# BlogHub – Full-Stack Blogging Platform with Comments

[![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen.svg)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v3.4-38B2AC.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**BlogHub** is a modern, responsive, production-quality full-stack blogging platform. Engineered with a clean **dark navy and purple/indigo** aesthetic, BlogHub delivers rich Markdown publishing, real-time dynamic comment discussions, author-driven comment moderation, interactive likes, reading time estimation, category filtering, search, and a creator telemetry dashboard.

---

## 🌟 Key Features

### 🎨 User Interface & Experience
- **Responsive Layout:** Pixel-perfect across desktop, tablet, and mobile devices.
- **Theme Support:** Instant Dark / Light mode toggle with persistent state.
- **Modern Typography & Shadows:** Custom palette featuring Midnight Navy (`#090d16`), Slate (`#0f172a`), and vivid Indigo/Purple accents (`#6366f1`).
- **Toast Notifications & Modals:** Powered by `react-hot-toast` with confirmation modals before destructive deletions.
- **Empty States & Skeletons:** High-fidelity loading spinners and guidance states for empty search results or dashboards.

### 📝 Publishing & Content Management
- **Article Editor:** Write with title, description, category, tags, and cover image.
- **Markdown & Code Preview:** Real-time dual-tab editor (Markdown writing and instant Live Preview).
- **Draft & Publish Lifecycle:** Save articles as drafts in your private dashboard or publish publicly.
- **Reading Time Calculator:** Automatically computes estimated reading time based on word count.
- **Image Upload & URL Support:** Supports direct image uploads via `multer` or custom web image URLs.
- **Related Articles:** Automatically recommends stories in the same category.

### 💬 Discussion & Comment System
- **Real-Time Dynamic Updates:** Add, edit, and delete comments without page reloads.
- **Author Moderation:** Post owners can moderate (delete) **any** comment on their stories to protect discussion quality.
- **User Ownership:** Users can edit or delete their own comments at any time.
- **Live Counter:** Dynamic comment counters updated across blog cards and detail views.

### 🔐 Authentication & Security
- **JWT Authentication:** Secure token storage with Authorization header and HTTP-only cookie support.
- **Password Hashing:** Passwords securely hashed with `bcryptjs` (salt factor 10).
- **Route Guards:** Protected React Router routes for dashboards, creation, editing, and profiles.
- **Role & Ownership Verification:** Backend authorization middleware guarantees only post/comment owners or admins can modify resources.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite 8, React Router DOM v7, Axios, Tailwind CSS v3.4, React Icons, React Hot Toast |
| **Backend** | Node.js, Express.js 4, RESTful API architecture, JWT (`jsonwebtoken`), bcryptjs, Multer |
| **Database** | MongoDB, Mongoose 8 ODM (with automatic in-memory zero-setup fallback) |

---

## 📁 Project Folder Structure

```
bloghub/
├── backend/
│   ├── config/
│   │   └── db.js                 # Database connection logic (local, cloud, or in-memory)
│   ├── controllers/
│   │   ├── authController.js     # User registration, login, logout, getMe
│   │   ├── commentController.js  # Comment CRUD and author moderation
│   │   ├── postController.js     # Post CRUD, search, filters, likes, related
│   │   └── userController.js     # User profile, metrics, image upload
│   ├── middleware/
│   │   ├── auth.js               # JWT verification & role protection
│   │   ├── error.js              # Centralized error handler
│   │   └── upload.js             # Multer configuration for file uploads
│   ├── models/
│   │   ├── Comment.js            # Comment Mongoose Schema
│   │   ├── Post.js               # Blog Post Schema with indexes & virtuals
│   │   └── User.js               # User Schema with bcrypt hooks
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth endpoints
│   │   ├── commentRoutes.js      # /api/comments endpoints
│   │   ├── postRoutes.js         # /api/posts endpoints
│   │   └── userRoutes.js         # /api/users endpoints
│   ├── utils/
│   │   ├── generateToken.js      # JWT generator & cookie setter
│   │   ├── seed.js               # Sample data generator with realistic blogs
│   │   └── testApi.js            # End-to-end integration test runner
│   ├── uploads/                  # Uploaded image assets
│   ├── .env.example              # Template environment variables
│   ├── .env                      # Local environment configuration
│   ├── server.js                 # Express server entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── comments/         # CommentSection, CommentItem
│   │   │   ├── common/           # BlogCard, Pagination, LoadingSpinner, EmptyState, ConfirmationModal
│   │   │   └── layout/           # Navbar, Footer, ProtectedRoute
│   │   ├── context/
│   │   │   ├── AuthContext.jsx   # Global user state, login, register, logout
│   │   │   └── ThemeContext.jsx  # Dark/Light theme state
│   │   ├── pages/
│   │   │   ├── AboutPage.jsx     # Platform story and tech stack
│   │   │   ├── BlogDetailsPage.jsx # Full article view, comments, likes, related
│   │   │   ├── CreateBlogPage.jsx# Markdown editor, preview, draft/publish
│   │   │   ├── DashboardPage.jsx # Creator metrics & blog management
│   │   │   ├── EditBlogPage.jsx  # Article editing & updates
│   │   │   ├── ExplorePage.jsx   # Search, category filters, sorting, pagination
│   │   │   ├── HomePage.jsx      # Hero, featured stories, categories, newsletter
│   │   │   ├── LoginPage.jsx     # Authentication with 1-click demo logins
│   │   │   ├── NotFoundPage.jsx  # 404 handler
│   │   │   ├── ProfilePage.jsx   # Bio, avatar update, authored stories
│   │   │   └── RegisterPage.jsx  # User signup with validation
│   │   ├── services/
│   │   │   └── api.js            # Axios API client with token interceptor
│   │   ├── App.jsx               # Routes and providers
│   │   ├── main.jsx              # Application bootstrap
│   │   └── index.css             # Tailwind base & custom styles
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── README.md
└── package.json                  # Root runner scripts
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** v18+ (tested on Node v24)
- **npm** v9+
- *(Optional)* Local MongoDB or MongoDB Atlas URI (if omitted, BlogHub automatically spins up an embedded in-memory MongoDB server with rich seed data for effortless zero-setup evaluation).

### 2. Installation
Install dependencies for both frontend and backend:

```bash
# In project root:
npm run install:all
```

Or install separately:
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 3. Environment Configuration
The backend uses environment variables located in `backend/.env`. A `.env.example` file is provided:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/bloghub # Or your Atlas connection string; leave blank for in-memory DB
JWT_SECRET=your_secure_secret_key_2026
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 4. Running the Platform

#### Start Backend:
```bash
cd backend
npm run dev
# Or: npm start
```
*Backend runs on `http://localhost:5000`*

#### Start Frontend:
```bash
cd frontend
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

## 🧪 Demo User Accounts (Pre-Seeded)

The application automatically seeds realistic articles and creator accounts for instant testing:

| Role | Name | Email | Password |
| :--- | :--- | :--- | :--- |
| **Admin & Architect** | Sophia Vance | `sophia@bloghub.com` | `password123` |
| **Full-Stack Writer** | Liam Chen | `liam@bloghub.com` | `password123` |
| **UI/UX Designer** | Elena Rostova | `elena@bloghub.com` | `password123` |

> *Tip: On the Login page, you can use the **1-Click Demo Login** buttons to sign in instantly without typing credentials.*

---

## 📡 REST API Documentation

### Authentication Endpoints (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user account |
| `POST` | `/api/auth/login` | Public | Authenticate user & issue JWT |
| `GET` | `/api/auth/me` | Private | Get authenticated user info |
| `POST` | `/api/auth/logout` | Public | Clear session cookie |

### Blog Post Endpoints (`/api/posts`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/posts` | Public | Fetch published posts with search, category filter, sort, & pagination |
| `GET` | `/api/posts/featured` | Public | Fetch featured top-performing stories |
| `GET` | `/api/posts/:id` | Public | Get single post by ID or Slug (increments view counter) |
| `GET` | `/api/posts/:id/related` | Public | Get related articles in the same category |
| `GET` | `/api/posts/user/my-posts` | Private | Fetch logged-in user's articles (all, published, or drafts) |
| `POST` | `/api/posts` | Private | Create a new blog post |
| `PUT` | `/api/posts/:id` | Private | Update post (author or admin only) |
| `DELETE` | `/api/posts/:id` | Private | Delete post and cascade comments (author only) |
| `PUT` | `/api/posts/:id/like` | Private | Toggle like/unlike on an article |

### Comment Endpoints (`/api/comments`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/comments/:postId` | Public | Fetch all comments for an article |
| `POST` | `/api/comments/:postId` | Private | Add comment to an article |
| `PUT` | `/api/comments/:id` | Private | Update comment (comment author only) |
| `DELETE` | `/api/comments/:id` | Private | Delete comment (**Comment author OR Post author moderation**) |

### User Endpoints (`/api/users`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users/profile` | Private | Fetch current user profile & published articles |
| `GET` | `/api/users/profile/:username` | Public | Fetch public profile by username |
| `PUT` | `/api/users/profile` | Private | Update bio, avatar, and full name |
| `GET` | `/api/users/dashboard/stats` | Private | Aggregated stats: total posts, drafts, views, likes, comments |
| `POST` | `/api/users/upload` | Private | Upload image file (multipart/form-data) |

---

## 🧪 Automated Integration Testing

An automated 15-step end-to-end API test suite is included in `backend/utils/testApi.js`. To execute tests:

```bash
node backend/utils/testApi.js
```

**Verified Test Scenarios:**
1. Health check `/api/health`
2. User registration with email format validation
3. User login & token retrieval
4. Current user session verification `/api/auth/me`
5. Blog post creation with auto read-time calculation
6. Paginated post query with text search
7. Post retrieval & automatic view counter increment
8. Like toggle functionality
9. Dynamic comment creation
10. Comment modification
11. Comments list retrieval
12. Post owner comment moderation & deletion
13. Article updating
14. Creator dashboard statistics calculation
15. Post deletion with cascading comment cleanup

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).

