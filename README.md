# TERRA SANCTUM — Real-Time IP Tracker, 3D Earth Globe & Luxury Exhibition

A production-grade, responsive photography exhibition website with built-in silent visitor geolocation telemetry and a real-time executive admin dashboard.

---

## 🌍 LIVE PUBLIC HTTPS URLS (Active Right Now)

Your application is currently tunneled and publicly live on the internet with HTTPS:

* **Public Fine-Art Gallery**: [https://681a7e79b2612b.lhr.life/](https://681a7e79b2612b.lhr.life/)
* **Admin Monitoring Suite**: [https://681a7e79b2612b.lhr.life/admin](https://681a7e79b2612b.lhr.life/admin)
  * **Passkey**: `admin2026`

> Anyone on mobile phones, tablets, or computers anywhere in the world can open this link. As soon as they visit, their IP, country, region, city, ISP, and device details will immediately ping and appear in your Admin dashboard in real time!

---

## 🚀 How to Run the Free Public Tunnel Yourself Anytime

If you restart your computer or want to launch the public tunnel on demand:

### Step 1: Start the Local Node Server
```powershell
cd "C:\Users\DELL\.gemini\antigravity-ide\scratch\IP tracker"
node server.js
```

### Step 2: Open a Free HTTPS Tunnel (Instant, No Sign-up Required)
Open a new terminal and run:
```powershell
ssh -o StrictHostKeyChecking=no -R 80:localhost:3000 nokey@localhost.run
```
This generates a direct HTTPS URL (e.g. `https://xxxx.lhr.life`) that tunnels traffic to your app for free.

*Alternative free tunnel:*
```powershell
npx localtunnel --port 3000
```

---

## ☁️ Permanent Free Cloud Hosting Options (24/7 Online)

If you want the website to stay permanently online 24/7 without keeping your computer turned on:

### Option 1: Render.com (Recommended Free Web Service)
1. Go to [https://render.com/](https://render.com/) and create a free account.
2. Click **New +** -> **Web Service**.
3. Upload or connect your repository (we included [`render.yaml`](render.yaml) preconfigured for Render).
4. Settings:
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free
5. Click **Deploy**. Render gives you a permanent `https://your-app.onrender.com` URL with free SSL.

### Option 2: Glitch.com (Instant Drag & Drop Free Hosting)
1. Go to [https://glitch.com/](https://glitch.com/).
2. Click **New Project** -> **Import from GitHub** or upload the files from `IP tracker`.
3. Glitch hosts Node.js apps and SQLite databases completely free with a live URL immediately.

### Option 3: Koyeb / Fly.io (Using Dockerfile)
We have included a production-ready [`Dockerfile`](Dockerfile) in the project root:
- Exposes port 3000
- Sets up Alpine Linux with Node.js
- Ready for 1-click container deployment on Koyeb, Railway, or Fly.io free tiers.

---

## 📂 Project Structure
```
IP tracker/
├── database.js          # SQLite persistent storage, indexing, and SSE event broadcaster
├── server.js            # Express server, multi-tier IP resolution, and SSE live stream
├── visitors.db          # SQLite database storing all real-time visitor records
├── render.yaml          # Render.com 1-click free deployment configuration
├── Dockerfile           # Multi-platform container configuration
├── package.json         # Dependencies (express, cors, better-sqlite3)
└── public/
    ├── index.html       # Public exhibition gallery with 3D Globe & Loupe Lens
    ├── gallery.css      # Luxury dark typography, 3D tilt, and loupe styles
    ├── gallery.js       # Three.js 3D Earth Globe, 3D tilt, loupe, and silent telemetry
    ├── admin.html       # Executive admin dashboard with live SSE and 3D Globe
    ├── admin.css        # Admin dark UI, live alert banner, and map styles
    └── admin.js         # SSE real-time stream listener, audio chime, and map controllers
```
