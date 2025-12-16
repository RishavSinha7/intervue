## 🚀 DEPLOYMENT INSTRUCTIONS

### Quick Setup (Local/Development)
1. Copy environment files:
   ```bash
   cp .env.example .env
   cp client/.env.example client/.env
   ```

2. Install dependencies:
   ```bash
   npm run install-all
   ```

3. Start services:
   ```bash
   # Terminal 1 - Backend
   npm start

   # Terminal 2 - Frontend  
   npm run client
   ```

### Production Deployment

#### Backend (Express + Socket.io)
**Platform**: Render, Railway, Heroku, or any Node.js host

1. Set environment variables:
   ```
   PORT=4000
   NODE_ENV=production
   CORS_ORIGIN=https://your-frontend-domain.com
   ```

2. Build command: `npm install`
3. Start command: `npm start`

#### Frontend (React)
**Platform**: Vercel, Netlify, or any static host

1. Set environment variable:
   ```
   REACT_APP_SOCKET_URL=https://your-backend-domain.com
   ```

2. Build command: `npm run build`
3. Publish directory: `build`

---

### Environment Variables Reference

**Backend (.env)**:
- `PORT` - Server port (default: 4000)
- `NODE_ENV` - Environment mode (development/production)
- `CORS_ORIGIN` - Frontend URL for CORS

**Frontend (client/.env)**:
- `REACT_APP_SOCKET_URL` - Backend WebSocket URL

---

### Deployment Checklist
- [ ] Install `dotenv` package: `npm install dotenv`
- [ ] Create `.env` files from examples
- [ ] Update CORS_ORIGIN to production frontend URL
- [ ] Update REACT_APP_SOCKET_URL to production backend URL
- [ ] Test build: `cd client && npm run build`
- [ ] Verify health endpoint: `curl http://localhost:4000/health`
- [ ] Deploy backend first
- [ ] Update frontend env with backend URL
- [ ] Deploy frontend

---

### Testing Production Build Locally
```bash
# 1. Build frontend
cd client
npm run build

# 2. Serve production build
npx serve -s build -p 3000

# 3. In another terminal, start backend with production settings
cd ..
NODE_ENV=production CORS_ORIGIN=http://localhost:3000 npm start
```
