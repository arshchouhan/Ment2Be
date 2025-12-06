# K23DX Project - API Documentation

## Overview
This document lists all API endpoints used in the K23DX project. Each service has endpoints available in both Node.js (Backend) and Java (JavaMaven) implementations.

---

## 1. Authentication Service

| Service | Method | Node.js Endpoint | Java Endpoint | Description |
|---------|--------|------------------|---------------|-------------|
| Login | POST | `/api/auth/login` | `/api/auth/login` | User login with email and password |
| Register | POST | `/api/auth/register` | `/api/auth/register` | User registration |
| Logout | POST | `/api/auth/logout` | `/api/auth/logout` | User logout |
| Verify Token | GET | `/api/auth/verify` | `/api/auth/verify` | Verify JWT token validity |

---

## 2. User Service

| Service | Method | Node.js Endpoint | Java Endpoint | Description |
|---------|--------|------------------|---------------|-------------|
| Get Current User | GET | `/api/user/me` | `/api/user/me` | Fetch authenticated user profile |
| Update Profile | PUT | `/api/user/profile` | `/api/user/profile` | Update user profile (bio, skills, interests, goals, social links, profile picture) |
| Get User by ID | GET | `/api/user/:id` | `/api/user/:id` | Fetch user details by ID |
| Get All Users | GET | `/api/user/all` | `/api/user/all` | Fetch all users (admin only) |
| Delete User | DELETE | `/api/user/:id` | `/api/user/:id` | Delete user account |

---

## 3. Mentor Service

| Service | Method | Node.js Endpoint | Java Endpoint | Description |
|---------|--------|------------------|---------------|-------------|
| Get All Mentors | GET | `/api/mentors` | `/api/mentors` | Fetch list of all mentors |
| Get Mentor by ID | GET | `/api/mentors/:id` | `/api/mentors/:id` | Fetch specific mentor details |
| Create Mentor Profile | POST | `/api/mentors` | `/api/mentors` | Create new mentor profile |
| Update Mentor Profile | PUT | `/api/mentors/:id` | `/api/mentors/:id` | Update mentor profile |
| Delete Mentor Profile | DELETE | `/api/mentors/:id` | `/api/mentors/:id` | Delete mentor profile |
| Get Mentor Sessions | GET | `/api/mentors/:id/sessions` | `/api/mentors/:id/sessions` | Get all sessions for a mentor |

---

## 4. Messaging Service

| Service | Method | Node.js Endpoint | Java Endpoint | Description |
|---------|--------|------------------|---------------|-------------|
| Get Conversations | GET | `/api/messages/conversations` | `/api/chat/conversations` | Fetch all conversations for authenticated user |
| Get Conversation Messages | GET | `/api/messages/conversations/:participantId/messages` | `/api/chat/messages/:conversationId` | Get messages for specific conversation |
| Send Message | POST | `/api/messages/send` | `/api/chat/send` | Send new message |
| Mark Messages as Read | PUT | `/api/messages/conversations/:senderId/read` | `/api/chat/conversations/:senderId/read` | Mark messages as read |
| Get Unread Count | GET | `/api/messages/unread-count` | `/api/chat/unread-count` | Get count of unread messages |
| Get Messageable Users | GET | `/api/messages/users` | `/api/chat/users` | Get list of users that can be messaged |
| Delete Message | DELETE | `/api/chat/messages/:messageId` | `/api/chat/messages/:messageId` | Delete a message |

---

## 5. Booking/Session Service

| Service | Method | Node.js Endpoint | Java Endpoint | Description |
|---------|--------|------------------|---------------|-------------|
| Get All Bookings | GET | `/api/bookings` | `/api/bookings` | Fetch all bookings for authenticated user |
| Get Booking by ID | GET | `/api/bookings/:id` | `/api/bookings/:id` | Fetch specific booking details |
| Create Booking | POST | `/api/bookings` | `/api/bookings` | Create new session booking |
| Update Booking | PUT | `/api/bookings/:id` | `/api/bookings/:id` | Update booking details |
| Cancel Booking | DELETE | `/api/bookings/:id` | `/api/bookings/:id` | Cancel a booking |
| Join Session | POST | `/api/bookings/:sessionId/join` | `/api/bookings/:sessionId/join` | Join a live session (returns roomId for WebRTC) |
| Update Meeting Status | PUT | `/api/bookings/:sessionId/meeting-status` | `/api/bookings/:sessionId/meeting-status` | Update session status (not_started, waiting, active, ended) |

