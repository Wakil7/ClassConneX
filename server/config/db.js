const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

let isFallbackMode = false;
const fallbackFilePath = path.join(__dirname, '../data_store.json');

// Initialize fallback database
if (!fs.existsSync(fallbackFilePath)) {
  const initialData = {
    users: [
      {
        _id: "seed-cr-id-12345",
        name: "Class Representative",
        email: "cr@classconnex.com",
        password: "$2a$10$W1wQe5KoxFhR8UaZix0qO.e7wI9ZJqN.9h1G/13d11D8Y4rK4/7kK", // bcrypt for 'cr12345'
        role: "cr",
        registerNumber: "CR2026001",
        createdAt: new Date().toISOString()
      }
    ],
    notices: [
      {
        _id: "welcome-notice-id",
        title: "Welcome to ClassConneX!",
        content: "This is the central notice board for all assignments, deadlines, events, and document updates. Class Representatives can post and manage details here.",
        category: "announcement",
        createdAt: new Date().toISOString(),
        createdBy: { name: "System Admin" }
      }
    ],
    documents: []
  };
  fs.writeFileSync(fallbackFilePath, JSON.stringify(initialData, null, 2));
}

const connectDB = async () => {
  try {
    console.log("Attempting to connect to MongoDB...");
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/classconnex', {
      serverSelectionTimeoutMS: 3000 // wait 3 seconds before timing out
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    isFallbackMode = false;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.log("--- FALLBACK MODE ENABLED: Using Local JSON File database ---");
    isFallbackMode = true;
  }
};

const getFallbackMode = () => isFallbackMode;

const fallbackDB = {
  read: () => {
    try {
      return JSON.parse(fs.readFileSync(fallbackFilePath, 'utf8'));
    } catch (e) {
      return { users: [], notices: [], documents: [] };
    }
  },
  write: (data) => {
    fs.writeFileSync(fallbackFilePath, JSON.stringify(data, null, 2));
  }
};

module.exports = { connectDB, getFallbackMode, fallbackDB };
