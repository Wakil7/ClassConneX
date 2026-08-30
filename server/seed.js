/**
 * ClassConneX - MongoDB Seed Script
 * Populates the database with realistic dummy data.
 * Run: node seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ── Inline Schemas (avoids the fallback-mode wrapper) ─────────────────────────

const UserSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  email:      { type: String, required: true, unique: true },
  password:   { type: String, required: true },
  role:       { type: String, enum: ['student', 'cr'], default: 'student' },
  rollNumber: { type: String, required: true },
  createdAt:  { type: Date, default: Date.now }
});

const NoticeSchema = new mongoose.Schema({
  title:        { type: String, required: true },
  content:      { type: String, required: true },
  category:     { type: String, enum: ['announcement', 'deadline', 'event'], default: 'announcement' },
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
  fileUrl:     { type: String, required: true },
  fileName:    { type: String, required: true },
  fileSize:    { type: String },
  uploadedBy: {
    _id:  { type: String, required: true },
    name: { type: String, required: true }
  },
  createdAt: { type: Date, default: Date.now }
});

const User     = mongoose.model('User',     UserSchema);
const Notice   = mongoose.model('Notice',   NoticeSchema);
const Document = mongoose.model('Document', DocumentSchema);

// ── Helpers ────────────────────────────────────────────────────────────────────

const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);
const daysFromNow = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);
const hash = (pw) => bcrypt.hashSync(pw, 10);

// ── Seed Data ─────────────────────────────────────────────────────────────────

async function seed() {
  console.log('🔌 Connecting to MongoDB…');
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/classconnex');
  console.log('✅ Connected.\n');

  // ── Clear existing data ──────────────────────────────────────────────────────
  await Promise.all([User.deleteMany({}), Notice.deleteMany({}), Document.deleteMany({})]);
  console.log('🗑️  Cleared existing collections.\n');

  // ── Users ────────────────────────────────────────────────────────────────────
  const users = await User.insertMany([
    // 1 CR
    {
      name:       'Priya Sharma',
      email:      'cr@classconnex.com',
      password:   hash('cr12345'),
      role:       'cr',
      rollNumber: '2024CSEB01',
      createdAt:  daysAgo(90)
    },
    // Students
    {
      name:       'Arjun Mehta',
      email:      'arjun.mehta@classconnex.com',
      password:   hash('student123'),
      role:       'student',
      rollNumber: '2024CSEB12',
      createdAt:  daysAgo(85)
    },
    {
      name:       'Sneha Patel',
      email:      'sneha.patel@classconnex.com',
      password:   hash('student123'),
      role:       'student',
      rollNumber: '2024CSEB19',
      createdAt:  daysAgo(80)
    },
    {
      name:       'Rohan Das',
      email:      'rohan.das@classconnex.com',
      password:   hash('student123'),
      role:       'student',
      rollNumber: '2024CSEB27',
      createdAt:  daysAgo(78)
    },
    {
      name:       'Anjali Nair',
      email:      'anjali.nair@classconnex.com',
      password:   hash('student123'),
      role:       'student',
      rollNumber: '2024CSEB34',
      createdAt:  daysAgo(70)
    },
    {
      name:       'Karan Verma',
      email:      'karan.verma@classconnex.com',
      password:   hash('student123'),
      role:       'student',
      rollNumber: '2024CSEB41',
      createdAt:  daysAgo(65)
    },
    {
      name:       'Divya Krishnan',
      email:      'divya.k@classconnex.com',
      password:   hash('student123'),
      role:       'student',
      rollNumber: '2024CSEB47',
      createdAt:  daysAgo(60)
    },
  ]);

  const cr      = users[0];
  const crRef   = { _id: cr._id.toString(), name: cr.name };
  console.log(`👥 Inserted ${users.length} users.`);

  // ── Notices ──────────────────────────────────────────────────────────────────
  const notices = await Notice.insertMany([
    // --- Announcements ---
    {
      title:     'Welcome to Semester 4 — ClassConneX is Live!',
      content:   'Hello everyone! I\'m Priya, your Class Representative for CS-B 2024. This platform is your one-stop hub for all notices, deadlines, events, and study material. Bookmark it and check daily. Wishing you all a productive semester ahead! 🎓',
      category:  'announcement',
      createdBy: crRef,
      createdAt: daysAgo(88)
    },
    {
      title:     'Lab Practical Schedule Released — Check Timetable',
      content:   'The Lab Practical schedule for Semester 4 has been released by the Department. DS Lab is on Mondays (10–12 PM, Lab 3) and OS Lab is on Wednesdays (2–4 PM, Lab 1). Please carry your lab journal and completed write-ups every session. Attendance is compulsory.',
      category:  'announcement',
      createdBy: crRef,
      createdAt: daysAgo(75)
    },
    {
      title:     'Guest Lecture: Mr. Vikram Nair from Google on System Design',
      content:   'We are thrilled to announce a guest lecture by Mr. Vikram Nair, Senior Software Engineer at Google, on the topic "System Design at Scale". The session will be held in Seminar Hall A on 28th June 2026, 11 AM – 1 PM. Attendance will be counted as an elective credit hour. Register using the link shared on WhatsApp.',
      category:  'announcement',
      createdBy: crRef,
      createdAt: daysAgo(60)
    },
    {
      title:     'Internal Marks Distribution — Semester 4',
      content:   'Based on discussions with faculty, here is the internal marks breakdown for all core subjects:\n\n• Data Structures: 20 (Assignments) + 30 (Internals)\n• OS: 20 (Lab record) + 30 (Internals)\n• TOC: 10 (Quiz) + 40 (Internals)\n• DBMS: 20 (Mini project) + 30 (Internals)\n• Maths IV: 10 (Assignments) + 40 (Internals)\n\nMake sure you collect your corrected assignment papers from the staff room by next Monday.',
      category:  'announcement',
      createdBy: crRef,
      createdAt: daysAgo(45)
    },
    {
      title:     'College Uniform Policy Reminder',
      content:   'The college administration has issued a reminder that students must wear the prescribed uniform on all working days. Defaulters will be marked absent regardless of physical presence. ID cards are mandatory. Casual dress is allowed only on Fridays. — CR on behalf of HOD office.',
      category:  'announcement',
      createdBy: crRef,
      createdAt: daysAgo(30)
    },
    {
      title:     'New Elective Registration Opens Monday',
      content:   'Semester 5 elective registration opens this Monday on the college portal. Available electives include: Machine Learning, Cybersecurity Fundamentals, Cloud Computing, and Mobile App Development. Seats are limited (30 per elective) and allotted on a first-come-first-served basis. Log in using your student ID.',
      category:  'announcement',
      createdBy: crRef,
      createdAt: daysAgo(10)
    },

    // --- Deadlines ---
    {
      title:     'DBMS Mini Project Submission — 20th June',
      content:   'Reminder: Your DBMS Mini Project (Phase 2 — Implementation) is due on 20th June 2026. Submit a zipped folder containing: source code, ER diagram, schema SQL file, and a short report (2–4 pages). Upload via the college portal under "DBMS Mini Project" section. Late submissions will incur a 50% mark deduction.',
      category:  'deadline',
      deadlineDate: daysFromNow(6),
      createdBy: crRef,
      createdAt: daysAgo(20)
    },
    {
      title:     'Data Structures Assignment 3 Due — 17th June',
      content:   'Assignment 3 covers Graphs (BFS, DFS, Shortest Path). Questions:\n1. Implement Dijkstra\'s algorithm for a weighted graph\n2. Detect cycle in a directed graph using DFS\n3. Find strongly connected components (Kosaraju\'s)\n\nHandwritten submissions only. Submit to Prof. Gupta\'s cabin before 4 PM on 17th June.',
      category:  'deadline',
      deadlineDate: daysFromNow(3),
      createdBy: crRef,
      createdAt: daysAgo(14)
    },
    {
      title:     'Theory of Computation Quiz 2 — 25th June',
      content:   'TOC Quiz 2 will be conducted in the classroom on 25th June 2026 from 9–10 AM. Syllabus: Regular Expressions, Finite Automata (DFA/NFA), Context-Free Grammars, and Pushdown Automata. Carry your ID card. No late entries allowed. Prepare from the study material uploaded on ClassConneX.',
      category:  'deadline',
      deadlineDate: daysFromNow(11),
      createdBy: crRef,
      createdAt: daysAgo(8)
    },
    {
      title:     'OS Lab Record Submission — 22nd June',
      content:   'Final OS Lab Record (including all 12 experiments) must be submitted to the lab in-charge by 22nd June. Missing experiments will lead to reduction in lab internal marks. If you have any doubts, meet Prof. Reddy during her office hours (Tuesday, 3–4 PM).',
      category:  'deadline',
      deadlineDate: daysFromNow(8),
      createdBy: crRef,
      createdAt: daysAgo(5)
    },
    {
      title:     'Internal Assessment 2 — Timetable',
      content:   'Internal Assessment 2 schedule:\n• 30 Jun — Data Structures (9–10 AM)\n• 01 Jul — Operating Systems (11–12 PM)\n• 02 Jul — DBMS (2–3 PM)\n• 03 Jul — TOC (9–10 AM)\n• 04 Jul — Maths IV (11–12 AM)\n\nSyllabus: Entire Unit 3 + Unit 4 of each subject. Exam is closed-book. Hall tickets will be distributed on 28th June.',
      category:  'deadline',
      deadlineDate: daysFromNow(16),
      createdBy: crRef,
      createdAt: daysAgo(3)
    },

    // --- Events ---
    {
      title:     'TechFest 2026 — Register Your Teams Now!',
      content:   'ClassConneX TechFest 2026 is here! Events include Hackathon (24 hrs), Code Sprint, UI/UX Design Challenge, and Debugging Relay. Registration is open till 19th June. Team size: 2–4 members. Prize pool: ₹50,000. Register at the link pinned on WhatsApp. Use your college email to sign up.',
      category:  'event',
      eventDate: daysFromNow(14),
      createdBy: crRef,
      createdAt: daysAgo(25)
    },
    {
      title:     'Farewell Ceremony for Final Year Students — 29th June',
      content:   'The farewell ceremony for the outgoing batch (2021–2025) will be held on 29th June 2026 in the college auditorium at 5 PM. Our class has been asked to help organize the decoration committee. Volunteers please reply in the class WhatsApp group by tomorrow night. Formal dress code for all attendees.',
      category:  'event',
      eventDate: daysFromNow(15),
      createdBy: crRef,
      createdAt: daysAgo(18)
    },
    {
      title:     'Industrial Visit — Infosys Mysore Campus (4th July)',
      content:   'An industrial visit to the Infosys Mysore Development Centre has been arranged for 4th July 2026. Bus departs at 7 AM sharp from the college main gate. Return expected by 7 PM. Participation fee: ₹200 (covers transport + lunch). Submit fee to CR by 21st June. Formal dress is mandatory. Max 40 seats.',
      category:  'event',
      eventDate: daysFromNow(20),
      createdBy: crRef,
      createdAt: daysAgo(12)
    },
    {
      title:     'Sports Day — Inter-Class Cricket & Badminton',
      content:   'Inter-class sports event is scheduled on 7th July 2026 (Cricket) and 8th July 2026 (Badminton). CS-B team for cricket: Arjun, Karan, Rohan + 8 more (see WhatsApp). Badminton: Mixed doubles — register your pairs with CR by 25th June. Wear sports kit. Event will be held in the ground near Block C.',
      category:  'event',
      eventDate: daysFromNow(23),
      createdBy: crRef,
      createdAt: daysAgo(7)
    },
    {
      title:     'Workshop: Git & GitHub for Beginners — 18th June',
      content:   'A hands-on workshop on Git & GitHub will be conducted by senior students from the coding club on 18th June 2026, 2–5 PM in Lab 2. Topics: version control basics, branching, merging, pull requests, and GitHub Actions intro. Bring your laptops. Free for all students. Certificate of participation will be issued.',
      category:  'event',
      eventDate: daysFromNow(4),
      createdBy: crRef,
      createdAt: daysAgo(4)
    },
    {
      title:     'Alumni Talk: Career Paths After CS Degree',
      content:   'Our department is hosting an alumni interaction session on 22nd June 2026, 4–6 PM (Online via Google Meet — link will be shared). Alumni from Google, Flipkart, and various startups will speak about their journeys, FAANG preparation, and MBA vs MS decisions. Attendance is optional but highly recommended!',
      category:  'event',
      eventDate: daysFromNow(8),
      createdBy: crRef,
      createdAt: daysAgo(2)
    },
  ]);
  console.log(`📢 Inserted ${notices.length} notices.`);

  // ── Documents ────────────────────────────────────────────────────────────────
  const documents = await Document.insertMany([
    // --- Data Structures Notes ---
    {
      title:       'Unit 1 Notes — Arrays, Linked Lists & Stacks',
      description: 'Comprehensive notes covering arrays, singly and doubly linked lists, stack operations, and applications. Includes solved examples and time-complexity analysis.',
      subjectName: 'Data Structures',
      subjectCode: 'CS2201',
      category:    'notes',
      fileUrl:     '/uploads/dummy/ds_unit1_notes.pdf',
      fileName:    'DS_Unit1_Notes.pdf',
      fileSize:    '2.4 MB',
      uploadedBy:  crRef,
      createdAt:   daysAgo(80)
    },
    {
      title:       'Unit 2 Notes — Trees & Binary Search Trees',
      description: 'Detailed notes on binary trees, BST insertion/deletion, AVL trees, heaps, and traversal algorithms (in-order, pre-order, post-order).',
      subjectName: 'Data Structures',
      subjectCode: 'CS2201',
      category:    'notes',
      fileUrl:     '/uploads/dummy/ds_unit2_notes.pdf',
      fileName:    'DS_Unit2_Trees.pdf',
      fileSize:    '3.1 MB',
      uploadedBy:  crRef,
      createdAt:   daysAgo(60)
    },
    {
      title:       'Unit 3 Notes — Graphs & Hashing',
      description: 'Graph representations (adjacency matrix/list), BFS/DFS traversal, Dijkstra\'s, Kruskal\'s, Prim\'s algorithms, and hash table implementations.',
      subjectName: 'Data Structures',
      subjectCode: 'CS2201',
      category:    'notes',
      fileUrl:     '/uploads/dummy/ds_unit3_graphs.pdf',
      fileName:    'DS_Unit3_Graphs_Hashing.pdf',
      fileSize:    '2.8 MB',
      uploadedBy:  crRef,
      createdAt:   daysAgo(40)
    },
    // --- DS Assignments ---
    {
      title:       'Assignment 1 — Sorting Algorithms (with Solutions)',
      description: 'Assignment 1 questions on Bubble, Selection, Insertion, Merge and Quick Sort. Includes worked solutions and complexity table.',
      subjectName: 'Data Structures',
      subjectCode: 'CS2201',
      category:    'assignment',
      fileUrl:     '/uploads/dummy/ds_asgn1_sorting.pdf',
      fileName:    'DS_Assignment1_Sorting.pdf',
      fileSize:    '1.2 MB',
      uploadedBy:  crRef,
      createdAt:   daysAgo(55)
    },
    {
      title:       'Assignment 2 — Linked List Programs',
      description: 'Programs to reverse a linked list, detect a loop, merge two sorted linked lists, and find the middle node. Submitted solutions from the class topper.',
      subjectName: 'Data Structures',
      subjectCode: 'CS2201',
      category:    'assignment',
      fileUrl:     '/uploads/dummy/ds_asgn2_ll.pdf',
      fileName:    'DS_Assignment2_LinkedList.pdf',
      fileSize:    '0.9 MB',
      uploadedBy:  crRef,
      createdAt:   daysAgo(35)
    },
    // --- DS PYQ ---
    {
      title:       'Previous Year Questions — DS (2021–2024)',
      description: 'Compiled PYQ papers for Data Structures from 2021 to 2024 semester exams. Extremely useful for exam preparation.',
      subjectName: 'Data Structures',
      subjectCode: 'CS2201',
      category:    'pyq',
      fileUrl:     '/uploads/dummy/ds_pyq_2021_2024.pdf',
      fileName:    'DS_PYQ_2021_2024.pdf',
      fileSize:    '5.6 MB',
      uploadedBy:  crRef,
      createdAt:   daysAgo(20)
    },

    // --- Operating Systems ---
    {
      title:       'OS Unit 1 — Process Management & Scheduling',
      description: 'Covers process life cycle, PCB, context switching, CPU scheduling algorithms (FCFS, SJF, Round Robin, Priority Scheduling) with examples and Gantt charts.',
      subjectName: 'Operating Systems',
      subjectCode: 'CS2202',
      category:    'notes',
      fileUrl:     '/uploads/dummy/os_unit1_process.pdf',
      fileName:    'OS_Unit1_ProcessScheduling.pdf',
      fileSize:    '3.5 MB',
      uploadedBy:  crRef,
      createdAt:   daysAgo(75)
    },
    {
      title:       'OS Unit 2 — Memory Management & Virtual Memory',
      description: 'Memory partitioning, paging, segmentation, TLB, page replacement algorithms (FIFO, LRU, Optimal), and thrashing explained with diagrams.',
      subjectName: 'Operating Systems',
      subjectCode: 'CS2202',
      category:    'notes',
      fileUrl:     '/uploads/dummy/os_unit2_memory.pdf',
      fileName:    'OS_Unit2_MemoryManagement.pdf',
      fileSize:    '4.0 MB',
      uploadedBy:  crRef,
      createdAt:   daysAgo(50)
    },
    {
      title:       'OS Lab Manual — All 12 Experiments',
      description: 'Complete OS Lab manual with source code (C programs), expected output, and viva questions for all 12 lab experiments including shell scripting, process creation (fork/exec), semaphores, and more.',
      subjectName: 'Operating Systems',
      subjectCode: 'CS2202',
      category:    'study_material',
      fileUrl:     '/uploads/dummy/os_lab_manual.pdf',
      fileName:    'OS_Lab_Manual_Complete.pdf',
      fileSize:    '6.2 MB',
      uploadedBy:  crRef,
      createdAt:   daysAgo(45)
    },
    {
      title:       'OS PYQ — 2022 to 2025 (University Exams)',
      description: 'University exam question papers for OS from 2022–2025. Includes repeated questions highlighted and chapter-wise categorization.',
      subjectName: 'Operating Systems',
      subjectCode: 'CS2202',
      category:    'pyq',
      fileUrl:     '/uploads/dummy/os_pyq.pdf',
      fileName:    'OS_PYQ_2022_2025.pdf',
      fileSize:    '4.8 MB',
      uploadedBy:  crRef,
      createdAt:   daysAgo(15)
    },

    // --- DBMS ---
    {
      title:       'DBMS Notes — ER Diagrams, Relational Model & Normalization',
      description: 'Complete notes on Entity-Relationship diagrams, converting ER to relational schema, functional dependencies, and normalization up to BCNF with examples.',
      subjectName: 'Database Management Systems',
      subjectCode: 'CS2203',
      category:    'notes',
      fileUrl:     '/uploads/dummy/dbms_unit1_er.pdf',
      fileName:    'DBMS_Unit1_ER_Normalization.pdf',
      fileSize:    '3.9 MB',
      uploadedBy:  crRef,
      createdAt:   daysAgo(70)
    },
    {
      title:       'DBMS SQL Reference Sheet',
      description: 'Quick reference for SQL commands: DDL (CREATE, ALTER, DROP), DML (SELECT, INSERT, UPDATE, DELETE), aggregate functions, joins, subqueries, and views. Print-friendly format.',
      subjectName: 'Database Management Systems',
      subjectCode: 'CS2203',
      category:    'study_material',
      fileUrl:     '/uploads/dummy/dbms_sql_cheatsheet.pdf',
      fileName:    'DBMS_SQL_CheatSheet.pdf',
      fileSize:    '0.7 MB',
      uploadedBy:  crRef,
      createdAt:   daysAgo(42)
    },
    {
      title:       'DBMS Mini Project Guide — Phase 1 & Phase 2',
      description: 'Step-by-step guide for the DBMS mini project including suggested project ideas (Library Management, Hospital Management, Online Exam System), ER diagram templates, normalization checklist, and report format.',
      subjectName: 'Database Management Systems',
      subjectCode: 'CS2203',
      category:    'assignment',
      fileUrl:     '/uploads/dummy/dbms_miniproject_guide.pdf',
      fileName:    'DBMS_MiniProject_Guide.pdf',
      fileSize:    '1.8 MB',
      uploadedBy:  crRef,
      createdAt:   daysAgo(28)
    },

    // --- TOC ---
    {
      title:       'TOC Handwritten Notes — Automata & Formal Languages',
      description: 'Handwritten notes scanned from class, covering DFA/NFA construction, equivalence, Regular Expressions, Pumping Lemma, CFGs, CNF, and Turing Machines.',
      subjectName: 'Theory of Computation',
      subjectCode: 'CS2204',
      category:    'notes',
      fileUrl:     '/uploads/dummy/toc_handwritten.pdf',
      fileName:    'TOC_Handwritten_Notes.pdf',
      fileSize:    '7.3 MB',
      uploadedBy:  crRef,
      createdAt:   daysAgo(65)
    },
    {
      title:       'TOC Important Questions — Internal & University Exam',
      description: 'Curated list of 40 important questions sorted by unit and difficulty. Includes expected questions from Prof. Venkatesh based on patterns from last 5 years.',
      subjectName: 'Theory of Computation',
      subjectCode: 'CS2204',
      category:    'study_material',
      fileUrl:     '/uploads/dummy/toc_imp_questions.pdf',
      fileName:    'TOC_Important_Questions.pdf',
      fileSize:    '1.1 MB',
      uploadedBy:  crRef,
      createdAt:   daysAgo(18)
    },

    // --- Maths ---
    {
      title:       'Engineering Maths IV — Unit 1: Fourier Series',
      description: 'Complete solved problems on Fourier Series, Euler\'s formulae, half-range expansions, and Parseval\'s identity. Sourced from R.K. Kanodia + class notes.',
      subjectName: 'Engineering Mathematics IV',
      subjectCode: 'MA2201',
      category:    'notes',
      fileUrl:     '/uploads/dummy/maths4_fourier.pdf',
      fileName:    'Maths4_Fourier_Series.pdf',
      fileSize:    '2.6 MB',
      uploadedBy:  crRef,
      createdAt:   daysAgo(62)
    },
    {
      title:       'Maths IV — Assignment 1 (Transforms) Solutions',
      description: 'Solved assignment on Laplace Transforms and Z-Transforms. All 10 questions with step-by-step workings. Marks obtained: 18/20.',
      subjectName: 'Engineering Mathematics IV',
      subjectCode: 'MA2201',
      category:    'assignment',
      fileUrl:     '/uploads/dummy/maths4_asgn1_solutions.pdf',
      fileName:    'Maths4_Transforms_Assignment_Solutions.pdf',
      fileSize:    '1.5 MB',
      uploadedBy:  crRef,
      createdAt:   daysAgo(32)
    },
  ]);
  console.log(`📁 Inserted ${documents.length} documents.`);

  // ── Summary ───────────────────────────────────────────────────────────────────
  console.log('\n🎉 Seed complete!');
  console.log('─────────────────────────────────────────────');
  console.log(`  Users     : ${users.length}`);
  console.log(`  Notices   : ${notices.length}`);
  console.log(`  Documents : ${documents.length}`);
  console.log('─────────────────────────────────────────────');
  console.log('\n📋 Login credentials:');
  console.log('  CR (Class Rep)  → cr@classconnex.com        / cr12345');
  console.log('  Student         → arjun.mehta@classconnex.com / student123');
  console.log('  (All other students also use: student123)\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
