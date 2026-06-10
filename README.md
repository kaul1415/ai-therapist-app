# 🌸 Mind Bloom – AI Therapist

> An open-source, full-stack AI-powered mental wellness web application providing empathetic real-time therapeutic conversations, mood tracking, journalling, and a personal wellness dashboard — powered by Google Gemini 2.5 Flash.

---

## 📌 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [AI Engine & Prompt Engineering](#ai-engine--prompt-engineering)
- [Intent Detection System](#intent-detection-system)
- [Authentication & Security](#authentication--security)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Testing](#testing)
- [Comparison with Existing Systems](#comparison-with-existing-systems)
- [Limitations & Future Scope](#limitations--future-scope)

---

## Overview

Mental health support remains inaccessible to over 80% of those who need it in India alone — due to cost, stigma, geography, and a severe shortage of professionals (0.3 psychiatrists per 100,000 population vs WHO's recommended 1 per 100,000).

**Mind Bloom** addresses this gap by providing a free, open-source, privacy-respecting AI mental wellness companion named **Bloom**, available 24/7 without barriers of cost or geography.

Unlike rule-based chatbots (e.g., early Woebot), Mind Bloom leverages a state-of-the-art **Large Language Model (Google Gemini 2.5 Flash)** with a custom **regex-based NLP intent detection system** that classifies each user message and selects the most therapeutically appropriate response mode.

> ⚠️ **Disclaimer:** Mind Bloom is a wellness support tool and is not a substitute for professional mental health care. It does not provide clinical diagnosis or treatment.

---

## Features

| Feature | Description |
|---|---|
| 💬 AI Therapy Chat | Real-time empathetic conversations powered by Gemini 2.5 Flash |
| 🧠 Intent Detection | Classifies messages into 3 modes: Emotional Support, Guidance, Advice |
| 📊 Mood Tracker | Daily mood logging with historical trend visualization |
| 📓 Personal Journal | Private digital journal with persistent storage |
| 📚 Resource Library | Curated mental health resources and self-help materials |
| 🗂️ Wellness Dashboard | Unified view of chat history, mood trends, and journal entries |
| 🔐 Secure Auth | JWT-based stateless authentication with bcrypt password hashing |
| 📱 Responsive UI | Vanilla SPA — works across desktop, tablet, and mobile |

---

## Tech Stack

### Backend
| Technology | Version | Role |
|---|---|---|
| Node.js | v20 LTS | JavaScript runtime; non-blocking I/O |
| Express.js | v4.18.2 | REST API framework & middleware pipeline |
| MongoDB Atlas | Cloud | NoSQL document database |
| Mongoose | v7.8.9 | ODM; schema definition, validation, lifecycle hooks |
| Google Gemini API | v0.21.0 | LLM for AI therapeutic responses |
| jsonwebtoken | v9.0.3 | Stateless JWT authentication |
| bcryptjs | v3.0.3 | Password hashing (salt rounds = 10) |
| express-validator | v7.3.1 | Route-level request body validation |
| Joi | v17.10.1 | Environment variable schema validation |
| cors | v2.8.6 | Cross-Origin Resource Sharing middleware |
| morgan | v1.10.0 | HTTP request logging |
| Jest | v29.6.4 | Unit testing framework |
| Supertest | v6.3.3 | HTTP endpoint integration testing |

### Frontend
| Technology | Role |
|---|---|
| HTML5 / CSS3 / JavaScript | Vanilla SPA — no frontend framework dependency |
| Fetch API | Async HTTP communication with backend |
| CSS Custom Properties | Theme management |
| DOM show/hide routing | Client-side view transitions without page reload |

---

## System Architecture

Mind Bloom follows a **three-tier client-server architecture**:

```
┌─────────────────────────────────────────────────────────┐
│                   TIER 1: Frontend SPA                   │
│         HTML5 + CSS3 + Vanilla JavaScript                │
│    (9 views, DOM routing, Fetch API async calls)         │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP REST
┌──────────────────────▼──────────────────────────────────┐
│              TIER 2: Express.js REST API                 │
│         Node.js + MVC Architecture                       │
│  ┌──────────┐ ┌───────────┐ ┌──────────────────────┐   │
│  │  routes/ │ │controllers│ │ services/aiService.js │   │
│  │ /auth    │ │ authCtrl  │ │  Gemini 2.5 Flash API │   │
│  │ /chat    │ │ chatCtrl  │ │  Intent Detection     │   │
│  │ /users   │ │ userCtrl  │ │  Prompt Assembly      │   │
│  └──────────┘ └───────────┘ └──────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐    │
│  │           middleware/                            │    │
│  │  auth.js │ errorHandler.js │ validator.js        │    │
│  └─────────────────────────────────────────────────┘    │
└──────────────────────┬──────────────────────────────────┘
                       │ Mongoose ODM
┌──────────────────────▼──────────────────────────────────┐
│              TIER 3: MongoDB Atlas                       │
│     Collections: users │ chatSessions │ messages        │
└─────────────────────────────────────────────────────────┘
```

---

## AI Engine & Prompt Engineering

The AI response pipeline follows a **5-step structured prompt assembly** process:

```
1. Intent Classification  →  detect mode (Emotional Support / Guidance / Advice)
2. Mode-Specific Prompt   →  select therapeutically grounded system prompt
3. Common Principles      →  append universal guidelines (response length, no medical advice)
4. Conversation History   →  format last 6 turns as alternating user/assistant dialogue
5. Current Message        →  append user input + "Therapist:" primer
```

**Gemini generation parameters:**
```json
{
  "temperature": 0.9,
  "topP": 0.95,
  "topK": 40,
  "maxOutputTokens": 400
}
```

The three system prompts were developed through **iterative prompt engineering** validated against 200+ simulated therapy-context inputs spanning anxiety, grief, academic stress, and relationship challenges.

---

## Intent Detection System

A **regex-based NLP classifier** categorizes each user message in O(1) time:

```javascript
// Guidance mode — how-to requests
/\b(how to|how do i|guide|steps)\b/
/^(help|how|guide)\b/

// Advice mode — recommendation requests  
/\b(advice|suggest|recommend|tip)\b/
/\b(what should i|what can i do)\b/

// Default → Emotional Support mode
```

Each mode triggers a distinct AI persona response style:
- **Emotional Support** — empathetic, reflective listening, 2–4 sentences
- **Guidance** — step-by-step, structured, up to 8 sentences
- **Advice** — direct recommendation with explanation

---

## Authentication & Security

**JWT Authentication:**
```
Signature = HMAC_SHA256(Base64url(Header) + "." + Base64url(Payload), JWT_SECRET)
Token expiry: 24 hours
```

**bcrypt Password Hashing:**
- Cost factor: 10 (≈ 1,024 internal iterations, ~100ms per hash)
- Unique cryptographic salt per password — prevents rainbow table attacks
- Original password never stored or recovered

**Additional security measures:**
- Input validation via `express-validator` on all routes
- CORS configuration restricting cross-origin access
- Environment variable management via `dotenv` + `Joi` schema validation
- Authentication guard middleware on all protected routes

---

## API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api` | No | API health check |
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login; receive JWT |
| GET | `/api/auth/profile` | ✅ JWT | Get current user profile |
| POST | `/api/chat/sessions` | No | Create new chat session |
| GET | `/api/chat/sessions` | No | List all chat sessions |
| GET | `/api/chat/sessions/:id` | No | Get session with messages |
| POST | `/api/chat/sessions/:id/messages` | No | Send message; receive AI reply |
| DELETE | `/api/chat/sessions/:id` | No | Delete session and messages |
| GET | `/api/users/profile` | ✅ JWT | Get user profile |
| PUT | `/api/users/profile` | ✅ JWT | Update user profile |

All endpoints accept and return `application/json`. Protected endpoints require `Authorization: Bearer <token>`.

---

## Database Schema

```javascript
// Users Collection
{
  name: String (required),
  email: String (unique, lowercase),
  password: String (bcrypt hashed, select: false),
  role: enum ['user', 'admin'],
  createdAt: Date,
  updatedAt: Date
}

// Chat Sessions Collection
{
  title: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}

// Messages Collection
{
  chatSession: ObjectId (ref: ChatSession),
  sender: enum ['user', 'ai'],
  content: String,
  metadata: Mixed,
  createdAt: Date
}
```

---

## Project Structure

```
mind-bloom/
├── backend/
│   ├── config/          # DB connection, env config
│   ├── controllers/     # authController, chatController, userController
│   ├── middleware/       # auth.js, errorHandler.js, validator.js
│   ├── models/          # User.js, ChatSession.js, Message.js
│   ├── routes/          # authRoutes.js, chatRoutes.js, userRoutes.js
│   ├── services/
│   │   └── aiService.js # Gemini API integration + intent detection
│   ├── utils/           # Utility functions
│   ├── tests/           # Jest + Supertest unit tests
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── index.html       # Single Page Application entry point
│   ├── style.css        # CSS custom properties + responsive layout
│   └── app.js           # DOM routing, Fetch API calls, view logic
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js v20 LTS
- MongoDB Atlas account (free tier works)
- Google Gemini API key ([get one here](https://aistudio.google.com/))

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials (see Environment Variables below)

# Start development server
npm run dev
```

Open `frontend/index.html` in your browser or serve it with a local server.

---

## Environment Variables

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/mindbloom
JWT_SECRET=your_jwt_secret_key_here
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
```

---

## Testing

```bash
# Run all unit tests
npm test

# Run with coverage report
npm run test:coverage
```

Tests cover: authentication controllers, chat session management, AI service intent detection, and API endpoint responses using Jest + Supertest.

---

## Comparison with Existing Systems

| Feature | Woebot | Wysa | Replika | **Mind Bloom** |
|---|---|---|---|---|
| AI Engine | Rule-based | Hybrid NLP | Deep Learning | **LLM (Gemini 2.5)** |
| Intent Detection | No | Limited | No | **Yes (3 modes)** |
| Free Access | Limited | Freemium | Freemium | **Yes** |
| Open Source | No | No | No | **Yes** |
| Mood Tracking | Yes | Yes | No | **Yes** |
| Journalling | No | No | No | **Yes** |
| Conversational Flexibility | Low | Medium | High | **High** |

---

## Limitations & Future Scope

**Current Limitations:**
- No real-time crisis detection or emergency referral system
- Chat sessions not yet linked to userId in production schema
- No multi-language support

**Future Scope:**
- Crisis detection with emergency resource escalation
- Voice input/output integration
- Sentiment analysis using fine-tuned BERT model
- Mobile app (React Native)
- Multi-language support for regional Indian languages

---

> "Technology cannot replace human connection, but it can bridge the gap until help arrives."
