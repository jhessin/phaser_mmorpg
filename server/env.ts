import 'dotenv/config';
// require('dotenv').config();

// Set port
export const port = process.env.PORT || 3000;

// Get mongo env variables
export const mongoConnectionUrl = process.env.MONGO_CONNECTION_URL;
export const mongoUserName = process.env.MONGO_USER_NAME;
export const mongoPassword = process.env.MONGO_PASSWORD;

// Get JWT Secrets
export const jwtSecret = process.env.JWT_SECRET;
export const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;

// Get email variables
export const email = process.env.EMAIL;
export const password = process.env.PASSWORD;
export const emailProvider = process.env.EMAIL_PROVIDER;
