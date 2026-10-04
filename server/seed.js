/**
 * ClassConneX - Multi-College MongoDB Seed Script
 * Populates MongoDB with realistic cross-institutional data.
 * Run: node seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  email:      { type: String, required: true, unique: true },
  password:   { type: String, required: true },
  role:       { type: String, enum: ['student', 'cr'], default: 'student' },
  rollNumber: { type: String, required: true },
  institution:{ type: String, default: 'National Institute of Technology Tiruchirappalli (NIT Trichy)' },
  createdAt:  { type: Date, default: Date.now }
});

const NoticeSchema = new mongoose.Schema({
  title:        { type: String, required: true },
  content:      { type: String, required: true },
  category:     { type: String, enum: ['announcement', 'deadline', 'event'], default: 'announcement' },
  institution:  { type: String, default: 'National Institute of Technology Tiruchirappalli (NIT Trichy)' },
  isGlobal:     { type: Boolean, default: false },
  deadlineDate: { type: Date },
  eventDate:    { type: Date },
  fileUrl:      { type: String },
  fileName:     { type: String },
  createdBy: {
    _id:  { type: String, required: true },
    name: { type: String, required: true }
  },
  createdAt: { type: Date, default: Date.now }
});

const DocumentSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String },
  subjectName: { type: String, required: true },
  subjectCode: { type: String, required: true },
  category:    { type: String, enum: ['notes', 'assignment', 'study_material', 'pyq'], default: 'notes' },
  institution: { type: String, required: true },
  isPublic:    { type: Boolean, default: true },
  fileUrl:     { type: String, required: true },
  fileName:    { type: String, required: true },
  fileSize:    { type: String },
  uploadedBy: {
    _id:  { type: String, required: true },
    name: { type: String, required: true }
  },
  createdAt: { type: Date, default: Date.now }
});

const User     = mongoose.model('User', UserSchema);
const Notice   = mongoose.model('Notice', NoticeSchema);
const Document = mongoose.model('Document', DocumentSchema);

async function seed() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/classconnex';
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 4000 });
    console.log('Connected to MongoDB for seeding...');

    await User.deleteMany({});
    await Notice.deleteMany({});
    await Document.deleteMany({});

    const passwordHash = await bcrypt.hash('cr12345', 10);

    const crNITT = await User.create({
      name: 'Class Representative',
      email: 'cr@classconnex.com',
      password: passwordHash,
      role: 'cr',
      rollNumber: 'CR2026001',
      institution: 'National Institute of Technology Tiruchirappalli (NIT Trichy)'
    });

    const crIITB = await User.create({
      name: 'Aarav Sharma (IITB CR)',
      email: 'cr.iitb@classconnex.com',
      password: passwordHash,
      role: 'cr',
      rollNumber: '23B030012',
      institution: 'Indian Institute of Technology Bombay (IIT Bombay)'
    });

    await Notice.create([
      {
        title: '🏆 All-India Inter IIT & NIT CodeSprint 2026 Open!',
        content: 'Annual nationwide hackathon for all IITs, NITs, and premier engineering institutions. Teams of 2-4 can register.',
        category: 'event',
        institution: 'National Institute of Technology Tiruchirappalli (NIT Trichy)',
        isGlobal: true,
        deadlineDate: new Date('2026-11-15T18:30:00.000Z'),
        eventDate: new Date('2026-11-20T09:00:00.000Z'),
        createdBy: { _id: crNITT._id.toString(), name: 'National Coordinator' }
      },
      {
        title: 'NIT Trichy: Mid-Term Examination Schedule Announced',
        content: 'The mid-semester examination timetable has been published. Please check your hall allocations.',
        category: 'announcement',
        institution: 'National Institute of Technology Tiruchirappalli (NIT Trichy)',
        isGlobal: false,
        deadlineDate: new Date('2026-10-25T17:00:00.000Z'),
        createdBy: { _id: crNITT._id.toString(), name: crNITT.name }
      },
      {
        title: 'IIT Bombay: Techfest Campus Ambassador Registrations',
        content: 'Call for student volunteers and campus leads for Asia\'s largest tech festival.',
        category: 'event',
        institution: 'Indian Institute of Technology Bombay (IIT Bombay)',
        isGlobal: false,
        deadlineDate: new Date('2026-11-01T23:59:00.000Z'),
        createdBy: { _id: crIITB._id.toString(), name: crIITB.name }
      }
    ]);

    await Document.create([
      {
        title: 'Database Management Systems (DBMS) - Complete Unit 1 to 5 Notes',
        description: 'Detailed handwritten lecture notes covering ER diagrams, Relational Algebra, SQL, Normalization, and Concurrency Control.',
        subjectName: 'Database Management Systems',
        subjectCode: 'CS2203',
        category: 'notes',
        institution: 'National Institute of Technology Tiruchirappalli (NIT Trichy)',
        isPublic: true,
        fileUrl: '/uploads/dbms_complete_notes.pdf',
        fileName: 'DBMS_Unit_1_to_5_Complete.pdf',
        fileSize: '4.8 MB',
        uploadedBy: { _id: crNITT._id.toString(), name: crNITT.name }
      },
      {
        title: 'NITT Operating Systems Lab Manual & Practice Problems',
        description: 'Department internal lab manual with POSIX thread exercises and semaphore implementations.',
        subjectName: 'Operating Systems Lab',
        subjectCode: 'CS2205',
        category: 'assignment',
        institution: 'National Institute of Technology Tiruchirappalli (NIT Trichy)',
        isPublic: false,
        fileUrl: '/uploads/nitt_os_lab_manual.pdf',
        fileName: 'OS_Lab_Manual_NITT.pdf',
        fileSize: '2.1 MB',
        uploadedBy: { _id: crNITT._id.toString(), name: crNITT.name }
      },
      {
        title: 'Advanced Algorithms & Complexity (IIT Bombay CS601)',
        description: 'Comprehensive lecture slides & problem sets by Prof. at CSE IIT Bombay. Covers NP-Completeness and Linear Programming.',
        subjectName: 'Advanced Algorithms',
        subjectCode: 'CS601',
        category: 'notes',
        institution: 'Indian Institute of Technology Bombay (IIT Bombay)',
        isPublic: true,
        fileUrl: '/uploads/iitb_advanced_algorithms.pdf',
        fileName: 'IITB_CS601_Algorithms_Notes.pdf',
        fileSize: '7.2 MB',
        uploadedBy: { _id: crIITB._id.toString(), name: crIITB.name }
      },
      {
        title: 'IIT Bombay End-Semester PYQs (2021-2025): Machine Learning',
        description: 'Previous 5 years end-sem examination question papers with detailed step-by-step solutions.',
        subjectName: 'Machine Learning & AI',
        subjectCode: 'CS725',
        category: 'pyq',
        institution: 'Indian Institute of Technology Bombay (IIT Bombay)',
        isPublic: true,
        fileUrl: '/uploads/iitb_ml_pyqs_sol.pdf',
        fileName: 'IITB_CS725_ML_PYQ_Solved.pdf',
        fileSize: '5.4 MB',
        uploadedBy: { _id: crIITB._id.toString(), name: crIITB.name }
      },
      {
        title: 'Distributed Systems & Cloud Computing Architectures',
        description: 'Lecture notes on Raft, Paxos, Kafka, and distributed consensus from IIT Delhi COL733.',
        subjectName: 'Cloud Computing & Systems',
        subjectCode: 'COL733',
        category: 'study_material',
        institution: 'Indian Institute of Technology Delhi (IIT Delhi)',
        isPublic: true,
        fileUrl: '/uploads/iitd_col733_distributed_systems.pdf',
        fileName: 'IITDelhi_COL733_DistributedSystems.pdf',
        fileSize: '6.1 MB',
        uploadedBy: { _id: crIITB._id.toString(), name: 'Kunal Mehra (IITD)' }
      }
    ]);

    console.log('MongoDB Seeded successfully with multi-college datasets!');
    process.exit(0);
  } catch (err) {
    console.log('MongoDB seed skipped or timed out (expected if using fallback mode):', err.message);
    process.exit(0);
  }
}

seed();
