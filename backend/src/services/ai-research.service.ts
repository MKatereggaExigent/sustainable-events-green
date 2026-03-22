import openaiService from './openai.service';
import logger from '../utils/logger';

interface IndustryBenchmark {
  industry: string;
  average_carbon_per_attendee: number;
  best_practice_carbon_per_attendee: number;
  your_performance: 'excellent' | 'good' | 'average' | 'needs_improvement';
  percentile: number;
  recommendations: string[];
}

interface SDGAlignment {
  sdg_number: number;
  sdg_name: string;
  alignment_score: number; // 0-100
  relevant_targets: string[];
  how_event_contributes: string;
  improvement_opportunities: string[];
}

interface EcoEvent {
  title: string;
  date: string;
  location: string;
  type: string;
  description: string;
  url: string;
  relevance_score: number;
}

interface FundingOpportunity {
  title: string;
  provider: string;
  amount_range: string;
  deadline: string;
  eligibility: string[];
  focus_areas: string[];
  application_url: string;
  relevance_score: number;
}

interface ResearchReport {
  industry_benchmarks: IndustryBenchmark[];
  sdg_alignments: SDGAlignment[];
  upcoming_events: EcoEvent[];
  funding_opportunities: FundingOpportunity[];
  market_trends: string[];
  best_practices: string[];
  generated_at: string;
}

class AIResearchService {
  /**
   * Generate comprehensive industry research and benchmarking
   */
  async generateIndustryResearch(eventData: {
    industry: string;
    event_type: string;
    attendees: number;
    carbon_footprint: number;
    location: string;
  }): Promise<ResearchReport> {
    logger.info('Generating industry research', { industry: eventData.industry });

    const prompt = `
You are an expert sustainability analyst. Analyze the following event and provide comprehensive research:

Event Details:
- Industry: ${eventData.industry}
- Event Type: ${eventData.event_type}
- Attendees: ${eventData.attendees}
- Carbon Footprint: ${eventData.carbon_footprint} kg CO2e
- Location: ${eventData.location}

Provide a comprehensive analysis including:
1. Industry benchmarking (compare to industry averages)
2. UN SDG alignment (which SDGs this event supports)
3. Upcoming eco/green energy events (relevant to this industry)
4. Eco-friendly funding opportunities
5. Market trends in sustainable events
6. Best practices for this industry

Current date: ${new Date().toISOString().split('T')[0]}

Respond with valid JSON matching this structure:
{
  "industry_benchmarks": [{
    "industry": "string",
    "average_carbon_per_attendee": number,
    "best_practice_carbon_per_attendee": number,
    "your_performance": "excellent|good|average|needs_improvement",
    "percentile": number,
    "recommendations": ["string"]
  }],
  "sdg_alignments": [{
    "sdg_number": number,
    "sdg_name": "string",
    "alignment_score": number,
    "relevant_targets": ["string"],
    "how_event_contributes": "string",
    "improvement_opportunities": ["string"]
  }],
  "upcoming_events": [{
    "title": "string",
    "date": "YYYY-MM-DD",
    "location": "string",
    "type": "string",
    "description": "string",
    "url": "string",
    "relevance_score": number
  }],
  "funding_opportunities": [{
    "title": "string",
    "provider": "string",
    "amount_range": "string",
    "deadline": "YYYY-MM-DD",
    "eligibility": ["string"],
    "focus_areas": ["string"],
    "application_url": "string",
    "relevance_score": number
  }],
  "market_trends": ["string"],
  "best_practices": ["string"]
}
`;

    try {
      const result = await openaiService.generateJSON<Omit<ResearchReport, 'generated_at'>>(prompt);
      
      return {
        ...result,
        generated_at: new Date().toISOString(),
      };
    } catch (error: any) {
      logger.error('Industry research generation failed', { error: error.message });
      throw new Error('Failed to generate industry research');
    }
  }

  /**
   * Get UN SDG alignment for an event
   */
  async getSDGAlignment(eventData: {
    description: string;
    carbon_reduction: number;
    sustainability_initiatives: string[];
  }): Promise<SDGAlignment[]> {
    const prompt = `
Analyze how this event aligns with the UN Sustainable Development Goals (SDGs):

Event Description: ${eventData.description}
Carbon Reduction Achieved: ${eventData.carbon_reduction} kg CO2e
Sustainability Initiatives: ${eventData.sustainability_initiatives.join(', ')}

Identify which SDGs this event contributes to and provide detailed alignment analysis.
Focus on SDGs 7 (Clean Energy), 11 (Sustainable Cities), 12 (Responsible Consumption), 13 (Climate Action), and 17 (Partnerships).

Respond with a JSON array of SDG alignments.
`;

    try {
      return await openaiService.generateJSON<SDGAlignment[]>(prompt);
    } catch (error: any) {
      logger.error('SDG alignment generation failed', { error: error.message });
      throw new Error('Failed to generate SDG alignment');
    }
  }
}

export default new AIResearchService();

