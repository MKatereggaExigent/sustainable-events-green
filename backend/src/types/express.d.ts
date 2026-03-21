// Extend Express Request type to include custom properties
declare namespace Express {
  export interface Request {
    user?: {
      userId: string;
      email: string;
      permissions?: string[];
      roles?: string[];
    };
    organizationId?: string;
    subscriptionUsage?: {
      eventsThisMonth: number;
      maxEvents: number;
      planCode: string;
    };
  }
}

