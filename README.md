<div align="center">

<a href="#ment2be">
  <img src="Frontend/src/assets/logo-hat.png" alt="Ment2Be Logo" width="120"/>
</a>

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" alt="line" width="100%"/>

# Ment2Be

### 🎓 Connect. Learn. Grow.

**A modern mentorship platform that bridges the gap between aspiring students and industry experts**

[![Visit Site](https://img.shields.io/badge/🌐_Visit_Site-ment2be.arshchouhan.me-6366F1?style=for-the-badge&logo=googlechrome&logoColor=white)](https://ment2be.arshchouhan.me)
[![Live Demo](https://img.shields.io/badge/▶_Live_Demo-Watch_Video-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://youtu.be/HM1EFZ8p1kQ)
[![GitHub Stars](https://img.shields.io/github/stars/arshchouhan/Ment2Be?style=for-the-badge&logo=github)](https://github.com/arshchouhan/Ment2Be)

<br/>

![React](https://img.shields.io/badge/React-19.1-61DAFB?style=flat-square&logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.1-000000?style=flat-square&logo=express&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-010101?style=flat-square&logo=socket.io&logoColor=white)
![License](https://img.shields.io/badge/License-ISC-blue?style=flat-square)

<br/>

<img src="Frontend/src/assets/first.png" alt="Ment2Be Dashboard" width="90%" style="border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"/>

<br/>

[**🎯 Features**](#-features) · [**🛠️ Tech Stack**](#️-tech-stack) · [**🚀 Quick Start**](#-quick-start) · [**📸 Screenshots**](#-screenshots) · [**🤝 Contributing**](#-contributing)

</div>

---

## 🎯 Features

<table>
<tr>
<td width="50%" valign="top">

### 👨‍🎓 For Students

| Feature | Description |
|---------|-------------|
| 🔍 **Explore Mentors** | Browse by skills, expertise & ratings |
| 📅 **Book Sessions** | Schedule 1-on-1 video sessions |
| 💬 **Real-time Chat** | Instant messaging with mentors |
| 📝 **Task Tracking** | Manage assignments & goals |
| 📓 **Learning Journal** | Document your growth journey |
| ⭐ **Rate & Review** | Share feedback & video testimonials |
| 🏆 **Karma Points** | Earn rewards for engagement |

</td>
<td width="50%" valign="top">

### 👨‍🏫 For Mentors

| Feature | Description |
|---------|-------------|
| 📊 **Analytics Dashboard** | Track mentees & performance |
| 📆 **Availability** | Set your time slots |
| ✅ **Task Assignment** | Create tasks for mentees |
| 💰 **Earnings** | Monitor payments & revenue |
| 🌟 **Profile** | Showcase skills & rates |
| 💼 **Connections** | Manage student requests |
| 📈 **Reviews** | Build your reputation |

</td>
</tr>
</table>

### 🌟 Platform Highlights

<div align="center">

| 🎥 Video Conferencing | 💬 Real-time Chat | 🔐 Secure Auth | 💳 Payments |
|:---:|:---:|:---:|:---:|
| HD calls with ZegoCloud | Socket.IO messaging | JWT + Google OAuth | Razorpay integration |
| Screen sharing | Typing indicators | Role-based access | Secure transactions |
| In-call chat | Read receipts | Password recovery | Session booking |

</div>

---

## 🛠️ Tech Stack

<div align="center">

### Frontend
![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite_7-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![Framer](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)

### Backend
![Node.js](https://img.shields.io/badge/Node.js_18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express_5-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socket.io&logoColor=white)

### Services
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)
![Razorpay](https://img.shields.io/badge/Razorpay-0C2451?style=for-the-badge&logo=razorpay&logoColor=white)
![ZegoCloud](https://img.shields.io/badge/ZegoCloud-FF6B35?style=for-the-badge)
![Google](https://img.shields.io/badge/Google_OAuth-4285F4?style=for-the-badge&logo=google&logoColor=white)

</div>

---

## 🚀 Quick Start

### Prerequisites

```
✅ Node.js 18+
✅ MongoDB Atlas account
✅ Cloudinary account
✅ ZegoCloud account (for video)
```

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/arshchouhan/Ment2Be.git
cd Ment2Be

# 2. Setup Backend
cd Backend
npm install
cp .env.example .env    # Configure your environment variables

# 3. Setup Frontend
cd ../Frontend
npm install
```

### Environment Variables

<details>
<summary><b>📋 Backend (.env)</b></summary>

```env
# Required
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Optional
GOOGLE_CLIENT_ID=your_google_client_id
STREAM_API_KEY=your_stream_key
STREAM_API_SECRET=your_stream_secret
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
GEMINI_API_KEY=your_gemini_key
```

</details>

<details>
<summary><b>📋 Frontend (.env.local)</b></summary>

```env
VITE_API_URL=http://localhost:4000
VITE_ZEGO_APP_ID=your_zego_app_id
VITE_ZEGO_SERVER_SECRET=your_zego_secret
```

</details>

### Run the Application

```bash
# Terminal 1: Backend (http://localhost:4000)
cd Backend && npm run dev

# Terminal 2: Frontend (http://localhost:5173)
cd Frontend && npm run dev
```

---

## 📁 Project Structure

```
Ment2Be/
│
├── 🔧 Backend/
│   ├── config/           # Database & service configs
│   ├── controllers/      # 23 request handlers
│   ├── middleware/       # Auth & validation
│   ├── models/           # 17 MongoDB schemas
│   ├── routes/           # 26 API route files
│   ├── services/         # Business logic
│   ├── socket/           # Real-time handlers
│   └── index.js          # Server entry
│
├── 🎨 Frontend/
│   └── src/
│       ├── assets/       # Images & static files
│       ├── components/   # 75+ UI components
│       ├── config/       # API configuration
│       ├── context/      # React providers
│       ├── pages/        # 38 page components
│       ├── services/     # API functions
│       └── App.jsx       # Root component
│
└── 📄 README.md
```

---

## 🔌 API Overview

<details>
<summary><b>View All Endpoints</b></summary>

| Category | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| **Auth** | POST | `/api/auth/register` | Register user |
| | POST | `/api/auth/login` | Login |
| | POST | `/api/auth/google` | Google OAuth |
| **Users** | GET | `/api/user/me` | Get profile |
| | PUT | `/api/user/update` | Update profile |
| **Mentors** | GET | `/api/mentors` | List mentors |
| | GET | `/api/mentors/:id` | Get mentor |
| | PUT | `/api/mentors/profile` | Update profile |
| **Bookings** | POST | `/api/bookings` | Create booking |
| | GET | `/api/bookings` | Get bookings |
| | POST | `/api/bookings/:id/join` | Join session |
| **Messages** | GET | `/api/messages/conversations` | Get chats |
| | POST | `/api/messages/send` | Send message |
| **Tasks** | POST | `/api/tasks` | Create task |
| | GET | `/api/tasks` | Get tasks |
| | PUT | `/api/tasks/:id` | Update task |
| **Reviews** | POST | `/api/reviews` | Create review |
| | GET | `/api/reviews` | Get reviews |
| **Forum** | GET | `/api/forum/questions` | Get questions |
| | POST | `/api/forum/questions` | Ask question |

</details>

---

## 📸 Screenshots

<div align="center">

| Student Dashboard | Connect with Mentors |
|:---:|:---:|
| <img src="Frontend/src/assets/studentdashbaordimage.png" alt="Student Dashboard" width="100%"/> | <img src="Frontend/src/assets/connect1.png" alt="Connect" width="100%"/> |

| Task Management | Ask Questions |
|:---:|:---:|
| <img src="Frontend/src/assets/taskbymentee.png" alt="Tasks" width="100%"/> | <img src="Frontend/src/assets/student.png" alt="Ask Questions" width="100%"/> |

| Student Features | Live Chat |
|:---:|:---:|
| <img src="Frontend/src/assets/student2.png" alt="Student Features" width="100%"/> | <img src="Frontend/src/assets/mentor.png" alt="Live Chat" width="100%"/> |

| Rate Your Mentor | Your Journal |
|:---:|:---:|
| <img src="Frontend/src/assets/s1.png" alt="Rate Your Mentor" width="100%"/> | <img src="Frontend/src/assets/s3.png" alt="Your Journal" width="100%"/> |

| Find Mentors | Your Mentees |
|:---:|:---:|
| <img src="Frontend/src/assets/s4.png" alt="Find Mentors" width="100%"/> | <img src="Frontend/src/assets/s5.png" alt="Your Mentees" width="100%"/> |

</div>

---

## 📊 User Flows

<table>
<tr>
<td width="50%">

### 👨‍🎓 Student Journey

```mermaid
graph TD
    A[Register/Login] --> B[Complete Profile]
    B --> C[Explore Mentors]
    C --> D[Connect & Book]
    D --> E[Make Payment]
    E --> F[Join Video Session]
    F --> G[Complete Tasks]
    G --> H[Rate & Review]
```

</td>
<td width="50%">

### 👨‍🏫 Mentor Journey

```mermaid
graph TD
    A[Register as Mentor] --> B[Setup Profile]
    B --> C[Set Availability]
    C --> D[Accept Requests]
    D --> E[Conduct Sessions]
    E --> F[Assign Tasks]
    F --> G[Track Earnings]
```

</td>
</tr>
</table>

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

```bash
# 1. Fork the repository
# 2. Create your feature branch
git checkout -b feature/amazing-feature

# 3. Commit your changes
git commit -m 'Add amazing feature'

# 4. Push to the branch
git push origin feature/amazing-feature

# 5. Open a Pull Request
```

---

## 📞 Support

<div align="center">

| Resource | Link |
|----------|------|
| 🐛 **Report Bug** | [GitHub Issues](https://github.com/arshchouhan/Ment2Be/issues) |
| 💡 **Request Feature** | [GitHub Issues](https://github.com/arshchouhan/Ment2Be/issues) |
| 👨‍💻 **Author** | [Arsh Chauhan](https://github.com/arshchouhan) |

</div>

---

## 📄 License

This project is licensed under the [ISC License](https://opensource.org/licenses/ISC).

---

<div align="center">

<img src="Frontend/src/assets/logo-hat.png" alt="Ment2Be" width="50"/>

### Made with ❤️ for the mentorship community


**[⬆ Back to Top](#ment2be)**

</div>
