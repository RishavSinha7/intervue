# Live Polling System - Configuration Guide

## Environment Variables

### Backend Configuration

Create a `.env` file in the root directory (optional):

```env
PORT=4000
NODE_ENV=development
```

**Default Values:**
- PORT: 4000
- NODE_ENV: development

### Frontend Configuration

Create a `.env` file in the `client` directory (optional):

```env
REACT_APP_SOCKET_URL=http://localhost:4000
```

**Default Values:**
- REACT_APP_SOCKET_URL: http://localhost:4000

## Port Configuration

### Change Backend Port

Edit `server/index.js`:
```javascript
const PORT = process.env.PORT || 4000; // Change 4000 to your port
```

### Change Frontend Port

Frontend port is managed by React Scripts. To change:
1. Set PORT environment variable before starting
2. Or allow React to prompt for alternative port

**Windows:**
```bash
set PORT=3001 && npm start
```

## Socket.io Configuration

### Backend CORS Settings

Edit `server/index.js`:
```javascript
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // Update for production
    methods: ['GET', 'POST']
  }
});
```

### Frontend Socket Settings

Edit `client/src/socket/socket.js`:
```javascript
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:4000';
```

## Redux Configuration

### Serialization Settings

Edit `client/src/store/store.js` to customize Redux middleware:
```javascript
middleware: (getDefaultMiddleware) =>
  getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: ['poll/setPollResults'],
      ignoredActionPaths: ['payload.timestamp'],
      ignoredPaths: ['poll.startTime']
    }
  })
```

## Customization Options

### Poll Time Limits

Edit `client/src/features/teacher/CreatePoll.jsx`:
```javascript
const [duration, setDuration] = useState(60); // Default time

// Min/Max validation
min="10"   // Minimum seconds
max="300"  // Maximum seconds
```

### Maximum Options

Edit `client/src/features/teacher/CreatePoll.jsx`:
```javascript
if (options.length < 6) {  // Change 6 to your max
  setOptions([...options, '']);
}
```

### Character Limits

**Question Length:**
Edit `CreatePoll.jsx`:
```javascript
maxLength={200}  // Question max length
```

**Option Length:**
Edit `CreatePoll.jsx`:
```javascript
maxLength={100}  // Option max length
```

**Student Name:**
Edit `StudentJoin.jsx`:
```javascript
maxLength={30}   // Name max length
```

**Chat Message:**
Edit `ChatPopup.jsx`:
```javascript
maxLength={200}  // Message max length
```

## Color Customization

### Update Color Palette

Edit `client/src/theme/colors.js`:
```javascript
export const colors = {
  lavender: '#7765DA',      // Primary color
  blueViolet: '#5767D0',    // Secondary color
  deepViolet: '#4F0DCE',    // Accent color
  lightGray: '#F2F2F2',     // Background
  darkGray: '#373737',      // Text
  mediumGray: '#6E6E6E'     // Secondary text
};
```

### Apply Custom Colors

1. Update values in `colors.js`
2. Colors are automatically applied throughout the app
3. Restart the development server

## Timer Configuration

### Update Frequency

Edit `client/src/features/student/PollRoom.jsx`:
```javascript
const interval = setInterval(() => {
  // Update logic
}, 100); // Change 100ms to your preferred interval
```

### Timer States

Edit `client/src/features/poll/Timer.jsx`:
```javascript
const getTimerClass = () => {
  const percentage = (displayTime / duration) * 100;
  if (percentage <= 25) return 'timer-critical';  // Critical threshold
  if (percentage <= 50) return 'timer-warning';   // Warning threshold
  return 'timer-normal';
};
```

## Production Deployment

### Backend Production Settings

1. **Set Production URL:**
   ```javascript
   // server/index.js
   const io = new Server(server, {
     cors: {
       origin: 'https://your-production-domain.com',
       methods: ['GET', 'POST']
     }
   });
   ```

2. **Environment Variables:**
   ```env
   NODE_ENV=production
   PORT=4000
   ```

### Frontend Production Settings

1. **Update Socket URL:**
   ```env
   REACT_APP_SOCKET_URL=https://your-backend-url.com
   ```

2. **Build for Production:**
   ```bash
   cd client
   npm run build
   ```

3. **Serve Build:**
   - Use a static file server
   - Or integrate with backend Express server

### Recommended Hosting

**Backend:**
- Heroku
- Railway
- Render
- DigitalOcean

**Frontend:**
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

## Performance Tuning

### Socket.io Options

Edit `client/src/socket/socket.js`:
```javascript
const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionDelay: 1000,      // Delay between reconnection attempts
  reconnectionAttempts: 5,       // Max reconnection attempts
  timeout: 20000                 // Connection timeout
});
```

### Redux DevTools

Disable in production:
```javascript
// client/src/store/store.js
export const store = configureStore({
  reducer: { /* ... */ },
  devTools: process.env.NODE_ENV !== 'production'
});
```

## Security Considerations

### Input Sanitization

Already implemented:
- `.trim()` on all text inputs
- `maxLength` attributes
- Server-side validation

### Additional Security

For production, consider adding:
- Rate limiting (express-rate-limit)
- Input sanitization library
- Helmet.js for Express
- HTTPS enforcement

### Example Rate Limiting:

```javascript
// server/index.js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);
```

## Troubleshooting

### Port Already in Use

**Backend:**
```bash
# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Change port in server/index.js
```

**Frontend:**
- React will prompt to use alternative port
- Or set PORT environment variable

### Socket Connection Issues

1. Check backend is running
2. Verify CORS settings
3. Check Socket URL in client
4. Check firewall settings

### Build Errors

```bash
# Clear cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Browser Compatibility

**Tested and Working:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Required Features:**
- WebSocket support
- LocalStorage support
- ES6+ support

## Development Tips

### Hot Reload

Both frontend and backend support hot reload:
- Frontend: Automatic with React Scripts
- Backend: Use `nodemon` for auto-restart

### Debug Mode

Enable detailed logging:
```javascript
// server/socket.js
console.log('Debug:', data); // Add throughout code
```

### Redux DevTools

Install Redux DevTools browser extension for state inspection.

---

## Quick Reference

**Default Ports:**
- Backend: 4000
- Frontend: 3000

**Key Files:**
- Backend config: `server/index.js`
- Socket config: `client/src/socket/socket.js`
- Colors: `client/src/theme/colors.js`
- Store: `client/src/store/store.js`

**Environment Files:**
- Root `.env` (backend)
- `client/.env` (frontend)

---

For more information, see README.md and QUICKSTART.md
