import { pool } from '../config/database';
import logger from '../utils/logger';
import openaiService from './openai.service';
import impactDashboardService from './impact-dashboard.service';

interface ExecutiveReport {
  report_id: string;
  organization_name: string;
  report_period: {
    start_date: string;
    end_date: string;
  };
  executive_summary: string;
  key_metrics: {
    total_events: number;
    total_carbon_footprint: number;
    carbon_reduction_achieved: number;
    cost_savings: number;
    sdg_contributions: number;
  };
  performance_highlights: string[];
  challenges_identified: string[];
  strategic_recommendations: string[];
  detailed_sections: {
    carbon_analysis: any;
    financial_impact: any;
    sdg_alignment: any;
    industry_comparison: any;
  };
  charts_data: any;
  generated_at: string;
  generated_by: string;
}

class ReportGenerationService {
  /**
   * Generate comprehensive executive report
   */
  async generateExecutiveReport(
    organizationId: string,
    userId: string,
    options: {
      start_date: string;
      end_date: string;
      include_charts?: boolean;
      include_recommendations?: boolean;
    }
  ): Promise<ExecutiveReport> {
    try {
      logger.info('Generating executive report', { organizationId, ...options });

      // Get organization details
      const orgResult = await pool.query(
        'SELECT name FROM organizations WHERE id = $1',
        [organizationId]
      );
      const organizationName = orgResult.rows[0]?.name || 'Organization';

      // Get metrics for the period
      const metrics = await this.getMetricsForPeriod(organizationId, options.start_date, options.end_date);

      // Get dashboard data
      const dashboardData = await impactDashboardService.getDashboardMetrics(organizationId);

      // Generate AI-powered executive summary
      const executiveSummary = await this.generateExecutiveSummary(organizationName, metrics, dashboardData);

      // Generate strategic recommendations
      const strategicRecommendations = options.include_recommendations
        ? await this.generateStrategicRecommendations(metrics, dashboardData)
        : [];

      // Compile report
      const report: ExecutiveReport = {
        report_id: `RPT-${Date.now()}`,
        organization_name: organizationName,
        report_period: {
          start_date: options.start_date,
          end_date: options.end_date,
        },
        executive_summary: executiveSummary,
        key_metrics: {
          total_events: metrics.total_events,
          total_carbon_footprint: metrics.total_carbon,
          carbon_reduction_achieved: metrics.carbon_reduction,
          cost_savings: metrics.cost_savings,
          sdg_contributions: metrics.sdg_count,
        },
        performance_highlights: this.extractHighlights(metrics, dashboardData),
        challenges_identified: this.identifyChallenges(metrics, dashboardData),
        strategic_recommendations: strategicRecommendations,
        detailed_sections: {
          carbon_analysis: dashboardData.breakdown,
          financial_impact: metrics.financial_data,
          sdg_alignment: dashboardData.performance.sdg_alignment,
          industry_comparison: dashboardData.performance.industry_benchmark,
        },
        charts_data: options.include_charts ? this.prepareChartsData(dashboardData) : null,
        generated_at: new Date().toISOString(),
        generated_by: userId,
      };

      // Save report to database
      await this.saveReport(report, organizationId, userId);

      logger.info('Executive report generated successfully', { report_id: report.report_id });

      return report;
    } catch (error: any) {
      logger.error('Report generation failed', { error: error.message, organizationId });
      throw new Error('Failed to generate executive report');
    }
  }

