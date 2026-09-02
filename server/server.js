const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to database (with fallback to local JSON database)
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: '*', // For development flexibility
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Folder for Uploaded Documents/Notice attachments
const uploadsPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath));

// 404 handler for missing uploaded files
app.use('/uploads/*', (req, res) => {
  const reqPath = req.params[0];
  const targetPath = path.join(uploadsPath, reqPath);
  if (!fs.existsSync(targetPath)) {
    return res.status(404).json({ message: `File not found: ${path.basename(reqPath)}` });
  }
});

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/notices', require('./routes/notice.routes'));
app.use('/api/documents', require('./routes/document.routes'));

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    databaseMode: require('./config/db').getFallbackMode() ? 'Local JSON Fallback' : 'MongoDB'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.message);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access backend API at http://localhost:${PORT}`);
});
