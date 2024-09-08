import {Client} from "@elastic/elasticsearch";
import Config from '../../config.js';
import { INDEX_ELASTICSEARCH } from '../constants/experts.js';
import { createIndex } from '../modules/elasticsearch/elasticsearch.service.js';
import { Expert, TopicEn, TopicVi } from '../models/index.js';
import ExpertsMapping from '../mappings/experts.json' assert { type: "json" };
import TopicsMapping from '../mappings/topics.json' assert { type: "json" };

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
  const indexTopicsVi = INDEX_ELASTICSEARCH.topicsVi;
  const indexTopicsEn = INDEX_ELASTICSEARCH.topicsEn;

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

  try {
    await createIndex({
      index: indexTopicsVi,
      model: TopicVi,
      body: {
        ...TopicsMapping
      }
    })
  } catch (e) {
    console.log('Error creating index topics', e.stack)
  }

  try {
    await createIndex({
      index: indexTopicsEn,
      model: TopicEn,
      body: {
        ...TopicsMapping
      }
    })
  } catch (e) {
    console.log('Error creating index topics', e.stack)
  }

}