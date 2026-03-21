import dotenv from 'dotenv';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '8035', 10),
  
  // Database
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'ecobserve',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    ssl: process.env.DB_SSL === 'true',
  },
  
  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },
  
  // JWT
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'your-super-secret-access-key-change-in-production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  
  // OAuth
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:8035/api/auth/google/callback',
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      callbackUrl: process.env.GITHUB_CALLBACK_URL || 'http://localhost:8035/api/auth/github/callback',
    },
  },
  
  // Frontend URL (for CORS and redirects)
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  
  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // limit each IP to 500 requests per windowMs (increased for SPA with multiple API calls)
  },
  
  // Bcrypt
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),

  // Paystack Payment Gateway
  paystack: {
    secretKey: process.env.PAYSTACK_SECRET_KEY || '',
    publicKey: process.env.PAYSTACK_PUBLIC_KEY || '',
    callbackUrl: process.env.PAYSTACK_CALLBACK_URL || 'https://ecobserve.com/api/payments/callback',
    webhookUrl: process.env.PAYSTACK_WEBHOOK_URL || 'https://ecobserve.com/api/payments/webhook',
  },

  // Email Configuration
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '465', 10),
    secure: process.env.EMAIL_USE_SSL === 'true' || process.env.EMAIL_USE_SSL === 'True',
    auth: {
      user: process.env.EMAIL_HOST_USER || '',
      pass: process.env.EMAIL_HOST_PASSWORD || '',
    },
    from: process.env.DEFAULT_FROM_EMAIL || 'no-reply@ecobserve.com',
  },

  // Security
  security: {
    emailVerificationTokenExpiry: 24 * 60 * 60 * 1000, // 24 hours
    passwordResetTokenExpiry: 60 * 60 * 1000, // 1 hour
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
  },
};

export default config;

