import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI; // රහස් කේතය මෙතනට ආරක්ෂිතව ලැබෙනවා
const client = new MongoClient(uri);

// Make.com Webhook URL එක
const WEBHOOK_URL = 'https://hook.eu1.make.com/41k8qajbe6y1ctqgd1ewsutdko8hwt3h';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        await client.connect();
        const database = client.db('pasiya_database'); // ඔබේ Database නම
        const collection = database.collection('feedback'); // ඔබේ Collection නම

        // 1. MongoDB එකට ඩේටා සේව් කිරීම
        const result = await collection.insertOne(req.body);

        // 2. Make.com වෙබ්හුක් ලින්ක් එකට ඩේටා යැවීම (Fetch)
        try {
            await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    insertedId: result.insertedId,
                    data: req.body
                })
            });
        } catch (webhookError) {
            console.error('Webhook error:', webhookError.message);
        }

        return res.status(200).json({ success: true, id: result.insertedId });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    } finally {
        await client.close();
    }
}
 
