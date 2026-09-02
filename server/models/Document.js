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
    const docs = data.documents || [];
    return [...docs].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  },
  findById: async (id) => {
    const data = fallbackDB.read();
    const docs = data.documents || [];
    return docs.find(d => d._id === id) || null;
  },
  create: async (docData) => {
    const data = fallbackDB.read();
    if (!data.documents) data.documents = [];
    const newDoc = {
      _id: 'doc_' + Math.random().toString(36).substr(2, 9),
      ...docData,
      createdAt: new Date().toISOString()
    };
    data.documents.push(newDoc);
    fallbackDB.write(data);
    return newDoc;
  },
  findByIdAndUpdate: async (id, updateData) => {
    const data = fallbackDB.read();
    if (!data.documents) data.documents = [];
    const idx = data.documents.findIndex(d => d._id === id);
    if (idx !== -1) {
      data.documents[idx] = { ...data.documents[idx], ...updateData };
      fallbackDB.write(data);
      return data.documents[idx];
    }
    return null;
  },
  findByIdAndDelete: async (id) => {
    const data = fallbackDB.read();
    if (!data.documents) data.documents = [];
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
  findById: async (id) => {
    if (getFallbackMode()) {
      return await FallbackDocument.findById(id);
    }
    return await MongooseDocument.findById(id);
  },
  create: async (docData) => {
    if (getFallbackMode()) {
      return await FallbackDocument.create(docData);
    }
    return await MongooseDocument.create(docData);
  },
  findByIdAndUpdate: async (id, updateData) => {
    if (getFallbackMode()) {
      return await FallbackDocument.findByIdAndUpdate(id, updateData);
    }
    return await MongooseDocument.findByIdAndUpdate(id, updateData, { new: true });
  },
  findByIdAndDelete: async (id) => {
    if (getFallbackMode()) {
      return await FallbackDocument.findByIdAndDelete(id);
    }
    return await MongooseDocument.findByIdAndDelete(id);
  },
  MongooseModel: MongooseDocument
};
