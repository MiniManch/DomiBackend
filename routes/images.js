const express = require('express');
const router = express.Router();
const Image = require('../models/Image');

// Route to get all images
router.get('/images', async (req, res) => {
    try {
        const images = await Image.find();
        res.json(images);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
