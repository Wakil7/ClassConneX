const mongoose = require('mongoose');
const { getFallbackMode, fallbackDB } = require('../config/db');

const DocumentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  subjectName: { type: String, required: true },
  subjectCode: { type: String, required: true },
  category: { type: String, enum: ['notes', 'assignment', 'study_material', 'pyq'], default: 'notes' },
  fileUrl: { type: String, required: true },
  fileName: { type: String, required: true },
  fileSize: { type: String },
  uploadedBy: {
    _id: { type: String, required: true },
    name: { type: String, required: true }
  },
  createdAt: { type: Date, default: Date.now }
});

const MongooseDocument = mongoose.model('Document', DocumentSchema);

const FallbackDocument = {
  find: async () => {
    const data = fallbackDB.read();
    return [...data.documents].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
  create: async (docData) => {
    const data = fallbackDB.read();
    const newDoc = {
      _id: 'doc_' + Math.random().toString(36).substr(2, 9),
      ...docData,
      createdAt: new Date().toISOString()
    };
    data.documents.push(newDoc);
    fallbackDB.write(data);
    return newDoc;
  },
  findByIdAndDelete: async (id) => {
    const data = fallbackDB.read();
    const idx = data.documents.findIndex(d => d._id === id);
    if (idx !== -1) {
      const deleted = data.documents.splice(idx, 1)[0];
      fallbackDB.write(data);
      return deleted;
    }
    return null;
  }
};

module.exports = {
  find: async (query = {}) => {
    if (getFallbackMode()) {
      return await FallbackDocument.find();
    }
    return await MongooseDocument.find(query).sort({ createdAt: -1 });
  },
  create: async (docData) => {
    if (getFallbackMode()) {
      return await FallbackDocument.create(docData);
    }
    return await MongooseDocument.create(docData);
  },
  findByIdAndDelete: async (id) => {
    if (getFallbackMode()) {
      return await FallbackDocument.findByIdAndDelete(id);
    }
    return await MongooseDocument.findByIdAndDelete(id);
  },
  MongooseModel: MongooseDocument
};
