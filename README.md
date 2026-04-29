# Simba Market 2.0

Simba Market 2.0 is a modern, full-stack marketplace application designed for efficient product search, branch management, and seamless transactions.

## Tech Stack

### Frontend
- **Framework:** React 19 (Vite)
- **Styling:** Tailwind CSS 4.0
- **State Management:** Context API
- **Routing:** React Router 7
- **Maps:** Google Maps API & Leaflet
- **Auth:** Google OAuth

### Backend
- **Runtime:** Node.js
- **Framework:** Express
- **Database:** PostgreSQL (via Prisma ORM)
- **AI Integration:** Groq SDK for AI-powered search
- **Security:** JWT, BcryptJS

## Project Structure

```
simba-2v0/
├── simba-frontend/    # React application
└── simba-backend/     # Express API & Prisma database
```

## Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL database
- Git

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/TaylorChongo/simba-market-2v0.git
   cd simba-market-2v0
   ```

2. **Backend Setup:**
   ```bash
   cd simba-backend
   npm install
   # Create a .env file based on your environment variables
   npx prisma generate
   npx prisma migrate dev
   npm run seed # Optional: seed the database
   npm run dev
   ```

3. **Frontend Setup:**
   ```bash
   cd ../simba-frontend
   npm install
   # Create a .env file with VITE_API_URL, etc.
   npm run dev
   ```

## Key Features
- **AI-Powered Product Search:** Context-aware search for finding products easily.
- **Multi-Branch Support:** Manage inventory and orders across different locations.
- **Secure Authentication:** Standard and Google OAuth login options.
- **Interactive Maps:** Locate branches and track orders visually.
- **Vendor Dashboard:** Comprehensive tools for vendors to manage their products and sales.

## Deployment
The project is configured for deployment on platforms like Render (backend) and Vercel (frontend).
- `render.yaml` for Render deployment.
- `vercel.json` for Vercel deployment.

## License
ISC
