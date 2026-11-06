# 🚀 Deploy to Railway (CSE Portfolio Ready)

Railway is **perfect for portfolio projects**—free tier, GitHub integration, automatic deployments.

---

## **Step 1: Prepare Your GitHub**

```bash
# In your project root
git init
git add .
git commit -m "Initial commit: Food Delivery App"
git remote add origin https://github.com/YOUR-USERNAME/food-delivery.git
git push -u origin main
```

> Replace `YOUR-USERNAME` with your GitHub username.

---

## **Step 2: Create Railway Account & Connect GitHub**

1. Go to [railway.app](https://railway.app)
2. Click **"Create New Project"** → **"Deploy from GitHub repo"**
3. Authorize Railway to access GitHub
4. Select the `food-delivery` repository
5. Railway auto-detects it's a **Monorepo** (frontend + backend)

---

## **Step 3: Create Backend Service**

Railway will see `backend/pom.xml` and create a Java service automatically.

### Configure Environment Variables for Backend:

In Railway dashboard → Backend Service → Variables:

```
DB_HOST=        (Railway will auto-fill this after MySQL service is added)
DB_PORT=3306
DB_NAME=food_delivery_db
DB_USER=root
DB_PASSWORD=     (Create a strong password)
JAVA_PORT=8080
JWT_SECRET=your-super-secret-256-bit-key-here
JWT_EXPIRATION=86400000
CORS_ALLOWED_ORIGINS=YOUR-FRONTEND-DOMAIN.railway.app
```

**Build Command:**
```bash
mvn clean package -DskipTests
```

**Start Command:**
```bash
java -jar target/food-delivery-backend-1.0.0.jar
```

---

## **Step 4: Add MySQL Database**

1. Railway Dashboard → **"Add Services"** → **"MySQL"**
2. Railway auto-fills `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` in backend environment
3. Create the database:
   ```sql
   CREATE DATABASE food_delivery_db;
   ```

---

## **Step 5: Create Frontend Service**

Railway will see `frontend/package.json` and create a Node service.

### Configure Environment Variables for Frontend:

In Railway dashboard → Frontend Service → Variables:

```
VITE_API_BASE_URL=https://YOUR-BACKEND-RAILWAY-URL/api
```

(Copy the backend public URL from Railway dashboard)

**Build Command:**
```bash
npm install && npm run build
```

**Start Command:**
```bash
npm run preview
```

---

## **Step 6: Get Your Live URLs**

After both services deploy:
- **Backend:** `https://your-backend.railway.app` → Use in frontend vars
- **Frontend:** `https://your-frontend.railway.app` → Share this as portfolio link

---

## **Step 7: Update CORS (Backend)**

Once frontend is deployed, update backend env var:

```
CORS_ALLOWED_ORIGINS=https://your-frontend.railway.app
```

---

## **Step 8: Troubleshooting**

### Backend fails to connect to MySQL:
- Check DB credentials in backend env vars match MySQL service
- Ensure `DB_NAME=food_delivery_db` exists (create manually if needed)

### Frontend shows "Cannot reach API":
- Verify `VITE_API_BASE_URL` points to correct backend URL
- Check backend CORS includes frontend domain
- Check browser console for CORS errors

### Build fails:
```bash
# Check logs in Railway dashboard
# Common fixes:
rm -rf node_modules package-lock.json  # Clear cache
```

---

## **Portfolio Tips**

1. **Add to GitHub README:**
   ```markdown
   ### 🌐 Live Demo
   [View Live](https://your-frontend.railway.app)
   
   ### 🚀 Deployment
   Deployed on Railway (auto-deploy from GitHub)
   ```

2. **LinkedIn:**
   ```
   🍔 Food Delivery App
   - Spring Boot + React Full-stack
   - Deployed live on Railway
   - Link: your-frontend.railway.app
   ```

3. **Screenshot each milestone:**
   - Homepage with restaurants
   - Seller dashboard with menu management
   - Live API responses

---

## **Free Tier Limits**

- ✅ 1 free project per month (~$5 credits)
- ✅ 500MB RAM + 1GB storage
- ✅ Enough for portfolio demo
- ⚠️ Will sleep after 7 days of inactivity (add $5/month to keep always on)

---

**Deploy takes ~5-10 minutes. Your portfolio link will be live!** 🎉

Got stuck? [Railway Docs](https://docs.railway.app)
