import 'dotenv/config';
import { Command } from 'commander';
import { config } from '../config';
import { scrapeProducts } from './scraper';
import { printResults, saveResults } from './output';

async function main() {
  const program = new Command();

  program
    .name('producthunt-scraper')
    .description('Scrape top products from Product Hunt leaderboard')
    .version('1.0.0')
    .showHelpAfterError()
    .argument('[period]', 'Time period: today, week, or month', config.period)
    .option('-n, --top <number>', 'Number of products to scrape', String(config.topN))
    .parse();

  const [period] = program.args as string[];
  const opts = program.opts<{ top: string }>();
  const topN = parseInt(opts.top, 10);
  const apiToken = config.apiToken || process.env.PH_API_TOKEN || '';

  const validPeriods = ['today', 'week', 'month'] as const;
  if (!validPeriods.includes(period as any)) {
    console.error(`Invalid period: "${period}". Must be one of: ${validPeriods.join(', ')}`);
    process.exit(1);
  }

  if (!Number.isInteger(topN) || topN < 1) {
    console.error(`Invalid topN: "${opts.top}". Must be a positive integer.`);
    process.exit(1);
  }

  if (!apiToken) {
    console.error('Missing API token. Provide via --token flag, PH_API_TOKEN env var, or .env file.');
    console.error('Get a free token at: https://www.producthunt.com/v2/oauth/applications\n');
    process.exit(1);
  }

  console.log(`Scraping top ${topN} products for ${period}...\n`);

  try {
    const products = await scrapeProducts(period as typeof validPeriods[number], topN, apiToken);

    if (products.length === 0) {
      console.warn('No products found. The API may not have data for this period.');
      process.exit(1);
    }

    printResults(products, period as typeof validPeriods[number]);
    saveResults(products, period as typeof validPeriods[number]);

    console.log(`\nDone! Found ${products.length} products.`);
  } catch (error) {
    console.error('Failed to scrape products:', error);
    process.exit(1);
  }
}

main();
