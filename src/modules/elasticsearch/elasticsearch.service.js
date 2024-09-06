import { esClient } from '../../databases/elasticsearch.js';

export const create = async (index = "", id = "", body = {}) => {
  try {
    const createToElastic = await esClient.index({
      index,
      id,
      body,
    });

    return createToElastic;
  } catch (e) {
    console.error(`ES create exception ${index} --- ${id} --- ${body} ---- ${e.stack}`);
  }
}

export const update = async (index = "", id = "", body) => {
  try {
    const updateElastic = await esClient.index({
      index,
      id,
      refresh: true,
      body,
    });
    return updateElastic;
  } catch (e) {
    console.error(`ES update exception  ${e.stack}`);
  }
}

export const deleteById = async (index = "", id = "") => {
  try {
    const deleteToElastic = await esClient.delete({
      index,
      id
    });

    return deleteToElastic;
  } catch (e) {
    console.error('ES deleteById exception: ' + id, e.stack);
  }
}


export const count = async (index = "", query) => {
  try {
    const countBody = await esClient.count({
      index,
      body: {
        query,
      },
    });

    return countBody?.body?.count || 0;
  } catch (e) {
    console.error('ES deleteById exception: ' + index, e.stack);
  }
}

export const createIndex = async ({index = "", model, body = {}, batchSize = 1000, isUpdate = false}) => {
  const checkIndexExist = await esClient.indices.exists({index});
  if (!checkIndexExist.body || isUpdate) {
    try {
      if (!isUpdate)
        await esClient.indices.create({
          index,
          body
        });

      // index data
      if (!model) {
        console.log(`No model found for ${index} index`);
        return;
      }

      let data = [];
      let page = 0;
      let totalIndexed = 0;

      do {
        data = await model.findForElastic({
          batchSize,
          page
        });
        if (data.length === 0 && page === 0) {
          console.log(`No data found for ${index} index`);
          return;
        }

        const operations = data.flatMap((doc) => {
          doc = doc.toObject();
          doc.id = doc._id;
          delete doc?._id;

          //update categories ids from _id to id for business
          doc?.research_area?.forEach(area => {
            area.id = area?._id;
            delete area?._id;
          })
          doc?.research_area_en?.forEach(area => {
            area.id = area?._id;
            delete area?._id;
          })

          return [
            {index: {_index: index, _id: doc.id}},
            doc
          ]
        });

        const bulkResponse = (await esClient.bulk({
          refresh: true,
          body: operations
        })).body;
        if (bulkResponse.errors) {
          const erroredDocuments = [];
          bulkResponse?.items.forEach((action, i) => {
            const operation = Object.keys(action)[0];
            if (action[operation].error) {
              erroredDocuments.push({
                status: action[operation].status,
                error: action[operation].error,
                operation: operations[i * 2],
                document: operations[i * 2 + 1],
                categories: operations[i * 2 + 1].categories
              });
            }
          });
          console.error(`Bulk indexing ${index} errors:`, erroredDocuments || bulkResponse);
        }

        totalIndexed += data.length;
        page++;

        console.log(`Index ${index} created with ${totalIndexed} documents`);
      } while (data.length === batchSize);

      // console.log(`Index ${index} created with ${totalIndexed} documents`);
    } catch (e) {
      console.error(`Error create index ${index}`, e.stack);
    }
  }
}

// const updateIndex = async (index) => {
//   const models = {
//     [INDEX_ELASTICSEARCH.business]: business,
//     [INDEX_ELASTICSEARCH.categories]: categories,
//     [INDEX_ELASTICSEARCH.countries]: countries,
//     [INDEX_ELASTICSEARCH.wishlist]: wishlist
//   }
//
//   for (const [key, value] of Object.entries(INDEX_ELASTICSEARCH)) {
//     if (index === key) {
//       await createIndex({
//         index: value,
//         model: models[value],
//         isUpdate: true
//       })
//       return;
//     }
//   }
// }


export default {
  create,
  update,
  deleteById,
  count,
  // updateIndex
}