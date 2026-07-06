# 🚀 ResumeRadar – AI Career Assistant

ResumeRadar is a full-stack AI-powered career assistant that helps job seekers optimize their resumes, generate ATS-friendly content, prepare for interviews, and improve their chances of landing their dream job.

---

## 📌 Features

- 🔐 Secure User Authentication (JWT)
- 📄 AI Resume Analysis
- 🎯 Resume vs Job Description Match Score
- ✍️ AI Cover Letter Generator
- 📝 AI Resume Bullet Rewriter
- 💼 Interview Question Generator
- 📚 Analysis History
- 📤 Resume Upload (PDF)
- 🤖 Groq LLM Integration
- 📊 Dashboard with User History
- 🔒 Protected Routes & API Authentication

---

## 🛠 Tech Stack

### Frontend

- React.js
- Vite
- Tailwind CSS
- Axios
- React Router

### Backend

- Node.js
- Express.js
- JWT Authentication
- Multer
- PDF Parser

### Database

- MongoDB
- Mongoose

### AI

- Groq LLM API

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/VaishnaviPujari04/ResumeRadar.git

cd ResumeRadar
```

---

## Backend Setup

```bash
cd backend

npm install
```

# 🔐 Environment Variables

Create a `.env` file inside the `backend` folder.

Example:

```env
PORT=5000

MONGO_URI=your_mongodb_connection

JWT_SECRET=your_jwt_secret

GROQ_API_KEY=your_groq_api_key
```

> **Never commit your `.env` file to GitHub.**
> Add `backend/.env` to `.gitignore`.

Run backend

```bash
npm run dev
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

---

## 🌟 Application Features

### Resume Analysis

- ATS Compatibility Score
- Skill Gap Detection
- Resume Strengths
- Weaknesses
- Improvement Suggestions

### Cover Letter Generator

Generate personalized cover letters using AI based on your resume and job description.

### Resume Rewriter

Improve resume bullet points with stronger action verbs and ATS-friendly wording.

### Interview Preparation

Generate technical and behavioral interview questions tailored to your resume.

### History

View and revisit previous resume analyses.

---

# 🚀 Future Improvements

- Resume PDF Export
- AI Career Roadmap
- Job Recommendation System
- Resume Templates
- Email Resume Sharing
- Multi-language Support

---

# 👩‍💻 Author

**Vaishnavi Pujari**

GitHub:
https://github.com/VaishnaviPujari04

LinkedIn:
https://www.linkedin.com/in/vaishnavi-pujari-35b792228/

---

# ⭐ Support

If you found this project useful, consider giving it a ⭐ on GitHub.

---
