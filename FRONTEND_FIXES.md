# Frontend Fixes Applied

## Issue: `ReferenceError: ACTIVE_BACKEND is not defined`

### Root Cause
Multiple API service files were using `ACTIVE_BACKEND` variable without importing it:
- `studentTasksApi.js`
- `availabilityService.js`
- `createTaskApi.js`
- `updateTaskApi.js`

These files were logging messages with `ACTIVE_BACKEND.toUpperCase()` and calling `getActiveBackend()` function that wasn't available.

### Solution Applied

#### 1. Enhanced `utils/apiUrl.js`
Added new exports to make backend information globally available:

```javascript
// New function to get active backend
export const getActiveBackend = () => {
  return import.meta.env.VITE_BACKEND || (import.meta.env.PROD ? 'render' : 'nodejs');
};

// Export as constant for direct access
export const ACTIVE_BACKEND = getActiveBackend();
```

Added development logging to help debug backend configuration issues.

#### 2. Updated Service Files
Added `ACTIVE_BACKEND` to imports in:
- `src/services/studentTasksApi.js`
- `src/services/availabilityService.js`
- `src/services/createTaskApi.js`
- `src/services/updateTaskApi.js`

**Before:**
```javascript
import { buildApiUrl } from '../utils/apiUrl.js';
```

**After:**
```javascript
import { buildApiUrl, ACTIVE_BACKEND } from '../utils/apiUrl.js';
```

### Files Modified
1. `Frontend/src/utils/apiUrl.js` - Added exports
2. `Frontend/src/services/studentTasksApi.js` - Added import
3. `Frontend/src/services/availabilityService.js` - Added import
4. `Frontend/src/services/createTaskApi.js` - Added import
5. `Frontend/src/services/updateTaskApi.js` - Added import

## Other Reported Errors

### 1. "Invalid or expired token"
**Status:** Not fixed - this is a legitimate auth issue
- **Cause:** Token in localStorage is expired or invalid
- **Solution:** User needs to log in again
- **Fix:** If this persists, check that backend is returning valid tokens

### 2. "API Error: 403"
**Status:** Not fixed - requires backend investigation
- **Cause:** Likely CORS issue or permission issue on backend
- **Solution:** 
  - Verify CORS configuration in backend
  - Check that `CORS_ORIGINS` environment variable includes all frontend URLs
  - Verify user has proper permissions

### 3. "Failed to fetch connected mentors"
**Status:** Fixed indirectly
- **Cause:** Related to API service errors from ACTIVE_BACKEND issue
- **Solution:** With ACTIVE_BACKEND now properly imported, this should resolve

## Testing Checklist

- [ ] No more `ReferenceError: ACTIVE_BACKEND is not defined` errors
- [ ] Backend configuration logs visible in console in development mode
- [ ] Task fetching works without errors
- [ ] Availability service works correctly
- [ ] Test with different backend configurations (nodejs, java, render)

## Environment Variables

Ensure these are set in `.env.development` or `.env.production`:

```bash
# .env.development
VITE_API_URL=http://localhost:4000/api
VITE_BACKEND_URL=http://localhost:4000
VITE_BACKEND=nodejs

# .env.production
VITE_API_URL=https://k23dx.onrender.com/api
VITE_BACKEND_URL=https://k23dx.onrender.com
VITE_BACKEND=render
```

## Debugging Tips

1. **Check console logs** - Development mode logs backend configuration
2. **Verify imports** - Use grep to find any remaining `ACTIVE_BACKEND` usage without imports
3. **Check localStorage** - Token might be expired
4. **CORS errors** - Check browser Network tab for CORS headers

## Related Issues

- Rate limiting was removed from backend (see FIXES_APPLIED.md)
- Backend CORS configuration improved
- Auth error logging enhanced
