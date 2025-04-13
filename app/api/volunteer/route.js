import { MongoClient } from 'mongodb';

export async function POST(request) {
    try {
        const formData = await request.json();
        console.log("Received volunteer data:", formData);

        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI environment variable not configured');
        }

        const client = new MongoClient(process.env.MONGODB_URI);

        try {
            await client.connect();
            console.log("Connected to MongoDB");

            const db = client.db("disaster-relief-db");
            const collection = db.collection('volunteers');

            // Add timestamp to document
            const completeData = {
                ...formData,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const result = await collection.insertOne(completeData);
            console.log("Insert successful, ID:", result.insertedId);

            return Response.json({
                success: true,
                mongoId: result.insertedId.toString(), // Return the actual MongoDB ID
                formattedId: `HELP-${result.insertedId.toString().slice(-8).toUpperCase()}` // Pre-formatted display ID
            });

        } finally {
            await client.close();
        }

    } catch (error) {
        console.error("Database error:", error);
        return Response.json(
            {
                success: false,
                message: error.message || 'Failed to save volunteer data'
            },
            { status: 500 }
        );
    }
}