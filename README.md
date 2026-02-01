<div align="center">

# 💜 HealHeart

### Emergency Medicine Locator Platform

<img src="https://img.shields.io/badge/Status-Live-brightgreen?style=for-the-badge" alt="Status"/>
<img src="https://img.shields.io/badge/Version-1.0.0-blue?style=for-the-badge" alt="Version"/>
<img src="https://img.shields.io/badge/License-MIT-purple?style=for-the-badge" alt="License"/>

<br/>

[![Live Demo](https://img.shields.io/badge/🌐_LIVE_DEMO-healheart--app-9333EA?style=for-the-badge&labelColor=1f2937)](https://healheart-344002794323.asia-south1.run.app/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Likhith623/healheart)
[![Demo Video](https://img.shields.io/badge/📹_Demo_Video-Watch-FF0000?style=for-the-badge&labelColor=1f2937)](https://github.com/Likhith623/healheart)

<br/>

**🏆 Built for Hackathon 2026 | Team Neutrons**

---

### *"Because every second counts when lives are at stake"*

<br/>

[🚀 Quick Start](#-quick-start-one-command) • [✨ Features](#-features) • [🛠️ Tech Stack](#️-tech-stack) • [📖 Documentation](#-source-code-structure) • [🎯 Live Demo](#-live-deployment)

</div>

---

<br/>

## 💔 The Problem That Breaks Hearts

<table>
<tr>
<td width="60%">

> ### *"Imagine a father running from pharmacy to pharmacy at 2 AM, desperately searching for his daughter's asthma inhaler while she struggles to breathe.*
>
> ### *Imagine a mother watching her child burn with fever, calling store after store, only to hear 'out of stock.'*
>
> ### *These aren't rare stories — they happen every single night across India."*

</td>
<td width="40%" align="center">

### 😢 The Harsh Reality

| Statistic | Impact |
|:---------:|:------:|
| **Every 5 min** | Someone loses a loved one |
| **68%** | Indians lack night pharmacy access |
| **45-90 min** | Average search time at night |
| **3-7 stores** | Visited before finding medicine |

</td>
</tr>
</table>

<br/>

<div align="center">

### ⚠️ The Truth

## *"People don't die because medicines don't exist.*
## *They die because they can't find them in time."*

</div>

---

<br/>

## 💜 Our Solution: HealHeart

<div align="center">

<table>
<tr>
<td align="center" width="25%">
<h3>🔍</h3>
<h4>One Search</h4>
<p>Find any medicine instantly</p>
</td>
<td align="center" width="25%">
<h3>⚡</h3>
<h4>Real-Time Data</h4>
<p>Live stock availability</p>
</td>
<td align="center" width="25%">
<h3>📍</h3>
<h4>GPS Navigation</h4>
<p>Directions to nearest pharmacy</p>
</td>
<td align="center" width="25%">
<h3>💚</h3>
<h4>Lives Saved</h4>
<p>Seconds, not hours</p>
</td>
</tr>
</table>

<br/>

> ### **HealHeart connects people to nearby pharmacies with real-time medicine availability in seconds — not hours.**
>
> ### **We're not just building an app — we're building a second chance for families who are running out of time.**

</div>

---

<br/>

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           💜 HEALHEART ARCHITECTURE                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│                                 ┌──────────────┐                                │
│                                 │   👤 USER    │                                │
│                                 │  (Browser)   │                                │
│                                 └──────┬───────┘                                │
│                                        │                                        │
│                                        ▼                                        │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                      🎨 FRONTEND (React 18 + Vite)                        │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │  │
│  │  │  🏠 Home    │  │ 🔍 Search   │  │ 🔐 Auth     │  │ 📊 Dashboards   │   │  │
│  │  │   Page      │  │  + Map      │  │  + Reset    │  │  Customer/Retail │   │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────┘   │  │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │  │
│  │  │     🧩 Components: Navbar │ Chatbot │ MedicineMap │ Layout          │  │  │
│  │  └─────────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────┬───────────────────────────────────────┘  │
│                                      │                                          │
│                       ┌──────────────┴──────────────┐                           │
│                       ▼                             ▼                           │
│  ┌─────────────────────────────────┐   ┌─────────────────────────────────────┐  │
│  │      🗄️ SUPABASE BACKEND       │   │         🌐 EXTERNAL APIs           │  │
│  │  ┌───────────────────────────┐  │   │  ┌─────────────────────────────┐    │  │
│  │  │  🔑 Authentication        │  │   │  │  🤖 Google Gemini AI        │    │  │
│  │  │     (Email/Password)      │  │   │  │     (Medical Chatbot)       │    │  │
│  │  └───────────────────────────┘  │   │  └─────────────────────────────┘    │  │
│  │  ┌───────────────────────────┐  │   │  ┌─────────────────────────────┐    │  │
│  │  │  🐘 PostgreSQL Database   │  │   │  │  🗺️ Leaflet + OpenStreetMap │    │  │
│  │  │     • profiles            │  │   │  │     (Interactive Maps)      │    │  │
│  │  │     • stores              │  │   │  └─────────────────────────────┘    │  │
│  │  │     • medicines           │  │   │  ┌─────────────────────────────┐    │  │
│  │  │     • search_history      │  │   │  │  📍 Geolocation API         │    │  │
│  │  │     • favorite_medicines  │  │   │  │     (User Location)         │    │  │
│  │  └───────────────────────────┘  │   │  └─────────────────────────────┘    │  │
│  │  ┌───────────────────────────┐  │   └─────────────────────────────────────┘  │
│  │  │  ⚡ Real-time Subscriptions│  │                                          │
│  │  │     (Live Stock Updates)  │  │                                          │
│  │  └───────────────────────────┘  │                                          │
│  └─────────────────────────────────┘                                          │
│                                                                                 │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                    ☁️ DEPLOYMENT (Google Cloud Run)                        │  │
│  │     🐳 Docker  →  ☁️ Cloud Run  →  🔒 HTTPS  →  🌍 Global CDN             │  │
│  │              Auto-scaling • Serverless • asia-south1 region               │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

<br/>

## 🛠️ Tech Stack

<div align="center">

### Frontend
[![React](https://img.shields.io/badge/React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)

### Backend & Database
[![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)

### AI & Maps
[![Google Gemini](https://img.shields.io/badge/Google_Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Leaflet](https://img.shields.io/badge/Leaflet_Maps-199900?style=for-the-badge&logo=leaflet&logoColor=white)](https://leafletjs.com/)
[![OpenStreetMap](https://img.shields.io/badge/OpenStreetMap-7EBC6F?style=for-the-badge&logo=openstreetmap&logoColor=white)](https://www.openstreetmap.org/)

### DevOps & Deployment
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Google Cloud](https://img.shields.io/badge/Google_Cloud_Run-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white)](https://cloud.google.com/run)
[![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/features/actions)
[![Nginx](https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white)](https://nginx.org/)

</div>

<br/>

| Layer | Technology | Purpose |
|:------|:-----------|:--------|
| **Frontend** | React 18 + Vite | ⚡ Lightning-fast, modern UI framework |
| **Styling** | Tailwind CSS | 🎨 Glass morphism design system |
| **Animations** | Framer Motion | ✨ Smooth, professional micro-interactions |
| **Maps** | Leaflet + OpenStreetMap | 🗺️ Interactive pharmacy location maps |
| **State** | Zustand | 🔄 Lightweight global state management |
| **Backend** | Supabase | 🗄️ PostgreSQL + Auth + Real-time subscriptions |
| **AI Chatbot** | Google Gemini 1.5 Flash | 🤖 Intelligent medical assistant |
| **Deployment** | Google Cloud Run | ☁️ Serverless auto-scaling containers |
| **CI/CD** | GitHub Actions | 🔄 Automated build & deploy pipeline |
| **Container** | Docker + Nginx | 🐳 Production-optimized builds |

---

<br/>

## ✨ Features

<table>
<tr>
<td width="50%">

### 👥 For Customers

| Feature | Description |
|:--------|:------------|
| 🔍 **Instant Search** | Find medicines across all nearby pharmacies in seconds |
| 📍 **GPS Navigation** | Turn-by-turn directions to the nearest pharmacy with stock |
| ⚡ **Real-Time Stock** | Live availability updates from verified pharmacies |
| 🤖 **AI Health Assistant** | Get medical guidance from HealHeart AI chatbot |
| ❤️ **Favorites** | Save frequently needed medicines for quick access |
| 🔔 **Notifications** | Get alerts when out-of-stock medicines become available |
| 🔐 **Secure Auth** | Email/password with forgot password recovery |
| 📱 **Mobile Responsive** | Perfect experience on any device |

</td>
<td width="50%">

### 🏪 For Pharmacies

| Feature | Description |
|:--------|:------------|
| 📦 **Inventory Management** | Add/update medicine stock in real-time |
| 🏬 **Store Management** | Manage multiple pharmacy locations |
| 📊 **Analytics Dashboard** | View customer searches and trends |
| 📤 **Bulk Upload** | Import inventory from Excel/CSV |
| 📸 **Image Upload** | Add store and medicine images |
| 🎯 **Customer Reach** | Get discovered by thousands of customers |
| ⏰ **Operating Hours** | Set and display store timings |
| ✅ **Verification Badge** | Build trust with verified status |

</td>
</tr>
</table>

---

<br/>

## 🚀 Quick Start (One Command)

```bash
git clone https://github.com/Likhith623/healheart.git && cd healheart/frontend && npm install && npm run dev
```

**Then open:** [http://localhost:5173](http://localhost:5173) 🎉

---

<br/>

## 📥 Detailed Setup Instructions

### Prerequisites

<table>
<tr>
<td>

```
✅ Node.js v18+
✅ npm v9+
✅ Git
```

</td>
<td>

```bash
# Check versions
node --version   # Should be v18+
npm --version    # Should be v9+
git --version    # Any recent version
```

</td>
</tr>
</table>

### Step-by-Step Installation

#### 1️⃣ Clone the Repository
```bash
git clone https://github.com/Likhith623/healheart.git
cd healheart
```

#### 2️⃣ Install Dependencies
```bash
cd frontend
npm install
```

#### 3️⃣ Environment Configuration
Create a `.env` file in the `frontend` directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

#### 4️⃣ Run the Application
```bash
npm run dev
```

#### 5️⃣ Open in Browser
Navigate to: **http://localhost:5173** ✨

---

<br/>

## 🔄 Build Commands

<table>
<tr>
<th>Command</th>
<th>Purpose</th>
<th>Usage</th>
</tr>
<tr>
<td>

```bash
npm run dev
```

</td>
<td>🔧 Development server with hot reload</td>
<td>Local development</td>
</tr>
<tr>
<td>

```bash
npm run build
```

</td>
<td>📦 Production build</td>
<td>Before deployment</td>
</tr>
<tr>
<td>

```bash
npm run preview
```

</td>
<td>👀 Preview production build</td>
<td>Test before deploy</td>
</tr>
<tr>
<td>

```bash
docker build -t healheart .
docker run -p 8080:8080 healheart
```

</td>
<td>🐳 Docker containerized build</td>
<td>Production deployment</td>
</tr>
</table>

---

<br/>

## ✅ Verification Checklist

After setup, verify these features work:

- [ ] 🌐 App loads at `http://localhost:5173`
- [ ] 🔍 Can search for medicines (try "Paracetamol")
- [ ] 🗺️ Map displays pharmacy locations with markers
- [ ] 👤 Can sign up as Customer or Retailer
- [ ] 🔐 Can login with existing account
- [ ] 🤖 Chatbot responds to health queries
- [ ] 📧 Forgot password sends reset email
- [ ] 📱 Mobile responsive design works

---

<br/>

## 🤖 AI Tools & Prompt Strategy

### AI Tools Used

| AI Tool | Usage | Contribution |
|:--------|:------|:-------------|
| **GitHub Copilot (Claude Sonnet 4)** | Primary coding assistant | ~30% of codebase |
| **Google Gemini 1.5 Flash** | In-app medical chatbot | HealHeart AI feature |
| **Claude (Anthropic)** | Architecture planning & debugging | System design |

### Prompt Engineering Strategy

<details>
<summary><b>1️⃣ Iterative Development Approach</b></summary>

We used conversational prompts to build features incrementally:
```
"Add a forgot password feature with email reset using Supabase Auth"
"Fix the recent search not saving - check database column names"
```
</details>

<details>
<summary><b>2️⃣ Context-Rich Prompts</b></summary>

Always provided full context for accurate solutions:
```
"I have a React frontend with Supabase backend. The user clicks 
forgot password, receives email, clicks link. Create the full 
flow including ResetPasswordPage component and route."
```
</details>

<details>
<summary><b>3️⃣ Error-Driven Debugging</b></summary>

Shared exact errors for quick fixes:
```
"Getting 'column user_latitude not found' error. Here's my 
logSearch function and database schema..."
```
</details>

<details>
<summary><b>4️⃣ HealHeart AI Chatbot Prompt</b></summary>

```
"You are HealHeart AI, a comprehensive health and medicine 
assistant. Provide helpful medical guidance while always 
recommending users consult healthcare professionals for 
serious concerns. Be empathetic, clear, and supportive."
```
</details>

---

<br/>

## 📁 Source Code Structure

```
healheart/
│
├── 📂 frontend/                      # 🎨 React + Vite Frontend
│   ├── 📂 src/
│   │   ├── 📂 components/            # 🧩 Reusable UI components
│   │   │   ├── Navbar.jsx            #    Navigation with auth state
│   │   │   ├── Chatbot.jsx           #    🤖 AI medical assistant
│   │   │   ├── MedicineMap.jsx       #    🗺️ Leaflet map integration
│   │   │   ├── Layout.jsx            #    Page wrapper component
│   │   │   └── LoadingSpinner.jsx    #    Loading states
│   │   │
│   │   ├── 📂 pages/
│   │   │   ├── HomePage.jsx          #    🏠 Landing page with CTAs
│   │   │   ├── SearchPage.jsx        #    🔍 Medicine search + map
│   │   │   ├── AuthPage.jsx          #    🔐 Login/Register
│   │   │   ├── ResetPasswordPage.jsx #    🔑 Password recovery
│   │   │   ├── ProfilePage.jsx       #    👤 User profile
│   │   │   ├── 📂 customer/          #    👥 Customer pages
│   │   │   │   ├── CustomerDashboard.jsx
│   │   │   │   ├── FavoritesPage.jsx
│   │   │   │   └── NotificationsPage.jsx
│   │   │   └── 📂 retailer/          #    🏪 Retailer pages
│   │   │       ├── RetailerDashboard.jsx
│   │   │       ├── InventoryManagement.jsx
│   │   │       └── StoreManagement.jsx
│   │   │
│   │   ├── 📂 store/                 # 🔄 Zustand state management
│   │   │   ├── authStore.js          #    Authentication state
│   │   │   └── locationStore.js      #    Geolocation state
│   │   │
│   │   ├── 📂 lib/
│   │   │   └── supabase.js           # 🗄️ Supabase client + helpers
│   │   │
│   │   ├── App.jsx                   # 🛣️ Routes configuration
│   │   ├── main.jsx                  # ⚡ App entry point
│   │   └── index.css                 # 🎨 Global styles + animations
│   │
│   ├── Dockerfile                    # 🐳 Production container
│   ├── nginx.conf                    # ⚙️ Nginx SPA configuration
│   ├── package.json                  # 📦 Dependencies
│   ├── vite.config.js               # ⚡ Vite configuration
│   ├── tailwind.config.js           # 🎨 Tailwind configuration
│   └── postcss.config.js            # 🔧 PostCSS configuration
│
├── 📂 backend/                       # ⚙️ FastAPI Backend (Optional)
│   ├── 📂 app/
│   │   ├── 📂 routes/                # 🛣️ API endpoints
│   │   │   ├── auth.py
│   │   │   ├── medicines.py
│   │   │   ├── stores.py
│   │   │   └── customer.py
│   │   ├── database.py               # 🗄️ Supabase connection
│   │   ├── schemas.py                # 📋 Pydantic models
│   │   └── config.py                 # ⚙️ App configuration
│   ├── main.py                       # ⚡ FastAPI entry point
│   └── requirements.txt              # 📦 Python dependencies
│
├── 📂 database/                      # 🗄️ SQL setup scripts
│   └── COMPLETE_DATABASE_SETUP.sql   # 📋 Full schema setup
│
├── 📂 .github/workflows/
│   └── deploy.yml                    # 🔄 CI/CD pipeline
│
└── README.md                         # 📖 You are here!
```

---

<br/>

## 🎯 Live Deployment

<div align="center">

### 🌐 **[https://healheart-344002794323.asia-south1.run.app/](https://healheart-344002794323.asia-south1.run.app/)**

<br/>

### Demo Credentials

| Role | Email | Password |
|:----:|:------|:---------|
| 👥 **Customer** | `demo@healheart.com` | `demo123` |
| 🏪 **Retailer** | `pharmacy@healheart.com` | `pharmacy123` |

</div>

---

<br/>

## 🖼️ Application Screenshots

<table>
<tr>
<td align="center" width="50%">

### 🏠 Home Page
*Emotional hero section with statistics and call-to-actions*

</td>
<td align="center" width="50%">

### 🔍 Search Page
*Real-time medicine search with interactive map*

</td>
</tr>
<tr>
<td align="center">

### 🔐 Authentication
*Beautiful login/register with role selection*

</td>
<td align="center">

### 📊 Dashboard
*Customer & retailer management dashboards*

</td>
</tr>
<tr>
<td align="center">

### 🤖 AI Chatbot
*Intelligent medical guidance assistant*

</td>
<td align="center">

### 📦 Inventory
*Easy medicine stock management for pharmacies*

</td>
</tr>
</table>

---

<br/>

## 🏆 What Makes HealHeart Special

<table>
<tr>
<td align="center" width="14%">

### 💜
**Real Impact**

Solves a genuine life-or-death problem

</td>
<td align="center" width="14%">

### 🔄
**Complete**

Both customer & retailer sides

</td>
<td align="center" width="14%">

### ☁️
**Production Ready**

Deployed on Google Cloud Run

</td>
<td align="center" width="14%">

### 🤖
**AI-Powered**

Intelligent medical chatbot

</td>
<td align="center" width="14%">

### ✨
**Beautiful UI**

Glass morphism design

</td>
<td align="center" width="14%">

### 📱
**Responsive**

Perfect on all devices

</td>
<td align="center" width="14%">

### 🔐
**Secure**

Full auth with recovery

</td>
</tr>
</table>

---

<br/>

## 🗺️ Future Roadmap

- [ ] 📲 **Mobile Apps** — Native iOS & Android applications
- [ ] 🔔 **Push Notifications** — Real-time medicine availability alerts
- [ ] 💊 **Prescription Upload** — OCR-based prescription scanning
- [ ] 🚚 **Delivery Integration** — Partner with delivery services
- [ ] 🏥 **Hospital Integration** — Connect with hospital pharmacies
- [ ] 🌐 **Multi-language** — Support for regional Indian languages
- [ ] 📊 **Analytics Dashboard** — Advanced insights for pharmacies
- [ ] 🤝 **API for Partners** — Third-party integration support

---

<br/>

## 👥 Team Neutrons

<div align="center">

Built with 💜 and countless late nights

*"We believe technology should serve humanity's most urgent needs"*

---

### Contributors

<a href="https://github.com/Likhith623">
  <img src="https://img.shields.io/badge/Likhith623-Developer-9333EA?style=for-the-badge&logo=github&logoColor=white" alt="Likhith623"/>
</a>

</div>

---

<br/>

## 📜 License

<div align="center">

**MIT License**

*Feel free to use this to save lives!* 🩺

---

<br/>

## 💬 Final Words

<table>
<tr>
<td>

> ### *"People don't die because medicines don't exist.*
> ### *They die because they can't find them in time.*
> ### *HealHeart fixes that —*
> ### ***one search, one life saved."***

</td>
</tr>
</table>

<br/>

# 💜 HealHeart

### *Because Every Second Counts When Lives Are at Stake*

<br/>

[![Made with Love](https://img.shields.io/badge/Made%20with-💜-purple?style=for-the-badge)](https://github.com/Likhith623/healheart)
[![Save Lives](https://img.shields.io/badge/Goal-Save%20Lives-brightgreen?style=for-the-badge)](https://healheart-344002794323.asia-south1.run.app/)

</div>
