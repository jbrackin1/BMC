// /src/backend/db/knex.js
const knex = require('knex');
const config = require('../../../knexfile');

const environment = process.env.NODE_ENV || 'development';
const knexConfig = config[environment];

if (!knexConfig?.client) {
  throw new Error(`❌ Invalid knex config for environment: ${environment}`);
}

const db = knex(knexConfig);
module.exports = db;