import { Request, Response } from 'express';
import impactDashboardService from '../services/impact-dashboard.service';
import aiResearchService from '../services/ai-research.service';
import chatbotService from '../services/chatbot.service';
import eventMonitoringService from '../services/event-monitoring.service';
import reportGenerationService from '../services/report-generation.service';
import badgeService from '../services/badge.service';
import weatherService from '../services/weather.service';
import logger from '../utils/logger';

/**
 * Get comprehensive impact dashboard
 */
export async function getDashboard(req: Request, res: Response) {
  try {
    const organizationId = req.user?.organizationId;
    
    if (!organizationId) {
      return res.status(400).json({ error: 'Organization ID required' });
    }

    const dashboard = await impactDashboardService.getDashboardMetrics(organizationId);

    res.json({
      success: true,
      data: dashboard,
    });
  } catch (error: any) {
    logger.error('Dashboard fetch failed', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
}

/**
 * Generate industry research and benchmarking
 */
export async function generateResearch(req: Request, res: Response) {
  try {
    const organizationId = req.user?.organizationId;
    const { industry, event_type, attendees, carbon_footprint, location } = req.body;

    if (!organizationId) {
      return res.status(400).json({ error: 'Organization ID required' });
    }

    const research = await aiResearchService.generateIndustryResearch({
      industry,
      event_type,
      attendees,
      carbon_footprint,
      location,
    });

    res.json({
      success: true,
      data: research,
    });
  } catch (error: any) {
    logger.error('Research generation failed', { error: error.message });
    res.status(500).json({ error: 'Failed to generate research' });
  }
}

/**
 * Chat with AI assistant
 */
export async function chat(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    const organizationId = req.user?.organizationId;
    const { message, conversation_history } = req.body;

    if (!userId || !organizationId) {
      return res.status(400).json({ error: 'User and organization required' });
    }

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await chatbotService.chat(
      userId,
      organizationId,
      message,
      conversation_history || []
    );

    res.json({
      success: true,
      data: {
        message: response,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    logger.error('Chatbot failed', { error: error.message });
    res.status(500).json({ error: 'Failed to process chat message' });
  }
}

/**
 * Get suggested questions for chatbot
 */
export async function getSuggestedQuestions(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    const organizationId = req.user?.organizationId;

    if (!userId || !organizationId) {
      return res.status(400).json({ error: 'User and organization required' });
    }

    const questions = await chatbotService.getSuggestedQuestions(userId, organizationId);

    res.json({
      success: true,
      data: questions,
    });
  } catch (error: any) {
    logger.error('Failed to get suggested questions', { error: error.message });
    res.status(500).json({ error: 'Failed to get suggested questions' });
  }
}

/**
 * Monitor an event and get scorecard
 */
export async function monitorEvent(req: Request, res: Response) {
  try {
    const { eventId } = req.params;

    if (!eventId) {
      return res.status(400).json({ error: 'Event ID required' });
    }

    const scorecard = await eventMonitoringService.monitorEvent(eventId);

    res.json({
      success: true,
      data: scorecard,
    });
  } catch (error: any) {
    logger.error('Event monitoring failed', { error: error.message });
    res.status(500).json({ error: 'Failed to monitor event' });
  }
}

/**
 * Generate executive report
 */
export async function generateReport(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    const organizationId = req.user?.organizationId;
    const { start_date, end_date, include_charts, include_recommendations } = req.body;

    if (!userId || !organizationId) {
      return res.status(400).json({ error: 'User and organization required' });
    }

    const report = await reportGenerationService.generateExecutiveReport(
      organizationId,
      userId,
      {
        start_date,
        end_date,
        include_charts,
        include_recommendations,
      }
    );

    res.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    logger.error('Report generation failed', { error: error.message });
    res.status(500).json({ error: 'Failed to generate report' });
  }
}

/**
 * Generate sustainability badge
 */
export async function generateBadge(req: Request, res: Response) {
  try {
    const organizationId = req.user?.organizationId;

    if (!organizationId) {
      return res.status(400).json({ error: 'Organization ID required' });
    }

    const badge = await badgeService.generateBadge(organizationId);

    res.json({
      success: true,
      data: badge,
    });
  } catch (error: any) {
    logger.error('Badge generation failed', { error: error.message });
    res.status(500).json({ error: 'Failed to generate badge' });
  }
}

/**
 * Get badge embed code
 */
export async function getBadgeEmbed(req: Request, res: Response) {
  try {
    const { badgeId } = req.params;
    const { theme, size, show_metrics } = req.query;

    const embedCode = await badgeService.getEmbedCode(badgeId, {
      theme: theme as 'light' | 'dark',
      size: size as 'small' | 'medium' | 'large',
      show_metrics: show_metrics === 'true',
    });

    res.json({
      success: true,
      data: embedCode,
    });
  } catch (error: any) {
    logger.error('Failed to get embed code', { error: error.message });
    res.status(500).json({ error: 'Failed to get embed code' });
  }
}

/**
 * Get weather data for event location
 */
export async function getWeather(req: Request, res: Response) {
  try {
    const { location } = req.query;

    if (!location) {
      return res.status(400).json({ error: 'Location is required' });
    }

    const weather = await weatherService.getCurrentWeather(location as string);

    res.json({
      success: true,
      data: weather,
    });
  } catch (error: any) {
    logger.error('Weather fetch failed', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
}

