import { addFilter, addMust, addMustNot, addShould } from '../utils/elasticsearch.js';
import {FACETS_TYPE, INDEX_ELASTICSEARCH, mapFilterFields, mapFacetFields} from "../constants/experts.js";
import { esClient } from '../databases/elasticsearch.js';

import { Expert } from '../models/index.js';
import pkg from 'lodash';
const { isEmpty, find } = pkg;

class InvalidLatLonException extends Error {
  constructor(message) {
    super(message);
    this.name = 'InvalidLatLonException';
  }
}

class InvalidQueryException extends Error {
  constructor(message) {
    super(message);
    this.name = 'InvalidQueryException';
  }
}

function parseLatLon(latlon) {
  const values = latlon.split(',');
  if (values.length !== 2) {
    throw new InvalidLatLonException(`Invalid lat,lon: ${latlon}`);
  }
  const lat = parseFloat(values[0]);
  const lon = parseFloat(values[1]);
  if (isNaN(lat) || isNaN(lon)) {
    throw new InvalidLatLonException(`Invalid lat,lon: ${latlon}`);
  }
  return { lat, lon };
}

export const  createBoundingBoxFilter = (topLeft, bottomRight) => {
  const topLeftCoords = parseLatLon(topLeft);
  const bottomRightCoords = parseLatLon(bottomRight);

  return {
    geo_bounding_box: {
      location: {
        top_left: {
          lat: topLeftCoords.lat,
          lon: topLeftCoords.lon
        },
        bottom_right: {
          lat: bottomRightCoords.lat,
          lon: bottomRightCoords.lon
        }
      }
    }
  };
}

export const  createDistanceFilter = (latlon, radius) => {
  const coords = parseLatLon(latlon);
  return {
    geo_distance: {
      distance: `${radius}km`,
      location: {
        lat: coords.lat,
        lon: coords.lon
      }
    }
  };
}

export const  createDistanceSort = (latlon) => {
  const coords = parseLatLon(latlon);
  return [
    {
      _geo_distance: {
        location: {
          lat: coords.lat,
          lon: coords.lon
        },
        order: 'asc',
        unit: 'km',
        distance_type: 'plane'
      }
    }
  ];
}

export const  createFieldFilter = (fieldName, values) =>{
  return {
    terms: {
      [mapFilterFields[fieldName] || fieldName]: values.split(',')
    }
  };
}

export const  createDuplicatedFilter = () => {
  return {
    exists: {
      field: 'duplicated'
    }
  };
}

export const  createStatusFilter = () => {
  return {
    term: {
      status: {
        value: 'UNVERIFIED'
      }
    }
  };
}

export const  createRangeFilter = (fieldName, fromValue, toValue) => {
  const range = {};
  if (fromValue !== null && fromValue !== undefined) {
    range.from = fromValue;
  }
  if (toValue !== null && toValue !== undefined) {
    range.to = toValue;
  }
  return {
    range: { [fieldName]: range }
  };
}

export const  createAggregations = (facets) => {
  const fieldValues = facets.split(',');
  const aggs = {};
  fieldValues.forEach(fieldValue => {
    const [fieldName, facetSize] = fieldValue.split(':');
    if (!fieldName || !facetSize) {
      console.warn(`Wrong type of facet: ${fieldValue}`);
      return;
    }
    aggs[fieldName] = {
      terms: {
        field: mapFacetFields[fieldName] || fieldName,
        size: parseInt(facetSize, 10),
      },
    };
  });
  return aggs;
}

export const createSort = (sort) => {
  if (!sort || sort === '') {
    return null;
  }
  const tokens = sort.split(':');
  if (tokens.length === 1) {
    if (sort === 'TIME') {
      return {
        start_datetime: 'desc'
      };
    }
  }
}

