import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Adjust path
import { dbConnect } from "@/lib/mongodb/connection";
import User from "@/lib/mongodb/models/User";

export async function POST(req) {
    try {
        // Get current session
        const session = await getServerSession(authOptions);

        // Check if user is authenticated
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Parse request body
        const formData = await req.json();
        console.log("Received profile data:", formData); // Debug log to see incoming data

        // Connect to database using mongoose
        await dbConnect();

        // Generate unique USER-XXXXXX ID
        const timestamp = Date.now().toString(36); // Base36 timestamp
        const random = Math.random().toString(36).substr(2, 5); // 5 random chars
        let userId = `USER-${timestamp}-${random}`;

        // Check for uniqueness using mongoose
        let isUnique = false;
        let attempt = 0;
        const maxAttempts = 5;

        while (!isUnique && attempt < maxAttempts) {
            const existingUser = await User.findOne({ userId });
            if (!existingUser) isUnique = true;
            else {
                const newRandom = Math.random().toString(36).substr(2, 5);
                userId = `USER-${timestamp}-${newRandom}`;
            }
            attempt++;
        }

        if (!isUnique) return NextResponse.json({ error: "Failed to generate unique ID" }, { status: 500 });

        // Validate dateOfBirth
        const dateOfBirth = formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined;
        if (formData.dateOfBirth && isNaN(dateOfBirth)) {
            return NextResponse.json(
                { error: "Invalid date of birth format" },
                { status: 400 }
            );
        }

        // Update user profile with ALL form fields using the mongoose model
        try {
            const updatedUser = await User.findOneAndUpdate(
                { email: session.user.email },
                {
                    name: formData.name || session.user.name, // Prioritize form data, fallback to session
                    image: session.user.image, // Preserve Google image
                    gender: formData.gender,
                    dateOfBirth: dateOfBirth,
                    phone: formData.phone,
                    address: {
                        street: formData.address?.street,
                        city: formData.address?.city,
                        state: formData.address?.state,
                        postalCode: formData.address?.postalCode,
                        country: formData.address?.country,
                    },
                    userId: userId,
                    isProfileComplete: true,
                    profileUpdatedAt: new Date(),
                },
                { new: true, runValidators: true, upsert: true }
            );

            console.log("Profile updated successfully (Mongoose):", updatedUser);
            return NextResponse.json({
                success: true,
                message: "Profile updated successfully",
                isProfileComplete: true,
                user: updatedUser,
                userId: userId // Explicitly include userId in the response
            });
        } catch (mongooseError) {
            console.error("Mongoose update failed:", mongooseError);

            // If user wasn't found with the mongoose model, try alternative approach
            try {
                // Use the mongoose connection to access the collection directly
                const collection = mongoose.connection.collection('users');
                const result = await collection.findOneAndUpdate(
                    { email: session.user.email },
                    {
                        $set: {
                            name: formData.name || session.user.name,
                            image: session.user.image,
                            gender: formData.gender,
                            dateOfBirth: dateOfBirth,
                            phone: formData.phone,
                            address: {
                                street: formData.address?.street,
                                city: formData.address?.city,
                                state: formData.address?.state,
                                postalCode: formData.address?.postalCode,
                                country: formData.address?.country,
                            },
                            userId: userId,
                            isProfileComplete: true,
                            profileUpdatedAt: new Date(),
                        }
                    },
                    { returnDocument: "after", upsert: true }
                );

                console.log("Profile updated successfully (direct collection):", result.value);
                return NextResponse.json({
                    success: true,
                    message: "Profile updated successfully",
                    isProfileComplete: true,
                    user: result.value,
                    userId: userId
                });
            } catch (directError) {
                console.error("Direct collection update failed:", directError);
                return NextResponse.json(
                    { error: directError.message || "Failed to update profile" },
                    { status: 500 }
                );
            }
        }
    } catch (error) {
        console.error("Error updating profile:", error);
        return NextResponse.json(
            { error: error.message || "Failed to update profile" },
            { status: 500 }
        );
    }
}