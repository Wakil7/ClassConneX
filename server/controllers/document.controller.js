const Document = require('../models/Document');
const fs = require('fs');
const path = require('path');

const formatBytes = (bytes, decimals = 2) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// @desc    Get all documents (with college/scope filtering)
// @route   GET /api/documents
// @access  Private
const getDocuments = async (req, res) => {
  try {
    const { scope, institution, category } = req.query;
    const userInstitution = req.user ? req.user.institution : null;

    let filter = {};

    if (scope === 'campus' || scope === 'my_college') {
      // Only documents belonging to the user's institution
      if (userInstitution) {
        filter.institution = userInstitution;
      }
    } else if (scope === 'global') {
      // Global hub: all public documents
      filter.isPublic = true;
      if (institution && institution !== 'all') {
        filter.institution = institution;
      }
    } else {
      // Default: show documents that are public OR belong to user's college
      if (userInstitution) {
        filter = {
          $or: [
            { isPublic: true },
            { institution: userInstitution }
          ]
        };
      }
      if (institution && institution !== 'all') {
        filter.institution = institution;
      }
    }

    if (category && category !== 'all') {
      filter.category = category;
    }

    const documents = await Document.find(filter);
    res.json(documents || []);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ message: 'Server error fetching documents' });
  }
};

// @desc    Upload new document (CR only)
// @route   POST /api/documents
// @access  Private (CR)
const uploadDocument = async (req, res) => {
  const { title, description, subjectName, subjectCode, category, institution, isPublic } = req.body;

  try {
    if (!title || !subjectName || !subjectCode || !category) {
      return res.status(400).json({ message: 'Title, subject name, subject code, and category are required' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please select a document file to upload' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const fileName = req.file.originalname;
    const fileSize = formatBytes(req.file.size);

    const userId = (req.user._id || req.user.id).toString();
    const userInstitution = institution || (req.user && req.user.institution) || 'National Institute of Technology Tiruchirappalli (NIT Trichy)';
    const documentIsPublic = isPublic === undefined ? true : (isPublic === 'true' || isPublic === true);

    const docData = {
      title,
      description: description || '',
      subjectName,
      subjectCode,
      category,
      institution: userInstitution,
      isPublic: documentIsPublic,
      fileUrl,
      fileName,
      fileSize,
      uploadedBy: {
        _id: userId,
        name: req.user.name
      }
    };

    const newDoc = await Document.create(docData);
    res.status(201).json(newDoc);
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ message: 'Server error uploading document' });
  }
};

// @desc    Update a document (CR uploader only)
// @route   PUT /api/documents/:id
// @access  Private (CR uploader)
const updateDocument = async (req, res) => {
  const { id } = req.params;
  const { title, description, subjectName, subjectCode, category, isPublic } = req.body;

  try {
    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const uploaderId = document.uploadedBy ? (document.uploadedBy._id || document.uploadedBy.id) : null;
    const currentUserId = (req.user._id || req.user.id).toString();

    if (uploaderId && uploaderId.toString() !== currentUserId) {
      return res.status(403).json({ message: 'Unauthorized: Only the uploader can edit this document' });
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (subjectName) updateData.subjectName = subjectName;
    if (subjectCode) updateData.subjectCode = subjectCode;
    if (category) updateData.category = category;
    if (isPublic !== undefined) updateData.isPublic = (isPublic === 'true' || isPublic === true);

    const updated = await Document.findByIdAndUpdate(id, updateData);
    res.json(updated || { ...document, ...updateData });
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ message: 'Server error updating document' });
  }
};

// @desc    Delete a document (CR uploader only)
// @route   DELETE /api/documents/:id
// @access  Private (CR uploader)
const deleteDocument = async (req, res) => {
  const { id } = req.params;

  try {
    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const uploaderId = document.uploadedBy ? (document.uploadedBy._id || document.uploadedBy.id) : null;
    const currentUserId = (req.user._id || req.user.id).toString();

    if (uploaderId && uploaderId.toString() !== currentUserId) {
      return res.status(403).json({ message: 'Unauthorized: Only the uploader can delete this document' });
    }

    await Document.findByIdAndDelete(id);

    // Clean up uploaded file
    if (document.fileUrl) {
      const filename = document.fileUrl.replace('/uploads/', '');
      const filepath = path.join(__dirname, '../uploads', filename);
      if (fs.existsSync(filepath)) {
        try {
          fs.unlinkSync(filepath);
        } catch (fileErr) {
          console.error('Failed to delete physical file:', fileErr.message);
        }
      }
    }

    res.json({ message: 'Document deleted successfully', id });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ message: 'Server error deleting document' });
  }
};

module.exports = { getDocuments, uploadDocument, updateDocument, deleteDocument };