export const convertParamsToExpertSearchQuery = (params) => {
  const esQuery = {
    from: params.start,
    size: params.size,
    // _source: {
    //   excludes: ['description', 'source']
    // },
    // sort: {
    //   rank_experts: 'desc'
    // }
  };

  const what = params.what;
  if (what) {
    const queries = what?.split(',')?.map(q => q.trim());

    // const whatQuery = {
    //   query_string: {
    //     fields: [
    //       'name',
    //       'research_area.name',
    //       'research_area_en.name',
    //       'research_area_en._id',
    //       'research_area._id',
    //     ],
    //     query: `*${what}`,
    //     default_operator: 'AND'
    //   },
    // };

    const whatQuery = {
      bool: {
        should: []
      }
    };

    queries.map(q => {
      const query = {
        query_string: {
          fields: [
            'name',
            'research_area.name',
            'research_area_en.name',
            'research_area_en._id',
            'research_area._id',
          ],
          query: `*${q}`,
          default_operator: 'AND',
          boost: 1
        },
      };

      whatQuery.bool.should.push(query);

    })

    whatQuery.bool.should.push({
      bool: {
        should: queries.map(q => ({
          bool: {
            should: [
              {
                "match_phrase": {
                  "researches.title": {
                    "query": q,
                    boost: 3
                  },
                }
              },
              {
                "match_phrase": {
                  "book_written.title": {
                    "query": q,
                    boost: 3
                  }
                }
              },
              {
                "match_phrase": {
                  "articles.title": {
                    "query": q,
                    boost: 3
                  }
                }
              }
            ]
          }
        }))
      }
    })

    addMust(esQuery, whatQuery);
  }

  const where = params.where;
  if (where) {
    const whereQuery = {
      query_string: {
        fields: [
          'address',
          'company'
        ],
        query: where,
        default_operator: 'AND',
        boost: 1
      }
    };
    addMust(esQuery, whereQuery);
  }

  const {degree, company, research_area, address} = params;
  if (degree) {
    addFilter(esQuery, createFieldFilter(mapFilterFields.degree, degree));
  }
  if (company) {
    addFilter(esQuery, createFieldFilter(mapFilterFields.company, company));
  }

  if (research_area) {
    addFilter(esQuery, createFieldFilter(mapFilterFields.research_area, research_area));
    // addFilter(esQuery, createFieldFilter(mapFilterFields.research_area_en, research_area));
  }

  if (address) {
    addFilter(esQuery, createFieldFilter(mapFilterFields.address, address));
  }

  // const status = params.status;
  // if (status !== 'ALL') {
  //   if (status === 'UNVERIFIED') {
  //     addFilter(esQuery, createFieldFilter('status', 'UNVERIFIED'));
  //   }
  //   if (status === 'VERIFIED') {
  //     addMustNot(esQuery, createStatusFilter());
  //   }
  // }

  const topLeft = params.top_left;
  const bottomRight = params.bottom_right;
  if (topLeft && bottomRight) {
    addFilter(esQuery, createBoundingBoxFilter(topLeft, bottomRight));
  }

  // if (params.deduplicate !== false) {
  //   addMustNot(esQuery, createDuplicatedFilter());
  // }

  // if (params.after) {
  //   addFilter(esQuery, createRangeFilter('start_datetime', params.after, null));
  // }
  //
  // if (params.before) {
  //   addFilter(esQuery, createRangeFilter('end_datetime', null, params.before));
  // }

  const facets = params.facets;
  if (facets) {
    esQuery.aggs = createAggregations(facets);
  }

  // const latlon = params.latlon;
  // if (latlon) {
  //   esQuery.sort = createDistanceSort(latlon);
  //   const radius = params.radius;
  //   if (radius && radius > 0) {
  //     addFilter(esQuery, createDistanceFilter(latlon, radius));
  //   }
  // }
  //
  // if (params.sort && params.sort_by === 'TIME') {
  //   esQuery.sort = {
  //     start_datetime: 'desc'
  //   };
  // } else if (params.sort_by === 'TIME') {
  //   const orderBy = params.order_by;
  //   if (['DESC', 'ASC'].includes(orderBy)) {
  //     esQuery.sort = {
  //       indexed: orderBy
  //     };
  //   } else {
  //     esQuery.sort = {
  //       indexed: 'desc'
  //     };
  //   }
  // } else if (params.sort_by === 'created_at' && ['DESC', 'ASC', 'desc', 'asc'].includes(params.order_by)) {
  //   esQuery.sort = {
  //     createdAt: params.order_by.toLowerCase()
  //   };
  // }
  //
  // if (params.sort === 'RANK_EXPERTS') {
  //   esQuery.sort = {
  //     rank_experts: 'desc'
  //   };
  // }

  // if (userId) {
  //   addFilter(esQuery, createFieldFilter(mapFilterFields.userId, userId));
  // }

  esQuery.query = {
    bool: {
      must: esQuery.query,
      should: {
        function_score: {
          query: esQuery.query,
          // field_value_factor: {
          //   field: 'rank_experts',
          //   factor: 1,
          //   missing: 1
          // },
          boost_mode: 'sum'
        }
      }
    }
  };

  return esQuery;
}

