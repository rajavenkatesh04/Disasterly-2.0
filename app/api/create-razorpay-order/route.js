import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(request) {
    try {
        const { amount, name, email } = await request.json();

        // Initialize Razorpay instance with your key_id and key_secret
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        // Create an order
        const order = await razorpay.orders.create({
            amount: amount, // amount in the smallest currency unit (paise for INR)
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
            notes: {
                name: name,
                email: email,
            },
        });

        return NextResponse.json({
            id: order.id,
            amount: order.amount,
            currency: order.currency,
        });
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        return NextResponse.json(
            { message: 'Error creating payment order', error: error.message },
            { status: 500 }
        );
    }
}