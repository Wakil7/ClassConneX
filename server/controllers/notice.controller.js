const Notice = require('../models/Notice');
const fs = require('fs');
const path = require('path');

// @desc    Get all notices (scoped by college & global announcements)
// @route   GET /api/notices
// @access  Private
const getNotices = async (req, res) => {
  try {
    const { scope, category } = req.query;
    const userInstitution = req.user ? req.user.institution : null;

    let filter = {};

    if (scope === 'campus') {
      if (userInstitution) {
        filter.institution = userInstitution;
      }
    } else if (scope === 'global') {
      filter.isGlobal = true;
    } else {
      // Default: show notices that are global OR belong to user's college
      if (userInstitution) {
        filter = {
          $or: [
            { isGlobal: true },
            { institution: userInstitution }
          ]
        };
      }
    }

    if (category && category !== 'all') {
      filter.category = category;
    }

    const notices = await Notice.find(filter);
    res.json(notices || []);
  } catch (error) {
    console.error('Error fetching notices:', error);
    res.status(500).json({ message: 'Server error fetching notices' });
  }
};

// @desc    Create a new notice (CR only)
// @route   POST /api/notices
// @access  Private (CR)
const createNotice = async (req, res) => {
  const { title, content, category, deadlineDate, eventDate, isGlobal, institution } = req.body;

  try {
    if (!title || !content || !category) {
      return res.status(400).json({ message: 'Title, content, and category are required' });
    }

    let fileUrl = '';
    let fileName = '';

    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
      fileName = req.file.originalname;
    }

    const userInstitution = institution || (req.user && req.user.institution) || 'National Institute of Technology Tiruchirappalli (NIT Trichy)';
    const noticeIsGlobal = isGlobal === 'true' || isGlobal === true;

    const noticeData = {
      title,
      content,
      category,
      institution: userInstitution,
      isGlobal: noticeIsGlobal,
      deadlineDate: deadlineDate || null,
      eventDate: eventDate || null,
      fileUrl,
      fileName,
      createdBy: {
        _id: req.user.id.toString(),
        name: req.user.name
      }
    };

    const newNotice = await Notice.create(noticeData);
    res.status(201).json(newNotice);
  } catch (error) {
    console.error('Error creating notice:', error);
    res.status(500).json({ message: 'Server error creating notice' });
  }
};

// @desc    Delete a notice (CR only)
// @route   DELETE /api/notices/:id
// @access  Private (CR)
const deleteNotice = async (req, res) => {
  const { id } = req.params;

  try {
    const notice = await Notice.findByIdAndDelete(id);
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    // Clean up uploaded file if it exists
    if (notice.fileUrl) {
      const filename = notice.fileUrl.replace('/uploads/', '');
      const filepath = path.join(__dirname, '../uploads', filename);
      if (fs.existsSync(filepath)) {
        try {
          fs.unlinkSync(filepath);
        } catch (fileErr) {
          console.error('Failed to delete associated notice file:', fileErr.message);
        }
      }
    }

    res.json({ message: 'Notice deleted successfully', id });
  } catch (error) {
    console.error('Error deleting notice:', error);
    res.status(500).json({ message: 'Server error deleting notice' });
  }
};

module.exports = { getNotices, createNotice, deleteNotice };
