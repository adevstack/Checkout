
# CheckOut - E-commerce Platform

A full-stack e-commerce platform built with React, Express, and MongoDB.

## Features

- 🛍️ Product browsing and searching 
- 🛒 Shopping cart functionality
- 👤 User authentication and profiles
- 💳 Checkout process
- 📱 Responsive design
- 🌙 Dark/Light mode
- 👨‍💼 Admin dashboard
- 📊 Order management
- 🏷️ Product categories
- ⭐ User reviews and ratings

## Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS, Radix UI
- **Backend**: Express.js, Node.js
- **Database**: MongoDB
- **State Management**: React Query, Context API
- **Authentication**: JWT
- **UI Components**: Shadcn UI

## Project Structure

```
├── client/                # Frontend React application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Application pages/routes
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utility functions
│   │   └── context/      # React context providers
├── server/               # Backend Express application
│   ├── routes.ts         # API routes
│   └── storage.ts        # Data storage logic
└── shared/               # Shared TypeScript types
```

## API Endpoints

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `GET /api/orders` - Get user's orders
- `POST /api/orders` - Create new order

## Getting Started

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will start on port 5000.

## Environment Variables

The following environment variables are required:

- `DATABASE_URL` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT authentication
- `NODE_ENV` - Environment (development/production)

## License

MIT
