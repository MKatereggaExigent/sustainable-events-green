import { query } from '../config/database';
import { logger } from '../utils/logger';

interface BenchmarkData {
  eventType: string;
  attendees: number;
  carbonPerAttendee: number;
  waterPerAttendee?: number;
  wastePerAttendee?: number;
  sustainabilityScore?: number;
}

interface BenchmarkComparison {
  yourEvent: {
    carbonPerAttendee: number;
    waterPerAttendee: number;
    wastePerAttendee: number;
    sustainabilityScore: number;
  };
  industryAverage: {
    carbonPerAttendee: number;
    waterPerAttendee: number;
    wastePerAttendee: number;
    sustainabilityScore: number;
  };
  comparison: {
    carbonPerformance: 'better' | 'average' | 'worse';
    carbonDifference: number; // percentage
    waterPerformance: 'better' | 'average' | 'worse';
    waterDifference: number;
    wastePerformance: 'better' | 'average' | 'worse';
    wasteDifference: number;
    overallRanking: string; // Top 10%, Top 25%, etc.
  };
  recommendations: string[];
}

/**
 * Compare event against industry benchmarks
 */
export async function compareWithBenchmarks(data: BenchmarkData): Promise<BenchmarkComparison> {
  try {
    // Determine attendee range
    const attendeeRange = getAttendeeRange(data.attendees);

    // Get industry benchmark
    const benchmarkResult = await query(
      `SELECT * FROM industry_benchmarks 
       WHERE event_type = $1 AND attendee_range = $2
       LIMIT 1`,
      [data.eventType, attendeeRange]
    );

    let industryAverage;
    if (benchmarkResult.length === 0) {
      // Use default benchmarks if no data available
      industryAverage = getDefaultBenchmark(data.eventType, attendeeRange);
    } else {
      industryAverage = {
        carbonPerAttendee: parseFloat(benchmarkResult[0].avg_carbon_per_attendee),
        waterPerAttendee: parseFloat(benchmarkResult[0].avg_water_per_attendee || 0),
        wastePerAttendee: parseFloat(benchmarkResult[0].avg_waste_per_attendee || 0),
        sustainabilityScore: benchmarkResult[0].avg_sustainability_score || 50
      };
    }

    // Calculate performance
    const carbonDiff = ((data.carbonPerAttendee - industryAverage.carbonPerAttendee) / industryAverage.carbonPerAttendee) * 100;
    const waterDiff = data.waterPerAttendee 
      ? ((data.waterPerAttendee - industryAverage.waterPerAttendee) / industryAverage.waterPerAttendee) * 100
      : 0;
    const wasteDiff = data.wastePerAttendee
      ? ((data.wastePerAttendee - industryAverage.wastePerAttendee) / industryAverage.wastePerAttendee) * 100
      : 0;

    const comparison: BenchmarkComparison = {
      yourEvent: {
        carbonPerAttendee: data.carbonPerAttendee,
        waterPerAttendee: data.waterPerAttendee || 0,
        wastePerAttendee: data.wastePerAttendee || 0,
        sustainabilityScore: data.sustainabilityScore || 0
      },
      industryAverage,
      comparison: {
        carbonPerformance: getPerformance(carbonDiff),
        carbonDifference: Math.abs(carbonDiff),
        waterPerformance: getPerformance(waterDiff),
        waterDifference: Math.abs(waterDiff),
        wastePerformance: getPerformance(wasteDiff),
        wasteDifference: Math.abs(wasteDiff),
        overallRanking: getOverallRanking(data.sustainabilityScore || 0)
      },
      recommendations: generateBenchmarkRecommendations(carbonDiff, waterDiff, wasteDiff)
    };

    return comparison;

  } catch (error) {
    logger.error('Failed to compare with benchmarks:', error);
    throw new Error('Benchmark comparison failed');
  }
}

/**
 * Get attendee range category
 */
