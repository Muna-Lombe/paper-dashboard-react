const jwt = require('jsonwebtoken');
const Token = require('../models/Token');
require('dotenv').config();

module.exports = async function(req, res, next) {
    // Get token from header
    const token = req.header('x-auth-token') || req.header('authorization')?.replace('Bearer ', '');

    // Check if no token
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        // Check token in database
        const tokenRecord = await Token.findOne({
            where: {
                token: token,
                isActive: true,
                expiresAt: {
                    [require('sequelize').Op.gt]: new Date()
                }
            }
        });

        if (!tokenRecord) {
            return res.status(401).json({ msg: 'Invalid or expired token' });
        }

        // Verify JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'auth-permission-granted-by-muna-lombe-to-');
        
        // Add user from payload
        req.user = {
            id: tokenRecord.userId,
            name: tokenRecord.userName,
            roles: tokenRecord.userRoles
        };
        next();
    } catch (err) {
        console.error('Auth middleware error:', err.message);
        res.status(401).json({ msg: 'Token is not valid' });
    }
}; 