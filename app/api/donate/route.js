import { MongoClient } from 'mongodb';

export async function POST(request) {
    try {
        const { amount, name, email, disaster, cardNumber } = await request.json();
        console.log("Received donation:", { amount, name, email, disaster });

        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI environment variable not configured');
        }

        const client = new MongoClient(process.env.MONGODB_URI);

        try {
            await client.connect();
            console.log("Connected to MongoDB");

            const db = client.db("disaster-relief-db");
            const collection = db.collection('donations');

            // Generate IDs
            const result = await collection.insertOne({}); // Temporary document for ID
            const receiptId = `DONATE-${result.insertedId.toString().slice(-8).toUpperCase()}`;
            const transactionId = `TXN-${Math.random().toString(36).slice(-8).toUpperCase()}`; // Mock transaction ID

            // Save donation data
            const donationData = {
                amount,
                name,
                email,
                disaster,
                cardNumber: cardNumber.slice(-4).padStart(16, '*'), // Store last 4 digits only
                receiptId,
                transactionId,
                status: 'completed',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            await collection.updateOne(
                { _id: result.insertedId },
                { $set: donationData }
            );

            console.log("Donation saved, ID:", result.insertedId);

            return Response.json({
                success: true,
                receiptId,
                transactionId,
                mongoId: result.insertedId.toString(),
            });
        } finally {
            await client.close();
        }
    } catch (error) {
        console.error("Database error:", error);
        return Response.json(
            {
                success: false,
                message: error.message || 'Failed to save donation'
            },
            { status: 500 }
        );
    }
}