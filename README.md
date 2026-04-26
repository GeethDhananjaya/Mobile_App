# 🌿 Hidden Gems SL — Discover Sri Lanka's Hidden Places

> A full-stack mobile application for discovering, sharing, and planning trips to hidden travel destinations across Sri Lanka.

[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/GeethDhananjaya/Hidden_Place_new)

[![Backend Status](https://img.shields.io/badge/Backend-Live%20on%20Railway-0B0D0E?style=for-the-badge&logo=railway)](https://mobileapp-production-d938.up.railway.app/)

---

## 📖 Project Overview

**Hidden Gems SL** is a React Native mobile application that helps travelers discover lesser-known, beautiful destinations in Sri Lanka. Users can explore categorized destinations, plan trips, hire local travel guides, upload media, and share reviews with the community.

### ✨ Key Features

- 🗂️ **Travel Categories & Environmental Tags** — Browse destinations by category and environmental filters
- 📍 **Destination Management** — Add, edit, and manage hidden travel destinations with details and images
- 🧭 **Travel Guide Management** — Register as a guide, browse verified guides, and connect with locals
- 🗓️ **Trip Planner & Wishlist** — Plan trips with date selection and save favorite destinations
- 📸 **Media Gallery** — Upload and browse photos/videos of destinations
- ⭐ **Reviews & Community Feedback** — Rate destinations and engage through reviews and comments
- 🔐 **Authentication** — Secure user registration, login, password reset, and Google OAuth

---

## 🛠️ Tech Stack

| Layer        | Technology                                                      |
| ------------ | --------------------------------------------------------------- |
| **Frontend** | React Native, Expo SDK 54, React Navigation                    |
| **Backend**  | Node.js, Express.js                                             |
| **Database** | MongoDB (Mongoose ODM)                                          |
| **Auth**     | JWT, bcrypt.js, Google Auth Library                             |
| **Storage**  | Multer (file uploads)                                           |
| **Email**    | Nodemailer                                                      |
| **Deploy**   | Railway (Backend)                                               |

---

## 🔗 Important Links

| Resource           | URL                                                                                          |
| ------------------ | -------------------------------------------------------------------------------------------- |
| **GitHub Repo**    | [https://github.com/GeethDhananjaya/Hidden_Place_new](https://github.com/GeethDhananjaya/Hidden_Place_new) |
| **Backend (Live)** | [https://mobileapp-production-d938.up.railway.app/](https://mobileapp-production-d938.up.railway.app/)     |

---

## 📁 Project Structure

```
Hidden_Place_new/
├── Hidden_place_backend/        # Express.js REST API
│   ├── config/                  # Database configuration
│   ├── middleware/               # Auth & upload middleware
│   ├── models/                  # Mongoose schemas
│   │   ├── User.js
│   │   ├── Place.js
│   │   ├── Guide.js
│   │   ├── Category.js
│   │   ├── TripPlan.js
│   │   ├── Review.js
│   │   ├── Comment.js
│   │   └── MediaAsset.js
│   ├── routes/                  # API route handlers
│   │   ├── authRoutes.js
│   │   ├── placeRoutes.js
│   │   ├── guideRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── tripRoutes.js
│   │   ├── reviewRoutes.js
│   │   ├── commentRoutes.js
│   │   └── mediaRoutes.js
│   ├── uploads/                 # Uploaded media files
│   └── server.js                # App entry point
│
├── Hidden_place_frontend/       # React Native (Expo) app
│   ├── screens/                 # App screens
│   │   ├── HomeScreen.js
│   │   ├── LoginScreen.js
│   │   ├── RegisterScreen.js
│   │   ├── CategoriesScreen.js
│   │   ├── AddPlaceScreen.js
│   │   ├── EditPlaceScreen.js
│   │   ├── PlaceDetailsScreen.js
│   │   ├── GuidesListScreen.js
│   │   ├── GuideDetailsScreen.js
│   │   ├── RegisterGuideScreen.js
│   │   ├── ManageGuidesScreen.js
│   │   ├── CreateTripScreen.js
│   │   ├── MyTripsScreen.js
│   │   ├── TripDetailsScreen.js
│   │   ├── AddReviewScreen.js
│   │   ├── UploadMediaScreen.js
│   │   ├── ProfileScreen.js
│   │   ├── ForgotPasswordScreen.js
│   │   └── ResetPasswordScreen.js
│   ├── styles/                  # Shared stylesheets
│   ├── assets/                  # Images & static assets
│   ├── apiConfig.js             # Backend API base URL
│   └── App.js                   # Root component & navigation
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18+)
- **npm** or **yarn**
- **Expo CLI** — `npm install -g expo-cli`
- **MongoDB** (local or Atlas connection string)

### Backend Setup

```bash
cd Hidden_place_backend
npm install
```

Create a `.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Start the server:

```bash
npm run dev        # Development (with nodemon)
npm start          # Production
```

### Frontend Setup

```bash
cd Hidden_place_frontend
npm install
```

Update `apiConfig.js` with your backend URL:

```js
export const API_BASE_URL = "https://mobileapp-production-d938.up.railway.app";
```

Start the Expo dev server:

```bash
npx expo start
```

---

## 👥 Team Details

| Student ID   | Name                      | Module / Responsibility                          |
| ------------ | ------------------------- | ------------------------------------------------ |
| IT24103497   | Gunawardhana C.Y.D        | Travel Categories and Environmental Tags         |
| IT24103580   | Gunawardhana H.K.D        | Destination Management                           |
| IT24103526   | Senaratne P.A.R.T         | Travel Guide Management                          |
| IT24100878   | Imalki G.N                | Trip Planner and Wishlist                         |
| IT24102941   | Rukshan R.A.R             | Media Gallery and System Infrastructure          |
| IT24102635   | Wijerathne P.W.G.I.D      | Review and Community Feedback                    |

---

## 📡 API Endpoints

| Prefix             | Description                     |
| ------------------- | ------------------------------- |
| `/api/auth`         | Authentication & user management |
| `/api/places`       | Destination CRUD operations      |
| `/api/guides`       | Travel guide management          |
| `/api/categories`   | Travel categories & tags         |
| `/api/trips`        | Trip planning                    |
| `/api/reviews`      | Destination reviews              |
| `/api/comments`     | Community comments               |
| `/api/media`        | Media upload & gallery           |

---

## 📄 License

This project is developed as part of an academic module and is intended for educational purposes.
