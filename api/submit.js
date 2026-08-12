 import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI; // රහස් කේතය මෙතනට ආරක්ෂිතව ලැබෙනවා
const client = new MongoClient(uri);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        await client.connect();
        const database = client.db('pasiya_database'); // ඔබේ Database නම
        const collection = database.collection('feedback'); // ඔබේ Collection නම

        const result = await collection.insertOne(req.body);
        return res.status(200).json({ success: true, id: result.insertedId });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    } finally {
        await client.close();
    }
}
