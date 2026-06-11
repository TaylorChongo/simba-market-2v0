# Simba Market 2.0 Deployment Guide

This guide covers the steps to deploy the application with the following stack:
- **Backend:** Render (Web Service)
- **Frontend:** Vercel (Static Hosting)
- **Database:** Supabase (PostgreSQL)

---

## 1. Database Setup (Supabase)

1. Create a new project on [Supabase](https://supabase.com).
2. Go to **Project Settings > Database**.
3. Locate the **Connection Strings** section and copy the **URI** (Transaction mode / Port 6543) for `DATABASE_URL`.
4. Locate the **Direct connection** (Port 5432) for `DIRECT_URL`.
5. Ensure the password you set for the database is included in these strings.

---

## 2. Backend Deployment (Render)

### Option A: Manual Setup
1. Create a **New Web Service** on Render.
2. Connect your repository.
3. Set the following:
   - **Root Directory:** `simba-backend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
4. Add **Environment Variables**:
   - `DATABASE_URL`: (from Supabase Transaction mode)
   - `DIRECT_URL`: (from Supabase Direct mode)
   - `JWT_SECRET`: (a random string)
   - `FRONTEND_URL`: (Your Vercel deployment URL, e.g., `https://simba-market.vercel.app`)
   - `GROQ_API_KEY`: (Your AI search API key)
   - `VITE_GOOGLE_CLIENT_ID`: (Your Google OAuth ID)
   - `MOMO_MOCK_MODE`: `true`

### Option B: using `render.yaml`
1. Re-create a `render.yaml` file (template below) in the root directory.
2. Render will automatically detect it and configure your services.

---

## 3. Frontend Deployment (Vercel)

1. Connect your repository to [Vercel](https://vercel.com).
2. Select the `simba-frontend` folder as the **Root Directory**.
3. Vercel should auto-detect **Vite**.
4. Add **Environment Variables**:
   - `VITE_API_URL`: (Your Render backend URL, e.g., `https://simba-api.onrender.com`)
   - `VITE_GOOGLE_CLIENT_ID`: (Your Google OAuth ID)
5. Deploy.

---

## Security & Maintenance

- **CORS:** The backend is configured to only allow requests from `FRONTEND_URL` and `localhost`.
- **Migrations:** The backend `build` script automatically runs `prisma migrate deploy` to update the Supabase schema on every deploy.
- **Seeding:** The backend automatically seeds initial data if the database is empty.
