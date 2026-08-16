# Job Hub — Backend

REST API powering **Job Hub**, a job portal connecting candidates and recruiters. Handles authentication, job postings, applications, and in-app messaging.

Frontend (Flutter app) repo: [JOB_HUB_FRONTEND](https://github.com/SimarSingh2004/JOB_HUB_FRONTEND)

Live API: `https://jobhubbackend-production-fb43.up.railway.app/api/v1`

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Architecture Notes](#architecture-notes)
- [Project Structure](#project-structure)
- [Local Setup](#local-setup)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## Tech Stack

| Layer            | Choice                                                         |
| ---------------- | -------------------------------------------------------------- |
| Runtime          | Node.js                                                        |
| Framework        | Express 5                                                      |
| Database         | MongoDB (Mongoose ODM), hosted on MongoDB Atlas                |
| Auth             | JWT — short-lived access token + long-lived refresh token pair |
| Password hashing | bcrypt                                                         |
| Hosting          | Railway                                                        |

## Features

**Auth**

- Register / login for two roles: `candidate` and `recruiter`
- Access + refresh token pair; refresh endpoint issues a new pair
- Password hashing with bcrypt; JWT secrets never hardcoded, loaded from environment

**Jobs**

- Recruiters create, update, and soft-delete job postings (deleted jobs are marked `isActive: false`, not removed — preserves history for existing applications)
- Public browsing with pagination, text search, and filters: location (partial match), salary range, skills
- A candidate viewing a job detail sees whether they've already applied to it

**Applications**

- Candidates apply to jobs; duplicate applications to the same job are rejected at the database level (unique compound index on `job` + `candidate`)
- Status lifecycle: `applied` → `shortlisted` → `accepted` / `rejected`
- If a job is deleted while an application is still `applied`/`shortlisted`, it displays as `expired`. Terminal outcomes (`accepted`/`rejected`) are preserved even after the job is deleted — a candidate's outcome doesn't change just because the listing was removed later
- Recruiters see paginated applicant lists per job, with candidate details populated

**Messaging**

- Once a candidate is shortlisted, a recruiter can start a conversation tied to that job + candidate pair
- Simple text messaging, conversation list shows the latest message preview

## Architecture Notes

A few patterns used consistently across the codebase, worth knowing before extending it:

- **Every controller is wrapped in `asyncHandler`** (`utils/asyncHandler.js`) — catches rejected promises and forwards them to Express's error-handling middleware, instead of needing try/catch in every controller.
- **Errors are thrown as `ApiError` instances** (`utils/ApiError.js`) with a status code, message, and optional errors array — never thrown as raw strings/objects.
- **A single global error handler** in `app.js` (registered last, after all routes) catches everything and returns a consistent JSON shape:
  ```json
  { "statusCode": 400, "success": false, "message": "...", "errors": [] }
  ```
  Non-`ApiError` exceptions (bugs, unexpected failures) are logged server-side and returned as a generic 500 — they never leak a raw stack trace to the client in production (`NODE_ENV=production` gates that).
- **Successful responses use `ApiResponse`** (`utils/ApiResponse.js`) for the same consistency on the success path.
- **Auth has two middleware variants**: `verifyJWT` (throws 401 if no valid token — for routes that require login) and `attachUserIfPresent` (never throws, just attaches `req.user` if a valid token happens to be present — for routes that are public but behave differently for a logged-in user, like job detail's "have I applied?" check, or logout, which should succeed even with an expired token).
- **Query parser is explicitly set to `"extended"`** in `app.js`. Express 5 changed its default from Express 4's `"extended"` (via the `qs` library, supports `filter[key]=value` bracket notation) to `"simple"` (Node's built-in `querystring`, which does not). This app relies on bracket notation for range filters like `salary[min]`/`salary[max]`, so this line is load-bearing — don't remove it.

## Project Structure

```
src/
├── controllers/    # Request handlers — parse req, call a service, shape the response
├── services/       # Business logic — the actual DB queries and rules live here
├── models/         # Mongoose schemas: User, Job, Application, Conversation, Message
├── routes/         # Route definitions, wiring middleware to controllers
├── middlewares/    # verifyJWT, attachUserIfPresent, role guards (onlyRecruiter/onlyCandidate)
├── utils/          # ApiError, ApiResponse, asyncHandler, job query builder
├── app.js          # Express app: middleware stack, route mounting, global error handler
└── index.js        # Entry point — connects to MongoDB, starts the HTTP server
```

## Local Setup

**Prerequisites:** Node.js (v18+ recommended), a MongoDB connection string (local instance or Atlas)

```bash
git clone https://github.com/SimarSingh2004/JOB_HUB_BACKEND.git
cd JOB_HUB_BACKEND
npm install
```

Create a `.env` file in the project root (see [Environment Variables](#environment-variables) below), then:

```bash
npm run dev     # development — auto-restarts on file changes (nodemon)
npm start       # production-style — no file watching (node directly)
```

Server runs at `http://localhost:8000` by default; all routes are mounted under `/api/v1`.

## Environment Variables

| Variable               | Description                                                                         | Example                                                                          |
| ---------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `MONGODB_URI`          | Full MongoDB connection string, including database name                             | `mongodb+srv://user:pass@cluster.mongodb.net/jobhub?retryWrites=true&w=majority` |
| `PORT`                 | Port the server listens on                                                          | `8000`                                                                           |
| `NODE_ENV`             | `development` or `production` — gates cookie `secure` flag and stack trace exposure | `production`                                                                     |
| `CORS_ORIGIN`          | Allowed CORS origin                                                                 | `*` (fine — client is a native mobile app, not a browser)                        |
| `ACCESS_TOKEN_SECRET`  | Signing secret for access tokens                                                    | random 64+ byte hex string                                                       |
| `ACCESS_TOKEN_EXPIRY`  | Access token lifetime                                                               | `15m`                                                                            |
| `REFRESH_TOKEN_SECRET` | Signing secret for refresh tokens — **must differ** from the access secret          | random 64+ byte hex string                                                       |
| `REFRESH_TOKEN_EXPIRY` | Refresh token lifetime                                                              | `7d`                                                                             |

Generate a secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## API Reference

Base URL: `/api/v1`. Protected routes require `Authorization: Bearer <accessToken>`.

### Auth — `/auth`

| Method | Path             | Auth     | Description                                                             |
| ------ | ---------------- | -------- | ----------------------------------------------------------------------- |
| POST   | `/register`      | —        | Create an account (`fullname`, `username`, `email`, `password`, `role`) |
| POST   | `/login`         | —        | Returns `accessToken`, `refreshToken`, `user`                           |
| POST   | `/refresh-token` | —        | Exchange a refresh token for a new pair                                 |
| POST   | `/logout`        | optional | Clears the stored refresh token if a valid session is present           |

### Profile — `/profile`

| Method | Path         | Auth     | Description                                             |
| ------ | ------------ | -------- | ------------------------------------------------------- |
| GET    | `/me`        | required | Get the current user's profile (404 if not created yet) |
| POST   | `/candidate` | required | Create a candidate profile                              |
| POST   | `/recruiter` | required | Create a recruiter profile                              |
| PATCH  | `/me`        | required | Update the existing profile                             |

### Jobs — `/jobs`

| Method | Path       | Auth              | Description                                                                                                      |
| ------ | ---------- | ----------------- | ---------------------------------------------------------------------------------------------------------------- |
| GET    | `/`        | optional          | Browse/search jobs — query params: `search`, `location`, `salary[min]`, `salary[max]`, `skills`, `page`, `limit` |
| GET    | `/:id`     | optional          | Job detail — includes `hasApplied` if requester is an authenticated candidate                                    |
| POST   | `/`        | recruiter         | Create a job                                                                                                     |
| GET    | `/my-jobs` | recruiter         | List the recruiter's own postings                                                                                |
| PATCH  | `/:id`     | recruiter (owner) | Update a job                                                                                                     |
| DELETE | `/:id`     | recruiter (owner) | Soft-delete (`isActive: false`)                                                                                  |

### Applications — `/applications`

| Method | Path                     | Auth              | Description                                         |
| ------ | ------------------------ | ----------------- | --------------------------------------------------- |
| POST   | `/:jobId`                | candidate         | Apply to a job                                      |
| GET    | `/me`                    | candidate         | List the candidate's own applications               |
| GET    | `/job/:jobId`            | recruiter (owner) | List applicants for a job                           |
| PATCH  | `/:applicationId/status` | recruiter         | Update status (`shortlisted`/`accepted`/`rejected`) |

### Conversations & Messages

| Method | Path                        | Auth     | Description                                                      |
| ------ | --------------------------- | -------- | ---------------------------------------------------------------- |
| POST   | `/conversations`            | required | Start or fetch an existing conversation (`jobId`, `candidateId`) |
| GET    | `/conversations`            | required | List the current user's conversations                            |
| POST   | `/messages`                 | required | Send a message (`conversationId`, `text`)                        |
| GET    | `/messages/:conversationId` | required | Get messages for a conversation                                  |

All error responses share the same shape (see [Architecture Notes](#architecture-notes)).

## Deployment

Currently deployed on **Railway**, backed by **MongoDB Atlas**.

1. Push this repo to GitHub, connect it in Railway as **New Project → Deploy from GitHub repo**.
2. Set all variables from [Environment Variables](#environment-variables) in Railway's **Variables** tab — use fresh, production-strength secrets, not whatever you used locally.
3. In MongoDB Atlas → **Network Access**, whitelist `0.0.0.0/0` (Railway uses dynamic IPs, so a fixed-IP allowlist won't work).
4. Railway auto-detects `npm start` from `package.json`. Under **Settings → Networking**, click **Generate Domain** to get a public URL.
5. Watch the deploy logs for `Connected to MongoDb` and `Server is running on port ...` to confirm a healthy boot.

## Troubleshooting

- **`MongooseServerSelectionError` / "IP that isn't whitelisted"** → Atlas Network Access doesn't include your host's IP. Add `0.0.0.0/0` for Railway/Render-style dynamic-IP hosts.
- **A filter (e.g. salary range) silently does nothing** → check `app.set("query parser", "extended")` is still present in `app.js` — see the Express 5 note in [Architecture Notes](#architecture-notes).
- **Errors come back as HTML instead of JSON** → the global error handler in `app.js` must be the _last_ `app.use()` call, after every route.
