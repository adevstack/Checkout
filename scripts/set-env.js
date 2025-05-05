#!/usr/bin/env node

/**
 * This script helps set up environment variables for Railway deployment
 * Run with: node scripts/set-env.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Environment variables needed for the application
const requiredVars = [
  {
    name: 'MONGODB_URI',
    description: 'MongoDB connection string (e.g., mongodb+srv://user:password@cluster.mongodb.net/dbname)',
    default: 'mongodb+srv://tes3:L7TNwCauy0twPdRP@checkout.b4bz4yc.mongodb.net/ecommerce?retryWrites=true&w=majority'
  },
  {
    name: 'JWT_SECRET',
    description: 'Secret key for JWT token generation (should be a strong random string)',
    default: 'checkout_production_jwt_secret'
  },
  {
    name: 'SESSION_SECRET',
    description: 'Secret for session management (should be a strong random string)',
    default: 'checkout_production_session_secret'
  },
  {
    name: 'NODE_ENV',
    description: 'Environment mode (development or production)',
    default: 'production'
  }
];

// Result object to store environment variable values
const result = {};

// Function to ask for each environment variable
function askForVar(index) {
  if (index >= requiredVars.length) {
    writeEnvFile();
    return;
  }

  const varInfo = requiredVars[index];
  rl.question(`${varInfo.name} (${varInfo.description}) [${varInfo.default}]: `, (answer) => {
    result[varInfo.name] = answer.trim() || varInfo.default;
    askForVar(index + 1);
  });
}

// Function to write the .env.production file
function writeEnvFile() {
  const envContent = Object.entries(result)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  const filePath = path.join(process.cwd(), '.env.production');
  
  fs.writeFileSync(filePath, envContent);
  console.log(`Environment variables written to ${filePath}`);
  console.log('\nTo deploy to Railway:');
  console.log('1. Set these variables in the Railway dashboard');
  console.log('2. Update package.json scripts as mentioned in README.md');
  console.log('3. Configure build and start commands in Railway');
  
  rl.close();
}

console.log('Setting up environment variables for Railway deployment\n');
askForVar(0);