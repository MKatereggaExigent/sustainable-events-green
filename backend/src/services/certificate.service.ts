import { query } from '../config/database';
import { logger } from '../utils/logger';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

interface CertificateData {
  eventId: number;
  organizationId: number;
  eventName: string;
  organizationName: string;
  sustainabilityScore: number;
  carbonFootprintKg: number;
  waterUsageLiters?: number;
  wasteGeneratedKg?: number;
  eventDate?: string;
}

/**
 * Generate Green Score Card Certificate
 */
export async function generateCertificate(data: CertificateData): Promise<string> {
  try {
    // Generate unique certificate number
    const certificateNumber = `ESC-${Date.now()}-${data.eventId}`;
    
    // Create PDF
    const pdfPath = await createCertificatePDF(data, certificateNumber);
    
    // Save to database
    await query(
      `INSERT INTO certificates (
        event_id, organization_id, certificate_number, sustainability_score,
        carbon_footprint_kg, water_usage_liters, waste_generated_kg, pdf_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        data.eventId,
        data.organizationId,
        certificateNumber,
        data.sustainabilityScore,
        data.carbonFootprintKg,
        data.waterUsageLiters || null,
        data.wasteGeneratedKg || null,
        pdfPath
      ]
    );

    logger.info(`Certificate generated: ${certificateNumber}`);
    return certificateNumber;

  } catch (error) {
    logger.error('Failed to generate certificate:', error);
    throw new Error('Certificate generation failed');
  }
}

/**
 * Create PDF certificate
 */
async function createCertificatePDF(data: CertificateData, certificateNumber: string): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });
      const fileName = `${certificateNumber}.pdf`;
      const filePath = path.join(process.cwd(), 'certificates', fileName);
      
      // Ensure directory exists
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Certificate Design
      // Background
      doc.rect(0, 0, 842, 595).fill('#f0fdf4');

      // Border
      doc.rect(30, 30, 782, 535)
         .lineWidth(3)
         .strokeColor('#10b981')
         .stroke();

      doc.rect(40, 40, 762, 515)
         .lineWidth(1)
         .strokeColor('#10b981')
         .stroke();

      // Header
      doc.fontSize(36)
         .fillColor('#065f46')
         .font('Helvetica-Bold')
         .text('GREEN SCORE CARD', 0, 80, { align: 'center' });

      doc.fontSize(16)
         .fillColor('#047857')
         .font('Helvetica')
         .text('Sustainability Certificate', 0, 130, { align: 'center' });

      // Certificate Body
      doc.fontSize(14)
         .fillColor('#374151')
         .font('Helvetica')
         .text('This certifies that', 0, 180, { align: 'center' });

      doc.fontSize(28)
         .fillColor('#065f46')
         .font('Helvetica-Bold')
         .text(data.organizationName, 0, 210, { align: 'center' });

      doc.fontSize(14)
         .fillColor('#374151')
         .font('Helvetica')
         .text('has successfully measured and documented the environmental impact of', 0, 250, { align: 'center' });

      doc.fontSize(20)
         .fillColor('#047857')
         .font('Helvetica-Bold')
         .text(data.eventName, 0, 280, { align: 'center' });

      // Sustainability Score (Large Circle)
      const scoreColor = getScoreColor(data.sustainabilityScore);
      doc.circle(421, 370, 50)
         .fillColor(scoreColor)
         .fill();

      doc.fontSize(32)
         .fillColor('#ffffff')
         .font('Helvetica-Bold')
         .text(data.sustainabilityScore.toString(), 396, 355);

      doc.fontSize(12)
         .fillColor('#374151')
         .font('Helvetica')
         .text('Sustainability Score', 0, 430, { align: 'center' });

      // Environmental Metrics
      const metricsY = 470;
      doc.fontSize(11)
         .fillColor('#6b7280')
         .font('Helvetica');

      doc.text(`Carbon Footprint: ${data.carbonFootprintKg.toFixed(2)} kg CO₂e`, 200, metricsY);
      if (data.waterUsageLiters) {
        doc.text(`Water Usage: ${data.waterUsageLiters.toFixed(2)} L`, 450, metricsY);
      }
      if (data.wasteGeneratedKg) {
        doc.text(`Waste Generated: ${data.wasteGeneratedKg.toFixed(2)} kg`, 200, metricsY + 20);
      }

      // Footer
      doc.fontSize(10)
         .fillColor('#9ca3af')
         .font('Helvetica')
         .text(`Certificate No: ${certificateNumber}`, 0, 520, { align: 'center' });

      doc.text(`Issued: ${new Date().toLocaleDateString('en-ZA')}`, 0, 535, { align: 'center' });

      doc.fontSize(8)
         .text('Verified by EcobServe Sustainability Platform', 0, 550, { align: 'center' });

      doc.end();

      stream.on('finish', () => {
        resolve(`/certificates/${fileName}`);
      });

      stream.on('error', reject);

    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Get color based on sustainability score
 */
function getScoreColor(score: number): string {
  if (score >= 80) return '#10b981'; // Green
  if (score >= 60) return '#f59e0b'; // Amber
  return '#ef4444'; // Red
}

/**
 * Get certificate by event ID
 */
export async function getCertificateByEventId(eventId: number): Promise<any> {
  const result = await query(
    'SELECT * FROM certificates WHERE event_id = $1 ORDER BY created_at DESC LIMIT 1',
    [eventId]
  );
  return result[0] || null;
}

