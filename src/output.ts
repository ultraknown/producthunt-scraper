import * as fs from 'node:fs';
import * as path from 'node:path';
import type { Product, TimePeriod } from './types';

const PERIOD_LABELS: Record<TimePeriod, string> = {
  today: 'Today',
  week: 'This Week',
  month: 'This Month',
};

export function printResults(products: Product[], period: TimePeriod): void {
  const label = PERIOD_LABELS[period];
  const divider = '─'.repeat(70);

  console.log(`\n${divider}`);
  console.log(`  Product Hunt Leaderboard — ${label}`);
  console.log(`${divider}\n`);

  for (const p of products) {
    const rankStr = `#${String(p.rank).padStart(2, ' ')}`;
    console.log(`  ${rankStr}  ${p.name}`);
    if (p.tagline) {
      console.log(`        ${p.tagline}`);
    }
    console.log(`        ${p.votes.toLocaleString()} votes  |  ${p.url}`);
    if (p.rank < products.length) {
      console.log('');
    }
  }

  console.log(`\n${divider}`);
}

export function saveResults(products: Product[], period: TimePeriod): void {
  const outputDir = path.resolve(process.cwd(), 'output');
  fs.mkdirSync(outputDir, { recursive: true });

  const data = {
    scrapedAt: new Date().toISOString(),
    period,
    products,
  };

  const filePath = path.join(outputDir, `${period}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`\nResults saved to: ${filePath}`);
}
