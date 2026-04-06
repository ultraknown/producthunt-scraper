import type { ScraperConfig } from './src/types';

export const config: ScraperConfig = {
  // 'today' | 'week' | 'month'
  period: 'today',
  // Number of top products to scrape
  topN: 10,
  // Product Hunt Developer Token
  // Set the PH_API_TOKEN environment variable (see .env.example)
  apiToken: process.env.PH_API_TOKEN || '',
};
