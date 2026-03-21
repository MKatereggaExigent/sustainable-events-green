import { Request, Response } from 'express';
import { generateBasicRecommendations, EventInputs } from '../services/recommendations.service';

/**
 * Generate basic recommendations based on event inputs
 * POST /api/recommendations/generate
 */
export async function generateRecommendations(req: Request, res: Response): Promise<void> {
  try {
    const inputs: EventInputs = req.body;

    // Validate inputs
    if (!inputs.venue || !inputs.fnb || !inputs.transport || !inputs.materials) {
      res.status(400).json({
        success: false,
        error: 'Missing required event inputs (venue, fnb, transport, materials)',
      });
      return;
    }

    const recommendations = generateBasicRecommendations(inputs);

    res.json({
      success: true,
      data: {
        recommendations,
        totalRecommendations: recommendations.length,
        totalPotentialSavingsKgCO2: recommendations.reduce((sum, r) => sum + r.impactKgCO2, 0),
      },
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate recommendations',
    });
  }
}

