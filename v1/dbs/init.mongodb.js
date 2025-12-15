'use strict';
const { default: mongoose } = require('mongoose');
const config = require('../config');

const connectString = `${config.MONGO_URI}/${config.MONGO_DB_NAME}`;
class Database {
  constructor() {
    this.connect();
  }

  // connect
  connect() {
    mongoose
      .connect(connectString)
      .then((_) => console.log(`Connected Mongodb Success PRO:`, connectString))
      .catch((err) => console.log(`Error Connect! ${err}`));

    //   dev
    if (1 === 1) {
      mongoose.set('debug', true);
      mongoose.set('debug', { color: true });
    }
  }

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }

    return Database.instance;
  }
}
const instanceMongodb = Database.getInstance();
module.exports = instanceMongodb;
