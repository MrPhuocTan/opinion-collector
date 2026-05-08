const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const hashPassword = async (password) => {
    return await bcrypt.hash(password, 10);
};

const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

const generateToken = (userId, userRole) => {
    return jwt.sign(
        { userId, userRole, timestamp: Date.now() },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
};

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports = { hashPassword, comparePassword, generateToken, verifyToken, generateOTP };
