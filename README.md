# IBanking-Tuition — Service-oriented iBanking Demo

Short description
- A small service-oriented / microservices demo for a tuition payment banking flow.
- Consists of:
  - API Gateway (proxy + CORS handling)
  - Services: User, Students, OTP, Transactions (Express + MongoDB)
  - Frontend client (React / Vite)

Architecture (high level)
- Frontend (http://localhost:5173) → API Gateway (http://localhost:5000)
- Gateway proxies routes to backend services:
  - /api/users         → User service (http://localhost:5001)
  - /api/students      → Students service (http://localhost:5002)
  - /api/otp           → OTP service (http://localhost:5003)
  - /api/transactions  → Transactions service (http://localhost:5004)
- Each service connects to its MongoDB instance (single DB or separate DBs as configured).

Prerequisites
- Node.js (>= 18 recommended)
- npm
- MongoDB (local or remote)
- (Optional) Docker if you prefer containerized runs

Repository layout
- client/                        — Frontend (Vite + React)
- gateway/                        — API Gateway (Express + http-proxy-middleware)
- services/
  - user/                         — User service (Express + MongoDB)
  - students/                     — Students service
  - otp/                          — OTP service
  - transactions/                 — Transaction service
- .env (root or per-service)      — Environment variables

Quick start (local, Windows PowerShell)
1. Clone and open repo
   ```powershell
   git clone https://github.com/roddely/Ibanking-Tuition.git
   cd "d:\Project\Service-oriented approach\IBanking-tuition"
   ```

2. Install dependencies for each project
   ```powershell
   # from repo root (repeat in each folder if no root script)
   cd client
   npm install
   cd ../gateway
   npm install
   cd ../services/user
   npm install
   # repeat for other services: students, otp, transactions
   ```

3. Create .env files
   - Gateway example (.env in gateway or root):
     ```
     GATEWAY_PORT=5000
     USERS_TARGET=http://localhost:5001
     STUDENTS_TARGET=http://localhost:5002
     OTP_TARGET=http://localhost:5003
     TRANSACTIONS_TARGET=http://localhost:5004
     FRONTEND_ORIGIN=http://localhost:5173
     ```
   - Service example (each service):
     ```
     PORT=5001
     MONGO_URI=mongodb://localhost:27017/ibanking-users
     JWT_SECRET=your_jwt_secret
     # other service-specific envs
     ```

4. Start services (each in its own terminal)
   ```powershell
   # start gateway
   cd gateway
   npm start

   # start user service
   cd ../services/user
   npm start

   # start students service
   cd ../services/students
   npm start

   # start otp service
   cd ../services/otp
   npm start

   # start transactions service
   cd ../services/transactions
   npm start

   # start frontend
   cd ../../client
   npm run dev
   ```

Notes on env variable names
- Gateway code expects target URLs via env variables (e.g. `USERS_TARGET`). Use full URL form (http://localhost:5001).
- Services load DB and port settings from their own .env files (each service typically resolves ../../.env or local .env).

Frontend & cookies
- Frontend calls gateway with credentials: use fetch { credentials: 'include' } or axios withCredentials: true.
- Gateway must set:
  - Access-Control-Allow-Origin to the exact frontend origin (not `*`) when sending credentials.
  - Access-Control-Allow-Credentials: true
- Gateway code already applies CORS and also sets these headers on proxied responses.

Common issues & troubleshooting
- "Response to preflight request doesn't pass access control check" — ensure gateway CORS origin matches frontend and credentials are allowed. Do not use '*' when using cookies.
- Wrong target forwarded (students request answered by user service) — ensure proxy config uses the correct target per route (create distinct proxy options per service).
- "Cast to ObjectId failed for value 'test'" — indicates request reached a service expecting an ObjectId; ensure path rewrites are correct so resource is routed to the intended service.
- Proxy function import error: If you see `createUserServiceProxyMiddleware is not a function` ensure you import:
  ```js
  const { createProxyMiddleware } = require('http-proxy-middleware');
  ```
- Git / repo tips: to add & commit all modified tracked files:
  ```powershell
  git add -A
  git commit -m "Your message"
  git push origin main
  ```

Testing
- Manual: use Postman or browser to hit gateway endpoints:
  - GET http://localhost:5000/health
  - POST http://localhost:5000/api/users/login (proxied to user service)
  - POST http://localhost:5000/api/otp/generate and /verify (OTP flow)
- Unit tests: none included by default — add tests per service using jest/mocha as needed.

Deployment suggestions
- Frontend: can be deployed to GitHub Pages, Netlify, Vercel, or any static host.
- Backend services & gateway: deploy to cloud platforms that support Node services:
  - Render, Railway, Fly.io, Cloud Run, AWS ECS/Fargate, Heroku, DigitalOcean App Platform.
- Use HTTPS in production; cookie Secure and SameSite settings required for cross-site cookies.

Security & secrets
- Do not commit .env or secrets to the repo.
- Use platform secret stores (Render/Cloud Run secrets, GitHub Actions secrets) for production.

Contributing
- Open issues describing bugs or improvements.
- Create PRs against main branch; keep commits clear and scoped.

License
- Add a LICENSE file if you plan to open-source this project. No license included by default.

Contact / notes
- This README is a concise overview. Check individual service folders for implementation details and service-specific env/config.