const mongoose = require('mongoose');
const { getFallbackMode, fallbackDB } = require('../config/db');

const NoticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, enum: ['announcement', 'deadline', 'event'], default: 'announcement' },
  institution: { type: String, default: 'National Institute of Technology Tiruchirappalli (NIT Trichy)' },
  isGlobal: { type: Boolean, default: false },
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
  find: async (query = {}) => {
    const data = fallbackDB.read();
    let notices = data.notices || [];

    if (query.$or) {
      notices = notices.filter(n => {
        return query.$or.some(clause => {
          return Object.keys(clause).every(k => n[k] === clause[k]);
        });
      });
    } else {
      Object.keys(query).forEach(k => {
        notices = notices.filter(n => n[k] === query[k]);
      });
    }

    return [...notices].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
  create: async (noticeData) => {
    const data = fallbackDB.read();
    const newNotice = {
      _id: 'notice_' + Math.random().toString(36).substr(2, 9),
      institution: noticeData.institution || 'National Institute of Technology Tiruchirappalli (NIT Trichy)',
      isGlobal: noticeData.isGlobal !== undefined ? noticeData.isGlobal : false,
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
      return await FallbackNotice.find(query);
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
