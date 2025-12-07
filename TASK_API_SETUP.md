# Task Management API Setup

## Overview
You now have **two complete implementations** of the Task Management API:
- **Node.js Backend** (MongoDB) - Port 4000
- **Java Backend** (MongoDB) - Port 8081

Both implementations are fully functional and can be easily switched between.

## Node.js Backend Implementation

### Files Created:
1. **Model**: `/Backend/models/task.model.js`
   - Complete MongoDB schema with all task fields
   - Indexes for fast queries
   - Timestamps and status tracking

2. **Controller**: `/Backend/controllers/task.controller.js`
   - `createTask()` - Create new task
   - `getTasksByMentor()` - Get all tasks for authenticated mentor
   - `getTasksByMentee()` - Get tasks for specific mentee
   - `getTaskById()` - Get single task
   - `updateTask()` - Update task details
   - `deleteTask()` - Delete task
   - `getTasksByStatus()` - Filter by status
   - `getTasksByMentorAndMentee()` - Get tasks for specific mentor-mentee pair

3. **Routes**: `/Backend/routes/task.routes.js`
   - `POST /api/tasks` - Create task (authenticated)
   - `GET /api/tasks` - Get mentor's tasks (authenticated)
   - `GET /api/tasks/status/:status` - Filter by status (authenticated)
   - `GET /api/tasks/mentor-mentee/:menteeId` - Get specific mentor-mentee tasks (authenticated)
   - `GET /api/tasks/mentee/:menteeId` - Get mentee's tasks
   - `GET /api/tasks/:id` - Get single task
   - `PUT /api/tasks/:id` - Update task (authenticated)
   - `DELETE /api/tasks/:id` - Delete task (authenticated)

4. **Server Integration**: Updated `/Backend/index.js`
   - Added task router import
   - Registered routes at `/api/tasks`

## Frontend Configuration

### API Switcher
**File**: `/Frontend/src/config/apiConfig.js`

```javascript
// Change ACTIVE_BACKEND to switch between implementations
const ACTIVE_BACKEND = 'nodejs'; // or 'java'
```

### Updated Components:
1. **TasksSection.jsx** - Uses `TASK_API_URL` from config
2. **StatsCards.jsx** - Uses `TASK_API_URL` from config
3. **MenteesSidebar.jsx** - Uses `TASK_API_URL` from config
4. **CreateTaskModal.jsx** - Uses `TASK_API_URL` from config

## How to Switch Between Backends

### Option 1: Change Frontend Config
Edit `/Frontend/src/config/apiConfig.js`:
```javascript
// For Node.js backend
const ACTIVE_BACKEND = 'nodejs';

// For Java backend
const ACTIVE_BACKEND = 'java';
```

### Option 2: Programmatic Switch
```javascript
import { switchBackend } from '../../config/apiConfig.js';

// Switch to Java backend
switchBackend('java');

// Switch to Node.js backend
switchBackend('nodejs');
```

## Running Both Backends

### Node.js Backend (Port 4000)
```bash
cd Backend
npm start
```

### Java Backend (Port 8081)
```bash
cd JavaMaven/target
java -jar JavaMaven-1.0-SNAPSHOT.jar
```

Or with Maven:
```bash
cd JavaMaven
mvn spring-boot:run
```

## API Endpoints Comparison

Both backends provide identical endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/tasks` | POST | Create task |
| `/api/tasks` | GET | Get mentor's tasks |
| `/api/tasks/:id` | GET | Get single task |
| `/api/tasks/:id` | PUT | Update task |
| `/api/tasks/:id` | DELETE | Delete task |
| `/api/tasks/status/:status` | GET | Filter by status |
| `/api/tasks/mentee/:menteeId` | GET | Get mentee's tasks |
| `/api/tasks/mentor-mentee/:menteeId` | GET | Get mentor-mentee tasks |

## Task Data Structure

```javascript
{
  title: String,                    // Required
  description: String,
  instructions: String,
  mentorId: ObjectId,              // Required
  menteeId: ObjectId,              // Required
  category: String,                // Technical Skills, Soft Skills, etc.
  priority: String,                // high, medium, low
  status: String,                  // not-started, in-progress, pending-review, completed
  dueDate: Date,
  estimatedTime: String,
  resources: String,
  attachments: [String],
  notifyMentee: Boolean,
  requireSubmission: Boolean,
  progress: Number,                // 0-100
  createdAt: Date,
  updatedAt: Date
}
```

## Key Features

✅ **Identical API Contracts** - Both backends return same response format
✅ **Easy Switching** - Change one config variable to switch backends
✅ **Full CRUD Operations** - Create, read, update, delete tasks
✅ **Status Tracking** - Track task progress and completion
✅ **User Association** - Link tasks to mentors and mentees
✅ **Filtering** - Filter by status, mentor, mentee
✅ **Authentication** - JWT token validation on protected routes
✅ **MongoDB Integration** - Both use same database

## Testing

1. **Start Node.js backend**: `npm start` (port 4000)
2. **Create a task** via frontend
3. **Verify in database** - Check MongoDB for task record
4. **Switch to Java backend** in config
5. **Verify same data** - Java backend should return same tasks
6. **Create task via Java** - Should appear in Node.js too

## Troubleshooting

### Tasks not showing up
- Ensure backend is running on correct port
- Check browser console for API errors
- Verify authentication token is present
- Check MongoDB connection

### API switching not working
- Clear browser cache
- Restart frontend dev server
- Verify `apiConfig.js` has correct backend name

### Database issues
- Ensure MongoDB is running
- Check connection string in environment variables
- Verify database and collection exist

## Next Steps

1. ✅ Both backends created and integrated
2. ✅ Frontend configured for easy switching
3. ⏭️ Consider adding task notifications
4. ⏭️ Add task submission/review workflow
5. ⏭️ Implement real-time task updates via Socket.IO
