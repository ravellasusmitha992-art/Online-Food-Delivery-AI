# 🎯 Railway Deployment Checklist (CSE Portfolio Edition)

## ✅ Pre-deployment (Already Done)

- [x] Environment variables configured (no hardcoded secrets)
- [x] `application.properties` uses env vars with defaults
- [x] `application-prod.properties` created for production
- [x] Frontend `axios.js` uses environment-based API URL
- [x] `.env.example` created with all required variables
- [x] `.gitignore` prevents `.env` from being committed
- [x] Backend compiles successfully ✓
- [x] Frontend builds successfully ✓

---

## 📋 Deploy to Railway Today (15 minutes)

### 1️⃣ Prepare GitHub

```bash
# Make sure everything is committed
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

### 2️⃣ Railway Setup (5 minutes)

1. Go to [railway.app](https://railway.app)
2. Sign up (free) or login
3. **"Create New Project"** → **"Deploy from GitHub repo"**
4. Authorize & select `food-delivery` repo
5. Let Railway auto-detect the monorepo

### 3️⃣ Backend Configuration (3 minutes)

In Railway dashboard → **Backend Service** → **Variables**:

```
DB_HOST=           (Railway MySQL will auto-fill)
DB_PORT=3306
DB_NAME=food_delivery_db
DB_USER=root
DB_PASSWORD=       (IMPORTANT: Create strong password)
JAVA_PORT=8080
JWT_SECRET=        (IMPORTANT: Generate 256-bit key)
CORS_ALLOWED_ORIGINS=YOUR_FRONTEND_RAILWAY_URL
```

**Build Command:**
```
mvn clean package -DskipTests
```

**Start Command:**
```
java -jar target/food-delivery-backend-1.0.0.jar
```

### 4️⃣ Add MySQL (2 minutes)

1. Dashboard → **"Add Service"** → **"MySQL"**
2. Railway auto-fills `DB_HOST`, `DB_USER`, `DB_PASSWORD`
3. Button: **"Connect"** to link to backend
4. Create database:
   ```sql
   CREATE DATABASE food_delivery_db;
   ```

### 5️⃣ Frontend Configuration (3 minutes)

In Railway dashboard → **Frontend Service** → **Variables**:

```
VITE_API_BASE_URL=https://YOUR-BACKEND-RAILWAY-URL/api
```

**Build Command:**
```
npm install && npm run build
```

**Start Command:**
```
npm run preview
```

---

## 🎉 You're Live!

After successful deploys:
- 🔗 **Backend URL:** `https://your-backend-xxxx.railway.app`
- 🌐 **Frontend URL:** `https://your-frontend-xxxx.railway.app` ← **Share this!**

---

## 📱 Portfolio Caption

```
🍔 Food Delivery App - Full Stack
✅ Spring Boot + React + MySQL + JWT
🚀 Deployed on Railway
🔗 [View Live](https://your-frontend-xxxx.railway.app)
```

---

## 🆘 Troubleshooting

| Error | Fix |
|-------|-----|
| Backend fails to start | Check `DB_PASSWORD` and `JWT_SECRET` are set |
| Frontend "Cannot reach API" | Verify `VITE_API_BASE_URL` in frontend vars |
| "Cannot GET /" on backend | Run migrations in Railway MySQL console |
| CORS errors | Update `CORS_ALLOWED_ORIGINS` to frontend domain |

---

**Estimated time: 15 minutes from GitHub to live link!** ⏱️

Got questions? Check [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md) for detailed guide.
