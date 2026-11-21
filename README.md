# Portfolio Backend API

> Production-grade Node.js & Express.js REST API with TypeScript, robust layered architecture, runtime schema validation, rate limiting, and email dispatch for the developer portfolio platform.

---

## Architecture Overview

This project is built following the **3-Tier Layered Architecture Pattern** (Separation of Concerns):

```
HTTP Request
     │
     ▼
[ Middlewares ] ─── (Helmet, CORS, Request Logger, Rate Limiting, Zod Validation)
     │
     ▼
[ Routes Layer ] ── (Defines URI endpoints and binds middlewares to controllers)
     │
     ▼
[ Controllers ] ─── (Extracts request payload, invokes services, formats ApiResponse)
     │
     ▼
[ Services Layer ] ─ (Core business logic, email dispatch, data querying)
     │
     ▼
[ Data / Storage ] ─ (Portfolio models, seed repositories, or database adapters)
```

### Key Architectural Benefits:
1. **Decoupled Business Logic**: Controllers only orchestrate HTTP requests and responses; all domain logic lives inside testable services.
2. **Standardized Response Protocol**: Every endpoint produces uniform JSON using `ApiResponse` (`{ success: true, statusCode, message, data }`) or `ApiError` (`{ success: false, statusCode, message, errors }`).
3. **Runtime Type Safety**: Environment variables and client inputs are strictly validated at runtime with **Zod**.
4. **Security Hardening**: Built-in HTTP security headers (`helmet`), CORS whitelisting, IP-based rate-limiting, and graceful shutdown signal handlers (`SIGTERM`, `SIGINT`).

---

## Project Folder Structure

```
portfolio-backend/
├── .env.example                  # Template of environment variables
├── .env                          # Local environment variables
├── .gitignore                    # Git ignore file
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # TypeScript compiler configuration
├── README.md                     # Documentation
└── src/
    ├── app.ts                    # Express app initialization & middleware stack
    ├── server.ts                 # Server entry point & graceful shutdown
    ├── config/
    │   ├── env.ts                # Strongly-typed environment variables (Zod validated)
    │   └── cors.ts               # CORS policy & origin configuration
    ├── controllers/
    │   ├── contact.controller.ts # Handles contact form submissions
    │   ├── project.controller.ts # Handles project queries, search & category filters
    │   ├── service.controller.ts # Handles service verticals
    │   └── health.controller.ts  # Health check & system metrics
    ├── services/
    │   ├── email.service.ts      # Nodemailer SMTP & fallback notification logger
    │   ├── contact.service.ts    # Contact business logic & storage
    │   └── project.service.ts    # Project filtering, search & category calculations
    ├── routes/
    │   ├── index.ts              # Master API router (/api)
    │   ├── contact.routes.ts     # /api/contact routes
    │   ├── project.routes.ts     # /api/projects routes
    │   ├── service.routes.ts     # /api/services routes
    │   └── health.routes.ts      # /api/health routes
    ├── middlewares/
    │   ├── error.middleware.ts   # Global error handler & 404 handler
    │   ├── validate.middleware.ts# Zod request validation middleware
    │   ├── rateLimiter.middleware.ts # IP rate limiter & contact anti-spam
    │   └── logger.middleware.ts  # HTTP request logger
    ├── validations/
    │   └── contact.validation.ts # Contact form inquiry Zod schema
    ├── types/
    │   ├── index.ts              # Common TypeScript types
    │   └── portfolio.ts          # Project, Service, and Contact data models
    ├── data/
    │   └── projects.data.ts      # Seed data matching frontend categories
    └── utils/
        ├── ApiError.ts           # Operational API error class
        ├── ApiResponse.ts         # Uniform API response structure
        ├── asyncHandler.ts       # Async route wrapper for exception forwarding
        └── logger.ts             # Colorized timestamped console logger
```

---

## Getting Started

### 1. Prerequisites
- **Node.js** v18+ (tested on Node v20+)
- **npm** or **pnpm**

### 2. Installation
```bash
# Navigate to the backend directory
cd "C:\Users\ghosh\OneDrive\Documents\Projects(Frontend and backend)\portfolio-backend"

# Install all dependencies (already installed)
npm install
```

### 3. Environment Setup
Review the `.env` file (copied from `.env.example`):
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MINUTES=15
RATE_LIMIT_MAX_REQUESTS=100
CONTACT_RATE_LIMIT_MAX=5

# SMTP (Optional: fill in to send real emails, otherwise logs to console)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
CONTACT_RECEIVER_EMAIL=Udayan.ghosh.dev@gmail.com
```

### 4. Running the Server

#### Development Mode (with hot-reload via `tsx watch`):
```bash
npm run dev
```

#### Production Build & Start:
```bash
npm run build
npm start
```

---

## API Endpoints Reference

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Description | Query / Body Params |
| :--- | :--- | :--- | :--- |
| `GET` | `/api` | Root API directory & version info | None |
| `GET` | `/api/health` | System status, uptime, memory & Node version | None |
| `GET` | `/api/projects` | List projects (with search & filtering) | `?category=ecommerce&search=stripe&featured=true` |
| `GET` | `/api/projects/categories` | List project category tabs & counts | None |
| `GET` | `/api/projects/:id` | Get single project by ID or slug | Parameter: `:id` (e.g. `velo-luxe`) |
| `GET` | `/api/services` | List all 6 service verticals | None |
| `GET` | `/api/services/:id` | Get single service details | Parameter: `:id` (e.g. `website-development`) |
| `POST` | `/api/contact` | Submit client inquiry (rate-limited, validated) | JSON body (see below) |
| `GET` | `/api/contact` | Retrieve recent contact inquiries | None |

---

### Contact Form Payload Example (`POST /api/contact`)

**Request Body:**
```json
{
  "name": "Sarah Connor",
  "email": "sarah@acme-corp.com",
  "message": "We need a custom e-commerce web platform built with Next.js and Stripe with sub-second page loads.",
  "budget": "$7,000 - $15,000",
  "timeline": "2 - 4 Weeks",
  "service": "Ecommerce Website Development"
}
```

**Success Response (`201 Created`):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Thank you! Your project inquiry has been received. I will review it and reply within 24 hours.",
  "data": {
    "id": "inq_1732112400000_a8x9z",
    "createdAt": "2024-11-20T14:30:00.000Z"
  }
}
```

**Validation Error Response (`400 Bad Request`):**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please enter a valid email address"
    },
    {
      "field": "message",
      "message": "Message must be at least 10 characters long"
    }
  ]
}
```
