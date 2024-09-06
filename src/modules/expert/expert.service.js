import { Expert } from '../../models/index.js';
import { INDEX_ELASTICSEARCH } from '../../constants/experts.js';
import { convertParamsToExpertSearchQuery } from '../../helpers/expert.js';
import { esClient } from '../../databases/elasticsearch.js';

const searchExpert = async (query) => {
  console.log(query);
  const queryElastic = convertParamsToExpertSearchQuery(query);
  console.log(queryElastic);
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

export default {
  searchExpert
}