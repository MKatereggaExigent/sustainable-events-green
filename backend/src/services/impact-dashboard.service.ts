import { pool } from '../config/database';
import logger from '../utils/logger';
import weatherService from './weather.service';
import aiResearchService from './ai-research.service';

interface DashboardMetrics {
  overview: {
    total_events: number;
    total_carbon_footprint: number;
    total_carbon_offset: number;
    net_carbon_impact: number;
    total_attendees: number;
    average_carbon_per_attendee: number;
  };
  trends: {
    period: string;
    carbon_trend: 'increasing' | 'decreasing' | 'stable';
    percentage_change: number;
    monthly_data: Array<{
      month: string;
      carbon: number;
      events: number;
      attendees: number;
    }>;
  };
  breakdown: {
    by_category: Array<{
      category: string;
      carbon: number;
      percentage: number;
      event_count: number;
    }>;
    by_emission_source: Array<{
      source: string;
      carbon: number;
      percentage: number;
    }>;
  };
  performance: {
    industry_benchmark: {
      your_average: number;
      industry_average: number;
      performance_rating: 'excellent' | 'good' | 'average' | 'needs_improvement';
      percentile: number;
    };
    sdg_alignment: Array<{
      sdg_number: number;
      sdg_name: string;
      alignment_score: number;
    }>;
  };
  predictions: {
    next_month_carbon: number;
    year_end_projection: number;
    reduction_opportunities: string[];
  };
}

class ImpactDashboardService {
  /**
   * Get comprehensive dashboard metrics for an organization
   */
  async getDashboardMetrics(organizationId: string): Promise<DashboardMetrics> {
    try {
      // Get overview metrics
      const overview = await this.getOverviewMetrics(organizationId);
      
      // Get trends
      const trends = await this.getTrends(organizationId);
      
      // Get breakdown
      const breakdown = await this.getBreakdown(organizationId);
      
      // Get performance metrics (requires AI)
      const performance = await this.getPerformanceMetrics(organizationId);
      
      // Get predictions (requires AI)
      const predictions = await this.getPredictions(organizationId, trends);

      return {
        overview,
        trends,
        breakdown,
        performance,
        predictions,
      };
    } catch (error: any) {
      logger.error('Failed to get dashboard metrics', { error: error.message, organizationId });
      throw new Error('Failed to generate dashboard metrics');
    }
  }

