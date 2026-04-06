import https from 'node:https';
import type { TimePeriod, Product } from './types';

const PRODUCT_HUNT_API_URL = 'https://api.producthunt.com/v2/api/graphql';

function graphqlQuery(query: string, token: string, retries = 3): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ query });
    let attempt = 0;

    function doRequest() {
      attempt++;
      const req = https.request(PRODUCT_HUNT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
          'Authorization': `Bearer ${token}`,
        },
      }, (res) => {
        let data = '';
        res.on('data', (chunk: string) => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`Failed to parse response: ${data.substring(0, 200)}`));
          }
        });
      });
      req.on('error', (err: NodeJS.ErrnoException) => {
        if ((err.code === 'ECONNRESET' || err.code === 'ECONNREFUSED') && attempt < retries) {
          console.log(`  Connection error, retrying (${attempt}/${retries})...`);
          setTimeout(doRequest, 1000 * attempt);
        } else {
          reject(err);
        }
      });
      req.write(payload);
      req.end();
    }

    doRequest();
  });
}

function getDateRange(period: TimePeriod): { after: Date; before: Date } {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setUTCHours(0, 0, 0, 0);

  const before = new Date(now);

  let after: Date;
  switch (period) {
    case 'today':
      after = new Date(startOfDay);
      break;
    case 'week':
      after = new Date(startOfDay);
      after.setDate(after.getDate() - 7);
      break;
    case 'month':
      after = new Date(startOfDay);
      after.setDate(after.getDate() - 30);
      break;
  }

  return { after, before };
}

export async function scrapeProducts(period: TimePeriod, topN: number, token: string): Promise<Product[]> {
  const { after, before } = getDateRange(period);
  const isoAfter = after.toISOString();
  const isoBefore = before.toISOString();

  const query = `
    {
      posts(order: RANKING, featured: true, postedAfter: "${isoAfter}" postedBefore: "${isoBefore}", first: ${topN}) {
        edges {
          node {
            id
            name
            tagline
            votesCount
            url
            featuredAt
            thumbnail {
              url
            }
          }
        }
      }
    }
  `.trim();

  console.log(`Querying Product Hunt API for ${period} (${isoAfter.slice(0, 10)} → ${isoBefore.slice(0, 10)})...`);

  const response = await graphqlQuery(query, token) as Record<string, unknown>;

  if (response.errors) {
    throw new Error(`API error: ${JSON.stringify((response as Record<string, unknown>).errors)}`);
  }

  const edges = (response as Record<string, unknown>).data as Record<string, unknown> | undefined;
  const postsData = (edges as Record<string, { edges?: Array<{ node: Record<string, unknown> }> }>)?.posts;
  const edgeList = postsData?.edges || [];

  if (edgeList.length === 0) {
    return [];
  }

  return edgeList.slice(0, topN).map((edge: { node: Record<string, unknown> }, i: number) => {
    const node = edge.node;
    const thumb = node.thumbnail as Record<string, unknown> | null;
    const thumbnail = thumb?.url ? String(thumb.url) : undefined;

    return {
      rank: i + 1,
      name: String(node.name || ''),
      tagline: String(node.tagline || ''),
      votes: Number(node.votesCount || 0),
      url: String(node.url || ''),
      thumbnail,
    } as Product;
  });
}
