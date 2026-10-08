# N.Honest Supermarket - Full-Stack E-Commerce Application

A full-stack modern E-Commerce web application built with **Node.js**, **Express**, **TypeScript**, **MongoDB Atlas**, and a lightweight vanilla **Frontend (HTML/CSS/JS)**.

---

## 🚀 Features

- **Store Branding**: N.Honest Supermarket catalog, category filters, real-time search, cart, and checkout flow.
- **Unified Full-Stack Server**: Express serves both REST API endpoints and static frontend assets (`fronttt/`).
- **Authentication & Security**:
  - User registration & login with password hashing (`bcryptjs`).
  - Secure JSON Web Tokens (JWT) for session management.
  - Role-based authorization (`user` & `admin`).
- **Product Management**:
  - CRUD operations on products.
  - Category filtering, price sorting, and text search.
  - Image hosting via Cloudinary.
- **Email Notifications**:
  - Brevo (Sendinblue) transactional email integration.
  - Automated HTML welcome emails upon registration with branded templates.
- **API Documentation**: Interactive Swagger UI available at `/api/docs`.
- **Production Ready**: One-click deployment blueprint for [Render](https://render.com) (`render.yaml`).

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express, TypeScript
- **Database**: MongoDB Atlas with Mongoose ODM
- **Frontend**: Responsive HTML5, Modern CSS3, JavaScript (Fetch API)
- **File Uploads**: Cloudinary & Multer
- **Emails**: Brevo (Sendinblue) API
- **API Docs**: Swagger / OpenAPI 3.0 (`swagger-ui-express`)
- **Deployment**: Render Web Service

---

## 📁 Project Structure

```
├── fronttt/                 # Frontend client (HTML, CSS, JS, assets)
│   ├── css/style.css
│   ├── js/app.js
│   └── index.html
├── src/
│   ├── config/              # MongoDB, Cloudinary, and Brevo mailer configs
│   ├── controllers/         # Request handlers (auth, products, users, emails)
│   ├── middlewares/         # Auth, validation, and error middlewares
│   ├── models/              # Mongoose schemas (User, Product)
│   ├── routes/              # Express API route modules
│   ├── schemas/             # Joi / Zod validation schemas
│   ├── services/            # Business logic & Brevo email service
│   ├── templates/           # Branded HTML email templates
│   ├── types/               # TypeScript interfaces & types
│   ├── swagger.ts           # Swagger OpenAPI specifications
│   └── server.ts            # Main application entry point & static server
├── .env.example             # Template for required environment variables
├── render.yaml              # Render blueprint deployment configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies and scripts
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory modeled after `.env.example`:

```env
PORT=3000
NODE_ENV=development
BASE_URL=http://localhost:3000

# MongoDB
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/ecommerce?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Brevo (Sendinblue) Email
BREVO_API_KEY=your_brevo_api_key
EMAIL_FROM=your_verified_email@domain.com
EMAIL_FROM_NAME="N.Honest Supermarket"

# Cloudinary (Product image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

---

## 🏃 Getting Started Locally

### 1. Clone the repository
```bash
git clone https://github.com/AROSTA-MOSTER/E-commerce.git
cd E-commerce
```

### 2. Install dependencies
```bash
npm install
```

### 3. Build TypeScript
```bash
npm run build
```

### 4. Run the server
- **Development mode** (with auto-reload):
  ```bash
  npm run dev
  ```
- **Production mode**:
  ```bash
  npm start
  ```

Visit the application at [http://localhost:3000](http://localhost:3000) or check the Swagger documentation at [http://localhost:3000/api/docs](http://localhost:3000/api/docs).

---

## 🌐 Deploy to Render

This repository includes a `render.yaml` blueprint. To deploy:
1. Push your repository to GitHub.
2. Go to your [Render Dashboard](https://dashboard.render.com/) -> **New** -> **Blueprint**.
3. Select this repository.
4. Fill in the required environment variables in Render's dashboard (`MONGO_URI`, `JWT_SECRET`, `BREVO_API_KEY`, etc.).
5. Click **Apply** to launch the web service!
