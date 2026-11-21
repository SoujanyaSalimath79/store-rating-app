# Store Rating Platform

NestJS + TypeORM + MySQL backend, React (Vite) frontend.

## Setup

1. Create a MySQL database: `CREATE DATABASE store_rating;`
2. Backend
   ```
   cd backend
   cp .env.example .env     # fill in DB password and JWT secret
   npm install
   npm run start:dev        # http://localhost:3000
   ```
   Tables are created automatically (TypeORM `synchronize`). `schema.sql` is a reference copy.
   A first admin is created from `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env`.
3. Frontend
   ```
   cd frontend
   cp .env.example .env
   npm install
   npm run dev              # http://localhost:5173
   ```

## Roles
- ADMIN: dashboard counts, add users/stores, filter + sort listings, user details
- USER: sign up, browse/search stores, submit and modify 1-5 ratings, change password
- OWNER: see own store average rating and the users who rated it, change password
  (an admin creates the owner user, then creates a store and assigns that owner)

## API summary
| Method | Route | Role |
|---|---|---|
| POST | /auth/signup, /auth/login | public |
| PATCH | /auth/password | any logged in |
| GET | /admin/dashboard | ADMIN |
| GET/POST | /admin/users, GET /admin/users/:id | ADMIN |
| GET/POST | /admin/stores | ADMIN |
| GET | /stores?search&sortBy&order | USER |
| PUT | /stores/:id/rating | USER |
| GET | /stores/owner/dashboard | OWNER |
