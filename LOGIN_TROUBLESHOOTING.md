# Login Stuck - Troubleshooting Guide

## What Was Changed
1. Added **timeout handling** (15 seconds) to prevent infinite loading
2. Added **console logging** to track the login flow
3. Added **better error messages** for different error types
4. Added **credentials header** for CORS compatibility

## Checklist to Fix "Stuck at Logging In" Issue

### 1. Verify Backend is Running
```bash
# In Backend directory, run:
npm run dev

# You should see:
# "Server running in development mode"
# "Port: 4000"
```

### 2. Check Browser Console
Open DevTools (F12) → Console tab
Look for messages like:
```
[Login] Attempting login to http://localhost:4000/api/auth/login
[Login] Response status: 200
[Login] Response data: { success: true, token: "...", ... }
[Login] Login successful, redirecting to student dashboard
```

### 3. Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| `[Login] Attempting login...` but nothing after | Backend not running or not responding |
| Response status: 401 | Wrong email/password |
| Response status: 400 | Validation error (check email format) |
| Response status: 500 | Backend error (check backend console) |
| Request timed out | Backend not responding within 15 seconds |
| CORS error | Check CORS configuration in backend |

### 4. Test Backend Connection
In browser console, run:
```javascript
fetch('http://localhost:4000/api/health')
  .then(r => r.json())
  .then(d => console.log('Backend OK:', d))
  .catch(e => console.error('Backend error:', e))
```

Should output: `Backend OK: {success: true, status: "healthy", ...}`

### 5. Required Environment Variables

**Backend (.env)**:
```bash
PORT=4000
NODE_ENV=development
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_id
GOOGLE_CLIENT_SECRET=your_google_secret
```

**Frontend (.env.development)**:
```bash
VITE_API_URL=http://localhost:4000/api
VITE_BACKEND_URL=http://localhost:4000
VITE_BACKEND=nodejs
```

### 6. Step-by-Step Debug

1. **Check Backend Health**
   - Open http://localhost:4000/api/health in browser
   - Should show green response

2. **Open Dev Tools**
   - F12 → Network tab
   - Click Login
   - Look for `auth/login` request
   - Check response status and body

3. **Read Console Logs**
   - Look for `[Login]` prefixed messages
   - They will tell you exactly where it's stuck

4. **Check Backend Logs**
   - Terminal running backend should show request logs
   - Format: `[timestamp] POST /api/auth/login`

### 7. Force Clear Cache
```bash
# In Frontend directory:
npm run dev -- --force

# Or clear and rebuild:
rm -rf node_modules/.vite
npm run dev
```

### 8. If Still Stuck
1. Check that backend `.env` has all required variables
2. Verify MongoDB connection is working
3. Check both frontend and backend are using correct URLs
4. Try with a known user (register first if needed)
5. Check for any firewall blocking port 4000

## Files Modified
- `Frontend/src/pages/Login.jsx` - Enhanced with timeout and logging

## Success Indicators
✅ Console shows: `[Login] Response status: 200`
✅ You're redirected to dashboard
✅ Token saved in localStorage
