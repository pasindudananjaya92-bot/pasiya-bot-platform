/**
 * OPTIONAL local seed — DO NOT deploy secrets.
 * node -e "process.env.MONGODB_URI='...'; import('./api/seed-users-example.js')"
 * Or use Atlas UI to insert test documents into pasiya_db.users
 *
 * Example document:
 * { name: "Pasindu", email: "demo@example.com", username: "pasiya", bio: "AI builder", createdAt: new Date() }
 */
export default async function handler(req, res) {
  return res.status(403).json({
    success: false,
    error: 'Seed endpoint disabled. Insert users via MongoDB Atlas UI.'
  });
}
