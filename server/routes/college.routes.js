const express = require('express');
const router = express.Router();
const COLLEGES = require('../data/colleges');

// @desc    Get all colleges (IITs, NITs, and other)
// @route   GET /api/colleges
// @access  Public
router.get('/', (req, res) => {
  const { type, query } = req.query;
  let list = COLLEGES;

  if (type) {
    list = list.filter(c => c.type.toLowerCase() === type.toLowerCase());
  }

  if (query) {
    const q = query.toLowerCase();
    list = list.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.shortName.toLowerCase().includes(q) ||
      c.state.toLowerCase().includes(q)
    );
  }

  res.json(list);
});

module.exports = router;
