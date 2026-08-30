const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../uploads');

// Create upload directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allow common study materials: pdf, doc, docx, ppt, pptx, xls, xlsx, txt, zip, png, jpg, jpeg
  const allowedExtensions = /pdf|doc|docx|ppt|pptx|xls|xlsx|txt|zip|png|jpg|jpeg/i;
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file format. Please upload document or image files.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

module.exports = upload;
