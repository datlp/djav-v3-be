const config = {};
config.APP_PORT = process.env.APP_PORT;
config.API_VERSION = process.env.API_VERSION;
config.DB_NAME = process.env.DB_NAME;
config.EMAIL_PASS = process.env.EMAIL_PASS;
config.EMAIL_USER = process.env.EMAIL_USER;
config.FRONT_END_ENDPOINT = process.env.FRONT_END_ENDPOINT;
config.GEMINI_API_KEY = process.env.GEMINI_API_KEY;
config.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;
config.JWT_SECRET = process.env.JWT_SECRET;
config.MONGO_DB_NAME = process.env.MONGO_DB_NAME;
config.MONGO_URI = process.env.MONGO_URI;
config.SERVER_URL = process.env.SERVER_URL;
config.NODE_ENV = process.env.NODE_ENV;
config.isDevelopment = config.NODE_ENV === 'dev';
config.isProduction = config.NODE_ENV === 'pro';

config.SERVER_ENDPOINT = config.isDevelopment
  ? `${config.SERVER_URL}:${config.APP_PORT}/${config.API_VERSION}`
  : `${config.SERVER_URL}/${config.API_VERSION}`;

module.exports = config;
