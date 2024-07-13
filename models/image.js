// models/Image.js
const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
    id: Number,
    link_1: String,
    link_2: String,
    aspect: String,
    text: String,
    title: String,
    year: String,
    page: String,
    order: String
}, { collection: 'Paintings' }); // Explicitly set the collection name

module.exports = mongoose.model('Image', ImageSchema);
