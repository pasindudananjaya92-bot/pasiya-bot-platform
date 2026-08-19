/**
 * GET /api/search-users?q=keyword&limit=20
 * Atlas Search on pasiya_db.users using index "default"
 * Requires Vercel env: MONGODB_URI
 */
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
let cached = global._pasiyaMongo;

async function getClient() {
  if (!uri) throw new Error('MONGODB_URI env is missing on Vercel');
  if (cached && cached.topology && cached.topology.isConnected()) return cached;
  const client = new MongoClient(uri, { maxPoolSize: 5 });
  await client.connect();
  global._pasiyaMongo = client;
  cached = client;
  return client;
}

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const q = String(req.query.q || req.query.query || '').trim();
  const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10) || 20, 1), 50);

  if (!q) {
    return res.status(400).json({ success: false, error: 'Missing query ?q=' });
  }
  if (q.length > 100) {
    return res.status(400).json({ success: false, error: 'Query too long' });
  }

  try {
    const client = await getClient();
    const col = client.db('pasiya_db').collection('users');

    // Atlas Search — index name: default
    let results = [];
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
      // Fallback if index path config differs — regex on common fields
      console.warn('Atlas $search failed, fallback regex:', searchErr.message);
      const rx = new RegExp(escapeRegex(q), 'i');
      results = await col
        .find({
          $or: [
            { name: rx },
            { email: rx },
            { username: rx },
            { bio: rx }
          ]
        })
        .limit(limit)
        .project({ name: 1, email: 1, username: 1, bio: 1, role: 1, createdAt: 1 })
        .toArray();
    }

    return res.status(200).json({
      success: true,
      query: q,
      count: results.length,
      results
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Search failed'
    });
  }
}
