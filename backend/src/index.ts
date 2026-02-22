import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { testConnection } from './config/database';
import { logger } from './utils/logger';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { configurePassport } from './config/passport';
import passport from 'passport';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Organization-Id'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Passport OAuth
configurePassport();
app.use(passport.initialize());

// OAuth callback routes
app.get('/api/auth/google', passport.authenticate('google', { session: false }));
app.get(
  '/api/auth/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${config.frontendUrl}/login?error=oauth_failed` }),
  (req, res) => {
    const result = req.user as any;
    res.cookie('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: config.env === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.redirect(`${config.frontendUrl}/auth/callback?token=${result.tokens.accessToken}`);
  }
);

app.get('/api/auth/github', passport.authenticate('github', { session: false }));
app.get(
  '/api/auth/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: `${config.frontendUrl}/login?error=oauth_failed` }),
  (req, res) => {
    const result = req.user as any;
    res.cookie('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: config.env === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.redirect(`${config.frontendUrl}/auth/callback?token=${result.tokens.accessToken}`);
  }
);

// Request logging
app.use((req, res, next) => {
  logger.http(`${req.method} ${req.url}`);
  next();
});

// API routes
app.use('/api', routes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
async function start() {
  // Test database connection
  const dbConnected = await testConnection();
  if (!dbConnected) {
    logger.error('Failed to connect to database. Exiting...');
    process.exit(1);
  }

  app.listen(config.port, () => {
    logger.info(`Server running on port ${config.port} in ${config.env} mode`);
    logger.info(`API available at http://localhost:${config.port}/api`);
  });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

start();

export default app;

