<div align=center>
<h1> 🏬 Store Rating Management System </h1>

Roxiler – Full Stack Intern Assignment
</div>



## 📌 Project Overview

* This is a role-based Store Rating Management System developed as part of the Roxiler Full Stack Intern Coding Challenge.

* The application enables:

* Users to view stores and submit/update ratings

* Store Owners to view ratings and average rating of their own store

* Admins to manage users, owners, stores, roles, and assignments

* The system is built with React (Vite) for the frontend, Node.js + Express for the backend, and SQLite for data storage.

---

## 🌐 Live Project Links

* Frontend (Vercel)
👉 https://stores-ratings.vercel.app/login

* Backend (Render)
👉 https://store-rating-backend-1yyd.onrender.com

* GitHub Repository
👉 https://github.com/Sanjay-Kumar-Git/store-rating.git

### 🔐 Admin Credentials (Important)
#### Use the following credentials to access the Admin Dashboard:

```
Email: admin@gmail.com 
Password: Admin@123

```

## ⚠️ Note:
<i>The project is deployed using free-tier hosting (Render + Vercel).
Because of this, data is NOT persisted permanently.
On redeploy or inactivity, the database may reset.
</i><br/>

---
#### 👉 Please recreate users and stores using the admin account after login.

#### ⚠️ Deployment Note (Free Tier Limitation)

* Database used: SQLite (file-based)

* Hosting: Render (Free Plan)

####  Important Implication:

* Data may reset on:

  * Server restart

  * Inactivity

  * Redeployment

#### 📌 For evaluation/demo purposes, kindly:

* Login as admin

* Recreate users, owners, and stores manually

---

## 🧑‍💻 User Roles & Functionality
### 🛠 Admin (System Controller)

#### Admin has full access and control over the system.

#### Admin Capabilities:

* Login using admin credentials

* Create:

   * Standard Users

  * Store Owners

* Create Stores

* Assign Stores to Owners

* View:

  * All users

  * All stores

  * Store details with owner information

* Manage user roles (User ↔ Owner)

* Delete users, owners, and stores

* View store reports

#### 📌 Important Flow Rule:

* Users and Owners are created by Admin

* Stores are created by Admin

* Stores are assigned to Owners by Admin

---
## 👤 Standard User

### A normal user can interact with stores but has no management access.

#### User Capabilities:

* Login as a user

* View list of all available stores

* Submit rating (1–5) for a store

* Update previously submitted rating

* View their own ratings

#### 📌 Visibility Rule:

* Only users are visible as raters

* Owners are not allowed to rate stores
---
## 🏪 Store Owner

### Store owners can only monitor their own store.

#### Owner Capabilities:

* Login as store owner

* View only the store assigned to them

* See:

  * Average rating of their store

  * List of users who rated their store

* Cannot rate any store

#### 📌 Visibility Rule:

* Owner becomes visible only after a store is assigned

* Owners cannot see other stores

---
## 🔁 Recommended Usage Flow (For Evaluators)

To fully test the system, follow this order:

#### 1. Login as Admin

#### 2. Create a Standard User

#### 3. Create a Store Owner

#### 4. Create a Store

#### 5. Assign the store to the owner

#### 6. Login as User

 * Rate the store

#### 7. Login as Owner

* View ratings and average rating

---

## 🧱 Tech Stack
### Frontend

* React (Vite)

* React Router DOM

* Tailwind CSS

* js-cookie

### Backend

* Node.js

* Express.js

* SQLite

* JWT Authentication

* bcrypt (password hashing)

### Deployment

* Frontend: Vercel

* Backend: Render
---

## 🗂 Project Structure
```
store-rating/
│
├── backend/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── database/
│   ├── app.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── vercel.json
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```
---
## 🗄 Database Schema (Summary)
### Users

- id

- name

- email (unique)

- password (hashed)

- address

- role (admin / user / owner)

### Stores

- id

- name

- email

- address

- owner_id (FK → Users)

### Ratings

- id

- user_id (FK → Users)

- store_id (FK → Stores)

- rating (1–5)

- created_at

- Unique (user_id, store_id)

📌 Average ratings are calculated dynamically using SQL queries.

---
## 🔐 Security Features

* JWT-based authentication

* Role-based authorization

* Password hashing using bcrypt

* Protected routes using middleware
---
## 👨‍💻 Author
<div align=center>
<i>
# Sanjay Thadaka<br></i>
B.Tech – Computer Science Engineering<br>
Full Stack Developer (MERN)
</div>

---
## 📜 License

This project is developed for educational and evaluation purposes only.