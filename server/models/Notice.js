const mongoose = require('mongoose');
const { getFallbackMode, fallbackDB } = require('../config/db');

const NoticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, enum: ['announcement', 'deadline', 'event'], default: 'announcement' },
  deadlineDate: { type: Date },
  eventDate: { type: Date },
  fileUrl: { type: String },
  fileName: { type: String },
  createdBy: {
    _id: { type: String, required: true },
    name: { type: String, required: true }
  },
  createdAt: { type: Date, default: Date.now }
});

const MongooseNotice = mongoose.model('Notice', NoticeSchema);

const FallbackNotice = {
  find: async () => {
    const data = fallbackDB.read();
    // Sort by createdAt desc
    return [...data.notices].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
  create: async (noticeData) => {
    const data = fallbackDB.read();
    const newNotice = {
      _id: 'notice_' + Math.random().toString(36).substr(2, 9),
      ...noticeData,
      createdAt: new Date().toISOString()
    };
    data.notices.push(newNotice);
    fallbackDB.write(data);
    return newNotice;
  },
  findByIdAndDelete: async (id) => {
    const data = fallbackDB.read();
    const idx = data.notices.findIndex(n => n._id === id);
    if (idx !== -1) {
      const deleted = data.notices.splice(idx, 1)[0];
      fallbackDB.write(data);
      return deleted;
    }
    return null;
  }
};

module.exports = {
  find: async (query = {}) => {
    if (getFallbackMode()) {
      return await FallbackNotice.find();
    }
    return await MongooseNotice.find(query).sort({ createdAt: -1 });
  },
  create: async (noticeData) => {
    if (getFallbackMode()) {
      return await FallbackNotice.create(noticeData);
    }
    return await MongooseNotice.create(noticeData);
  },
  findByIdAndDelete: async (id) => {
    if (getFallbackMode()) {
      return await FallbackNotice.findByIdAndDelete(id);
    }
    return await MongooseNotice.findByIdAndDelete(id);
  },
  MongooseModel: MongooseNotice
};
