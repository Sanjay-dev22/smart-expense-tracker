# Smart Expense Tracker

A full-stack expense tracking and budgeting application built with React, Express, and MongoDB. The project focuses on authentication, analytics, budgeting workflows, and responsive dashboard interfaces while maintaining a clean and modular architecture.

The application allows users to:

* Track daily and monthly expenses
* Organize expenses by category
* Monitor spending trends through analytics dashboards
* Set and manage monthly budgets
* Export expense data as CSV
* Manage authentication, profile, and password recovery flows

---

## Live Demo

[https://smart-expense-tracker-ten.vercel.app](https://smart-expense-tracker-ten.vercel.app)

---

## Features

### Authentication & Account Management

* JWT-based authentication
* Email verification workflow
* Password reset functionality
* Google Sign-In using Firebase Authentication
* Protected API routes
* Profile management and password updates

### Expense Management

* Add, edit, and delete expenses
* Category-based expense organization
* Search, filter, and sorting support
* CSV export functionality
* User-specific expense isolation

### Analytics Dashboard

* Monthly spending trends
* Category-wise expense breakdown
* Daily expense summaries
* Budget tracking and utilization
* KPI cards and visual charts

### Budget Management

* Monthly budget configuration
* Budget usage monitoring
* Budget alert email notifications

### User Experience

* Responsive dashboard layout
* Sidebar navigation and sticky topbar
* Loading and empty states
* Toast notifications and feedback
* Mobile-friendly UI components

---

## Project Structure

```text
client/
├── src/
│   ├── components/
│   ├── hooks/
│   ├── layouts/
│   ├── pages/
│   ├── services/
│   └── utils/

server/
├── middleware/
├── models/
├── routes/
├── utils/
└── index.js
```

---

## Architecture Overview

### Frontend

The frontend is built using React and organized around reusable components, layouts, hooks, and service modules. Pages manage screen-level behavior while shared components handle dashboard rendering, forms, filters, charts, and reusable UI states.

### Backend

The backend is built using Express and MongoDB with route-based organization and middleware protection. APIs handle authentication, expense management, budget operations, profile management, analytics aggregation, and email workflows.

### Authentication Flow

* Users register using email/password or Google Sign-In
* Email verification is required before login access
* JWT tokens are issued after successful authentication
* Protected routes validate authenticated users through middleware
* Password reset uses signed expiring tokens delivered by email

### Analytics & Performance

Analytics summaries are aggregated server-side to reduce unnecessary client-side calculations and large payload transfers.

The application also includes:

* Debounced search requests
* Abortable API calls
* Async email handling
* Optimized dashboard rendering
* Indexed MongoDB queries for common operations

---

## Security

* JWT-protected private routes
* Password hashing using bcrypt
* User-scoped MongoDB queries
* Signed password reset and verification tokens
* Firebase token verification for Google authentication
* Environment-based credential management

---

## Tech Stack

| Layer          | Technology                       |
| -------------- | -------------------------------- |
| Frontend       | React, React Router, Material UI |
| Backend        | Node.js, Express                 |
| Database       | MongoDB, Mongoose                |
| Authentication | JWT, bcrypt, Firebase Auth       |
| Charts         | Recharts                         |
| Email          | Nodemailer                       |
| Export         | PapaParse, FileSaver             |

---

## API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | User login |
| GET | `/api/expenses` | Fetch user expenses |
| POST | `/api/expenses` | Create expense |
| PUT | `/api/expenses/:id` | Update expense |
| DELETE | `/api/expenses/:id` | Delete expense |
| GET | `/api/expenses/summary` | Dashboard analytics summary |
| POST | `/api/budgets` | Create or update monthly budget |

---

## Local Development Setup

### Backend Setup

```bash
cd server
npm install
npm run dev
```

### Frontend Setup

```bash
cd client
npm install
npm start
```

---

## Environment Variables

### Backend

```env
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret
CLIENT_URL=http://localhost:3000
EMAIL_USER=your_email
EMAIL_PASS=your_password
```

### Frontend

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_FIREBASE_API_KEY=your_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
```

---

## Deployment

### Frontend

The frontend is deployed on Vercel.

Build command:

```bash
npm run build
```

### Backend

The backend can be deployed on:

* Render
* Railway
* Fly.io
* VPS providers

Required production configuration:

* MongoDB connection string
* JWT secret
* Firebase credentials
* Email credentials

---

## Future Improvements

* Recurring expenses and subscriptions
* OCR-based receipt scanning
* Advanced analytics and trend insights
* Mobile application support
* Multi-currency support
* Shared budgets and collaboration
* Dockerized deployment setup
* Automated testing workflows

---

## License

MIT License
