import { query } from '../config/database';
import { logger } from '../utils/logger';
import axios from 'axios';

interface EventInputs {
  venue: any;
  fnb: any;
  transport: any;
  materials: any;
  attendees?: number;
  eventType?: string;
}

interface AIRecommendation {
  category: string;
  title: string;
  description: string;
  impactReduction: {
    carbonKg: number;
    percentage: number;
  };
  implementation: {
    difficulty: 'Easy' | 'Medium' | 'Hard';
    cost: 'Low' | 'Medium' | 'High';
    timeframe: string;
  };
  alternatives: Array<{
    name: string;
    provider?: string;
    location?: string;
    carbonScore?: number;
    url?: string;
  }>;
  priority: 'High' | 'Medium' | 'Low';
}

/**
 * Generate AI-powered sustainability recommendations using GPT
 */
export async function generateAIRecommendations(
  eventId: number,
  organizationId: number,
  inputs: EventInputs,
  carbonFootprint: number
): Promise<AIRecommendation[]> {
  try {
    const openaiApiKey = process.env.OPENAI_API_KEY;
    const openaiEndpoint = process.env.OPENAI_API_ENDPOINT || 'https://api.openai.com/v1/chat/completions';

    if (!openaiApiKey) {
      logger.warn('OpenAI API key not configured, using fallback recommendations');
      return getFallbackRecommendations(inputs, carbonFootprint);
    }

    // Build context-rich prompt
    const prompt = buildRecommendationPrompt(inputs, carbonFootprint);

    // Call OpenAI GPT API
    const response = await axios.post(
      openaiEndpoint,
      {
        model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are an expert sustainability consultant specializing in event carbon reduction. 
            Provide actionable, data-driven recommendations with specific South African eco-friendly alternatives.
            Always include real supplier names, locations, and estimated carbon impact reductions.
            Format your response as valid JSON matching the AIRecommendation interface.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      },
      {
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const gptResponse = response.data.choices[0].message.content;
    const recommendations = JSON.parse(gptResponse).recommendations as AIRecommendation[];

    // Save to database
    await query(
      `INSERT INTO ai_recommendations (event_id, organization_id, recommendations, gpt_model, prompt_tokens, completion_tokens, total_cost_usd)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        eventId,
        organizationId,
        JSON.stringify(recommendations),
        response.data.model,
        response.data.usage.prompt_tokens,
        response.data.usage.completion_tokens,
        calculateCost(response.data.usage)
      ]
    );

    logger.info(`Generated ${recommendations.length} AI recommendations for event ${eventId}`);
    return recommendations;

  } catch (error) {
    logger.error('Failed to generate AI recommendations:', error);
    // Fallback to rule-based recommendations
    return getFallbackRecommendations(inputs, carbonFootprint);
  }
}

/**
 * Build detailed prompt for GPT
 */
function buildRecommendationPrompt(inputs: EventInputs, carbonFootprint: number): string {
  return `
Analyze this event and provide 8-10 specific sustainability recommendations:

EVENT DETAILS:
- Total Carbon Footprint: ${carbonFootprint.toFixed(2)} kg CO2e
- Attendees: ${inputs.attendees || 'Unknown'}
- Event Type: ${inputs.eventType || 'General'}

VENUE:
- Type: ${inputs.venue?.type || 'Unknown'}
- Energy Source: ${inputs.venue?.energySource || 'Unknown'}
- Size: ${inputs.venue?.size || 'Unknown'} sqm

FOOD & BEVERAGE:
- Menu Type: ${inputs.fnb?.menuType || 'Unknown'}
- Servings: ${inputs.fnb?.servings || 'Unknown'}
- Waste Management: ${inputs.fnb?.wasteManagement || 'Unknown'}

TRANSPORT:
- Modes: ${JSON.stringify(inputs.transport || {})}

MATERIALS:
- Types: ${JSON.stringify(inputs.materials || {})}

Provide recommendations in this JSON format:
{
  "recommendations": [
    {
      "category": "venue|food|transport|materials|energy|waste",
      "title": "Short actionable title",
      "description": "Detailed explanation with specific steps",
      "impactReduction": {
        "carbonKg": estimated_kg_reduction,
        "percentage": percentage_of_total
      },
      "implementation": {
        "difficulty": "Easy|Medium|Hard",
        "cost": "Low|Medium|High",
        "timeframe": "Immediate|1-2 weeks|1-3 months"
      },
      "alternatives": [
        {
          "name": "Specific supplier/venue/product name",
          "provider": "Company name",
          "location": "City, South Africa",
          "carbonScore": 85,
          "url": "website if available"
        }
      ],
      "priority": "High|Medium|Low"
    }
  ]
}

Focus on South African suppliers and solutions. Include real companies where possible.
`;
}

/**
 * Calculate OpenAI API cost
 */
function calculateCost(usage: any): number {
  const inputCostPer1k = 0.01; // $0.01 per 1K tokens for GPT-4 Turbo
  const outputCostPer1k = 0.03; // $0.03 per 1K tokens
  
  const inputCost = (usage.prompt_tokens / 1000) * inputCostPer1k;
  const outputCost = (usage.completion_tokens / 1000) * outputCostPer1k;
  
  return inputCost + outputCost;
}

/**
 * Fallback recommendations when GPT is unavailable
 */
function getFallbackRecommendations(inputs: EventInputs, carbonFootprint: number): AIRecommendation[] {
  // Return basic rule-based recommendations
  return [];
}

