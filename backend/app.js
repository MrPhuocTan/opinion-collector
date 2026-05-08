const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const config = require('./config');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();

// ─── Middleware ──────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(morgan(config.env === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api/', apiLimiter);

// Static files for uploaded PDFs
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Health Check ───────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.env,
  });
});

// ─── API Routes ─────────────────────────────────────────
const routes = require('./routes');
app.use('/api/v1', routes);

// ─── Error Handling ─────────────────────────────────────
app.use(errorHandler);

// 404 handler (must be last)
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// ─── Start Server ───────────────────────────────────────
app.listen(config.port, () => {
  console.log(`🚀 Server running on http://localhost:${config.port}`);
  console.log(`📝 Environment: ${config.env}`);
});

module.exports = app;