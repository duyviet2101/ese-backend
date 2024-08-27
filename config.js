import 'dotenv/config.js';


const config = {
  ENV: process.env.NODE_ENV || "development",
  MONGO_USER: process.env.MONGO_INITDB_ROOT_USERNAME || 'duyviet2101',
  MONGO_PASS: process.env.MONGO_INITDB_ROOT_PASSWORD || '21012004Viet',
  MONGO_HOST: process.env.MONGO_HOST || 'localhost',
  MONGO_PORT: process.env.MONGO_PORT || 27017,
  MONGO_DB: process.env.MONGO_DB || 'ese_db',
  MONGO_URL: process.env.MONGO_URL ||  'mongodb://localhost:27017/ese_db',
}

export default config;