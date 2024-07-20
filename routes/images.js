const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const Image = require('../models/Image');
const verifyToken = require('../utils');

// Configure Cloudinary for image uploads 
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Set up `multer` for file upload handling
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/images', async (req, res) => {
  try {
    const images = await Image.find();
    res.json(images);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});

router.get('/image/:id', async (req, res) => {
  try {
    const image = await Image.findOne({ 'id': parseInt(req.params.id) });
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }
    res.json(image);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});

router.post('/image', upload.fields([{ name: 'link_1' }, { name: 'link_2' }]), async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const { valid, expired } = verifyToken(token);

  if (!valid) {
    return res.status(401).json({ message: expired ? 'Token expired' : 'Unauthorized' });
  }

  const { title, year, text } = req.body;
  const newImage = new Image({
    title,
    year,
    text,
    id: Math.floor(100000 + Math.random() * 900000)
  });

  const uploadImage = async (file, fieldName) => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { resource_type: 'image' },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result.secure_url);
          }
        }
      ).end(file.buffer);
    });
  };

  try {
    if (req.files.link_1) {
      newImage.link_1 = await uploadImage(req.files.link_1[0], 'link_1');
    }
    if (req.files.link_2) {
      newImage.link_2 = await uploadImage(req.files.link_2[0], 'link_2');
    }

    const savedImage = await newImage.save();
    res.status(201).json(savedImage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/image/:id/:field', upload.single('file'), async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const { valid, expired } = verifyToken(token);

  if (!valid) {
    return res.status(401).json({ message: expired ? 'Token expired' : 'Unauthorized' });
  }

  const { id, field } = req.params;
  const updateData = {};

  if (field === 'link_1' || field === 'link_2') {
    // Handle file upload
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'File is required' });
    }

    try {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { resource_type: 'image' },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result.secure_url);
            }
          }
        ).end(file.buffer);
      });

      updateData[field] = result;
      const image = await Image.findOneAndUpdate({ 'id': parseInt(id) }, { $set: updateData }, { new: true });
      if (!image) {
        return res.status(404).json({ message: 'Image not found' });
      }
      res.json(image);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: 'Error uploading file' });
    }
  } else {
    // Handle other fields
    updateData[field] = req.body.value;

    try {
      const image = await Image.findOneAndUpdate({ 'id': parseInt(id) }, { $set: updateData }, { new: true });
      if (!image) {
        return res.status(404).json({ message: 'Image not found' });
      }
      res.json(image);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message });
    }
  }
});

// Route to delete an image by ID
router.delete('/image/:id', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const { valid, expired } = verifyToken(token);

  if (!valid) {
    return res.status(401).json({ message: expired ? 'Token expired' : 'Unauthorized' });
  }

  try {
    const image = await Image.findOneAndDelete({ 'id': parseInt(req.params.id) });
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }
    res.json({ message: 'Image deleted successfully' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;
