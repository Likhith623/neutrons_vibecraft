# 💜 HealHeart — Emergency Medicine Locator

<div align="center">
  <🌐 https://healheart-344002794323.asia-south1.run.app//>
  
  ### *"Because every second counts when lives are at stake"*
  
  [![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-healheart-purple?style=for-the-badge)](https://healheart-344002794323.asia-south1.run.app/)
  [![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/Likhith623/healheart)
  
</div>

---

## The Problem That Breaks Hearts

> **"Imagine a father running from pharmacy to pharmacy at 2 AM, desperately searching for his daughter's asthma inhaler while she struggles to breathe. Imagine a mother watching her child burn with fever, calling store after store, only to hear 'out of stock.' These aren't rare stories — they happen every single night across India.**
>
> **We built HealHeart because we believe no parent should feel that helplessness. No life should be lost to something as preventable as not knowing which pharmacy has the medicine. HealHeart connects people to nearby pharmacies with real-time medicine availability in seconds — not hours. Because when someone you love can't breathe, every second is a lifetime."**

---

## Problem Statement

### The Crisis
- **Every 5 minutes**, someone in India loses a loved one because they couldn't find a medicine in time
- **68% of Indians** live in areas with limited pharmacy access after hours
- **Average time** to find emergency medicine at night: **45-90 minutes**
- Patients visit **3-7 pharmacies** on average before finding required medicine

### The Reality
People don't die because medicines don't exist. **They die because they can't find them in time.**

### Our Mission
HealHeart is our answer: **instant, real-time medicine search** across pharmacies near you. One search. Real-time availability. GPS directions to the nearest pharmacy that has what you need.

**We're not just building an app — we're building a second chance for families who are running out of time.**

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              HealHeart Architecture                          │
└─────────────────────────────────────────────────────────────────────────────┘

                                    ┌──────────────┐
                                    │    User      │
                                    │  (Browser)   │
                                    └──────┬───────┘
                                           │
                                           ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (React + Vite)                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  HomePage   │  │ SearchPage  │  │  AuthPage   │  │  Retailer Dashboard │  │
│  │             │  │  + Map      │  │  + Forgot   │  │  + Inventory Mgmt   │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                    Components: Navbar, Chatbot, MedicineMap             │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────┬───────────────────────────────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    ▼                             ▼
┌───────────────────────────────┐   ┌─────────────────────────────────────────┐
│      Supabase Backend         │   │           External APIs                 │
│  ┌─────────────────────────┐  │   │  ┌─────────────────────────────────┐    │
│  │   Authentication        │  │   │  │   Google Gemini AI (Chatbot)   │    │
│  │   (Email/Password)      │  │   │  └─────────────────────────────────┘    │
│  └─────────────────────────┘  │   │  ┌─────────────────────────────────┐    │
│  ┌─────────────────────────┐  │   │  │   Leaflet Maps (OpenStreetMap)  │    │
│  │   PostgreSQL Database   │  │   │  └─────────────────────────────────┘    │
│  │   - profiles            │  │   │  ┌─────────────────────────────────┐    │
│  │   - stores              │  │   │  │   Browser Geolocation API       │    │
│  │   - medicines           │  │   │  └─────────────────────────────────┘    │
│  │   - search_history      │  │   └─────────────────────────────────────────┘
│  │   - favorite_medicines  │  │
│  └─────────────────────────┘  │
│  ┌─────────────────────────┐  │
│  │   Real-time Subscriptions│ │
│  │   (Live Stock Updates)  │  │
│  └─────────────────────────┘  │
└───────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                        DEPLOYMENT (Google Cloud Run)                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │   Docker Container → Cloud Run → HTTPS → Custom Domain                  │ │
│  │   Auto-scaling • Serverless • asia-south1 region                        │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 18 + Vite | Fast, modern UI framework |
| **Styling** | Tailwind CSS | Utility-first styling with glass morphism |
| **Animations** | Framer Motion | Smooth, professional animations |
| **Maps** | Leaflet + OpenStreetMap | Interactive medicine location maps |
| **State Management** | Zustand | Lightweight global state |
| **Backend** | Supabase | PostgreSQL + Auth + Real-time |
| **AI Chatbot** | Google Gemini 1.5 Flash | Medical assistant chatbot |
| **Deployment** | Google Cloud Run | Serverless container hosting |
| **CI/CD** | GitHub Actions | Automated deployments |
| **Containerization** | Docker + Nginx | Production-ready builds |

---

## ✨ Features

### For Customers 👥
- 🔍 **Instant Medicine Search** — Find medicines across all nearby pharmacies
- 📍 **GPS Navigation** — Get directions to the nearest pharmacy with stock
- ⏱️ **Real-time Availability** — Live stock updates from verified pharmacies
- 💬 **AI Health Assistant** — Get medical guidance from our HealHeart AI chatbot
- ❤️ **Favorites** — Save frequently needed medicines
- 🔔 **Notifications** — Get alerts when medicines become available
- 🔐 **Secure Auth** — Email/password with forgot password recovery

### For Pharmacies 🏪
- 📦 **Inventory Management** — Add/update medicine stock in real-time
- 🏬 **Store Management** — Manage multiple pharmacy locations
- 📊 **Dashboard** — View analytics and customer searches
- 📸 **Image Upload** — Add store and medicine images

---

## 🚀 Setup Instructions (Build Reproducibility)

### Prerequisites
- **Node.js** v18+ 
- **npm** v9+
- **Git**

### Step 1: Clone the Repository
```bash
git clone https://github.com/Likhith623/healheart.git
cd healheart
```

### Step 2: Setup Frontend
```bash
cd frontend
npm install
```

### Step 3: Environment Configuration
Create a `.env` file in the `frontend` directory:
```env
VITE_SUPABASE_URL=https://ahmlknnxexsondeeitgz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFobWxrbm54ZXhzb25kZWVpdGd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4NDE2MjQsImV4cCI6MjA4NTQxNzYyNH0.YneOEsdBkMdBxTIGBZ74AWCRFl0IjJlG1suwdpDHmkM
VITE_GEMINI_API_KEY=AIzaSyBtqHHqsrMxsm-qZ-LoLtdcsUi3CG4ibBE
```

### Step 4: Run the Application
```bash
npm run dev
```

### Step 5: Open in Browser
Navigate to: **http://localhost:5173**

---

## 🔄 Build Reproducibility (Mandatory)

### Quick Start (One Command)
```bash
git clone https://github.com/Likhith623/healheart.git && cd healheart/frontend && npm install && npm run dev
```

### Production Build
```bash
cd frontend
npm run build
npm run preview
```

### Docker Build (For Deployment)
```bash
cd frontend
docker build -t healheart .
docker run -p 8080:8080 healheart
```

### Verification Checklist
- [ ] App loads at `http://localhost:5173`
- [ ] Can search for medicines (try "Paracetamol")
- [ ] Map displays pharmacy locations
- [ ] Can sign up/login as Customer or Retailer
- [ ] Chatbot responds to health queries
- [ ] Forgot password sends email

---

## 🤖 AI Tools Used

| AI Tool | Usage |
|---------|-------|
| **GitHub Copilot (Claude Sonnet 4)** | Primary coding assistant — wrote 30% of the codebase |
| **Google Gemini 1.5 Flash** | In-app medical chatbot (HealHeart AI) |
| **Claude (Anthropic)** | Architecture planning and debugging |

---

## 💡 Prompt Strategy Summary

### 1. **Iterative Development Approach**
We used conversational prompts to build features incrementally:
```
"Add a forgot password feature with email reset using Supabase Auth"
"Fix the recent search not saving - check database column names"
```

### 2. **Context-Rich Prompts**
Always provided full context:
```
"I have a React frontend with Supabase backend. The user clicks 
forgot password, receives email, clicks link. Create the full 
flow including ResetPasswordPage component and route."
```

### 3. **Error-Driven Debugging**
Shared exact errors for quick fixes:
```
"Getting 'column user_latitude not found' error. Here's my 
logSearch function and database schema..."
```



### 5. **Chatbot System Prompt Design**
Our HealHeart AI chatbot uses a carefully crafted system prompt:
```
"You are HealHeart AI, a comprehensive health and medicine 
assistant. Provide helpful medical guidance while always 
recommending users consult healthcare professionals for 
serious concerns. Be empathetic, clear, and supportive."
```

---

## 📁 Source Code Structure

```
healheart/
├── frontend/                    # React + Vite Frontend
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── Navbar.jsx       # Navigation with auth state
│   │   │   ├── Chatbot.jsx      # AI medical assistant
│   │   │   ├── MedicineMap.jsx  # Leaflet map integration
│   │   │   └── Layout.jsx       # Page wrapper
│   │   ├── pages/
│   │   │   ├── HomePage.jsx     # Landing page with CTAs
│   │   │   ├── SearchPage.jsx   # Medicine search + map
│   │   │   ├── AuthPage.jsx     # Login/Register
│   │   │   ├── ResetPasswordPage.jsx  # Password recovery
│   │   │   ├── customer/        # Customer dashboard pages
│   │   │   └── retailer/        # Retailer management pages
│   │   ├── store/               # Zustand state management
│   │   ├── lib/
│   │   │   └── supabase.js      # Supabase client + helpers
│   │   ├── App.jsx              # Routes configuration
│   │   └── index.css            # Global styles + animations
│   ├── Dockerfile               # Production container
│   ├── nginx.conf               # Nginx SPA configuration
│   └── package.json
├── backend/                     # FastAPI Backend (optional)
│   ├── app/
│   │   ├── routes/              # API endpoints
│   │   ├── database.py          # Supabase connection
│   │   └── schemas.py           # Pydantic models
│   └── requirements.txt
├── database/                    # SQL setup scripts
│   └── COMPLETE_DATABASE_SETUP.sql
└── .github/workflows/
    └── deploy.yml               # CI/CD pipeline
```

---

## 🎯 Final Output

### Live Deployment
🌐 **https://healheart-344002794323.asia-south1.run.app/**

### Key Screens

| Screen | Description |
|--------|-------------|
| **Home Page** | Emotional hero section with stats and CTAs |
| **Search Page** | Medicine search with real-time map |
| **Auth Page** | Login/Register with role selection |
| **Customer Dashboard** | Search history, favorites, notifications |
| **Retailer Dashboard** | Store and inventory management |
| **AI Chatbot** | Medical guidance assistant |

### Demo Credentials
**Customer Account:**
- Email: `demo@healheart.com`
- Password: `demo123`

**Retailer Account:**
- Email: `pharmacy@healheart.com`  
- Password: `pharmacy123`

---

## 🏆 What Makes HealHeart Special

1. **Real Impact** — Solves a genuine life-or-death problem
2. **Complete Solution** — Both customer and retailer sides
3. **Production Ready** — Deployed on Google Cloud Run
4. **AI-Powered** — Intelligent medical chatbot
5. **Beautiful UI** — Glass morphism design with smooth animations
6. **Mobile Responsive** — Works perfectly on all devices
7. **Secure** — Proper authentication with password recovery

---

## 👥 Team Neutrons

Built with 💜 for the hackathon.

---

## 📜 License

MIT License — Feel free to use this to save lives! 🩺

---

<div align="center">
  
### *"People don't die because medicines don't exist. They die because they can't find them in time. HealHeart fixes that — one search, one life saved."*

**💜 HealHeart — Because Every Second Counts**

</div>
