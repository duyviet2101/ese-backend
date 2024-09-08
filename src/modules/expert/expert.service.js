import { Expert } from '../../models/index.js';
import { INDEX_ELASTICSEARCH, SUGGESTIONS_TYPES } from '../../constants/experts.js';
import { convertParamsToExpertSearchQuery } from '../../helpers/expert.js';
import { esClient } from '../../databases/elasticsearch.js';
import TopicService from '../topic/topic.service.js';
import pkg from 'lodash/lang.js';
const { isEmpty } = pkg;


const searchExpert = async (query) => {
  const queryElastic = convertParamsToExpertSearchQuery(query);
  // return (queryElastic);
  const esResponse = await esClient.search({
    index: INDEX_ELASTICSEARCH.experts,
    body: queryElastic,
  });
  const records = esResponse?.body?.hits?.hits.map((e) => ({
    _id: e?._id,
    ...e._source
  }));

  // const facets = await convertFacetResponse(esResponse?.body?.aggregations)
  return  {
    query: query,
    total: esResponse?.body?.hits?.total,
    items: records,
    // facets: facets,
    facets: esResponse?.body?.aggregations,
  };
}

const suggestNames = async ({
  q = '',
  size = 10,
  start = 0
}) => {
  const esQuery = {
    "from": 0,
    "size": size,
    'query': {
      'bool': {
        'must': {
          'query_string': {
            'query': q + '*',
            'default_operator': 'AND',
            'fields': ['name']
          }
        }
      }
    }
  }

  const esResponse = await esClient.search({
    index: INDEX_ELASTICSEARCH.experts,
    body: esQuery
  });

  const names = esResponse?.body?.hits?.hits.map(hit => hit._source);

  return names
}

const suggestCompany = async ({
  q = '',
  size = 10,
  start = 0
}) => {
  const res = await searchExpert({
    where: q,
    size: 0,
    start,
    facets: `company:${size}`
  });
  return res?.facets?.company?.buckets.map(bucket => bucket.key);
}

const suggestAddress = async ({
                                q = '',
                                size = 10,
                                start = 0
                              }) => {
  const res = await searchExpert({
    where: q,
    size: 0,
    start,
    facets: `address:${size}`
  });
  return res?.facets?.address?.buckets.map(bucket => bucket.key);
}

const getSuggestions = async ({
  q = '',
  size = 10,
  start = 0,
  type = 'what'
}) => {
  let suggestions = [];

  if (type === 'what') {
    const topics = await TopicService.getSuggestions({
      q,
      size,
      start
    });

    if (!isEmpty(topics)) {
      topics?.topicsVi?.map(topic => {
        suggestions.push({
          type: SUGGESTIONS_TYPES.topic,
          value: topic?.id??"",
          name: topic?.name??""
        })
      })
    }

    if (suggestions?.length < size) {
      const experts = await suggestNames({
        q,
        size: size - suggestions?.length,
        start
      });

      !isEmpty(experts) && experts.map(expert => {
        suggestions.push({
          type: SUGGESTIONS_TYPES.name,
          value: expert?.name??"",
          name: expert?.name??""
        })
      })
    }
  } else if (type === 'where') {
    if (suggestions?.length < size) {
      const companies = await suggestCompany({
        q,
        size: size - suggestions?.length,
        start
      });
      // console.log(companies);

      !isEmpty(companies) && companies.map(company => {
        suggestions.push({
          type: SUGGESTIONS_TYPES.company,
          value: company,
          name: company
        })
      })
    }

    if (suggestions?.length < size) {
      const address = await suggestAddress({
        q,
        size: size - suggestions?.length,
        start
      });
      console.log(address);

      !isEmpty(address) && address.map(address => {
        suggestions.push({
          type: SUGGESTIONS_TYPES.address,
          value: address,
          name: address
        })
      })
    }
  }


  return suggestions;
}

export default {
  searchExpert,
  getSuggestions
}