const { verifyToken } = require('../utils/auth.utils');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
        return res.status(403).json({ error: 'Invalid or expired token.' });
    }
    
    req.user = decoded;
    next();
};

const requireAdmin = (req, res, next) => {
    if (req.user && req.user.userRole === 'ADMIN') {
        next();
    } else {
        res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }
};

module.exports = { authenticateToken, requireAdmin };
