const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');

const hashPassword = async (password) => {
  return bcrypt.hash(password, 10);
};

const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

const generateToken = (userId, userRole) => {
  return jwt.sign(
    { userId, userRole, timestamp: Date.now() },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    return null;
  }
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports = { hashPassword, comparePassword, generateToken, verifyToken, generateOTP };
