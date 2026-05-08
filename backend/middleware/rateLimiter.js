const rateLimit = require('express-rate-limit');

const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 OTP requests per windowMs
    message: 'Too many OTP requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // limit each IP to 100 requests per minute
    message: 'Too many requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 login attempts per windowMs
    message: 'Too many login attempts, please try again later.',
    skipSuccessfulRequests: true,
});

module.exports = {
    otpLimiter,
    apiLimiter,
    loginLimiter
};
