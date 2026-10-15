const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Helpers for PDF generation
async function createAcademicPDF({ filename, title, subjectName, subjectCode, collegeName, category, pagesContent, primaryColor }) {
  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const totalPages = pagesContent.length;

  for (let i = 0; i < totalPages; i++) {
    const pageNum = i + 1;
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 (w, h)
    const { width, height } = page.getSize();

    // Top Header Banner
    page.drawRectangle({
      x: 0,
      y: height - 85,
      width: width,
      height: 85,
      color: rgb(primaryColor.r, primaryColor.g, primaryColor.b)
    });

    // College Name
    page.drawText(collegeName.toUpperCase(), {
      x: 40,
      y: height - 32,
      size: 13,
      font: fontBold,
      color: rgb(1, 1, 1)
    });

    // Subject & Code
    page.drawText(`${subjectName} (${subjectCode}) • ${category.toUpperCase()}`, {
      x: 40,
      y: height - 52,
      size: 11,
      font: fontRegular,
      color: rgb(0.9, 0.95, 1)
    });

    // Document Title
    page.drawText(title, {
      x: 40,
      y: height - 72,
      size: 10,
      font: fontOblique,
      color: rgb(0.8, 0.88, 0.98)
    });

    // Decorative underline bar
    page.drawRectangle({
      x: 40,
      y: height - 98,
      width: width - 80,
      height: 2,
      color: rgb(primaryColor.r, primaryColor.g, primaryColor.b)
    });

    // Content for this page
    const pageData = pagesContent[i];
    let currentY = height - 125;

    // Page Section Title
    page.drawText(pageData.sectionTitle, {
      x: 40,
      y: currentY,
      size: 15,
      font: fontBold,
      color: rgb(primaryColor.r, primaryColor.g, primaryColor.b)
    });
    currentY -= 22;

    if (pageData.subtitle) {
      page.drawText(pageData.subtitle, {
        x: 40,
        y: currentY,
        size: 11,
        font: fontOblique,
        color: rgb(0.35, 0.4, 0.45)
      });
      currentY -= 24;
    }

    // Paragraphs / bullet points
    for (const para of pageData.paragraphs) {
      if (para.type === 'heading') {
        currentY -= 8;
        page.drawText(para.text, {
          x: 40,
          y: currentY,
          size: 12,
          font: fontBold,
          color: rgb(0.15, 0.2, 0.25)
        });
        currentY -= 18;
      } else if (para.type === 'bullet') {
        page.drawText('•', {
          x: 45,
          y: currentY,
          size: 11,
          font: fontBold,
          color: rgb(primaryColor.r, primaryColor.g, primaryColor.b)
        });
        page.drawText(para.text, {
          x: 60,
          y: currentY,
          size: 10,
          font: fontRegular,
          color: rgb(0.2, 0.25, 0.3)
        });
        currentY -= 17;
      } else if (para.type === 'box') {
        const boxHeight = para.lines.length * 15 + 16;
        currentY -= (boxHeight - 12);
        page.drawRectangle({
          x: 40,
          y: currentY,
          width: width - 80,
          height: boxHeight,
          color: rgb(0.96, 0.97, 0.99),
          borderColor: rgb(0.8, 0.85, 0.9),
          borderWidth: 1
        });
        let lineY = currentY + boxHeight - 16;
        for (const line of para.lines) {
          page.drawText(line, {
            x: 52,
            y: lineY,
            size: 9.5,
            font: fontRegular,
            color: rgb(0.1, 0.2, 0.35)
          });
          lineY -= 15;
        }
        currentY -= 16;
      } else {
        page.drawText(para.text, {
          x: 40,
          y: currentY,
          size: 10,
          font: fontRegular,
          color: rgb(0.2, 0.25, 0.3)
        });
        currentY -= 16;
      }
    }

    // Footer
    page.drawRectangle({
      x: 40,
      y: 45,
      width: width - 80,
      height: 1,
      color: rgb(0.85, 0.88, 0.92)
    });

    page.drawText(`ClassConneX Academic Network • ${collegeName}`, {
      x: 40,
      y: 30,
      size: 9,
      font: fontOblique,
      color: rgb(0.5, 0.55, 0.6)
    });

    page.drawText(`Page ${pageNum} of ${totalPages}`, {
      x: width - 95,
      y: 30,
      size: 9,
      font: fontBold,
      color: rgb(0.4, 0.45, 0.5)
    });
  }

  const pdfBytes = await pdfDoc.save();
  const filePath = path.join(uploadsDir, filename);
  fs.writeFileSync(filePath, pdfBytes);
  const sizeKB = (pdfBytes.length / 1024).toFixed(1) + ' KB';
  console.log(`Generated PDF: ${filename} (${totalPages} pages, ${sizeKB})`);
  return { filename, sizeKB, pageCount: totalPages };
}

// Model Schemas
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'cr'], default: 'student' },
  rollNumber: { type: String, required: true },
  institution: { type: String, default: 'National Institute of Technology Tiruchirappalli (NIT Trichy)' },
  createdAt: { type: Date, default: Date.now }
});

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

const DocumentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  subjectName: { type: String, required: true },
  subjectCode: { type: String, required: true },
  category: { type: String, enum: ['notes', 'assignment', 'study_material', 'pyq'], default: 'notes' },
  institution: { type: String, required: true },
  isPublic: { type: Boolean, default: true },
  fileUrl: { type: String, required: true },
  fileName: { type: String, required: true },
  fileSize: { type: String },
  uploadedBy: {
    _id: { type: String, required: true },
    name: { type: String, required: true }
  },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Notice = mongoose.model('Notice', NoticeSchema);
const Document = mongoose.model('Document', DocumentSchema);

async function main() {
  console.log('--- Generating 6 Multi-Page Academic PDFs (2-3 Pages each) ---');

  // PDF 1: NIT Trichy DBMS Notes (3 Pages)
  await createAcademicPDF({
    filename: 'NIT_Trichy_CS2203_DBMS_Notes.pdf',
    title: 'Database Management Systems - Units 1 to 3 Complete Lecture Notes',
    subjectName: 'Database Management Systems',
    subjectCode: 'CS2203',
    collegeName: 'National Institute of Technology Tiruchirappalli (NIT Trichy)',
    category: 'Lecture Notes',
    primaryColor: { r: 0.12, g: 0.28, b: 0.58 }, // NIT Deep Navy Blue
    pagesContent: [
      {
        sectionTitle: 'Unit 1: Entity-Relationship (ER) Modeling & Architecture',
        subtitle: 'Core database concepts, abstraction levels, and data models',
        paragraphs: [
          { type: 'heading', text: '1.1 Three-Schema Architecture of DBMS' },
          { type: 'text', text: 'The ANSI/SPARC architecture defines three levels of data abstraction:' },
          { type: 'bullet', text: 'Physical/Internal Level: Describes physical storage structures and file access paths.' },
          { type: 'bullet', text: 'Conceptual/Logical Level: Describes what data is stored and entity relationships.' },
          { type: 'bullet', text: 'External/View Level: Tailored representations for distinct user applications.' },
          { type: 'heading', text: '1.2 Entity-Relationship (ER) Model Concepts' },
          { type: 'bullet', text: 'Entity: An object distinct from other objects (e.g., Student, Course).' },
          { type: 'bullet', text: 'Attributes: Simple, Composite, Derived, and Multivalued attributes.' },
          { type: 'bullet', text: 'Candidate Key: Minimal superkey uniquely identifying an entity tuple.' },
          { type: 'bullet', text: 'Primary Key: Candidate key chosen by database designer as primary identifier.' },
          { type: 'box', lines: [
            'Example ER Relationship:',
            'STUDENT(RollNo, Name, Email, DeptID) --[ENROLLS_IN]--> COURSE(CourseCode, Title, Credits)',
            'Cardinality: Many-to-Many (N:M) with EnrollmentDate as descriptive relationship attribute.'
          ]}
        ]
      },
      {
        sectionTitle: 'Unit 2: Relational Model & Relational Algebra Operators',
        subtitle: 'Formal query languages, set operators, and relational operations',
        paragraphs: [
          { type: 'heading', text: '2.1 Fundamental Relational Algebra Operations' },
          { type: 'text', text: 'Relational algebra provides formal foundations for SQL execution plans:' },
          { type: 'bullet', text: 'Selection (sigma): Selects rows satisfying a given condition sigma_p(R).' },
          { type: 'bullet', text: 'Projection (pi): Extracts specified columns and eliminates duplicate rows pi_A(R).' },
          { type: 'bullet', text: 'Cartesian Product (X): Combines tuples from two relations R X S.' },
          { type: 'bullet', text: 'Set Union (U), Set Difference (-), and Intersection (intersection).' },
          { type: 'heading', text: '2.2 Advanced Join Operations' },
          { type: 'bullet', text: 'Theta Join: Joins relations on an arbitrary predicate R |><|_theta S.' },
          { type: 'bullet', text: 'Natural Join: Equi-join on all common attributes followed by projection.' },
          { type: 'bullet', text: 'Outer Joins: Left Outer, Right Outer, and Full Outer Joins preserving unmatched tuples.' },
          { type: 'box', lines: [
            'Relational Algebra Example Query:',
            'Find names of all students enrolled in CS2203 with grade A:',
            'pi_Name ( sigma_CourseCode="CS2203" AND Grade="A" ( STUDENT |><| ENROLLMENT ) )'
          ]}
        ]
      },
      {
        sectionTitle: 'Unit 3: Functional Dependencies & Normalization Theory',
        subtitle: 'Eliminating anomalies, normal forms 1NF to BCNF, and dependency preservation',
        paragraphs: [
          { type: 'heading', text: '3.1 Database Anomalies' },
          { type: 'bullet', text: 'Insertion Anomaly: Inability to insert partial records without dummy data.' },
          { type: 'bullet', text: 'Deletion Anomaly: Unintended loss of crucial data during tuple deletion.' },
          { type: 'bullet', text: 'Update Anomaly: Inconsistent states due to duplicated data values across rows.' },
          { type: 'heading', text: '3.2 Hierarchy of Normal Forms' },
          { type: 'bullet', text: 'First Normal Form (1NF): All attribute domains contain only atomic, scalar values.' },
          { type: 'bullet', text: 'Second Normal Form (2NF): In 1NF and no non-prime attribute is partially dependent on any candidate key.' },
          { type: 'bullet', text: 'Third Normal Form (3NF): In 2NF and no non-prime attribute is transitively dependent on candidate keys.' },
          { type: 'bullet', text: 'Boyce-Codd Normal Form (BCNF): For every non-trivial FD X -> Y, X must be a superkey.' },
          { type: 'box', lines: [
            'Decomposition Criteria:',
            '1. Lossless-Join Decomposition: R1 intersection R2 -> R1 OR R1 intersection R2 -> R2.',
            '2. Dependency Preservation: (F1 union F2)+ must equal F+.'
          ]}
        ]
      }
    ]
  });

  // PDF 2: NIT Trichy OS Lab Manual (2 Pages)
  await createAcademicPDF({
    filename: 'NIT_Trichy_CS2205_OS_Lab_Manual.pdf',
    title: 'Operating Systems Lab - IPC, POSIX Threads & Synchronization Manual',
    subjectName: 'Operating Systems Lab',
    subjectCode: 'CS2205',
    collegeName: 'National Institute of Technology Tiruchirappalli (NIT Trichy)',
    category: 'Lab Assignment',
    primaryColor: { r: 0.18, g: 0.35, b: 0.65 }, // NIT Blue
    pagesContent: [
      {
        sectionTitle: 'Experiment 4: POSIX Threads & Producer-Consumer Synchronization',
        subtitle: 'Department of Computer Applications • Lab Exercise 4',
        paragraphs: [
          { type: 'heading', text: 'Objective & Problem Statement' },
          { type: 'text', text: 'Implement a bounded buffer producer-consumer model using POSIX mutex and semaphores.' },
          { type: 'bullet', text: 'Shared buffer capacity: BUFFER_SIZE = 10 items.' },
          { type: 'bullet', text: 'Producer threads produce integers and block when buffer is full.' },
          { type: 'bullet', text: 'Consumer threads consume integers and block when buffer is empty.' },
          { type: 'heading', text: 'Synchronization Primitives' },
          { type: 'bullet', text: 'sem_t empty: Initialized to BUFFER_SIZE (tracks vacant slots).' },
          { type: 'bullet', text: 'sem_t full: Initialized to 0 (tracks occupied slots).' },
          { type: 'bullet', text: 'pthread_mutex_t mutex: Protects critical section (buffer array insertion).' },
          { type: 'box', lines: [
            'Producer Routine Snippet:',
            'sem_wait(&empty);',
            'pthread_mutex_lock(&mutex);',
            'buffer[in] = item; in = (in + 1) % BUFFER_SIZE;',
            'pthread_mutex_unlock(&mutex);',
            'sem_post(&full);'
          ]}
        ]
      },
      {
        sectionTitle: 'Experiment 5: Banker\'s Algorithm for Deadlock Avoidance',
        subtitle: 'Department of Computer Applications • Lab Exercise 5',
        paragraphs: [
          { type: 'heading', text: 'Data Structures & Safety Algorithm' },
          { type: 'text', text: 'Given n processes P0..P4 and m resource types R0..R2:' },
          { type: 'bullet', text: 'Available[m]: Available instances of each resource type.' },
          { type: 'bullet', text: 'Max[n][m]: Maximum demand matrix for each process.' },
          { type: 'bullet', text: 'Allocation[n][m]: Currently allocated resource matrix.' },
          { type: 'bullet', text: 'Need[n][m]: Remaining need = Max[i][j] - Allocation[i][j].' },
          { type: 'heading', text: 'Lab Assignment Submission Instructions' },
          { type: 'bullet', text: '1. Write C program verifying system safe state and printing safe sequence.' },
          { type: 'bullet', text: '2. Handle resource request algorithm when process Pi requests vector Request_i.' },
          { type: 'bullet', text: 'Submit code and terminal screenshots on ClassConneX portal before deadline.' }
        ]
      }
    ]
  });

  // PDF 3: IIT Bombay Advanced Algorithms (3 Pages)
  await createAcademicPDF({
    filename: 'IIT_Bombay_CS601_Advanced_Algorithms.pdf',
    title: 'Advanced Algorithms & Complexity Theory - Comprehensive Lecture Notes',
    subjectName: 'Advanced Algorithms',
    subjectCode: 'CS601',
    collegeName: 'Indian Institute of Technology Bombay (IIT Bombay)',
    category: 'Lecture Notes',
    primaryColor: { r: 0.55, g: 0.12, b: 0.18 }, // IIT Bombay Deep Maroon
    pagesContent: [
      {
        sectionTitle: 'Lecture 1-4: Asymptotic Analysis & Recurrences',
        subtitle: 'Department of Computer Science & Engineering • Prof. Lecture Notes',
        paragraphs: [
          { type: 'heading', text: '1. Master Theorem for Divide-and-Conquer Recurrences' },
          { type: 'text', text: 'For recurrences of the form T(n) = a*T(n/b) + f(n), where a >= 1, b > 1:' },
          { type: 'bullet', text: 'Case 1: If f(n) = O(n^(log_b(a) - epsilon)), then T(n) = Theta(n^(log_b(a))).' },
          { type: 'bullet', text: 'Case 2: If f(n) = Theta(n^(log_b(a)) * log^k(n)), then T(n) = Theta(n^(log_b(a)) * log^(k+1)(n)).' },
          { type: 'bullet', text: 'Case 3: If f(n) = Omega(n^(log_b(a) + epsilon)) and regularity holds, T(n) = Theta(f(n)).' },
          { type: 'heading', text: '2. Amortized Analysis Methodologies' },
          { type: 'bullet', text: 'Aggregate Analysis: Show average cost per operation is T(n)/n over n operations.' },
          { type: 'bullet', text: 'Accounting Method: Assign credit/charge c_hat_i to each operation.' },
          { type: 'bullet', text: 'Potential Method: Define potential function Phi(D_i) >= Phi(D_0).' },
          { type: 'box', lines: [
            'Potential Formula:',
            'c_hat_i = c_i + Phi(D_i) - Phi(D_{i-1})',
            'Sum(c_hat_i) >= Sum(c_i) whenever Phi(D_n) >= Phi(D_0).'
          ]}
        ]
      },
      {
        sectionTitle: 'Lecture 5-8: Dynamic Programming & Network Flow',
        subtitle: 'Department of Computer Science & Engineering • Prof. Lecture Notes',
        paragraphs: [
          { type: 'heading', text: '1. Matrix Chain Multiplication' },
          { type: 'text', text: 'Finding optimal parenthesization of product A_1 * A_2 * ... * A_n with dimensions p_0..p_n:' },
          { type: 'bullet', text: 'Recurrence: m[i,j] = min_{i <= k < j} { m[i,k] + m[k+1,j] + p_{i-1} * p_k * p_j }.' },
          { type: 'bullet', text: 'Time Complexity: O(n^3) using table memoization, Space Complexity: O(n^2).' },
          { type: 'heading', text: '2. Max-Flow Min-Cut Theorem & Ford-Fulkerson' },
          { type: 'bullet', text: 'Given flow network G=(V,E) with source s, sink t, and edge capacities c(u,v).' },
          { type: 'bullet', text: 'Residual capacity: c_f(u,v) = c(u,v) - f(u,v).' },
          { type: 'bullet', text: 'Max-Flow Value equals capacity of minimum s-t cut in the network.' },
          { type: 'box', lines: [
            'Edmonds-Karp Modification:',
            'Using Breadth-First Search (BFS) to find shortest augmenting path in residual network.',
            'Guarantees termination in O(V * E^2) time regardless of irrational capacities.'
          ]}
        ]
      },
      {
        sectionTitle: 'Lecture 9-12: NP-Completeness & Complexity Reductions',
        subtitle: 'Department of Computer Science & Engineering • Prof. Lecture Notes',
        paragraphs: [
          { type: 'heading', text: '1. Complexity Classes P, NP, NP-Hard, and NP-Complete' },
          { type: 'bullet', text: 'Class P: Languages decidable by deterministic Turing machine in polynomial time O(n^k).' },
          { type: 'bullet', text: 'Class NP: Languages verifiable by deterministic algorithm in polynomial time with certificate.' },
          { type: 'bullet', text: 'Cook-Levin Theorem: SAT (Boolean Satisfiability) is NP-Complete.' },
          { type: 'heading', text: '2. Canonical Reduction Chain' },
          { type: 'bullet', text: '3-SAT <=_p CLIQUE <=_p VERTEX-COVER <=_p SET-COVER.' },
          { type: 'bullet', text: 'Approximation Algorithm for Vertex Cover: 2-Approximation using maximal matching.' }
        ]
      }
    ]
  });

  // PDF 4: IIT Bombay ML Solved PYQs (3 Pages)
  await createAcademicPDF({
    filename: 'IIT_Bombay_CS725_ML_PYQs_Solved.pdf',
    title: 'Machine Learning End-Semester Solved Question Papers (2022-2025)',
    subjectName: 'Machine Learning & AI',
    subjectCode: 'CS725',
    collegeName: 'Indian Institute of Technology Bombay (IIT Bombay)',
    category: 'Solved PYQs',
    primaryColor: { r: 0.58, g: 0.15, b: 0.15 }, // IIT Bombay Red
    pagesContent: [
      {
        sectionTitle: 'Section A: Linear Models & Regularization (Solved Exam Questions)',
        subtitle: 'CS725 Machine Learning • End-Semester 2022-2023 Solutions',
        paragraphs: [
          { type: 'heading', text: 'Question 1: Normal Equation Derivation for Ridge Regression (10 Marks)' },
          { type: 'text', text: 'Problem: Derive the closed-form weight vector w* for regularized least squares with L2 penalty.' },
          { type: 'bullet', text: 'Objective: J(w) = ||Xw - y||_2^2 + lambda * ||w||_2^2.' },
          { type: 'bullet', text: 'Expanding: J(w) = (Xw - y)^T (Xw - y) + lambda * w^T w.' },
          { type: 'bullet', text: 'Differentiating with respect to w: grad_w J(w) = 2 X^T (Xw - y) + 2 lambda * w.' },
          { type: 'bullet', text: 'Setting grad_w J(w) = 0: (X^T X + lambda * I) w = X^T y.' },
          { type: 'box', lines: [
            'Closed-Form Solution:',
            'w* = (X^T X + lambda * I)^(-1) X^T y',
            'Since (X^T X + lambda * I) is strictly positive definite for lambda > 0, the inverse always exists!'
          ]},
          { type: 'heading', text: 'Question 2: Comparison of L1 (Lasso) vs L2 (Ridge) Regularization' },
          { type: 'bullet', text: 'L1 norm promotes sparsity due to sharp corners at axes where contours touch first.' },
          { type: 'bullet', text: 'L2 norm shrinks weights uniformly towards zero without setting them strictly to zero.' }
        ]
      },
      {
        sectionTitle: 'Section B: Support Vector Machines & Kernels (Solved Exam Questions)',
        subtitle: 'CS725 Machine Learning • End-Semester 2023-2024 Solutions',
        paragraphs: [
          { type: 'heading', text: 'Question 3: Soft-Margin SVM Dual Formulation & KKT Conditions (12 Marks)' },
          { type: 'bullet', text: 'Primal: min_{w,b,xi} (1/2)||w||^2 + C * Sum(xi_i) s.t. y_i(w^T x_i + b) >= 1 - xi_i.' },
          { type: 'bullet', text: 'Dual: max_alpha Sum(alpha_i) - (1/2) Sum_i Sum_j alpha_i alpha_j y_i y_j (x_i^T x_j).' },
          { type: 'bullet', text: 'Subject to: 0 <= alpha_i <= C and Sum(alpha_i * y_i) = 0.' },
          { type: 'heading', text: 'Question 4: Kernel Trick & Mercer\'s Condition' },
          { type: 'bullet', text: 'A kernel function K(x, z) corresponds to inner product phi(x)^T phi(z) in high dimension.' },
          { type: 'bullet', text: 'Radial Basis Function (RBF) Kernel: K(x, z) = exp(-gamma * ||x - z||^2).' },
          { type: 'bullet', text: 'Mercer\'s Theorem: Gram matrix K must be symmetric positive semi-definite.' }
        ]
      },
      {
        sectionTitle: 'Section C: Neural Networks & Backpropagation (Solved Exam Questions)',
        subtitle: 'CS725 Machine Learning • End-Semester 2024-2025 Solutions',
        paragraphs: [
          { type: 'heading', text: 'Question 5: Gradient Derivation for Multi-Layer Perceptron (15 Marks)' },
          { type: 'bullet', text: 'Forward pass: z^[l] = W^[l] a^[l-1] + b^[l], a^[l] = sigma(z^[l]).' },
          { type: 'bullet', text: 'Output layer error: delta^[L] = grad_{a^[L]} L odot sigma\'(z^[L]).' },
          { type: 'bullet', text: 'Hidden layer error: delta^[l] = ((W^[l+1])^T delta^[l+1]) odot sigma\'(z^[l]).' },
          { type: 'bullet', text: 'Parameter updates: dW^[l] = delta^[l] (a^[l-1])^T, db^[l] = delta^[l].' },
          { type: 'box', lines: [
            'Exam Tip:',
            'Always verify dimensional compatibility of matrices: dW^[l] shape matches W^[l] shape exactly.'
          ]}
        ]
      }
    ]
  });

  // PDF 5: IIT Delhi Distributed Systems (2 Pages)
  await createAcademicPDF({
    filename: 'IIT_Delhi_COL733_Cloud_Distributed_Systems.pdf',
    title: 'Cloud Computing & Distributed Consensus Architectures Lecture Notes',
    subjectName: 'Distributed Systems & Cloud',
    subjectCode: 'COL733',
    collegeName: 'Indian Institute of Technology Delhi (IIT Delhi)',
    category: 'Study Material',
    primaryColor: { r: 0.5, g: 0.1, b: 0.12 }, // IIT Delhi Maroon
    pagesContent: [
      {
        sectionTitle: 'Module 1: Time, Order & Global State in Distributed Systems',
        subtitle: 'Department of Computer Science & Engineering • COL733 Notes',
        paragraphs: [
          { type: 'heading', text: '1. Lamport Logical Clocks & Causal Ordering' },
          { type: 'bullet', text: 'Happened-Before Relation (->): Transitive causal order defined by Leslie Lamport.' },
          { type: 'bullet', text: 'Clock Condition: If a -> b, then C(a) < C(b).' },
          { type: 'bullet', text: 'Vector Clocks: Overcomes Lamport limitation by guaranteeing: V(a) < V(b) <=> a -> b.' },
          { type: 'heading', text: '2. Chandy-Lamport Distributed Snapshot Algorithm' },
          { type: 'bullet', text: 'Captures consistent global state without freezing running processes.' },
          { type: 'bullet', text: 'Uses marker messages over FIFO reliable communication channels.' }
        ]
      },
      {
        sectionTitle: 'Module 2: Distributed Consensus & Fault Tolerance',
        subtitle: 'Department of Computer Science & Engineering • COL733 Notes',
        paragraphs: [
          { type: 'heading', text: '1. The Raft Consensus Algorithm' },
          { type: 'bullet', text: 'Deconstructs consensus into Leader Election, Log Replication, and Safety.' },
          { type: 'bullet', text: 'Leader Election: Randomized election timers prevent split-vote scenarios.' },
          { type: 'bullet', text: 'Log Invariant: If two logs have an entry with identical index and term, entries are identical.' },
          { type: 'heading', text: '2. CAP Theorem & PACELC Classification' },
          { type: 'bullet', text: 'Consistency, Availability, Partition tolerance trade-off.' },
          { type: 'bullet', text: 'PACELC: If Partition: Availability vs Consistency; Else: Latency vs Consistency.' }
        ]
      }
    ]
  });

  // PDF 6: NIT Surathkal Signals & Systems Solved PYQ (2 Pages)
  await createAcademicPDF({
    filename: 'NIT_Surathkal_EC204_Signals_Systems_PYQ.pdf',
    title: 'Signals & Systems Mid-Semester Solved Examination Paper with Derivations',
    subjectName: 'Signals and Systems',
    subjectCode: 'EC204',
    collegeName: 'National Institute of Technology Karnataka, Surathkal (NIT Surathkal)',
    category: 'Solved PYQs',
    primaryColor: { r: 0.08, g: 0.45, b: 0.42 }, // NITK Teal
    pagesContent: [
      {
        sectionTitle: 'Part A: LTI Systems, Convolution & Impulse Response',
        subtitle: 'Department of Electronics & Communication • Mid-Semester Solved PYQ',
        paragraphs: [
          { type: 'heading', text: 'Problem 1: Continuous-Time Convolution Integral (10 Marks)' },
          { type: 'text', text: 'Determine the response y(t) for an LTI system with input x(t) = e^(-2t) u(t) and impulse response h(t) = u(t-1).' },
          { type: 'bullet', text: 'Formula: y(t) = integral_{-inf}^{inf} x(tau) h(t - tau) dtau.' },
          { type: 'bullet', text: 'Non-zero condition: tau >= 0 and t - tau >= 1 => 0 <= tau <= t - 1 (for t >= 1).' },
          { type: 'bullet', text: 'Evaluating: y(t) = integral_0^{t-1} e^(-2tau) dtau = [ -0.5 * e^(-2tau) ]_0^{t-1}.' },
          { type: 'box', lines: [
            'Final Closed-Form Solution:',
            'y(t) = 0.5 * (1 - e^(-2(t-1))) * u(t - 1)',
            'System is Causal because h(t) = 0 for t < 0 and BIBO stable because integral |h(t)| dt < inf.'
          ]}
        ]
      },
      {
        sectionTitle: 'Part B: Fourier & Laplace Transforms with ROC Properties',
        subtitle: 'Department of Electronics & Communication • Mid-Semester Solved PYQ',
        paragraphs: [
          { type: 'heading', text: 'Problem 2: Laplace Transform & Region of Convergence (ROC)' },
          { type: 'bullet', text: 'Given signal x(t) = -e^(-3t) u(-t) + e^(-2t) u(t).' },
          { type: 'bullet', text: 'First term Laplace: 1 / (s + 3) with ROC: Re{s} < -3.' },
          { type: 'bullet', text: 'Second term Laplace: 1 / (s + 2) with ROC: Re{s} > -2.' },
          { type: 'bullet', text: 'Intersection: ROC = empty set. Therefore, Fourier Transform does not exist.' },
          { type: 'heading', text: 'Key Exam Tips on ROC Properties' },
          { type: 'bullet', text: '1. ROC contains no poles.' },
          { type: 'bullet', text: '2. For right-sided signals, ROC is to the right of the rightmost pole.' },
          { type: 'bullet', text: '3. A system is stable iff the jw-axis lies within the ROC.' }
        ]
      }
    ]
  });

  console.log('\n--- Seeding Database (MongoDB Atlas / Local & JSON Fallback) ---');
  
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/classconnex';
  let isMongoConnected = false;

  try {
    console.log('Connecting to MongoDB at:', mongoUri);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 4000 });
    console.log('Successfully connected to MongoDB!');
    isMongoConnected = true;
  } catch (err) {
    console.warn('Could not connect to MongoDB, will update local fallback file:', err.message);
  }

  const passwordHash = await bcrypt.hash('cr12345', 10);

  if (isMongoConnected) {
    await User.deleteMany({});
  }

  // User Accounts for colleges
  const crNITT = await User.create({
    name: 'Class Representative (NIT Trichy)',
    email: 'cr@classconnex.com',
    password: passwordHash,
    role: 'cr',
    rollNumber: '106121001',
    institution: 'National Institute of Technology Tiruchirappalli (NIT Trichy)',
    createdAt: new Date('2026-09-01T08:00:00.000Z')
  });

  const crIITB = await User.create({
    name: 'Aarav Sharma (IIT Bombay CR)',
    email: 'cr.iitb@classconnex.com',
    password: passwordHash,
    role: 'cr',
    rollNumber: '23B030012',
    institution: 'Indian Institute of Technology Bombay (IIT Bombay)',
    createdAt: new Date('2026-09-01T08:00:00.000Z')
  });

  const crIITD = await User.create({
    name: 'Kunal Mehra (IIT Delhi CR)',
    email: 'cr.iitd@classconnex.com',
    password: passwordHash,
    role: 'cr',
    rollNumber: '2023CS10450',
    institution: 'Indian Institute of Technology Delhi (IIT Delhi)',
    createdAt: new Date('2026-09-01T08:00:00.000Z')
  });

  const crNITK = await User.create({
    name: 'Pooja Hegde (NIT Surathkal CR)',
    email: 'cr.nitk@classconnex.com',
    password: passwordHash,
    role: 'cr',
    rollNumber: '221EC145',
    institution: 'National Institute of Technology Karnataka, Surathkal (NIT Surathkal)',
    createdAt: new Date('2026-09-01T08:00:00.000Z')
  });

  const usersToSeed = [crNITT, crIITB, crIITD, crNITK];

  // Documents to Seed
  const documentsToSeed = [
    {
      title: 'Database Management Systems (DBMS) - Complete Unit 1 to 3 Lecture Notes',
      description: 'Comprehensive handwritten & typed lecture notes covering ER diagrams, Relational Algebra, SQL, and Normalization up to BCNF.',
      subjectName: 'Database Management Systems',
      subjectCode: 'CS2203',
      category: 'notes',
      institution: 'National Institute of Technology Tiruchirappalli (NIT Trichy)',
      isPublic: true,
      fileUrl: '/uploads/NIT_Trichy_CS2203_DBMS_Notes.pdf',
      fileName: 'NIT_Trichy_CS2203_DBMS_Notes.pdf',
      fileSize: '3 Pages • 6.2 KB',
      uploadedBy: {
        _id: crNITT._id.toString(),
        name: crNITT.name
      },
      createdAt: new Date('2026-10-12T09:30:00.000Z')
    },
    {
      title: 'NIT Trichy OS Lab Manual - IPC, POSIX Threads & Deadlock Avoidance',
      description: 'Department lab manual with producer-consumer mutex synchronization and Banker\'s algorithm implementation assignments.',
      subjectName: 'Operating Systems Lab',
      subjectCode: 'CS2205',
      category: 'assignment',
      institution: 'National Institute of Technology Tiruchirappalli (NIT Trichy)',
      isPublic: true,
      fileUrl: '/uploads/NIT_Trichy_CS2205_OS_Lab_Manual.pdf',
      fileName: 'NIT_Trichy_CS2205_OS_Lab_Manual.pdf',
      fileSize: '2 Pages • 4.0 KB',
      uploadedBy: {
        _id: crNITT._id.toString(),
        name: crNITT.name
      },
      createdAt: new Date('2026-10-10T14:15:00.000Z')
    },
    {
      title: 'Advanced Algorithms & Complexity Theory - Master Theorem & NP-Completeness',
      description: 'Prof. lecture slides from IIT Bombay CSE Department. Covers dynamic programming, Max-Flow Min-Cut, and 3-SAT reductions.',
      subjectName: 'Advanced Algorithms',
      subjectCode: 'CS601',
      category: 'notes',
      institution: 'Indian Institute of Technology Bombay (IIT Bombay)',
      isPublic: true,
      fileUrl: '/uploads/IIT_Bombay_CS601_Advanced_Algorithms.pdf',
      fileName: 'IIT_Bombay_CS601_Advanced_Algorithms.pdf',
      fileSize: '3 Pages • 5.4 KB',
      uploadedBy: {
        _id: crIITB._id.toString(),
        name: crIITB.name
      },
      createdAt: new Date('2026-10-08T11:00:00.000Z')
    },
    {
      title: 'IIT Bombay CS725 Machine Learning End-Semester Solved PYQs (2022-2025)',
      description: 'Full solutions for past 4 years end-sem exams: Ridge/Lasso derivations, soft-margin SVM duals, and backprop step-by-step.',
      subjectName: 'Machine Learning & AI',
      subjectCode: 'CS725',
      category: 'pyq',
      institution: 'Indian Institute of Technology Bombay (IIT Bombay)',
      isPublic: true,
      fileUrl: '/uploads/IIT_Bombay_CS725_ML_PYQs_Solved.pdf',
      fileName: 'IIT_Bombay_CS725_ML_PYQs_Solved.pdf',
      fileSize: '3 Pages • 5.3 KB',
      uploadedBy: {
        _id: crIITB._id.toString(),
        name: crIITB.name
      },
      createdAt: new Date('2026-10-06T16:45:00.000Z')
    },
    {
      title: 'Cloud Computing Architectures & Raft Consensus Protocol Notes',
      description: 'IIT Delhi COL733 course summary covering Lamport clocks, Chandy-Lamport snapshots, and Raft consensus leader election.',
      subjectName: 'Distributed Systems & Cloud',
      subjectCode: 'COL733',
      category: 'study_material',
      institution: 'Indian Institute of Technology Delhi (IIT Delhi)',
      isPublic: true,
      fileUrl: '/uploads/IIT_Delhi_COL733_Cloud_Distributed_Systems.pdf',
      fileName: 'IIT_Delhi_COL733_Cloud_Distributed_Systems.pdf',
      fileSize: '2 Pages • 3.4 KB',
      uploadedBy: {
        _id: crIITD._id.toString(),
        name: crIITD.name
      },
      createdAt: new Date('2026-10-04T10:20:00.000Z')
    },
    {
      title: 'Signals & Systems Mid-Semester Solved Question Bank with Derivations',
      description: 'NITK Surathkal ECE department solved exam question papers on convolution integrals, LTI impulse response, and Laplace ROC.',
      subjectName: 'Signals and Systems',
      subjectCode: 'EC204',
      category: 'pyq',
      institution: 'National Institute of Technology Karnataka, Surathkal (NIT Surathkal)',
      isPublic: true,
      fileUrl: '/uploads/NIT_Surathkal_EC204_Signals_Systems_PYQ.pdf',
      fileName: 'NIT_Surathkal_EC204_Signals_Systems_PYQ.pdf',
      fileSize: '2 Pages • 3.6 KB',
      uploadedBy: {
        _id: crNITK._id.toString(),
        name: crNITK.name
      },
      createdAt: new Date('2026-10-02T13:00:00.000Z')
    }
  ];

  // Notices to Seed
  const noticesToSeed = [
    {
      title: '🏆 All-India Inter IIT & NIT CodeSprint 2026 Open!',
      content: 'Annual nationwide hackathon for all IITs, NITs, and premier engineering institutions. Teams of 2-4 can register until end of month. Exciting prizes & summer internships!',
      category: 'event',
      institution: 'National Institute of Technology Tiruchirappalli (NIT Trichy)',
      isGlobal: true,
      deadlineDate: new Date('2026-11-15T18:30:00.000Z'),
      eventDate: new Date('2026-11-20T09:00:00.000Z'),
      createdBy: {
        _id: crNITT._id.toString(),
        name: 'National Coordinator'
      },
      createdAt: new Date('2026-10-14T08:00:00.000Z')
    },
    {
      title: 'NIT Trichy: Mid-Term Examination Schedule Announced',
      content: 'The mid-semester examination timetable has been published for all B.Tech / MCA departments. Check seating arrangements on portal.',
      category: 'announcement',
      institution: 'National Institute of Technology Tiruchirappalli (NIT Trichy)',
      isGlobal: false,
      deadlineDate: new Date('2026-10-25T17:00:00.000Z'),
      createdBy: {
        _id: crNITT._id.toString(),
        name: crNITT.name
      },
      createdAt: new Date('2026-10-13T10:00:00.000Z')
    },
    {
      title: 'OS Lab Assignment 4 Due Date Reminder',
      content: 'Submit POSIX thread synchronization code and execution logs via ClassConneX Documents Hub before 11:59 PM.',
      category: 'deadline',
      institution: 'National Institute of Technology Tiruchirappalli (NIT Trichy)',
      isGlobal: false,
      deadlineDate: new Date('2026-10-22T23:59:00.000Z'),
      createdBy: {
        _id: crNITT._id.toString(),
        name: crNITT.name
      },
      createdAt: new Date('2026-10-12T11:30:00.000Z')
    },
    {
      title: 'IIT Bombay: Techfest Campus Ambassador Call 2026',
      content: 'Calling all student innovators and campus ambassadors across India for Asia\'s largest science and technology festival.',
      category: 'event',
      institution: 'Indian Institute of Technology Bombay (IIT Bombay)',
      isGlobal: true,
      deadlineDate: new Date('2026-11-05T23:59:00.000Z'),
      eventDate: new Date('2026-12-18T10:00:00.000Z'),
      createdBy: {
        _id: crIITB._id.toString(),
        name: crIITB.name
      },
      createdAt: new Date('2026-10-11T12:00:00.000Z')
    }
  ];

  if (isMongoConnected) {
    console.log('Seeding data into MongoDB...');
    await Notice.deleteMany({});
    await Document.deleteMany({});

    const createdNotices = [];
    for (const n of noticesToSeed) {
      createdNotices.push(await Notice.create(n));
    }
    const createdDocuments = [];
    for (const d of documentsToSeed) {
      createdDocuments.push(await Document.create(d));
    }
    console.log(`✅ MongoDB Seeded successfully with:
- ${usersToSeed.length} Users across 4 colleges
- ${createdNotices.length} Notices
- ${createdDocuments.length} Documents with valid multi-page PDFs`);

    // Synchronize to data_store.json
    const fallbackPath = path.join(__dirname, 'data_store.json');
    const fallbackData = {
      users: usersToSeed.map(u => ({
        _id: u._id.toString(),
        name: u.name,
        email: u.email,
        password: u.password,
        role: u.role,
        rollNumber: u.rollNumber,
        institution: u.institution,
        createdAt: u.createdAt
      })),
      notices: createdNotices.map(n => ({
        _id: n._id.toString(),
        title: n.title,
        content: n.content,
        category: n.category,
        institution: n.institution,
        isGlobal: n.isGlobal,
        deadlineDate: n.deadlineDate,
        eventDate: n.eventDate,
        createdBy: n.createdBy,
        createdAt: n.createdAt
      })),
      documents: createdDocuments.map(d => ({
        _id: d._id.toString(),
        title: d.title,
        description: d.description,
        subjectName: d.subjectName,
        subjectCode: d.subjectCode,
        category: d.category,
        institution: d.institution,
        isPublic: d.isPublic,
        fileUrl: d.fileUrl,
        fileName: d.fileName,
        fileSize: d.fileSize,
        uploadedBy: d.uploadedBy,
        createdAt: d.createdAt
      }))
    };
    fs.writeFileSync(fallbackPath, JSON.stringify(fallbackData, null, 2));
    console.log('✅ Synchronized local data_store.json fallback file successfully!');
  }

  // Also write to data_store.json for local fallback resilience
  const fallbackPath = path.join(__dirname, 'data_store.json');
  const fallbackData = {
    users: usersToSeed,
    notices: noticesToSeed,
    documents: documentsToSeed
  };
  fs.writeFileSync(fallbackPath, JSON.stringify(fallbackData, null, 2));
  console.log('✅ Synchronized local data_store.json fallback file successfully!');

  if (isMongoConnected) {
    await mongoose.disconnect();
  }
  console.log('\nAll PDF files and database records generated successfully!');
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error during seeding:', err);
  process.exit(1);
});
