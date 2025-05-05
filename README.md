# CheckOut - E-commerce Platform

An interactive e-commerce platform built with the MERN stack (MongoDB, Express, React, Node.js) and Prisma ORM.

## Features

- User authentication (login/register)
- Product browsing and filtering
- Shopping cart functionality
- Favorites/wishlist
- Order management
- Admin dashboard
- Responsive design with light/dark mode
- Modern Minimalist (light mode) and Luxury Boutique (dark mode) themes

## Deployment to Railway

To deploy this application to Railway, follow these steps:

### 1. Update package.json

Before deploying, make the following changes to your package.json:

```json
"scripts": {
  "dev": "NODE_ENV=development tsx server/index.ts",
  "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist/server",
  "start": "NODE_ENV=production node dist/server/index.js",
  "check": "tsc",
  "db:push": "drizzle-kit push"
}
```

### 2. Environment Variables

Set up the following environment variables in Railway:

- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: Secret key for JWT token generation
- `NODE_ENV`: Set to "production"
- `PORT`: Railway will set this automatically
- `SESSION_SECRET`: Secret for session management

### 3. Build Commands

Configure Railway to use:
- Build command: `npm run build`
- Start command: `npm start`

### 4. Connect MongoDB

Connect your MongoDB database in Railway or use an external MongoDB Atlas connection.

## Demo Accounts

- **Regular User**:
  - Username: user
  - Password: password123

- **Admin User**:
  - Username: admin
  - Password: admin123

## Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with the required environment variables
4. Run the development server: `npm run dev`