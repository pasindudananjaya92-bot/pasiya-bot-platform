/**
 * GET /api/search-users?q=keyword&limit=20
 * Database: pasiya_db | Collection: users | Atlas Search index: default
 * Vercel env required: MONGODB_URI
 */
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

async function getClient() {
  if (!uri) {
    throw new Error('MONGODB_URI is not set on Vercel Environment Variables');
  }
  if (!global._pasiyaMongoClient) {
    const client = new MongoClient(uri, { maxPoolSize: 5 });
    await client.connect();
    global._pasiyaMongoClient = client;
  }
  return global._pasiyaMongoClient;
}

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use GET.' });
  }

  const q = String(req.query.q || req.query.query || '').trim();
  let limit = parseInt(req.query.limit || '20', 10);
  if (Number.isNaN(limit) || limit < 1) limit = 20;
  if (limit > 50) limit = 50;

  if (!q) {
    return res.status(400).json({ success: false, error: 'Missing query. Example: /api/search-users?q=pasindu' });
  }
  if (q.length > 100) {
    return res.status(400).json({ success: false, error: 'Query too long (max 100 characters)' });
  }

  try {
    const client = await getClient();
    const col = client.db('pasiya_db').collection('users');

    let results = [];
    let mode = 'atlas-search';

    try {
      results = await col
        .aggregate([
          {
            $search: {
              index: 'default',
              text: {
                query: q,
                path: { wildcard: '*' },
                fuzzy: {
                  maxEdits: 2,
                  prefixLength: 1,
                  maxExpansions: 50
                }
              }
            }
          },
          { $limit: limit },
          {
            $project: {
              _id: 1,
              name: 1,
              email: 1,
              username: 1,
              bio: 1,
              role: 1,
              createdAt: 1,
              score: { $meta: 'searchScore' }
            }
          }
        ])
        .toArray();
    } catch (searchErr) {
      mode = 'regex-fallback';
      console.warn('Atlas $search failed, using regex fallback:', searchErr.message);
      const rx = new RegExp(escapeRegex(q), 'i');
      results = await col
        .find({
          $or: [{ name: rx }, { email: rx }, { username: rx }, { bio: rx }]
        })
        .limit(limit)
        .project({ name: 1, email: 1, username: 1, bio: 1, role: 1, createdAt: 1 })
        .toArray();
    }

    return res.status(200).json({
      success: true,
      query: q,
      mode: mode,
      count: results.length,
      results: results
    });
  } catch (err) {
    console.error('search-users error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Search failed'
    });
  }
}
