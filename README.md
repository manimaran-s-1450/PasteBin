# PasteBin Backend API

A RESTful PasteBin Backend API built using **Node.js**, **Express.js**, **MySQL**, and **Swagger** following the **MVC Architecture**.

## Features

- Create a new paste
- View all pastes
- View a single paste using its unique paste code
- Update an existing paste
- Delete a paste
- Interactive API documentation using Swagger
- Structured MVC Architecture
- MySQL Database Integration
- Error Handling Middleware

---

## Tech Stack

### Backend
- Node.js
- Express.js

### Database
- MySQL

### API Documentation
- Swagger UI
- swagger-jsdoc
- swagger-ui-express

### Development Tools
- Nodemon
- Thunder Client
- Git
- GitHub

---

## Project Structure

```text
PasteBin/
│
├── config/
│   └── db.js
│
├── controllers/
│   └── pasteController.js
│
├── middleware/
│   ├── errorHandler.js
│   └── notFoundHandler.js
│
├── models/
│   └── pasteModel.js
│
├── routes/
│   └── pasteRoutes.js
│
├── swagger/
│   └── swagger.js
│
├── utils/
│   └── generateCode.js
│
├── app.js
├── server.js
├── package.json
├── .env.example
└── README.md
```

---

## Installation

### Clone the repository

```bash
git clone https://github.com/manimaran-s-1450/pastebin-backend.git
```

### Navigate to the project directory

```bash
cd pastebin-backend
```

### Install dependencies

```bash
npm install
```

### Create a `.env` file

```env
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=pastebin_db
```

### Start the development server

```bash
npm run dev
```

or

```bash
npm start
```

---

## API Endpoints

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/pastes` | Create a new paste |
| GET | `/api/pastes` | Get all pastes |
| GET | `/api/pastes/:paste_code` | Get a paste by its unique code |
| PUT | `/api/pastes/:paste_code` | Update an existing paste |
| DELETE | `/api/pastes/:paste_code` | Delete a paste |

---

## API Documentation

After starting the server, open the following URL in your browser:

```text
http://localhost:5000/api-docs
```

Swagger provides interactive API documentation and allows testing all available endpoints directly from the browser.

---

## Architecture

This project follows the **Model-View-Controller (MVC)** architecture.

```text
Client
   │
   ▼
Routes
   │
   ▼
Controllers
   │
   ▼
Models
   │
   ▼
MySQL Database
```

---

## Future Improvements

- User Authentication
- User-specific Paste History
- Frontend Integration
- Copy-to-Clipboard Feature
- Syntax Highlighting
- Docker Deployment
- CI/CD Pipeline

---

## Author

**Manimaran S**

GitHub: https://github.com/manimaran-s-1450

---

## License

This project was developed as part of the **DEVS Club Round 2 Full Stack Development Recruitment Challenge**.