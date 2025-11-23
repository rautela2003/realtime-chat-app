# Deployment Guide (Free Tier)

This guide explains how to deploy your Real-Time Chat App for free using **Render** (for the Node.js Backend) and **Vercel** (for the React Frontend).

---

## 1. Backend Deployment (Render)
Render is great because it supports persistent Node.js servers (required for Socket.io) on its free tier.

1.  **Push to GitHub**: Ensure your latest code is on GitHub.
2.  **Sign Up**: Go to [render.com](https://render.com) and sign up with GitHub.
3.  **Create Web Service**:
    *   Click **"New +"** -> **"Web Service"**.
    *   Connect your `realtime-chat-app` repository.
4.  **Configure**:
    *   **Name**: `chat-app-backend` (or similar).
    *   **Region**: Choose one close to you.
    *   **Branch**: `main`.
    *   **Root Directory**: `.` (leave empty or dot).
    *   **Runtime**: `Node`.
    *   **Build Command**: `npm install`.
    *   **Start Command**: `node server.js`.
    *   **Instance Type**: `Free`.
5.  **Environment Variables**:
    *   Scroll down to "Environment Variables".
    *   Add `JWT_SECRET`: (Generate a random string).
    *   Add `EMAIL_USER` & `EMAIL_PASS`: (Your Gmail credentials, if you want real emails).
    *   *Note*: Render's free tier doesn't include persistent MongoDB. You can use **MongoDB Atlas** (Free Tier) for the database.
        *   Sign up at [mongodb.com/atlas](https://www.mongodb.com/atlas).
        *   Create a free cluster.
        *   Get the connection string (e.g., `mongodb+srv://...`).
        *   Add `MONGO_URI` to Render env vars.
        *   *Or rely on the in-memory fallback (data wipes on restart).*
6.  **Deploy**: Click "Create Web Service".
7.  **Copy URL**: Once live, copy your backend URL (e.g., `https://chat-app-backend.onrender.com`).

---

## 2. Frontend Deployment (Vercel)
Vercel is the best place to host React/Vite apps.

1.  **Update Code**:
    *   In `client/src/App.jsx` and `client/src/components/AuthScreen.jsx`, you currently point to `http://localhost:3000`.
    *   You need to change this to your **Render Backend URL**.
    *   *Best Practice*: Use an environment variable.
        *   Create `client/.env`: `VITE_API_URL=https://your-backend.onrender.com`
        *   Update code to use `import.meta.env.VITE_API_URL || 'http://localhost:3000'`.
2.  **Push Changes**: Push the URL update to GitHub.
3.  **Sign Up**: Go to [vercel.com](https://vercel.com) and sign up with GitHub.
4.  **Add New Project**:
    *   Import your `realtime-chat-app` repository.
5.  **Configure**:
    *   **Framework Preset**: `Vite`.
    *   **Root Directory**: Click "Edit" and select `client`. (Important!)
    *   **Environment Variables**:
        *   Add `VITE_API_URL` = `https://your-backend.onrender.com`.
6.  **Deploy**: Click "Deploy".

---

## 3. Final Check
1.  Open your **Vercel URL**.
2.  Try to log in.
3.  If it fails, check:
    *   **CORS**: You might need to update `server.js` to allow the Vercel domain in `cors` origin.
    *   **Env Vars**: Did you set the API URL correctly?

### Updating CORS (Server)
If you get CORS errors:
1.  Open `server.js`.
2.  Update the `cors` configuration:
    ```javascript
    app.use(cors({
        origin: ["http://localhost:5173", "https://your-vercel-app.vercel.app"],
        methods: ["GET", "POST"],
        credentials: true
    }));
    
    const io = new Server(server, {
        cors: {
            origin: ["http://localhost:5173", "https://your-vercel-app.vercel.app"],
            methods: ["GET", "POST"],
            credentials: true
        }
    });
    ```
3.  Push changes to GitHub (Render will auto-redeploy).
