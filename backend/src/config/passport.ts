import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { config } from './index';
import { findOrCreateOAuthUser } from '../services/auth.service';
import { logger } from '../utils/logger';

export function configurePassport() {
  // Google OAuth Strategy
  if (config.oauth.google.clientId && config.oauth.google.clientSecret) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: config.oauth.google.clientId,
          clientSecret: config.oauth.google.clientSecret,
          callbackURL: config.oauth.google.callbackUrl,
          scope: ['profile', 'email'],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            if (!email) {
              return done(new Error('No email provided by Google'));
            }

            const result = await findOrCreateOAuthUser('google', profile.id, {
              email,
              firstName: profile.name?.givenName,
              lastName: profile.name?.familyName,
              avatarUrl: profile.photos?.[0]?.value,
            });

            return done(null, result);
          } catch (error) {
            logger.error('Google OAuth error:', error);
            return done(error as Error);
          }
        }
      )
    );
    logger.info('Google OAuth strategy configured');
  }

  // GitHub OAuth Strategy
  if (config.oauth.github.clientId && config.oauth.github.clientSecret) {
    passport.use(
      new GitHubStrategy(
        {
          clientID: config.oauth.github.clientId,
          clientSecret: config.oauth.github.clientSecret,
          callbackURL: config.oauth.github.callbackUrl,
          scope: ['user:email'],
        },
        async (accessToken: string, refreshToken: string, profile: any, done: any) => {
          try {
            const email = profile.emails?.[0]?.value || `${profile.username}@github.local`;
            
            const result = await findOrCreateOAuthUser('github', profile.id, {
              email,
              firstName: profile.displayName?.split(' ')[0],
              lastName: profile.displayName?.split(' ').slice(1).join(' '),
              avatarUrl: profile.photos?.[0]?.value,
            });

            return done(null, result);
          } catch (error) {
            logger.error('GitHub OAuth error:', error);
            return done(error as Error);
          }
        }
      )
    );
    logger.info('GitHub OAuth strategy configured');
  }
}

export default passport;