  /**
   * Get overview metrics
   */
  private async getOverviewMetrics(organizationId: string) {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_events,
        COALESCE(SUM(total_carbon), 0) as total_carbon_footprint,
        COALESCE(SUM(carbon_offset), 0) as total_carbon_offset,
        COALESCE(SUM(total_carbon - COALESCE(carbon_offset, 0)), 0) as net_carbon_impact,
        COALESCE(SUM(attendees), 0) as total_attendees,
        CASE 
          WHEN SUM(attendees) > 0 THEN SUM(total_carbon) / SUM(attendees)
          ELSE 0
        END as average_carbon_per_attendee
      FROM events
      WHERE organization_id = $1
        AND deleted_at IS NULL
    `, [organizationId]);

    return result.rows[0];
  }

  /**
   * Get trends over time
   */
  private async getTrends(organizationId: string) {
    const monthlyResult = await pool.query(`
      SELECT 
        TO_CHAR(event_date, 'YYYY-MM') as month,
        COALESCE(SUM(total_carbon), 0) as carbon,
        COUNT(*) as events,
        COALESCE(SUM(attendees), 0) as attendees
      FROM events
      WHERE organization_id = $1
        AND deleted_at IS NULL
        AND event_date >= NOW() - INTERVAL '12 months'
      GROUP BY TO_CHAR(event_date, 'YYYY-MM')
      ORDER BY month DESC
      LIMIT 12
    `, [organizationId]);

    const monthlyData = monthlyResult.rows.reverse();

    // Calculate trend
    let carbon_trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    let percentage_change = 0;

    if (monthlyData.length >= 2) {
      const recent = parseFloat(monthlyData[monthlyData.length - 1].carbon);
      const previous = parseFloat(monthlyData[monthlyData.length - 2].carbon);
      
      if (previous > 0) {
        percentage_change = ((recent - previous) / previous) * 100;
        if (percentage_change > 5) carbon_trend = 'increasing';
        else if (percentage_change < -5) carbon_trend = 'decreasing';
      }
    }

    return {
      period: '12 months',
      carbon_trend,
      percentage_change: Math.round(percentage_change * 10) / 10,
      monthly_data: monthlyData,
    };
  }

  /**
   * Get breakdown by category and source
   */
  private async getBreakdown(organizationId: string) {
    // By category
    const categoryResult = await pool.query(`
      SELECT 
        event_type as category,
        COALESCE(SUM(total_carbon), 0) as carbon,
        COUNT(*) as event_count
      FROM events
      WHERE organization_id = $1
        AND deleted_at IS NULL
      GROUP BY event_type
      ORDER BY carbon DESC
    `, [organizationId]);

    const totalCarbon = categoryResult.rows.reduce((sum, row) => sum + parseFloat(row.carbon), 0);
    
    const by_category = categoryResult.rows.map(row => ({
      category: row.category,
      carbon: parseFloat(row.carbon),
      percentage: totalCarbon > 0 ? (parseFloat(row.carbon) / totalCarbon) * 100 : 0,
      event_count: parseInt(row.event_count),
    }));

    // By emission source - calculate from actual event data
    const emissionSourceResult = await pool.query(`
      SELECT
        'Transportation' as source,
        COALESCE(SUM(travel_carbon), 0) as carbon
      FROM events
      WHERE organization_id = $1 AND deleted_at IS NULL
      UNION ALL
      SELECT
        'Energy' as source,
        COALESCE(SUM(venue_carbon), 0) as carbon
      FROM events
      WHERE organization_id = $1 AND deleted_at IS NULL
      UNION ALL
      SELECT
        'Food & Catering' as source,
        COALESCE(SUM(catering_carbon), 0) as carbon
      FROM events
      WHERE organization_id = $1 AND deleted_at IS NULL
      UNION ALL
      SELECT
        'Waste' as source,
        COALESCE(SUM(waste_carbon), 0) as carbon
      FROM events
      WHERE organization_id = $1 AND deleted_at IS NULL
    `, [organizationId]);

    const by_emission_source = emissionSourceResult.rows.map(row => ({
      source: row.source,
      carbon: parseFloat(row.carbon),
      percentage: totalCarbon > 0 ? (parseFloat(row.carbon) / totalCarbon) * 100 : 0,
    }));

    return {
      by_category,
      by_emission_source,
    };
  }

  /**
   * Get performance metrics (AI-powered)
   */
  private async getPerformanceMetrics(organizationId: string) {
    // Calculate actual average carbon per attendee
    const avgResult = await pool.query(`
      SELECT
        CASE
          WHEN SUM(attendees) > 0 THEN SUM(total_carbon) / SUM(attendees)
          ELSE 0
        END as your_average
      FROM events
      WHERE organization_id = $1 AND deleted_at IS NULL AND attendees > 0
    `, [organizationId]);

    const your_average = parseFloat(avgResult.rows[0]?.your_average || '0');

    // Get industry benchmark from database (if available) or use calculated average from all orgs
    const industryResult = await pool.query(`
      SELECT
        CASE
          WHEN SUM(attendees) > 0 THEN SUM(total_carbon) / SUM(attendees)
          ELSE 62.5
        END as industry_average
      FROM events
      WHERE deleted_at IS NULL AND attendees > 0
    `);

    const industry_average = parseFloat(industryResult.rows[0]?.industry_average || '62.5');

    // Calculate performance rating
    let performance_rating: 'excellent' | 'good' | 'average' | 'needs_improvement' = 'average';
    let percentile = 50;

    if (your_average > 0 && industry_average > 0) {
      const ratio = your_average / industry_average;
      if (ratio <= 0.5) {
        performance_rating = 'excellent';
        percentile = 90;
      } else if (ratio <= 0.8) {
        performance_rating = 'good';
        percentile = 75;
      } else if (ratio <= 1.2) {
        performance_rating = 'average';
        percentile = 50;
      } else {
        performance_rating = 'needs_improvement';
        percentile = 25;
      }
    }

    // Get SDG alignment from events table
    const sdgResult = await pool.query(`
      SELECT
        sdg_alignments
      FROM events
      WHERE organization_id = $1 AND deleted_at IS NULL AND sdg_alignments IS NOT NULL
      ORDER BY created_at DESC
      LIMIT 1
    `, [organizationId]);

    let sdg_alignment: Array<{ sdg_number: number; sdg_name: string; alignment_score: number }> = [];

    if (sdgResult.rows.length > 0 && sdgResult.rows[0].sdg_alignments) {
      try {
        sdg_alignment = JSON.parse(sdgResult.rows[0].sdg_alignments);
      } catch (e) {
        // If parsing fails, return empty array
        sdg_alignment = [];
      }
    }

    return {
      industry_benchmark: {
        your_average,
        industry_average,
        performance_rating,
        percentile,
      },
      sdg_alignment,
    };
  }

  /**
   * Get predictions (AI-powered)
   */
  private async getPredictions(organizationId: string, trends: any) {
    // Calculate next month prediction based on trend
    const avgMonthlyCarbon = trends.monthly_data.length > 0
      ? trends.monthly_data.reduce((sum: number, m: any) => sum + m.carbon, 0) / trends.monthly_data.length
      : 0;

    const next_month_carbon = Math.round(avgMonthlyCarbon * (1 + (trends.percentage_change / 100)));

    // Project year-end based on current trend
    const monthsRemaining = 12 - new Date().getMonth();
    const year_end_projection = Math.round(
      trends.monthly_data.reduce((sum: number, m: any) => sum + m.carbon, 0) +
      (next_month_carbon * monthsRemaining)
    );

    // Get reduction opportunities from recent events
    const reduction_opportunities: string[] = [];

    const highCarbonEvents = await pool.query(`
      SELECT category, AVG(total_carbon / NULLIF(attendees, 0)) as avg_per_attendee
      FROM events
      WHERE organization_id = $1 AND deleted_at IS NULL AND attendees > 0
      GROUP BY category
      HAVING AVG(total_carbon / NULLIF(attendees, 0)) > 50
      ORDER BY avg_per_attendee DESC
      LIMIT 3
    `, [organizationId]);

    if (highCarbonEvents.rows.length > 0) {
      highCarbonEvents.rows.forEach(row => {
        reduction_opportunities.push(
          `Optimize ${row.category} events - currently ${Math.round(row.avg_per_attendee)}kg CO2e per attendee`
        );
      });
    }

    // Add generic opportunities if we don't have enough specific ones
    if (reduction_opportunities.length === 0) {
      reduction_opportunities.push(
        'Track more events to get personalized reduction opportunities',
        'Consider renewable energy options for venues',
        'Implement virtual attendance to reduce travel emissions'
      );
    }

    return {
      next_month_carbon,
      year_end_projection,
      reduction_opportunities,
    };
  }
}

export default new ImpactDashboardService();

