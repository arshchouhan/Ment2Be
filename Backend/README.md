Count is design choice. Small MVP needs about 12.

List:

auth
- POST /auth/register
- POST /auth/login

users
- GET /users/me
- PATCH /users/me

skills
- GET /skills
- POST /skills  (admin)
- POST /mentor/:id/skills   insert mapping
- DELETE /mentor/:mentorId/skills/:skillId

sessions
- POST /sessions
- GET /sessions?role=mentor|student
- PATCH /sessions/:id/status

payments
- POST /payments
- GET /payments/:id

reviews
- POST /reviews
- GET /reviews?mentor=ID

These twelve cover book flow.