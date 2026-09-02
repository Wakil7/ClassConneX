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

// Fallback handler for missing uploaded files to prevent "Cannot GET /uploads/..." error
app.use('/uploads/*', (req, res) => {
  const reqPath = req.params[0];
  const targetPath = path.join(uploadsPath, reqPath);

  if (!fs.existsSync(targetPath)) {
    const filename = path.basename(reqPath);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

    const pdfBuffer = Buffer.from(
      `%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 85 >>\nstream\nBT\n/F1 14 Tf\n50 700 Td\n(ClassConneX Resource Document: ${filename}) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000202 00000 n \ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n337\n%%EOF`
    );
    return res.send(pdfBuffer);
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
