import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

let cached = global.mongoose || { conn: null, promise: null };

export async function dbConnect() {
    if (cached.conn) {
        console.log("✅ Using existing MongoDB connection");
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            dbName: "disaster-relief-db",
            bufferCommands: false,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            console.log("✅ MongoDB Connected Successfully");
            return mongoose;
        }).catch((err) => {
            console.error("❌ MongoDB Connection Error:", err);
            cached.promise = null; // Reset for retry
            throw err;
        });
    }

    try {
        cached.conn = await cached.promise;
        return cached.conn;
    } catch (error) {
        console.error("Failed to connect to MongoDB, retrying...", error);
        // Simple retry logic (up to 3 attempts)
        for (let i = 1; i <= 2; i++) {
            console.log(`Retry attempt ${i}...`);
            try {
                cached.conn = await mongoose.connect(MONGODB_URI, opts);
                console.log("✅ Reconnected on retry!");
                return cached.conn;
            } catch (retryError) {
                console.error(`Retry ${i} failed:`, retryError);
                if (i === 2) throw retryError;
            }
        }
    }
}

export function isConnected() {
    return mongoose.connection.readyState === 1;
}