import { pool } from '../config/database';
import logger from '../utils/logger';
import notificationService from './notification.service';

type AlertLevel = 'normal' | 'high' | 'critical';

interface EventAlert {
  id: string;
  event_id: string;
  alert_type: string;
  level: AlertLevel;
  message: string;
  details: any;
  created_at: string;
  acknowledged: boolean;
}

interface EventScorecard {
  event_id: string;
  event_name: string;
  overall_score: number; // 0-100
  carbon_score: number;
  sustainability_score: number;
  efficiency_score: number;
  alerts: EventAlert[];
  status: 'excellent' | 'good' | 'warning' | 'critical';
  recommendations: string[];
}

class EventMonitoringService {
  /**
   * Monitor an event and generate alerts
   */
  async monitorEvent(eventId: string): Promise<EventScorecard> {
    try {
      // Get event data
      const eventResult = await pool.query(`
        SELECT * FROM events WHERE id = $1 AND deleted_at IS NULL
      `, [eventId]);

      if (eventResult.rows.length === 0) {
        throw new Error('Event not found');
      }

      const event = eventResult.rows[0];

      // Calculate scores
      const scores = this.calculateScores(event);

      // Generate alerts
      const alerts = await this.generateAlerts(event, scores);

      // Get recommendations
      const recommendations = this.generateRecommendations(event, scores, alerts);

      // Determine overall status
      const status = this.determineStatus(scores, alerts);

      // Send critical alerts
      await this.sendCriticalAlerts(event, alerts);

      return {
        event_id: eventId,
        event_name: event.event_name,
        overall_score: scores.overall,
        carbon_score: scores.carbon,
        sustainability_score: scores.sustainability,
        efficiency_score: scores.efficiency,
        alerts,
        status,
        recommendations,
      };
    } catch (error: any) {
      logger.error('Event monitoring failed', { error: error.message, eventId });
      throw new Error('Failed to monitor event');
    }
  }

  /**
   * Calculate event scores
   */
  private calculateScores(event: any) {
    const carbonPerAttendee = event.attendees > 0 ? event.total_carbon / event.attendees : 0;
    
    // Carbon score (lower is better)
    // Excellent: < 30 kg/attendee, Poor: > 100 kg/attendee
    const carbonScore = Math.max(0, Math.min(100, 100 - (carbonPerAttendee - 30) * 1.4));

    // Sustainability score (based on offsets and initiatives)
    const offsetPercentage = event.total_carbon > 0 ? (event.carbon_offset / event.total_carbon) * 100 : 0;
    const sustainabilityScore = Math.min(100, offsetPercentage + 20); // Base 20 points + offset

    // Efficiency score (based on planning and execution)
    const efficiencyScore = 75; // Placeholder - can be enhanced with more metrics

    // Overall score
    const overall = (carbonScore + sustainabilityScore + efficiencyScore) / 3;

    return {
      overall: Math.round(overall),
      carbon: Math.round(carbonScore),
      sustainability: Math.round(sustainabilityScore),
      efficiency: Math.round(efficiencyScore),
    };
  }

  /**
   * Generate alerts based on event data
   */
  private async generateAlerts(event: any, scores: any): Promise<EventAlert[]> {
    const alerts: EventAlert[] = [];
    const carbonPerAttendee = event.attendees > 0 ? event.total_carbon / event.attendees : 0;

    // Critical: Very high carbon footprint
    if (carbonPerAttendee > 100) {
      alerts.push({
        id: `alert-${Date.now()}-1`,
        event_id: event.id,
        alert_type: 'high_carbon_footprint',
        level: 'critical',
        message: 'Carbon footprint significantly exceeds industry standards',
        details: {
          carbon_per_attendee: carbonPerAttendee,
          industry_average: 62.5,
          excess_percentage: ((carbonPerAttendee - 62.5) / 62.5) * 100,
        },
        created_at: new Date().toISOString(),
        acknowledged: false,
      });
    }

    // High: Above average carbon footprint
    if (carbonPerAttendee > 70 && carbonPerAttendee <= 100) {
      alerts.push({
        id: `alert-${Date.now()}-2`,
        event_id: event.id,
        alert_type: 'above_average_carbon',
        level: 'high',
        message: 'Carbon footprint is above industry average',
        details: {
          carbon_per_attendee: carbonPerAttendee,
          industry_average: 62.5,
        },
        created_at: new Date().toISOString(),
        acknowledged: false,
      });
    }

    // High: Low carbon offset
    const offsetPercentage = event.total_carbon > 0 ? (event.carbon_offset / event.total_carbon) * 100 : 0;
    if (offsetPercentage < 20 && event.total_carbon > 1000) {
      alerts.push({
        id: `alert-${Date.now()}-3`,
        event_id: event.id,
        alert_type: 'low_carbon_offset',
        level: 'high',
        message: 'Carbon offset is below recommended levels',
        details: {
          current_offset_percentage: offsetPercentage,
          recommended_minimum: 20,
        },
        created_at: new Date().toISOString(),
        acknowledged: false,
      });
    }

    // Normal: Good performance
    if (alerts.length === 0) {
      alerts.push({
        id: `alert-${Date.now()}-4`,
        event_id: event.id,
        alert_type: 'good_performance',
        level: 'normal',
        message: 'Event is performing well within sustainability targets',
        details: { scores },
        created_at: new Date().toISOString(),
        acknowledged: false,
      });
    }

    return alerts;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(event: any, scores: any, alerts: EventAlert[]): string[] {
    const recommendations: string[] = [];

    if (scores.carbon < 50) {
      recommendations.push('Consider implementing renewable energy sources');
      recommendations.push('Encourage virtual attendance to reduce travel emissions');
    }

    if (scores.sustainability < 50) {
      recommendations.push('Increase carbon offset investments');
      recommendations.push('Partner with certified green vendors');
    }

    return recommendations;
  }

  /**
   * Determine overall status
   */
  private determineStatus(scores: any, alerts: EventAlert[]): 'excellent' | 'good' | 'warning' | 'critical' {
    const hasCritical = alerts.some(a => a.level === 'critical');
    const hasHigh = alerts.some(a => a.level === 'high');

    if (hasCritical) return 'critical';
    if (hasHigh) return 'warning';
    if (scores.overall >= 80) return 'excellent';
    return 'good';
  }

  /**
   * Send critical alerts to users
   */
  private async sendCriticalAlerts(event: any, alerts: EventAlert[]) {
    const criticalAlerts = alerts.filter(a => a.level === 'critical');
    
    for (const alert of criticalAlerts) {
      // Send notification (implement based on your notification service)
      logger.warn('Critical event alert', {
        event_id: event.id,
        alert_type: alert.alert_type,
        message: alert.message,
      });
    }
  }
}

export default new EventMonitoringService();