  /**
   * Get metrics for a specific period
   */
  private async getMetricsForPeriod(organizationId: string, startDate: string, endDate: string) {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_events,
        COALESCE(SUM(total_carbon), 0) as total_carbon,
        COALESCE(SUM(carbon_offset), 0) as carbon_reduction,
        COALESCE(SUM(cost_savings), 0) as cost_savings,
        COUNT(DISTINCT event_type) as event_types
      FROM events
      WHERE organization_id = $1
        AND event_date BETWEEN $2 AND $3
        AND deleted_at IS NULL
    `, [organizationId, startDate, endDate]);

    const data = result.rows[0];

    return {
      total_events: parseInt(data.total_events),
      total_carbon: parseFloat(data.total_carbon),
      carbon_reduction: parseFloat(data.carbon_reduction),
      cost_savings: parseFloat(data.cost_savings) || 0,
      sdg_count: 5, // Placeholder
      event_types: parseInt(data.event_types),
      financial_data: {
        total_investment: 0,
        roi: 0,
      },
    };
  }

  /**
   * Generate AI-powered executive summary
   */
  private async generateExecutiveSummary(orgName: string, metrics: any, dashboardData: any): Promise<string> {
    const prompt = `
Write a concise executive summary for a sustainability report for ${orgName}.

Key Metrics:
- Total Events: ${metrics.total_events}
- Total Carbon Footprint: ${metrics.total_carbon} kg CO2e
- Carbon Reduction: ${metrics.carbon_reduction} kg CO2e
- Cost Savings: $${metrics.cost_savings}

Performance:
- Industry Percentile: ${dashboardData.performance.industry_benchmark.percentile}th
- Performance Rating: ${dashboardData.performance.industry_benchmark.performance_rating}

Write a professional 3-4 paragraph executive summary highlighting achievements, challenges, and future outlook.
`;

    try {
      return await openaiService.complete(prompt, 'You are an expert sustainability report writer for corporate executives.');
    } catch (error) {
      return `${orgName} has successfully managed ${metrics.total_events} sustainable events during this period, achieving a total carbon footprint of ${metrics.total_carbon} kg CO2e with ${metrics.carbon_reduction} kg CO2e in carbon offsets.`;
    }
  }

  /**
   * Generate strategic recommendations
   */
  private async generateStrategicRecommendations(metrics: any, dashboardData: any): Promise<string[]> {
    const prompt = `
Based on these sustainability metrics, provide 5 strategic recommendations for the board:

Metrics:
- Total Events: ${metrics.total_events}
- Carbon Footprint: ${metrics.total_carbon} kg CO2e
- Performance: ${dashboardData.performance.industry_benchmark.performance_rating}

Provide actionable, strategic recommendations in JSON array format: ["recommendation 1", "recommendation 2", ...]
`;

    try {
      return await openaiService.generateJSON<string[]>(prompt);
    } catch (error) {
      return [
        'Increase investment in renewable energy sources',
        'Implement comprehensive carbon offset program',
        'Develop partnerships with sustainable vendors',
      ];
    }
  }

  /**
   * Extract performance highlights
   */
  private extractHighlights(metrics: any, dashboardData: any): string[] {
    const highlights: string[] = [];

    if (dashboardData.performance.industry_benchmark.percentile > 70) {
      highlights.push(`Performing in the top ${100 - dashboardData.performance.industry_benchmark.percentile}% of industry`);
    }

    if (metrics.carbon_reduction > 0) {
      highlights.push(`Achieved ${metrics.carbon_reduction} kg CO2e in carbon offsets`);
    }

    return highlights;
  }

  /**
   * Identify challenges
   */
  private identifyChallenges(metrics: any, dashboardData: any): string[] {
    return ['Increasing carbon footprint trend', 'Limited carbon offset coverage'];
  }

  /**
   * Prepare charts data
   */
  private prepareChartsData(dashboardData: any) {
    return {
      monthly_trends: dashboardData.trends.monthly_data,
      category_breakdown: dashboardData.breakdown.by_category,
      emission_sources: dashboardData.breakdown.by_emission_source,
    };
  }

  /**
   * Save report to database
   */
  private async saveReport(report: ExecutiveReport, organizationId: string, userId: string) {
    await pool.query(`
      INSERT INTO executive_reports (id, organization_id, user_id, report_data, created_at)
      VALUES ($1, $2, $3, $4, $5)
    `, [report.report_id, organizationId, userId, JSON.stringify(report), new Date()]);
  }
}

export default new ReportGenerationService();

