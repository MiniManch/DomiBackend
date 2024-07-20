require('dotenv').config();
const jwt = require('jsonwebtoken'); // Make sure to require the 'jsonwebtoken' module
const publicKey = process.env.JWT_PRIVATE_SECRET; // Replace with your actual public key

function verifyToken(token) {
    try {
        const decoded = jwt.verify(token, publicKey);
        return {
            valid: true,
            expired: false,
            decoded
        };
    } catch (err) {
        return {
            valid: false,
            expired: err.name === 'TokenExpiredError',
            decoded: null
        };
    }
}

module.exports = verifyToken;
