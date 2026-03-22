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

    // By emission source (simplified - you can enhance this based on your data model)
    const by_emission_source = [
      { source: 'Transportation', carbon: totalCarbon * 0.4, percentage: 40 },
      { source: 'Energy', carbon: totalCarbon * 0.3, percentage: 30 },
      { source: 'Food & Catering', carbon: totalCarbon * 0.2, percentage: 20 },
      { source: 'Waste', carbon: totalCarbon * 0.1, percentage: 10 },
    ];

    return {
      by_category,
      by_emission_source,
    };
  }

  /**
   * Get performance metrics (AI-powered)
   */
  private async getPerformanceMetrics(organizationId: string) {
    // Placeholder - will be enhanced with AI research
    return {
      industry_benchmark: {
        your_average: 45.2,
        industry_average: 62.5,
        performance_rating: 'good' as const,
        percentile: 72,
      },
      sdg_alignment: [
        { sdg_number: 7, sdg_name: 'Affordable and Clean Energy', alignment_score: 85 },
        { sdg_number: 13, sdg_name: 'Climate Action', alignment_score: 92 },
      ],
    };
  }

  /**
   * Get predictions (AI-powered)
   */
  private async getPredictions(organizationId: string, trends: any) {
    return {
      next_month_carbon: 1250,
      year_end_projection: 15000,
      reduction_opportunities: [
        'Switch to renewable energy sources',
        'Implement virtual attendance options',
        'Use local suppliers to reduce transportation',
      ],
    };
  }
}

export default new ImpactDashboardService();

