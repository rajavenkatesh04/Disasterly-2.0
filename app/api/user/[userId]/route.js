import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb/connection";

export async function GET(req, context) {
    const params = await context.params; // Await params
    const { userId } = params;

    if (!userId || !userId.startsWith("USER-")) {
        return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    try {
        await dbConnect(); // Ensure connection is established
        const db = global.mongoose.conn.connection.db; // Access the db from the cached connection
        const user = await db.collection("users").findOne({ userId });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ user }, { status: 200 });
    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}