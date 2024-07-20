const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const fs = require('fs');
const verifyToken = require('../utils');

const privateKey = process.env.JWT_PRIVATE_SECRET;

router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;
    const envUsername = process.env.LOGIN_USERNAME;
    const envPassword = process.env.LOGIN_PASSWORD;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    if (username !== envUsername || password !== envPassword) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    const token = jwt.sign({ username }, privateKey, { expiresIn: '1h' });

    res.json({ token });
  } catch (err) {
    console.error('Error generating token:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/check-token',(req, res) => {
  try{
    const token = req.headers.authorization?.split(' ')[1];
    const { valid, expired } = verifyToken(token);
    console.log(token)
    console.log(valid)

    if (!valid) {
      return res.status(401).json({ message: expired ? 'Token expired' : 'Unauthorized' });
    }
    else{
      return res.status(200).json({ message:'valid token'});
    }
  }catch(err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
})
module.exports = router;