function getAttendeeRange(attendees: number): string {
  if (attendees <= 50) return '0-50';
  if (attendees <= 200) return '51-200';
  if (attendees <= 500) return '201-500';
  return '500+';
}

/**
 * Determine performance level
 */
function getPerformance(difference: number): 'better' | 'average' | 'worse' {
  if (difference < -10) return 'better'; // 10% better than average
  if (difference > 10) return 'worse'; // 10% worse than average
  return 'average';
}

/**
 * Get overall ranking based on sustainability score
 */
function getOverallRanking(score: number): string {
  if (score >= 90) return 'Top 5%';
  if (score >= 80) return 'Top 10%';
  if (score >= 70) return 'Top 25%';
  if (score >= 60) return 'Top 50%';
  return 'Below Average';
}

/**
 * Generate recommendations based on benchmark comparison
 */
function generateBenchmarkRecommendations(carbonDiff: number, waterDiff: number, wasteDiff: number): string[] {
  const recommendations: string[] = [];

  if (carbonDiff > 10) {
    recommendations.push('Your carbon footprint is above industry average. Consider switching to renewable energy sources and optimizing transport.');
  } else if (carbonDiff < -10) {
    recommendations.push('Excellent! Your carbon footprint is below industry average. Share your best practices with peers.');
  }

  if (waterDiff > 10) {
    recommendations.push('Water usage is higher than average. Implement water-saving fixtures and rainwater harvesting.');
  }

  if (wasteDiff > 10) {
    recommendations.push('Waste generation exceeds industry norms. Focus on waste reduction, reuse, and composting programs.');
  }

  if (recommendations.length === 0) {
    recommendations.push('Your event performs at or above industry standards across all metrics. Keep up the great work!');
  }

  return recommendations;
}

/**
 * Get default benchmarks when no data available
 */
function getDefaultBenchmark(eventType: string, attendeeRange: string): any {
  // Default industry averages (based on research)
  return {
    carbonPerAttendee: 45, // kg CO2e per attendee
    waterPerAttendee: 150, // liters per attendee
    wastePerAttendee: 2.5, // kg per attendee
    sustainabilityScore: 55
  };
}

/**
 * Seed industry benchmarks
 */
export async function seedBenchmarks(): Promise<void> {
  const benchmarks = [
    { eventType: 'conference', attendeeRange: '0-50', avgCarbon: 35, avgWater: 100, avgWaste: 1.8, avgScore: 60 },
    { eventType: 'conference', attendeeRange: '51-200', avgCarbon: 42, avgWater: 130, avgWaste: 2.2, avgScore: 58 },
    { eventType: 'conference', attendeeRange: '201-500', avgCarbon: 48, avgWater: 150, avgWaste: 2.5, avgScore: 55 },
    { eventType: 'conference', attendeeRange: '500+', avgCarbon: 55, avgWater: 180, avgWaste: 3.0, avgScore: 52 },
    { eventType: 'wedding', attendeeRange: '0-50', avgCarbon: 50, avgWater: 200, avgWaste: 3.5, avgScore: 50 },
    { eventType: 'wedding', attendeeRange: '51-200', avgCarbon: 60, avgWater: 250, avgWaste: 4.0, avgScore: 48 },
    { eventType: 'corporate', attendeeRange: '0-50', avgCarbon: 30, avgWater: 90, avgWaste: 1.5, avgScore: 65 },
    { eventType: 'corporate', attendeeRange: '51-200', avgCarbon: 38, avgWater: 120, avgWaste: 2.0, avgScore: 62 }
  ];

  for (const b of benchmarks) {
    await query(
      `INSERT INTO industry_benchmarks (
        event_type, attendee_range, avg_carbon_per_attendee, avg_water_per_attendee,
        avg_waste_per_attendee, avg_sustainability_score, sample_size
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT DO NOTHING`,
      [b.eventType, b.attendeeRange, b.avgCarbon, b.avgWater, b.avgWaste, b.avgScore, 100]
    );
  }

  logger.info('Industry benchmarks seeded');
}

