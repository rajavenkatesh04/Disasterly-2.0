// app/api/resources/route.js
import { dbConnect } from "@/lib/mongodb/connection";
import Resource from "@/lib/mongodb/models/Resource";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await dbConnect();
        const resources = await Resource.find({}).sort({ category: 1, name: 1 });

        return NextResponse.json({
            success: true,
            data: resources
        }, { status: 200 });
    } catch (error) {
        console.error("Error in resources API:", error);
        return NextResponse.json({
            success: false,
            message: "Server error",
            error: error.message
        }, { status: 500 });
    }
}

// You can add other HTTP methods as needed
export async function POST(request) {
    try {
        await dbConnect();
        const data = await request.json();

        const newResource = new Resource(data);
        const savedResource = await newResource.save();

        return NextResponse.json({
            success: true,
            data: savedResource
        }, { status: 201 });
    } catch (error) {
        console.error("Error in resources API:", error);
        return NextResponse.json({
            success: false,
            message: "Server error",
            error: error.message
        }, { status: 500 });
    }
}