export const convertFacetResponse = async (aggregations) => {
  if(isEmpty(aggregations)) return {};
  const facetResponse = {};
  const keyIndexes = {
    experts: INDEX_ELASTICSEARCH.experts,
  };

  for (const [key, value] of Object.entries(aggregations)) {
    const items = value?.buckets??[];

    if (!keyIndexes[key]) {
      continue;
    }

    const ids = items.map(item => ([FACETS_TYPE.degree].includes(key)) ? item.key.toLowerCase() : item.key);

    const esResponse = await esClient.search({
      index: keyIndexes[key],
      body: {
        size: ids?.length,
        _source: ["id", "name", "names", "synonyms"],
        query: { ids: { values: ids } }
      }
    });
    const hits = esResponse.body.hits.hits;
    const facetMaps = {};

    hits.forEach(hit => {
      const source = hit._source;
      facetMaps[source.id] = source;
      // if (key !== "organizations") {
      // facetMaps[source.id] = source.names || {};
      // } else {
      // const tmpFacetMaps = {};
      // for (const [lang, synonyms] of Object.entries(source.names || {})) {
      //     tmpFacetMaps[lang] = synonyms.length ? synonyms[0] : "";
      // }
      // facetMaps[source.id] = source;
      // }
      //
      // ["en", "vi", "de", "fr"].forEach(lang => {
      //     if (!facetMaps[source.id][lang]) {
      //         facetMaps[source.id][lang] = "";
      //     }
      // });
    });
    facetResponse[key] =  items.map(item => {
      if ([FACETS_TYPE.countries, FACETS_TYPE.country_code].includes(key)) {
        item.key =  item.key.toLowerCase();
      }
      const result = {
        ...item,
        ...facetMaps?.[item.key],
        value: facetMaps?.[item.key]?.id
      }
      return result;
    });
  }

  return facetResponse;
}


export const readDataFromElasticToMongo = async () => {
  try {
    let esResponse = await esClient.search({
      index: INDEX_ELASTICSEARCH.business,
      scroll: '30s',
      size: 100,
      body: {
        query: {
          term: {
            types: 'business'
          }
        }
      }
    });
    let totalUpdate =  esResponse.body.hits.hits.length;
    let total = esResponse.body.hits.total.value;
    while (esResponse.body.hits.hits.length) {
      const promises = esResponse.body.hits.hits.map( async (item, index) => {
        const business = item._source;

        business._id = business.id;
        delete business?.id;

        business.categories = business.categories.map(category => category.id)
        business.types = ['organization']

        return await Business.create(business).catch(err => {
          logEvents(`Insert elastic to mongo error::: ` + err.toString());
        })
      })
      await Promise.all(promises);
      console.log(`Imported ${totalUpdate}/${total} businesses`);

      esResponse = await esClient.scroll({
        scroll_id: esResponse.body._scroll_id,
        scroll: '30s'
      })
      totalUpdate += esResponse.body.hits.hits.length;
    }
    const clearScrollResult = await esClient.clearScroll({ scroll_id: esResponse.body._scroll_id });
    if (clearScrollResult.body?.succeeded) {
      console.log('Clear scroll succeeded');
    } else {
      console.log('Clear scroll failed');
    }
  } catch (e) {
    console.log(e);
  }
}

export const suggestNames = async ({q='', size= 10, types = null}) => {
  const esQuery = {
    "from": 0,
    "size": size,
    "_source": {
      "includes": ["name", "names", "thumbnail", "slug", "address"]
    },
    'query': {
      'bool': {
        'must': {
          'query_string': {
            'query': q + '*',
            'default_operator': 'AND',
            'fields': ['name', 'names.en', 'names.vi']
          }
        }
      }
    }
  }

  if (!isEmpty(types)) {
    addFilter(esQuery,  {
      'terms': {
        'types': types.split(',')
      }
    })
  }

  const esResponse = await esClient.search({
    index: INDEX_ELASTICSEARCH.business,
    body: esQuery
  });

  const names = esResponse?.body?.hits?.hits.map(hit => hit._source);

  return names
}

export const suggestRegions = async ({q='', size= 10}) => {
  const  suggestions = [];
  const regionsSet = new Set();

  const regionTypes = ['country', 'locality'];

  for (const regionType of regionTypes) {
    if (suggestions.length < size) {
      const esQuery = {
        from: 0,
        size: 0,
        query: {
          bool: {
            filter: [
              {
                query_string: {
                  query: q + '*',
                  default_operator: 'AND',
                  fields: ['address.' + regionType]
                }
              }
            ]
          }
        },
        aggs: {
          [regionType]: {
            terms: {
              field: 'address.' + regionType + '.keyword',
              size: size
            }
          }
        }
      };

      const esResponse = await esClient.search({
        index: INDEX_ELASTICSEARCH.business,
        body: esQuery
      });

      const buckets = esResponse.body.aggregations[regionType].buckets;

      for (const bucket of buckets) {
        const regionName = bucket.key;
        if (!regionsSet.has(regionName)) {
          suggestions.push({
            name: regionName,
            value: regionName,
            type: regionType
          });
          regionsSet.add(regionName);
        }
      }
    }
  }

  return suggestions.slice(0, Math.min(size, suggestions?.length??0));

}