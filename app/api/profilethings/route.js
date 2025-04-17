import mongoose from 'mongoose';
import User from '@/lib/mongodb/models/User';
import { getToken } from 'next-auth/jwt';

export async function GET(req) {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const token = await getToken({ req });
        if (!token?.userId) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }

        const user = await User.findOne({ userId: token.userId }).lean();
        if (!user) {
            return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
        }

        return new Response(JSON.stringify(user), { status: 200 });
    } catch (error) {
        console.error('API error:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
}

export async function PUT(req) {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const token = await getToken({ req });
        if (!token?.userId) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }

        const body = await req.json();
        const { name, email, phone, gender, dateOfBirth, address, image } = body;

        if (!name || !email) {
            return new Response(JSON.stringify({ error: 'Name and email are required' }), { status: 400 });
        }

        const existingUser = await User.findOne({ email, userId: { $ne: token.userId } });
        if (existingUser) {
            return new Response(JSON.stringify({ error: 'Email is already in use' }), { status: 400 });
        }

        const updateData = {
            name,
            email,
            phone,
            gender,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
            address: address || {},
            image,
            profileUpdatedAt: new Date(),
            isProfileComplete: !!(name && email && phone && gender && dateOfBirth && address?.street),
        };

        const updatedUser = await User.findOneAndUpdate(
            { userId: token.userId },
            { $set: updateData },
            { new: true, runValidators: true }
        ).lean();

        if (!updatedUser) {
            return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
        }

        return new Response(JSON.stringify(updatedUser), { status: 200 });
    } catch (error) {
        console.error('API error:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const token = await getToken({ req });
        if (!token?.userId) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }

        const deletedUser = await User.findOneAndDelete({ userId: token.userId });
        if (!deletedUser) {
            return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
        }

        return new Response(JSON.stringify({ message: 'Account deleted successfully' }), { status: 200 });
    } catch (error) {
        console.error('API error:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
}