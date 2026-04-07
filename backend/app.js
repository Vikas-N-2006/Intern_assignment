const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoute');
const notesRoutes = require('./routes/noteRoute');
const profileRoutes = require('./routes/profileRoute');
const errorHandler = require('./middlewares/errorHandler');
const morgan = require("morgan");
const logger = require('./utils/logger');
const app = express();
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  }
}));
app.use(express.json());
app.use(morgan("combined"));
app.use((req, res, next) => {
	logger.info('Incoming request', {
		method: req.method,
		endpoint: req.originalUrl,
		userId: req.user?.id || null
	});

	res.on('finish', () => {
		logger.info('Request completed', {
			method: req.method,
			endpoint: req.originalUrl,
			statusCode: res.statusCode,
			userId: req.user?.id || null
		});
	});

	next();
});

app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/profile', profileRoutes);

app.use(errorHandler);

app.get('/health', (req, res) => {
  return res.status(200).json("status : OK");
});

module.exports = app;