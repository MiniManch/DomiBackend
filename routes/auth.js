const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const fs = require('fs');

const privateKey = process.env.JWT_PRIVATE_SECRET.replace(/\\n/g, '\n');

function verifyToken(token) {
    try {
        const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
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

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const envUsername = process.env.LOGIN_USERNAME;
  const envPassword = process.env.LOGIN_PASSWORD;

  if (username !== envUsername || password !== envPassword) {
    return res.status(400).json({ message: 'Invalid username or password' });
  }

  // Create and sign a JWT token
  const token = jwt.sign({ username }, privateKey, {
    algorithm: 'RS256',
    expiresIn: '1h'
  });

  res.json({ token });
});

module.exports = router;
