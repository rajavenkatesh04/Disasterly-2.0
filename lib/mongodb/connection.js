import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

let cached = global.mongoose || { conn: null, promise: null };

export async function dbConnect() {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        const options = {
            dbName: "disaster-relief-db",
            bufferCommands: false,
            maxPoolSize: 10, // Maintain up to 10 socket connections
            serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        };

        cached.promise = mongoose.connect(MONGODB_URI, options)
            .then((mongoose) => {
                console.log("✅ MongoDB Connected Successfully");
                return mongoose;
            })
            .catch(err => {
                console.error("❌ MongoDB Connection Error:", err);
                cached.promise = null; // Reset the promise so we can retry
                throw err; // Re-throw for calling code to handle
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

// Add a helper to check connection status
export function isConnected() {
    return mongoose.connection.readyState === 1;
}