# 💖 Dil Se Bank

A full-stack modern banking web application made with love — combining a stylish frontend with a secure Flask backend.

---

## ✨ Features

### 🖥️ Frontend (HTML/CSS/JS)
- 🔐 Login / Logout system
- 💰 Deposit / Withdraw money
- 📄 Transaction History with timestamps
- 📊 Live Updating Analytics Chart (Chart.js)
- 🧾 Profile, Analytics, Settings Tabs
- 🎨 Smooth Gradient UI + Card Animation
- 💼 Fixed Deposit: Create + Withdraw (with interest)

### 🧠 Backend (Flask + PostgreSQL)
- ✅ User registration & authentication (JWT)
- 🔐 Passwords hashed with Bcrypt
- 🏦 Secure account creation with unique account numbers
- 💸 RESTful APIs for login, balance, deposit, withdraw
- 📦 PostgreSQL database (SQLAlchemy ORM)
- 📃 `requirements.txt` for all dependencies

---

## 📁 Project Structure

Dil-Se-Bank/
├── app.py # Flask backend (API & DB)
├── requirements.txt # Python dependencies
├── static/
│ └── script.js # Frontend logic
├── templates/
│ └── index.html # Main UI
└── README.md # You're reading it!


---

## 🚀 Setup & Run

### 🔧 Backend (Flask)
```bash
pip install -r requirements.txt
python app.py
🌐 Frontend
Open index.html in your browser (served via Flask).

🔐 Environment
Set the following if needed:

SECRET_KEY

JWT_SECRET_KEY

SQLALCHEMY_DATABASE_URI (PostgreSQL URI)

🛠 Tech Stack
Frontend: HTML, CSS, JavaScript, Chart.js

Backend: Flask, Flask-JWT-Extended, Flask-Bcrypt

Database: PostgreSQL (via SQLAlchemy)

Hosting ready for Vercel / Render / Railway

👨‍💻 Author
Made by Developer SRK — built during Internship.
🔗 GitHub: github.com/developer-srk

🧡 Special Thanks
Inspired by real banking UI — built Dil Se 💖
