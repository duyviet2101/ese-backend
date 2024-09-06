import {Client} from "@elastic/elasticsearch";
import Config from '../../config.js';
import { INDEX_ELASTICSEARCH } from '../constants/experts.js';
import { createIndex } from '../modules/elasticsearch/elasticsearch.service.js';
import { Expert } from '../models/index.js';
import ExpertsMapping from '../mappings/experts.json' assert { type: "json" };

export const esClient = new Client({
  node: Config.ES_NODE_URL, // Elasticsearch endpoint,
  auth: {
    username: Config.ES_XPACK_USER,
    password: Config.ES_XPACK_PASSWORD,
  }
  // auth: {
  //     apiKey: { // API key ID and secret
  //         id: 'foo',
  //         api_key: 'bar',
  //     }
  // }
})

export const initializeElastic = async () => {
  const indexExperts = INDEX_ELASTICSEARCH.experts;

  try {
    await createIndex({
      index: indexExperts,
      model: Expert,
      body: {
        ...ExpertsMapping
      }
    })
  } catch (e) {
    console.log('Error creating index experts', e.stack)
  }

}