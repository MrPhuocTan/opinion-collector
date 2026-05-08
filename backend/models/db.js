const { Pool } = require('pg');
const config = require('../config');

const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.name,
  user: config.db.user,
  password: config.db.password,
  max: config.db.poolMax,
  idleTimeoutMillis: config.db.idleTimeout,
  connectionTimeoutMillis: config.db.connectionTimeout,
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error('❌ Database connection failed:', err.message);
  }
  console.log('✅ Database connected');
  release();
});

module.exports = pool;