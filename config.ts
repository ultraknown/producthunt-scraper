import type { ScraperConfig } from './src/types';

export const config: ScraperConfig = {
  // 'today' | 'week' | 'month'
  period: 'today',
  // Number of top products to scrape
  topN: 10,
  // Product Hunt Developer Token
  // Reads from .env file or environment variable
  apiToken: process.env.PH_API_TOKEN || '',
};
