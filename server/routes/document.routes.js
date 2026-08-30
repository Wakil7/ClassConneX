const express = require('express');
const router = express.Router();
const { getDocuments, uploadDocument, deleteDocument } = require('../controllers/document.controller');
const { protect, isCR } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.get('/', protect, getDocuments);
router.post('/', protect, isCR, upload.single('file'), uploadDocument);
router.delete('/:id', protect, isCR, deleteDocument);

module.exports = router;
