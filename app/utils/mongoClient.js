// app/utils/mongoClient.js
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

let cached = global.mongoose || { conn: null, promise: null };

export default async function dbConnect() {
    if (cached.conn) {
        console.log("Using existing MongoDB connection");
        return cached.conn;
    }

    if (!cached.promise) {
        console.log("Establishing new MongoDB connection...");

        // Remove deprecated options and use modern connection options
        const options = {
            dbName: "disaster-relief-db",
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(MONGODB_URI, options)
            .then((mongoose) => {
                console.log("✅ MongoDB Connected Successfully");
                return mongoose;
            })
            .catch(err => {
                console.error("❌ MongoDB Connection Error:", err);
                cached.promise = null;
                throw err;
            });
    }

    try {
        cached.conn = await cached.promise;
        return cached.conn;
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
        throw error;
    }
}