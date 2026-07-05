# 🚀 Smart Resume Analyzer

An AI-powered Resume Analyzer that compares a candidate's resume with a Job Description and generates an ATS-style analysis using Google's Gemini AI.

The application provides recruiters and job seekers with an instant compatibility report including match score, matched skills, missing skills, strengths, skill gaps, suggestions, keyword analysis, downloadable PDF reports, and authentication.

---

# ✨ Features

## Authentication

- User Registration
- Secure Login
- JWT Authentication
- Forgot Password
- Reset Password
- Delete Account
- Protected Routes

---

## Resume Analysis

- Upload Resume (PDF)
- Paste or Select Job Description
- AI-powered Resume Analysis using Gemini AI
- ATS Match Score
- Recruiter Recommendation
- Matched Skills
- Missing Skills
- Matched Keywords
- Missing Keywords
- Candidate Strengths
- Skill Gaps
- AI Suggestions
- Detailed Reasoning

---

## Dashboard

- Resume Upload (Drag & Drop)
- Job Description Templates
- Analysis History
- Delete Individual Analysis
- Clear Analysis History
- Download PDF Report
- Dark / Light Theme
- Responsive UI

---

# 🛠 Tech Stack

## Frontend

- React.js
- React Router
- Tailwind CSS
- Axios
- React Toastify
- jsPDF

## Backend

- Node.js
- Express.js
- JWT Authentication
- Multer
- pdf-parse
- Google Gemini AI

## Database

- MongoDB Atlas
- Mongoose

---

# 📁 Project Structure

```
Smart Resume Analyzer
│
├── frontend
│   ├── src
│   │   ├── components
│   │   ├── context
│   │   ├── pages
│   │   ├── assets
│   │   └── App.jsx
│   │
│   └── package.json
│
├── backend
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── services
│   ├── config
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/ShriyanshPandey-702/Smart-Resume-Analyzer.git
```

```bash
cd Smart-Resume-Analyzer
```

---

## Install Backend

```bash
cd backend
npm install
```

---

## Install Frontend

```bash
cd frontend
npm install
```

---

# 🔑 Environment Variables

Create a `.env` file inside the backend folder.

```env
MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key

GEMINI_API_KEY=your_gemini_api_key
```

---

# ▶️ Run Locally

## Backend

```bash
cd backend
npm run dev
```

Backend runs on

```
http://localhost:5001
```

---

## Frontend

```bash
cd frontend
npm run dev
```

Frontend runs on

```
http://localhost:5173
```

---

# 📊 How It Works

1. User logs in securely.
2. Uploads a PDF resume.
3. Selects or pastes a Job Description.
4. Resume text is extracted.
5. Gemini AI compares the Resume with the Job Description.
6. ATS Match Score is generated.
7. Detailed recruiter insights are displayed.
8. User can download the complete PDF report.
9. Analysis history is stored locally for quick access.

---

# 🔒 Authentication Flow

- Register
- Login
- Forgot Password
- Reset Password
- JWT Protected Dashboard
- Delete Account

---

# 📄 PDF Report

Each analysis can be downloaded as a professional PDF report containing:

- Match Score
- Recommendation
- Matched Skills
- Missing Skills
- Keywords
- Strengths
- Skill Gaps
- Suggestions
- AI Reasoning

---

# 📱 Responsive Design

The application is fully responsive and optimized for:

- Desktop
- Laptop
- Tablet
- Mobile Devices

---

# 🚀 Future Improvements

- Email-based Password Reset
- Admin Dashboard
- Resume Version Comparison
- Multi-language Resume Support
- Recruiter Dashboard
- Resume Ranking System
- Cloud File Storage
- Team Collaboration

---

# 📸 Screenshots

> Screenshots will be added after deployment.

---

# 🌐 Live Demo

Frontend

```
Coming Soon
```

Backend

```
Coming Soon
```

---

# 👨‍💻 Author

**Shriyansh Pandey**

- GitHub: https://github.com/ShriyanshPandey-702
- LinkedIn: https://www.linkedin.com/in/shriyansh-pandey-40673b348/

---

# ⭐ If you found this project helpful

Please consider giving it a ⭐ on GitHub.