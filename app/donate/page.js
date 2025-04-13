// app/donate/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DonatePage() {
    const [amount, setAmount] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const router = useRouter();

    const predefinedAmounts = [100, 500, 1000, 5000];

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!amount || amount <= 0) {
            setMessage('Please enter a valid donation amount');
            return;
        }

        setIsLoading(true);

        try {
            // Replace with your actual API endpoint for creating Razorpay orders
            const response = await fetch('/api/create-razorpay-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: amount * 100, // Razorpay expects amount in paise (1 INR = 100 paise)
                    name,
                    email,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Your Razorpay Key ID
                amount: data.amount,
                currency: data.currency,
                name: "Disasterly",
                description: "Donation",
                order_id: data.id,
                handler: function (response) {
                    // Handle successful payment
                    verifyPayment(response);
                },
                prefill: {
                    name: name,
                    email: email,
                },
                theme: {
                    color: "#4F46E5",
                },
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (error) {
            setMessage(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const verifyPayment = async (paymentData) => {
        try {
            const response = await fetch('/api/verify-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(paymentData),
            });

            const data = await response.json();

            if (data.success) {
                router.push(`/thank-you?amount=${amount}`);
            } else {
                setMessage('Payment verification failed. Please contact support.');
            }
        } catch (error) {
            setMessage('Error verifying payment');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
            <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-indigo-100">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 py-8 px-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mt-4 -mr-16 opacity-20">
                            <svg width="160" height="160" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="80" cy="80" r="80" fill="white" />
                                <path d="M80 50V110M50 80H110" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                            </svg>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white">Support people in need!</h1>
                        <p className="mt-2 text-lg text-indigo-100 max-w-lg">Your contribution helps us continue our mission to make a difference</p>
                    </div>

                    {/* Donation Form */}
                    <div className="p-6 md:p-8 lg:p-10">
                        {message && (
                            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md text-red-600 flex items-start">
                                <svg className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                                </svg>
                                <span>{message}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                        Your Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                                        placeholder="Enter your name"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <div className="flex justify-between items-center">
                                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                                        Donation Amount (INR)
                                    </label>
                                    <span className="text-sm text-gray-500">Choose or enter an amount</span>
                                </div>

                                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {predefinedAmounts.map((presetAmount) => (
                                        <button
                                            key={presetAmount}
                                            type="button"
                                            onClick={() => setAmount(presetAmount.toString())}
                                            className={`py-3 px-4 border-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 
                                                ${
                                                amount === presetAmount.toString()
                                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                                                    : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-300 hover:bg-indigo-50'
                                            }`}
                                        >
                                            ₹{presetAmount}
                                        </button>
                                    ))}
                                </div>

                                <div className="mt-4">
                                    <div className="relative rounded-lg shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 sm:text-sm">₹</span>
                                        </div>
                                        <input
                                            type="number"
                                            id="amount"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-lg transition-colors"
                                            placeholder="Enter custom amount"
                                            min="1"
                                            required
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 sm:text-sm">INR</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 mt-6">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-gray-600">
                                            Your contribution will help us improve Disasterly and provide better services. All donations are securely processed by Razorpay.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex justify-center py-4 px-4 border border-transparent rounded-lg shadow-md text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors duration-200"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </div>
                                    ) : (
                                        'Donate Now'
                                    )}
                                </button>
                            </div>

                            <div className="flex items-center justify-center pt-2">
                                <svg className="h-5 w-5 text-gray-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                </svg>
                                <span className="text-xs text-gray-500">Secure payment processed by Razorpay</span>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}