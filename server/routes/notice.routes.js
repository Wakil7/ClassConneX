const express = require('express');
const router = express.Router();
const { getNotices, createNotice, deleteNotice } = require('../controllers/notice.controller');
const { protect, isCR } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.get('/', protect, getNotices);
router.post('/', protect, isCR, upload.single('file'), createNotice);
router.delete('/:id', protect, isCR, deleteNotice);

module.exports = router;
