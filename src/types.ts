export type TimePeriod = 'today' | 'week' | 'month';

export interface ScraperConfig {
  period: TimePeriod;
  topN: number;
  apiToken: string;
}

export interface Product {
  rank: number;
  name: string;
  tagline: string;
  votes: number;
  url: string;
  thumbnail?: string;
}
