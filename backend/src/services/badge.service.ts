import { pool } from '../config/database';
import logger from '../utils/logger';
import crypto from 'crypto';

interface Badge {
  id: string;
  organization_id: string;
  badge_type: 'carbon_neutral' | 'eco_certified' | 'sustainability_leader' | 'green_event';
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  metrics: {
    total_carbon_offset: number;
    events_count: number;
    carbon_reduction_percentage: number;
    sdg_alignment_count: number;
  };
  verification_code: string;
  issued_at: string;
  expires_at: string | null;
  is_active: boolean;
}

interface EmbedCode {
  html: string;
  javascript: string;
  css: string;
  preview_url: string;
}

class BadgeService {
  /**
   * Generate a sustainability badge for an organization
   */
  async generateBadge(organizationId: string): Promise<Badge> {
    try {
      // Get organization metrics
      const metrics = await this.getOrganizationMetrics(organizationId);

      // Determine badge type and level
      const { badge_type, level } = this.determineBadgeLevel(metrics);

      // Generate verification code
      const verification_code = this.generateVerificationCode(organizationId);

      // Create badge
      const badge: Badge = {
        id: `BADGE-${Date.now()}`,
        organization_id: organizationId,
        badge_type,
        level,
        metrics,
        verification_code,
        issued_at: new Date().toISOString(),
        expires_at: null, // Badges don't expire unless revoked
        is_active: true,
      };

      // Save to database
      await pool.query(`
        INSERT INTO sustainability_badges 
        (id, organization_id, badge_type, level, metrics, verification_code, issued_at, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (organization_id) 
        DO UPDATE SET 
          badge_type = $3,
          level = $4,
          metrics = $5,
          verification_code = $6,
          issued_at = $7,
          is_active = $8
      `, [
        badge.id,
        badge.organization_id,
        badge.badge_type,
        badge.level,
        JSON.stringify(badge.metrics),
        badge.verification_code,
        badge.issued_at,
        badge.is_active,
      ]);

      logger.info('Badge generated', { badge_id: badge.id, organization_id: organizationId });

      return badge;
    } catch (error: any) {
      logger.error('Badge generation failed', { error: error.message, organizationId });
      throw new Error('Failed to generate badge');
    }
  }

  /**
   * Get embeddable code for a badge
   */
  async getEmbedCode(badgeId: string, options?: {
    theme?: 'light' | 'dark';
    size?: 'small' | 'medium' | 'large';
    show_metrics?: boolean;
  }): Promise<EmbedCode> {
    const theme = options?.theme || 'light';
    const size = options?.size || 'medium';
    const showMetrics = options?.show_metrics ?? true;

    const sizeMap = {
      small: { width: 150, height: 150 },
      medium: { width: 250, height: 250 },
      large: { width: 350, height: 350 },
    };

    const dimensions = sizeMap[size];
    const baseUrl = process.env.FRONTEND_URL || 'https://ecobserve.com';

    const html = `
<!-- EcobServe Sustainability Badge -->
<div id="ecobserve-badge-${badgeId}" class="ecobserve-badge"></div>
<script src="${baseUrl}/badge-widget.js" data-badge-id="${badgeId}" data-theme="${theme}" data-size="${size}" data-show-metrics="${showMetrics}"></script>
`.trim();

    const javascript = `
(function() {
  const badgeId = '${badgeId}';
  const theme = '${theme}';
  const size = '${size}';
  const showMetrics = ${showMetrics};
  
  // Fetch badge data
  fetch('${baseUrl}/api/badges/${badgeId}/public')
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById('ecobserve-badge-${badgeId}');
      if (!container) return;
      
      // Render badge
      container.innerHTML = \`
        <div class="ecobserve-badge-container" style="width: ${dimensions.width}px; height: ${dimensions.height}px;">
          <img src="${baseUrl}/badges/\${data.badge_type}-\${data.level}.svg" alt="Sustainability Badge" />
          \${showMetrics ? \`
            <div class="badge-metrics">
              <p>Carbon Offset: \${data.metrics.total_carbon_offset} kg</p>
              <p>Events: \${data.metrics.events_count}</p>
            </div>
          \` : ''}
          <a href="${baseUrl}/verify/\${data.verification_code}" target="_blank">Verify</a>
        </div>
      \`;
    });
})();
`.trim();

    const css = `
.ecobserve-badge-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: ${theme === 'dark' ? '#1a1a1a' : '#ffffff'};
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.ecobserve-badge-container img {
  max-width: 100%;
  height: auto;
}

.badge-metrics {
  margin-top: 12px;
  text-align: center;
  color: ${theme === 'dark' ? '#ffffff' : '#333333'};
  font-size: 14px;
}

.ecobserve-badge-container a {
  margin-top: 8px;
  color: #10b981;
  text-decoration: none;
  font-size: 12px;
}
`.trim();

    return {
      html,
      javascript,
      css,
      preview_url: `${baseUrl}/badge-preview/${badgeId}?theme=${theme}&size=${size}`,
    };
  }

  /**
   * Get organization metrics for badge calculation
   */
  private async getOrganizationMetrics(organizationId: string) {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as events_count,
        COALESCE(SUM(carbon_offset), 0) as total_carbon_offset,
        COALESCE(SUM(total_carbon), 0) as total_carbon,
        CASE 
          WHEN SUM(total_carbon) > 0 
          THEN (SUM(carbon_offset) / SUM(total_carbon)) * 100
          ELSE 0
        END as carbon_reduction_percentage
      FROM events
      WHERE organization_id = $1
        AND deleted_at IS NULL
    `, [organizationId]);

    const data = result.rows[0];

    return {
      total_carbon_offset: parseFloat(data.total_carbon_offset),
      events_count: parseInt(data.events_count),
      carbon_reduction_percentage: parseFloat(data.carbon_reduction_percentage),
      sdg_alignment_count: 5, // Placeholder
    };
  }

  /**
   * Determine badge type and level based on metrics
   */
  private determineBadgeLevel(metrics: any): { badge_type: Badge['badge_type']; level: Badge['level'] } {
    const { carbon_reduction_percentage, events_count, total_carbon_offset } = metrics;

    // Determine level
    let level: Badge['level'] = 'bronze';
    if (carbon_reduction_percentage >= 75 && events_count >= 20) level = 'platinum';
    else if (carbon_reduction_percentage >= 50 && events_count >= 10) level = 'gold';
    else if (carbon_reduction_percentage >= 25 && events_count >= 5) level = 'silver';

    // Determine type
    let badge_type: Badge['badge_type'] = 'eco_certified';
    if (carbon_reduction_percentage >= 100) badge_type = 'carbon_neutral';
    else if (level === 'platinum' || level === 'gold') badge_type = 'sustainability_leader';

    return { badge_type, level };
  }

  /**
   * Generate verification code
   */
  private generateVerificationCode(organizationId: string): string {
    const hash = crypto.createHash('sha256');
    hash.update(`${organizationId}-${Date.now()}-${Math.random()}`);
    return hash.digest('hex').substring(0, 16).toUpperCase();
  }

  /**
   * Verify a badge
   */
  async verifyBadge(verificationCode: string): Promise<Badge | null> {
    const result = await pool.query(`
      SELECT * FROM sustainability_badges
      WHERE verification_code = $1 AND is_active = true
    `, [verificationCode]);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      ...row,
      metrics: JSON.parse(row.metrics),
    };
  }
}

export default new BadgeService();

