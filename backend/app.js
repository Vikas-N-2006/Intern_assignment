const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoute');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));

app.use('/api/auth', authRoutes);

app.use(errorHandler);

module.exports = app;