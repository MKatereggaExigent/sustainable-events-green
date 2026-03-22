import { Router } from 'express';
import * as impactLeaderController from '../controllers/impact-leader.controller';
import { authenticate } from '../middleware/auth';
import { requireTier } from '../middleware/subscription';

const router = Router();

/**
 * All Impact Leader routes require authentication and Impact Leader tier
 */
router.use(authenticate);
router.use(requireTier('impact'));

/**
 * @route   GET /api/impact-leader/dashboard
 * @desc    Get comprehensive impact dashboard with visual analytics
 * @access  Impact Leader tier
 */
router.get('/dashboard', impactLeaderController.getDashboard);

/**
 * @route   POST /api/impact-leader/research
 * @desc    Generate AI-powered industry research and benchmarking
 * @access  Impact Leader tier
 */
router.post('/research', impactLeaderController.generateResearch);

/**
 * @route   POST /api/impact-leader/chat
 * @desc    Chat with AI assistant
 * @access  Impact Leader tier
 */
router.post('/chat', impactLeaderController.chat);

/**
 * @route   GET /api/impact-leader/chat/suggestions
 * @desc    Get suggested questions for chatbot
 * @access  Impact Leader tier
 */
router.get('/chat/suggestions', impactLeaderController.getSuggestedQuestions);

/**
 * @route   GET /api/impact-leader/monitor/:eventId
 * @desc    Monitor event and get real-time scorecard with alerts
 * @access  Impact Leader tier
 */
router.get('/monitor/:eventId', impactLeaderController.monitorEvent);

/**
 * @route   POST /api/impact-leader/reports/generate
 * @desc    Generate executive report for board meetings
 * @access  Impact Leader tier
 */
router.post('/reports/generate', impactLeaderController.generateReport);

/**
 * @route   POST /api/impact-leader/badge/generate
 * @desc    Generate sustainability badge/certification
 * @access  Impact Leader tier
 */
router.post('/badge/generate', impactLeaderController.generateBadge);

/**
 * @route   GET /api/impact-leader/badge/:badgeId/embed
 * @desc    Get embeddable code for sustainability badge
 * @access  Impact Leader tier
 */
router.get('/badge/:badgeId/embed', impactLeaderController.getBadgeEmbed);

/**
 * @route   GET /api/impact-leader/weather
 * @desc    Get weather data for event location
 * @access  Impact Leader tier
 */
router.get('/weather', impactLeaderController.getWeather);

export default router;

