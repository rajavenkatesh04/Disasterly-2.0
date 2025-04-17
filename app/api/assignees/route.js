// app/api/assignees/route.js
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb/connection';
import User from '@/lib/mongodb/models/User';

export async function POST(request) {
    try {
        const { userIds } = await request.json();

        console.log('Fetching assignees for userIds:', userIds); // Debug

        if (!Array.isArray(userIds) || userIds.length === 0) {
            console.warn('Invalid or empty userIds array');
            return NextResponse.json({ error: 'Invalid or empty userIds array' }, { status: 400 });
        }

        await dbConnect();
        const users = await User.find({
            userId: { $in: userIds.map(id => new RegExp(`^${id}$`, 'i')) },
        }).select('userId name phone image').lean();

        // Create a map of userId to user details
        const assigneeMap = userIds.reduce((acc, userId) => {
            const user = users.find(u => u.userId.toLowerCase() === userId.toLowerCase());
            acc[userId] = user ? { name: user.name, phone: user.phone, image: user.image } : null;
            return acc;
        }, {});

        console.log('Assignee map:', assigneeMap); // Debug
        return NextResponse.json({ assignees: assigneeMap }, { status: 200 });
    } catch (error) {
        console.error('Error fetching assignees:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}