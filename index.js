// index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3000;

mongoose.connect(process.env.EXPRESS_APP_MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

app.use(express.json());

const imagesRouter = require('./routes/images');
const emailRouter = require('./routes/email');
const loginRouter = require('./routes/auth');

app.use('/api', imagesRouter);
app.use('/api', emailRouter);
app.use('/api', loginRouter);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
