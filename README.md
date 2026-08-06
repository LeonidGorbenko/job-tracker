# Job Application Tracker

[![CI](https://github.com/LeonidGorbenko/job-tracker/actions/workflows/ci.yml/badge.svg)](https://github.com/LeonidGorbenko/job-tracker/actions/workflows/ci.yml)

A full-stack web application for managing job applications throughout the hiring process.

The application allows users to create, review, update, search, filter, sort, and delete job applications. It was built as a practical business-oriented project using React, Express, and PostgreSQL.

## Features

- Dashboard with application statistics
- Job application list
- Application details page
- Create and edit forms
- Form validation
- Delete confirmation
- Search by company, position, and location
- Filter by application status
- Sort by date or company
- Loading, error, and empty states
- Responsive layout
- REST API integration
- PostgreSQL data persistence

## Tech Stack

### Frontend

- React
- JavaScript
- Vite
- Tailwind CSS
- React Router
- Vitest

### Backend

- Node.js
- Express
- PostgreSQL

### Infrastructure

- Ubuntu Server
- Git and GitHub
- Vite development proxy
- Planned: Nginx, systemd, HTTPS, and CI/CD

## Project Structure

```text
job-tracker/
├── frontend/   # React frontend
├── backend/    # Express REST API and PostgreSQL integration
├── deploy/     # Deployment preparation scripts
└── README.md
```

## Architecture

```text
React frontend
      |
      | /api
      v
Express REST API
      |
      v
PostgreSQL
```

During local development, the React application sends relative `/api` requests. Vite proxies these requests to the Express backend.

The browser never connects directly to PostgreSQL.

## Current Status

### Implemented

- Frontend CRUD interface
- Express REST API
- PostgreSQL integration
- Search, filtering, and sorting
- Dashboard statistics
- Frontend utility tests
- Local full-stack development
- Manual backend and database validation on Ubuntu Server

### Planned

- Authentication
- Docker
- Public production deployment
- Nginx reverse proxy
- HTTPS
- Automated backend tests
- CI/CD pipeline

## Local Development

### Requirements

- Node.js
- npm
- PostgreSQL

Clone the repository:

```bash
git clone https://github.com/LeonidGorbenko/job-tracker.git
cd job-tracker
```

## Backend Setup

Install backend dependencies:

```bash
cd backend
npm install
```

Create the database and application role using a PostgreSQL administrator account:

```sql
CREATE DATABASE job_tracker_dev;
CREATE ROLE job_tracker_app
WITH LOGIN PASSWORD 'choose_a_password';
```

Connect to the database:

```sql
\c job_tracker_dev
```

Apply the database schema from the repository root:

```bash
psql -d job_tracker_dev -f backend/sql/001_create_applications.sql
```

Grant the application role access to the table:

```sql
GRANT SELECT, INSERT, UPDATE, DELETE
ON applications
TO job_tracker_app;
```

Create `backend/.env` using `backend/.env.example` as a reference:

```env
PORT=3000
DATABASE_URL=postgresql://job_tracker_app:your_password@localhost:5432/job_tracker_dev
```

Real `.env` files are excluded from Git.

Verify the database connection:

```bash
cd backend
npm run db:check
```

Start the backend development server:

```bash
npm run dev
```

The API runs by default at:

```text
http://127.0.0.1:3000
```

Health check:

```text
http://127.0.0.1:3000/api/health
```

## Frontend Setup

Open another terminal and install the frontend dependencies:

```bash
cd frontend
npm install
```

Start the frontend development server:

```bash
npm run dev
```

The frontend is usually available at:

```text
http://127.0.0.1:5173
```

By default, Vite proxies `/api` requests to:

```text
http://127.0.0.1:3000
```

When the backend runs on another machine, copy `frontend/.env.example` to `frontend/.env` and configure the proxy target:

```env
VITE_API_PROXY_TARGET=http://192.168.x.x:3000
```

The frontend continues to use relative API paths such as:

```javascript
fetch('/api/applications')
```

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Check API availability |
| `GET` | `/api/applications` | Get all applications |
| `GET` | `/api/applications/:id` | Get one application |
| `POST` | `/api/applications` | Create an application |
| `PATCH` | `/api/applications/:id` | Update an application |
| `DELETE` | `/api/applications/:id` | Delete an application |

The API validates:

- Required fields
- Supported application statuses
- Optional application dates
- Optional HTTP and HTTPS job URLs
- Unknown request fields

## Frontend Commands

Run the development server:

```bash
npm run dev
```

Run ESLint:

```bash
npm run lint
```

Run tests:

```bash
npm test
```

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Backend Commands

Run the development server:

```bash
npm run dev
```

Run the backend normally:

```bash
npm run start
```

Check the PostgreSQL connection:

```bash
npm run db:check
```

## Ubuntu Validation

The backend and PostgreSQL integration have been manually validated on Ubuntu Server 24.04 LTS.

Verified operations include:

- Installing frontend and backend dependencies
- Creating a frontend production build
- Connecting the backend to PostgreSQL
- Applying the database schema
- Checking the API health endpoint
- Creating, reading, updating, and deleting applications
- Verifying stored records directly through `psql`

Public deployment with Nginx, systemd, and HTTPS is still in progress.

## Security Notes

- Real `.env` files are not committed
- PostgreSQL credentials are provided through environment variables
- The browser does not connect directly to PostgreSQL
- The application database role should not be a PostgreSQL superuser
- Example configuration files contain placeholders only

## License

This project is currently provided for portfolio and educational purposes.