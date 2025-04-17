import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dbConnect } from "@/lib/mongodb/connection";
import User from "@/lib/mongodb/models/User";

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const formData = await req.json();
        console.log("Received profile data:", formData);

        await dbConnect();

        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5);
        let userId = `USER-${timestamp}-${random}`;
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

        const dateOfBirth = formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined;
        if (formData.dateOfBirth && isNaN(dateOfBirth)) {
            return NextResponse.json(
                { error: "Invalid date of birth format" },
                { status: 400 }
            );
        }

        try {
            const updatedUser = await User.findOneAndUpdate(
                { email: session.user.email },
                {
                    name: formData.name || session.user.name,
                    image: session.user.image,
                    gender: formData.gender,
                    dateOfBirth: dateOfBirth,
                    age: formData.age,
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
                userId: userId
            });
        } catch (mongooseError) {
            console.error("Mongoose update failed:", mongooseError);
            try {
                const collection = mongoose.connection.collection('users');
                const result = await collection.findOneAndUpdate(
                    { email: session.user.email },
                    {
                        $set: {
                            name: formData.name || session.user.name,
                            image: session.user.image,
                            gender: formData.gender,
                            dateOfBirth: dateOfBirth,
                            age: formData.age,
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