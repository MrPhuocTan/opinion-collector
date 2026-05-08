/**
 * Centralized Configuration
 * All environment variables and app constants in one place.
 */
require('dotenv').config();

module.exports = {
  port: parseInt(process.env.PORT, 10) || 3000,
  env: process.env.NODE_ENV || 'development',

  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    name: process.env.DB_NAME || 'opinion_collector',
    user: process.env.DB_USER || 'ocs_user',
    password: process.env.DB_PASSWORD || 'ocs_password_2024',
    poolMax: 20,
    idleTimeout: 30000,
    connectionTimeout: 2000,
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'change_me_in_production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  otp: {
    expiresInMinutes: parseInt(process.env.OTP_EXPIRES_IN_MINUTES, 10) || 5,
  },

  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10 * 1024 * 1024,
    path: process.env.UPLOAD_PATH || './uploads',
  },

  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
  },
};
