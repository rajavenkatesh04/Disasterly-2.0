// app/api/profile/update/route.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import dbConnect from "@/app/utils/mongoClient";
import User from "@/lib/mongodb/models/User";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        // Get current session
        const session = await getServerSession(authOptions);

        // Check if user is authenticated
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "You must be signed in to update your profile" },
                { status: 401 }
            );
        }

        // Parse request body
        const data = await req.json();
        console.log("Received profile data:", data); // Debug log to see incoming data

        // Connect to database
        await dbConnect();

        // Update user profile with ALL form fields
        const updatedUser = await User.findOneAndUpdate(
            { email: session.user.email },
            {
                // Keep existing name if data.name is not provided
                ...(session.user.name && { name: session.user.name }),

                // Store all the form fields from complete-profile
                gender: data.gender,
                dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
                phone: data.phone,

                // Store the complete address object
                address: {
                    street: data.address?.street,
                    city: data.address?.city,
                    state: data.address?.state,
                    postalCode: data.address?.postalCode,
                    country: data.address?.country
                },

                // Mark profile as complete and track update time
                isProfileComplete: true,
                profileUpdatedAt: new Date()
            },
            { new: true }
        );

        if (!updatedUser) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        console.log("Profile updated successfully:", updatedUser); // Debug log

        // Return success
        return NextResponse.json({
            success: true,
            message: "Profile updated successfully",
            isProfileComplete: true
        });
    } catch (error) {
        console.error("Error updating profile:", error);
        return NextResponse.json(
            { error: "Failed to update profile" },
            { status: 500 }
        );
    }
}