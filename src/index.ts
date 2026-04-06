import { config } from '../config';
import { scrapeProducts } from './scraper';
import { printResults, saveResults } from './output';

async function main() {
  const { period, topN, apiToken } = config;

  const validPeriods = ['today', 'week', 'month'] as const;
  if (!validPeriods.includes(period)) {
    console.error(`Invalid period: "${period}". Must be one of: ${validPeriods.join(', ')}`);
    process.exit(1);
  }

  if (!Number.isInteger(topN) || topN < 1) {
    console.error(`Invalid topN: "${topN}". Must be a positive integer.`);
    process.exit(1);
  }

  if (!apiToken) {
    console.error('Missing API token. Set PH_API_TOKEN environment variable or update config.ts.');
    console.error('Get a free token at: https://www.producthunt.com/v2/oauth/applications\n');
    process.exit(1);
  }

  console.log(`Scraping top ${topN} products for ${period}...\n`);

  try {
    const products = await scrapeProducts(period, topN, apiToken);

    if (products.length === 0) {
      console.warn('No products found. The API may not have data for this period.');
      process.exit(1);
    }

    printResults(products, period);
    saveResults(products, period);

    console.log(`\nDone! Found ${products.length} products.`);
  } catch (error) {
    console.error('Failed to scrape products:', error);
    process.exit(1);
  }
}

main();
