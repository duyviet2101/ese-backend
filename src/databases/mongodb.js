import mongoose from 'mongoose';
// import logger from '../api/utils/logger';
import config from "../../config.js";
// import {readDataFromElasticToMongo} from "../api/helpers/business";

const NODE_ENV = process.env.NODE_ENV;
const isProd = NODE_ENV === 'production';
const options = {
  // useCreateIndex: true,
  // useNewUrlParser: true,
  // useFindAndModify: false,
  autoIndex: isProd ? true : false, // Don't build indexes
  // reconnectTries: 5,
  // reconnectInterval: 2000, // Reconnect every 2s
  // poolSize: 4, // Maintain up to 4 socket connections
  // If not connected, return errors immediately rather than waiting for reconnect
  // bufferMaxEntries: 0,
  connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  dbName: config.MONGO_DB,
  user: config.MONGO_USER,
  pass: config.MONGO_PASS,
};
function updateRegexInsensitive(filter) {
  for (const field in filter) {
    if (filter[field]?.$regexi) {
      filter[field].$regex = filter[field].$regexi;
      delete filter[field].$regexi;
      filter[field].$options = (filter[field].$options || '') + 'i';
    } else if (typeof filter[field] === 'object') {
      updateRegexInsensitive(filter[field]);
    }
  }
}

function builderFunc(schema) {
  schema.statics.queryBuilder = async function (query) {
    let builder = this.find();
    let count;

    if (query.filter) {
      updateRegexInsensitive(query.filter);
      builder = builder.where(query.filter);
    }

    if (!query.notPaginate) {
      count = this.count(builder);
    }

    if (query.page && query.perPage) {
      builder = builder.limit(query.perPage).skip((query.page - 1) * query.perPage);
    } else if (query.limit) {
      builder = builder.limit(query.limit);
    } else if (query.offset) {
      builder = builder.skip(query.offset);
    }

    if (query.orderBy) {
      builder = builder.sort(query.orderBy);
    }

    if (query.populate) {
      try {
        query.populate = JSON.parse(query.populate);
      } catch (error) {
        query.populate = query.populate || '';
        if (typeof query.populate === 'string') {
          query.populate = query.populate.split(',').map((clt) => clt.trim()).filter((clt) => clt);
        }
      }

      if (Array.isArray(query.populate)) {
        for (const po of query.populate) {
          builder = builder.populate(po);
        }
      } else {
        builder = builder.populate(query.populate);
      }
    }

    if (query.select) {
      builder = builder.select(query.select);
    }

    if (count) {
      try {
        const [list, total] = await Promise.all([builder.lean().exec(), count.exec()]);
        return {
          list,
          total,
          page: query.page,
          perPage: query.perPage
        };
      } catch (error) {
        console.error(error);
      }
    }

    return builder.exec();
  };
}

export const initializeMongoConnection = () => {
  mongoose
    .connect(config.MONGO_URL ? config.MONGO_URL : `mongodb://${config.MONGO_HOST}:${config.MONGO_PORT}`, options)
    .then(() => {
      console.log(`Connect to mongodb://${config.MONGO_HOST}:${config.MONGO_PORT} success.`);
      // readDataFromElasticToMongo();
    })
    .catch(error => {
      console.log(error);
    });
  // mongoose.plugin(builderFunc);

  mongoose.connection.on('connected', () => {
    console.log('MongoDb connected to db');
  })

  mongoose.connection.on('error', (e) => {
    console.log(e.message);
  })

  mongoose.connection.on('disconnected', () => {
    console.log('MongoDb connected is disconnected');
  })

  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    process.exit(0);
  })
};
