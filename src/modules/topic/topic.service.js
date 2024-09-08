import { addMust } from '../../utils/elasticsearch.js';
import { esClient } from '../../databases/elasticsearch.js';
import { INDEX_ELASTICSEARCH } from '../../constants/experts.js';

const getSuggestions = async ({
  q = '',
  size = 10,
  start = 0
}) => {
  const esQuery = {
    from: start,
    size: size,
  };

  if (q) {
    addMust(esQuery, {
      query_string: {
        fields: [
          'name'
        ],
        query: `${q}*`,
        default_operator: 'AND'
      }
    })
  }

  const esResponseVi = await esClient.search({
    index: INDEX_ELASTICSEARCH.topicsVi,
    body: esQuery
  })

  const esResponseEn = await esClient.search({
    index: INDEX_ELASTICSEARCH.topicsEn,
    body: esQuery
  })

  const topicsVi = esResponseVi?.body?.hits?.hits.map(hit => hit._source);
  const topicsEn = esResponseEn?.body?.hits?.hits.map(hit => hit._source);

  return {
    topicsVi,
    topicsEn
  }
}

export default {
  getSuggestions
}