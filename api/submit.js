// WhatsApp Verify Token එක - FB එකේ දැම්ම එකම දාන්න
const VERIFY_TOKEN = 'abc123'; 

import { MongoClient } from 'mongodb'; 
const uri = process.env.MONGODB_URI; 
const client = new MongoClient(uri);

// Make.com Webhook URL එක
const WEBHOOK_URL = 'https://hook.eu1.make.com/41k8qajbe6y1ctqgd1ewsutdko8hwt3h'; 

export default async function handler(req, res) {
  
  // 1. WhatsApp VERIFY - GET Request
  if (req.method === 'GET') {
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    if (token === VERIFY_TOKEN) {
      console.log('WEBHOOK VERIFIED');
      return res.status(200).send(challenge);
    } else {
      return res.status(403).send('Wrong token');
    }
  }

  // 2. වෙබ්සයිට් / WhatsApp Message - POST Request
  if (req.method === 'POST') {
    try {
      await client.connect();
      const database = client.db('pasiya_database'); 
      const collection = database.collection('feedback'); 

      // 1. MongoDB එකට ඩේටා සේව් කිරීම
      const result = await collection.insertOne(req.body); 

      // 2. Make.com වෙබ්හුක් ලින්ක් එකට ඩේටා යැවීම
      try {
        await fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ insertedId: result.insertedId, data: req.body })
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

  // අනිත් හැම Method එකටම
  return res.status(405).json({ message: 'Method not allowed' });
} 
