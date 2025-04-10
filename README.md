# 🍽️ Restaurant Table Booking Backend

**Assignment:** *We Write Code — Restaurant Table Booking Backend*  
**Submitted by:** Nitin Pal  
**Repo:** [restaurantTableBooking](https://github.com/nitinkumarpals/restaurantTableBooking)

---

## 📌 Project Overview

This backend application is built to fulfill the requirements of the **Restaurant Table Booking** assignment provided by **We Write Code**. It allows users to browse restaurants, book tables, and manage their reservations with secure authentication and email notifications.

---

## 🔧 Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL (via Prisma ORM)
- **Authentication:** JWT, bcrypt
- **Email Service:** Nodemailer (can integrate SendGrid)
- **ORM:** Prisma
- **Environment:** Node.js with dotenv support

---

## 🚀 Features

- ✅ User Registration & Login (JWT Auth)
- ✅ Browse all available restaurants
- ✅ Book tables for a selected date, time, and guests
- ✅ View reservation history
- ✅ Cancel reservations
- ✅ Email confirmation on reservation

---

## 🛠️ Installation

```bash
git clone https://github.com/nitinkumarpals/restaurantTableBooking
cd restaurantTableBooking
npm install
```

### Configure Environment Variables

Create a `.env` file in the root:

```env
DATABASE_URL=your_postgres_db_url
JWT_SECRET=your_jwt_secret
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
```

### Run Development Server

```bash
npx prisma migrate dev --name init
npm run dev
```

---

## 📬 API Endpoints

### 📍 Restaurants

- `GET /api/restaurants`  
  Retrieve all available restaurants.

### 📅 Reservation

- `POST /api/reservations`  
  Book a reservation.  
  **Body:**
  ```json
  {
    "restaurantId": "cluc0b56n0000uw30us23j9ci",
    "date": "2025-04-10",
    "time": "19:00",
    "guests": 4
  }
  ```

- `GET /api/reservations`  
  Get all reservations by the authenticated user.

- `DELETE /api/reservations/:id`  
  Cancel a reservation by ID.

### 👤 User

- `POST /api/register`  
  Register a new user.

- `POST /api/login`  
  Log in and receive JWT token.

---

## 📄 User Stories Covered

- ✔️ As a user, I can **browse restaurants**.
- ✔️ As a user, I can **book tables** and receive **email confirmation**.
- ✔️ As a user, I can **view and cancel my reservations**.

---

## 📎 Folder Structure

```
restaurantTableBooking/
├── controllers/
├── middlewares/
├── models/
├── routes/
├── utils/
├── prisma/
├── .env.example
├── server.js
└── README.md
```

---

## 📤 Submission

- **Repository Link:** [https://github.com/nitinkumarpals/restaurantTableBooking](https://github.com/nitinkumarpals/restaurantTableBooking)
- **Deployment:** [Deployment: https://nitinpaldev.xyz](https://nitinpaldev.xyz)

---

## 📅 Deadline

**10 April 2025** — Submitted as per assignment requirements.

---

## 🙏 Acknowledgement

This project is developed as part of the **We Write Code - Backend Assignment** to demonstrate backend development skills including authentication, API design, reservation logic, and email integration.

---
