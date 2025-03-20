const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');
require('dotenv').config();

// Initialize express app
const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(express.json({ extended: false }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Define Routes
app.use('/api/help-requests', require('./routes/api/helpRequests'));
app.use('/api/users', require('./routes/api/users'));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
    // Set static folder
    app.use(express.static(path.join(__dirname, '../client/build')));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../client', 'build', 'index.html'));
    });
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({
        message: 'Server Error',
        error: process.env.NODE_ENV === 'production' ? {} : err.stack
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));