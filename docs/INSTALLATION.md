\# 📦 Installation Guide



\## Prerequisites



Before you begin, ensure you have the following installed:



\- \*\*Node.js\*\* (v18 or higher) - \[Download](https://nodejs.org/)

\- \*\*Python\*\* (v3.10 or higher) - \[Download](https://www.python.org/)

\- \*\*Git\*\* - \[Download](https://git-scm.com/)

\- \*\*PostgreSQL Database\*\* (Neon recommended) - \[Get Started](https://neon.tech/)



---



\## 🚀 Quick Setup (5 Minutes)



\### Step 1: Clone the Repository



```bash

git clone https://github.com/Mukesh7522/trading-db.git

cd trading-db

```



\### Step 2: Backend Setup



```bash

\# Navigate to backend folder

cd backend



\# Install dependencies

npm install



\# Create environment file

cp .env.example .env



\# Edit .env with your database credentials

notepad .env  # Windows

nano .env     # Mac/Linux

```



\*\*Required Environment Variables (.env):\*\*

```env

DB\_HOST=your-neon-db-host.aws.neon.tech

DB\_NAME=neondb

DB\_USER=your-db-user

DB\_PASSWORD=your-db-password

DB\_PORT=5432

PORT=3001

NODE\_ENV=development

```



```bash

\# Start the backend server

npm start



\# You should see:

\# ✅ Database connected successfully

\# 🚀 Server running on http://localhost:3001

```



\### Step 3: Frontend Setup



Open a \*\*new terminal window\*\*:



```bash

\# Navigate to frontend folder

cd frontend



\# Install dependencies

npm install



\# Create environment file

echo "VITE\_API\_URL=http://localhost:3001/api" > .env



\# Start the development server

npm run dev



\# You should see:

\# ➜  Local:   http://localhost:5173/

```



\### Step 4: Access the Application



Open your browser and visit: \*\*http://localhost:5173\*\*



You should see the Stock Dashboard! 🎉



---



\## 🗄️ Database Setup (Neon PostgreSQL)



\### Option A: Using Neon (Recommended - Free Tier)



1\. \*\*Create Account\*\*: Go to \[neon.tech](https://neon.tech) and sign up

2\. \*\*Create Project\*\*: Click "New Project"

3\. \*\*Get Connection String\*\*: Copy the connection details

4\. \*\*Update .env\*\*: Paste the credentials in `backend/.env`



\### Option B: Local PostgreSQL



```bash

\# Install PostgreSQL locally

\# Windows: Download from postgresql.org

\# Mac: brew install postgresql

\# Linux: sudo apt-get install postgresql



\# Create database

psql -U postgres

CREATE DATABASE stock\_dashboard;

\\q



\# Update .env with local credentials

DB\_HOST=localhost

DB\_NAME=stock\_dashboard

DB\_USER=postgres

DB\_PASSWORD=your\_password

DB\_PORT=5432

```



---



\## 🐍 Python Data Pipeline Setup



```bash

\# From project root

pip install -r requirements.txt



\# Configure database in stock\_pipeline\_v3\_cloud.py

\# Lines 45-52: Update DB credentials



\# Run the pipeline (first time - takes 15-20 minutes)

python stock\_pipeline\_v3\_cloud.py



\# You should see:

\# 🚀 STARTING STOCK MARKET DATA PIPELINE

\# 📊 26 stocks × 10 years

\# ✅ Pipeline completed successfully!

```



---



\## ✅ Verification Checklist



\- \[ ] Backend running on http://localhost:3001

\- \[ ] Frontend running on http://localhost:5173

\- \[ ] Database connected (check backend logs)

\- \[ ] Can see stock data on homepage

\- \[ ] Charts are rendering correctly



---



\## 🐛 Common Issues



\### Issue 1: "Database connection failed"



\*\*Solution:\*\*

```bash

\# Check if database credentials are correct

cd backend

cat .env



\# Test database connection

node -e "const pg = require('pg'); const client = new pg.Client({host: 'YOUR\_HOST', database: 'YOUR\_DB', user: 'YOUR\_USER', password: 'YOUR\_PASS', port: 5432, ssl: {rejectUnauthorized: false}}); client.connect().then(() => console.log('✅ Connected')).catch(err => console.log('❌ Failed:', err.message));"

```



\### Issue 2: "Port 3001 already in use"



\*\*Solution:\*\*

```bash

\# Windows

netstat -ano | findstr :3001

taskkill /PID <PID> /F



\# Mac/Linux

lsof -ti:3001 | xargs kill -9



\# Or change port in backend/.env

PORT=3002

```



\### Issue 3: "Cannot find module 'vite'"



\*\*Solution:\*\*

```bash

cd frontend

rm -rf node\_modules package-lock.json

npm install

npm run dev

```



\### Issue 4: "CORS Error"



\*\*Solution:\*\*

```bash

\# Make sure backend .env has correct CORS settings

\# Or add to backend/server.js:



const allowedOrigins = \[

&nbsp; 'http://localhost:5173',

&nbsp; 'http://localhost:3000'

];

```



---



\## 🔄 Automated Data Updates



\### Setup GitHub Actions



1\. Go to your repo: Settings → Secrets and variables → Actions

2\. Add secrets:

&nbsp;  - `DB\_HOST`

&nbsp;  - `DB\_NAME`

&nbsp;  - `DB\_USER`

&nbsp;  - `DB\_PASSWORD`

&nbsp;  - `DB\_PORT`



3\. The pipeline will run automatically at 9:00 AM IST daily



\### Manual Trigger



```bash

\# From project root

python stock\_pipeline\_v3\_cloud.py

```



---



\## 📱 Development Mode



\### Backend with Hot Reload



```bash

cd backend

npm install -g nodemon

nodemon server.js

```



\### Frontend with Hot Module Replacement



```bash

cd frontend

npm run dev

\# Changes auto-reload in browser

```



---



\## 🚢 Production Build



\### Build Frontend



```bash

cd frontend

npm run build



\# Output in: frontend/dist/

\# Deploy to: Vercel, Netlify, or any static host

```



\### Deploy Backend



```bash

cd backend

\# Already production-ready

\# Deploy to: Vercel, Heroku, Railway, etc.

```



---



\## 🆘 Need Help?



\- 📧 Email: Mukesh7522@gmail.com

\- 💼 LinkedIn: \[mukesh7522](https://linkedin.com/in/mukesh7522)

\- 🐛 Issues: \[GitHub Issues](https://github.com/Mukesh7522/trading-db/issues)



---



\## 🎓 Next Steps



1\. ✅ Complete installation

2\. 📖 Read \[API Documentation](API.md)

3\. 🎨 Customize the dashboard

4\. 🚀 Deploy to production

5\. ⭐ Star the repo if you find it helpful!