---

## 6. Karma Points Service

| Service | Method | Node.js Endpoint | Java Endpoint | Description |
|---------|--------|------------------|---------------|-------------|
| Get Karma Points | GET | `/api/karma/:userId` | `/api/karma/:userId` | Fetch karma points for user |
| Add Karma Points | POST | `/api/karma/:userId/add` | `/api/karma/:userId/add` | Add karma points to user |
| Deduct Karma Points | POST | `/api/karma/:userId/deduct` | `/api/karma/:userId/deduct` | Deduct karma points from user |
| Get Karma History | GET | `/api/karma/:userId/history` | `/api/karma/:userId/history` | Get karma transaction history |

---

## 7. Learning Journal Service

| Service | Method | Node.js Endpoint | Java Endpoint | Description |
|---------|--------|------------------|---------------|-------------|
| Get All Journal Entries | GET | `/api/journal` | `/api/journal` | Fetch all journal entries for user |
| Get Journal Entry by ID | GET | `/api/journal/:id` | `/api/journal/:id` | Fetch specific journal entry |
| Create Journal Entry | POST | `/api/journal` | `/api/journal` | Create new journal entry |
| Update Journal Entry | PUT | `/api/journal/:id` | `/api/journal/:id` | Update journal entry |
| Delete Journal Entry | DELETE | `/api/journal/:id` | `/api/journal/:id` | Delete journal entry |

---

## 8. Task Service

| Service | Method | Node.js Endpoint | Java Endpoint | Description |
|---------|--------|------------------|---------------|-------------|
| Get All Tasks | GET | `/api/tasks` | `/api/tasks` | Fetch all tasks for user |
| Get Task by ID | GET | `/api/tasks/:id` | `/api/tasks/:id` | Fetch specific task |
| Create Task | POST | `/api/tasks` | `/api/tasks` | Create new task |
| Update Task | PUT | `/api/tasks/:id` | `/api/tasks/:id` | Update task details |
| Complete Task | PUT | `/api/tasks/:id/complete` | `/api/tasks/:id/complete` | Mark task as complete |
| Delete Task | DELETE | `/api/tasks/:id` | `/api/tasks/:id` | Delete task |

---

## Response Format

### Success Response (Node.js)
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation successful"
}
```

### Success Response (Java)
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation successful"
}
```

### Error Response (Both)
```json
{
  "success": false,
  "message": "Error description",
  "error": "Error details"
}
```

---

## Authentication

All endpoints (except login/register) require JWT token in the Authorization header:

```
Authorization: Bearer <JWT_TOKEN>
```

---

## Base URLs

- **Node.js Backend**: `http://localhost:4000`
- **Java Backend**: `http://localhost:8080`

---

## Switching Between Backends

To switch from Node.js to Java backend, update the base URL in the frontend:

**Node.js:**
```javascript
const API_BASE = 'http://localhost:4000';
```

**Java:**
```javascript
const API_BASE = 'http://localhost:8080';
```

For messaging specifically:
- **Node.js**: `http://localhost:4000/api/messages/conversations`
- **Java**: `http://localhost:8080/api/chat/conversations`

---

## Implementation Status

### Node.js Backend
- ✅ Authentication Service
- ✅ User Service
- ✅ Mentor Service
- ✅ Messaging Service (Complete)
- ✅ Booking/Session Service
- ✅ Karma Points Service
- ⏳ Learning Journal Service (Partial)
- ⏳ Task Service (Partial)

### Java Backend
- ⏳ Authentication Service (TODO)
- ⏳ User Service (TODO)
- ⏳ Mentor Service (TODO)
- ✅ Messaging Service (Conversations endpoint added)
- ⏳ Booking/Session Service (TODO)
- ✅ Karma Points Service (Implemented)
- ⏳ Learning Journal Service (TODO)
- ⏳ Task Service (TODO)

---

## Notes

1. **Messaging Service**: Both Node.js and Java now have the same response format for conversations endpoint
2. **Authentication**: Required for all endpoints except `/api/auth/login` and `/api/auth/register`
3. **File Upload**: Profile picture upload uses multipart/form-data
4. **WebRTC**: Session joining returns roomId for real-time video/audio communication
5. **Pagination**: Some list endpoints support `limit` and `skip` query parameters

---

## Last Updated
December 6, 2025

