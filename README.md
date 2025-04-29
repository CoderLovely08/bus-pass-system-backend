# Smart QR-Based Bus Pass System

A modern digital solution for managing and verifying bus passes using QR codes. Built with Node.js, Express, Prisma, PostgreSQL for the backend, and React, React Query, Tailwind CSS for the frontend.

## Project Overview

The system digitizes the entire bus pass lifecycle - from application to verification, eliminating the need for physical passes. It consists of three core modules:

### 1. Admin Module

- Create and manage pass types (Weekly, Monthly, Quarterly)
- Set pass prices and validity periods
- View and manage system users (Admins, Conductors)
- Review and approve pass applications
- Monitor system revenue and analytics

### 2. Conductor Module

- Verify passenger passes via QR code scanning
- Manual pass verification using pass ID
- View verification history
- Track daily verifications

### 3. Passenger Module

- Self-registration and account management
- Browse available pass types
- Apply for new passes
- Upload required documents
- View pass status (Pending/Approved/Expired)
- Access QR codes for active passes

## 💻 Tech Stack:

![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white) ![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens) ![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white) ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-ffffff.svg?style=for-the-badge&logo=tailwindcss&logoColor=blue) ![React Query](https://img.shields.io/badge/reactquery-ffffff?style=for-the-badge&logo=reactquery&logoColor=#FF4154) ![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E) ![Heroku](https://img.shields.io/badge/heroku-%23430098.svg?style=for-the-badge&logo=heroku&logoColor=white) ![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB) ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white) ![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white) ![Postman](https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=postman&logoColor=white)

</p>

### Backend

- **Node.js & Express**: RESTful API server
- **Prisma**: ORM for database operations
- **PostgreSQL**: Primary database
- **JWT**: Authentication and authorization
- **Multer**: Document upload handling

### Frontend

- **React**: UI development
- **React Query**: Server state management
- **Tailwind CSS**: Styling and UI components
- **QR Code Libraries**: Generation and scanning

## Project Structure

### Backend Structure

```
backend/
    ├── config/
    │   ├── app.config.js
    │   ├── multer.config.js
    │   └── supabase.config.js
    ├── controllers/
    │   └── v1/
    │       ├── Admin.controller.js
    │       ├── Auth.controller.js
    │       ├── Conductor.controller.js
    │       └── Passenger.controller.js
    ├── middlewares/
    │   ├── auth.middleware.js
    │   ├── logging.middleware.js
    │   └── validation.middleware.js
    ├── prisma/
    │   ├── schema.prisma
    │   └── seed.js
    ├── routes/
    │   ├── index.routes.js
    │   ├── admin.routes.js
    │   ├── auth.routes.js
    │   ├── conductor.routes.js
    │   └── passenger.routes.js
    ├── schema/
    │   └── validation.schema.js
    ├── service/
    │   ├── core/
    │   │   └── CustomResponse.js
    │   ├── utils/
    │   │   └── Supabase.service.js
    │   └── v1/
    │       ├── admin.service.js
    │       ├── auth.service.js
    │       ├── conductor.service.js
    │       └── passenger.service.js
    ├── utils/
    │   ├── constants/
    │   │   └── app.constants.js
    │   └── helpers/
    │       └── app.helpers.js
    ├── .env.sample
    └── app.js
```

## Core Features

### Pass Management

- **Pass Types**: Different duration passes (Weekly, Monthly, Quarterly)
- **Dynamic Pricing**: Configurable pass prices
- **Document Verification**: Support for document uploads and verification
- **QR Integration**: Unique QR codes for each active pass

### User Management

- **Role-Based Access**: Different interfaces for Admin, Conductor, and Passenger
- **Self-Registration**: Passengers can create their own accounts
- **Admin Control**: Admins manage conductor accounts

### Verification System

- **QR Scanning**: Quick pass verification using QR codes
- **Manual Verification**: Fallback option for manual pass ID entry
- **Verification Logs**: Track all pass verifications
- **Real-time Validation**: Instant pass status checking

## API Endpoints

### Auth routes
POST    /auth/system/login              # To Login to the system
POST    /auth/system/register           # Te register a user

### Admin Routes

```
GET    /api/admin/applications                  # List pass applications
GET    /api/admin/applications/:applicationId   # List pass application by ID
PUT    /api/admin/applications/:applicationId   # Update application status
GET    /api/admin/pass-types                    # List all pass types
POST   /api/admin/pass-types                    # Create new pass type
PUT    /api/admin/pass-types/:passTypeId        # Update pass type
GET    /api/admin/statistics                    # Gets statistics
GET    /api/admin/users                         # Gets All registered users
GET    /api/admin/user-types                    # Gets All user types
```

### Conductor Routes

```
GET    /conductor/stats
POST   /conductor/verify-pass       # Verify pass (QR/Manual)
GET    /conductor/verifications     # View verification history
```

### Passenger Routes

```
GET    /passenger/passes            # View all passes
GET    /passenger/pass-types        # View all pass types and pricing
POST   /passenger/apply             # Apply for new pass
GET    /passenger/pass/:passId      # Get pass details
POST   /passenger/payment           # to complete the payment
```

## Database Schema
![Database Schema](<docs/DigiPass Database Schema.png>)