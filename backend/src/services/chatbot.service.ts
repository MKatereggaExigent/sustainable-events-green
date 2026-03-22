import openaiService from './openai.service';
import { pool } from '../config/database';
import logger from '../utils/logger';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatContext {
  user_id: string;
  organization_id: string;
  event_summary?: {
    total_events: number;
    total_carbon: number;
    average_carbon_per_event: number;
    top_categories: string[];
  };
  recent_events?: Array<{
    name: string;
    date: string;
    carbon_footprint: number;
    attendees: number;
  }>;
}

class ChatbotService {
  private readonly SYSTEM_PROMPT = `
You are EcoBot, an intelligent sustainability assistant for EcobServe, a platform for sustainable event management.

Your role:
- Help users understand their carbon footprint and sustainability metrics
- Provide actionable recommendations for reducing event emissions
- Answer questions about UN SDGs, green energy, and eco-friendly practices
- Guide users through the platform features
- Offer industry insights and benchmarking data

Privacy & Security Rules:
- NEVER share data from other users or organizations
- ONLY reference the current user's own event data
- Do not reveal sensitive business information
- If asked about other users/organizations, politely decline
- Keep responses professional and focused on sustainability

Tone: Friendly, knowledgeable, encouraging, and action-oriented.
`;

  /**
   * Get user's event context (privacy-safe)
   */
  private async getUserContext(userId: string, organizationId: string): Promise<ChatContext> {
    try {
      // Get event summary for this user's organization only
      const summaryResult = await pool.query(`
        SELECT 
          COUNT(*) as total_events,
          COALESCE(SUM(total_carbon), 0) as total_carbon,
          COALESCE(AVG(total_carbon), 0) as average_carbon_per_event,
          ARRAY_AGG(DISTINCT event_type) FILTER (WHERE event_type IS NOT NULL) as top_categories
        FROM events
        WHERE organization_id = $1
          AND deleted_at IS NULL
      `, [organizationId]);

      // Get recent events (last 5)
      const recentResult = await pool.query(`
        SELECT 
          event_name as name,
          event_date as date,
          total_carbon as carbon_footprint,
          attendees
        FROM events
        WHERE organization_id = $1
          AND deleted_at IS NULL
        ORDER BY created_at DESC
        LIMIT 5
      `, [organizationId]);

      return {
        user_id: userId,
        organization_id: organizationId,
        event_summary: summaryResult.rows[0] || undefined,
        recent_events: recentResult.rows || undefined,
      };
    } catch (error: any) {
      logger.error('Failed to get user context for chatbot', { error: error.message });
      return {
        user_id: userId,
        organization_id: organizationId,
      };
    }
  }

  /**
   * Sanitize user data to prevent leaking sensitive information
   */
  private sanitizeContext(context: ChatContext): string {
    if (!context.event_summary) {
      return 'The user is new and has not created any events yet.';
    }

    return `
User's Event Summary (PRIVATE - only for this user):
- Total Events: ${context.event_summary.total_events}
- Total Carbon Footprint: ${Math.round(context.event_summary.total_carbon)} kg CO2e
- Average per Event: ${Math.round(context.event_summary.average_carbon_per_event)} kg CO2e
- Event Categories: ${context.event_summary.top_categories?.join(', ') || 'None'}

Recent Events:
${context.recent_events?.map(e => 
  `- ${e.name} (${e.date}): ${Math.round(e.carbon_footprint)} kg CO2e, ${e.attendees} attendees`
).join('\n') || 'No recent events'}
`;
  }

  /**
   * Chat with the bot
   */
  async chat(
    userId: string,
    organizationId: string,
    message: string,
    conversationHistory: ChatMessage[] = []
  ): Promise<string> {
    try {
      // Get user context
      const context = await this.getUserContext(userId, organizationId);
      const contextString = this.sanitizeContext(context);

      // Build conversation messages
      const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
        { role: 'system', content: this.SYSTEM_PROMPT },
        { role: 'system', content: `User Context:\n${contextString}` },
      ];

      // Add conversation history (last 10 messages for context)
      const recentHistory = conversationHistory.slice(-10);
      for (const msg of recentHistory) {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      }

      // Add current user message
      messages.push({
        role: 'user',
        content: message,
      });

      // Get response from OpenAI
      const response = await openaiService.chat(messages, {
        temperature: 0.7,
        maxTokens: 1000,
      });

      logger.info('Chatbot response generated', {
        userId,
        organizationId,
        messageLength: message.length,
        responseLength: response.length,
      });

      return response;
    } catch (error: any) {
      logger.error('Chatbot chat failed', { error: error.message });
      throw new Error('Failed to generate chatbot response');
    }
  }

  /**
   * Get suggested questions based on user context
   */
  async getSuggestedQuestions(userId: string, organizationId: string): Promise<string[]> {
    const context = await this.getUserContext(userId, organizationId);

    const baseQuestions = [
      'How can I reduce my event\'s carbon footprint?',
      'What are the UN SDGs and how does my event align with them?',
      'Show me industry benchmarks for my events',
      'What funding opportunities are available for sustainable events?',
    ];

    if (context.event_summary && context.event_summary.total_events > 0) {
      return [
        'How do my events compare to industry standards?',
        'What are my biggest sources of emissions?',
        'Give me specific recommendations for my next event',
        ...baseQuestions.slice(1),
      ];
    }

    return baseQuestions;
  }
}

export default new ChatbotService();

