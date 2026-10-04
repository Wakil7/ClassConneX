const mongoose = require('mongoose');
const { getFallbackMode, fallbackDB } = require('../config/db');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'cr'], default: 'student' },
  rollNumber: { type: String, required: true },
  institution: { type: String, default: 'National Institute of Technology Tiruchirappalli (NIT Trichy)' },
  createdAt: { type: Date, default: Date.now }
});

const MongooseUser = mongoose.model('User', UserSchema);

// Fallback operations
const FallbackUser = {
  findOne: async (query) => {
    const data = fallbackDB.read();
    const key = Object.keys(query)[0];
    const val = query[key];
    const user = data.users.find(u => u[key] === val);
    return user ? { ...user, save: async () => user } : null;
  },
  findById: async (id) => {
    const data = fallbackDB.read();
    const user = data.users.find(u => u._id === id);
    return user ? { ...user, save: async () => user } : null;
  },
  create: async (userData) => {
    const data = fallbackDB.read();
    const newUser = {
      _id: 'user_' + Math.random().toString(36).substr(2, 9),
      institution: userData.institution || 'National Institute of Technology Tiruchirappalli (NIT Trichy)',
      ...userData,
      createdAt: new Date().toISOString()
    };
    data.users.push(newUser);
    fallbackDB.write(data);
    return newUser;
  }
};

module.exports = {
  findOne: async (query) => {
    if (getFallbackMode()) {
      return await FallbackUser.findOne(query);
    }
    return await MongooseUser.findOne(query);
  },
  findById: async (id) => {
    if (getFallbackMode()) {
      return await FallbackUser.findById(id);
    }
    return await MongooseUser.findById(id);
  },
  create: async (userData) => {
    if (getFallbackMode()) {
      return await FallbackUser.create(userData);
    }
    return await MongooseUser.create(userData);
  },
  MongooseModel: MongooseUser
};
