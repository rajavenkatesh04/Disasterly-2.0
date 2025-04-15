'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DonatePage() {
    const [amount, setAmount] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [disaster, setDisaster] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [cardHolder, setCardHolder] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [cardBrand, setCardBrand] = useState('');
    const router = useRouter();

    const predefinedAmounts = [100, 500, 1000, 5000];

    // Demo disasters with goals and raised amounts
    const disasters = [
        { name: 'Assam Floods 2025', goal: 100000, raised: 75000 },
        { name: 'Cyclone Amphan Relief', goal: 150000, raised: 90000 },
        { name: 'Kerala Landslides 2024', goal: 80000, raised: 60000 },
        { name: 'Odisha Cyclone 2024', goal: 120000, raised: 50000 },
        { name: 'Tamil Nadu Floods 2024', goal: 200000, raised: 140000 },
    ];

    // Get current disaster’s goal and raised amount
    const currentDisaster = disasters.find(d => d.name === disaster) || disasters[0];

    // Detect card brand
    const detectCardBrand = (number) => {
        const cleaned = number.replace(/\D/g, '');
        if (/^4/.test(cleaned)) return 'visa';
        if (/^5[1-5]/.test(cleaned)) return 'mastercard';
        if (/^6(?:011|5)/.test(cleaned)) return 'discover';
        if (/^50|^60|^652[1-2]|^64[0-8]|^639|^65|^66|^67|^68|^69/.test(cleaned)) return 'rupay';
        return '';
    };

    // Format card number
    const formatCardNumber = (number) => {
        const cleaned = number.replace(/\D/g, '');
        const chunks = cleaned.match(/.{1,4}/g);
        return chunks ? chunks.join(' ') : cleaned;
    };

    const handleCardNumberChange = (e) => {
        const value = e.target.value;
        const cleaned = value.replace(/\D/g, '').slice(0, 16);
        setCardNumber(formatCardNumber(cleaned));
        setCardBrand(detectCardBrand(cleaned));
    };

    // Validate expiry
    const validateExpiry = (value) => {
        const [month, year] = value.split('/').map(v => parseInt(v));
        const currentYear = new Date().getFullYear() % 100;
        const currentMonth = new Date().getMonth() + 1;
        if (month >= 1 && month <= 12 && year >= currentYear) {
            if (year === currentYear && month < currentMonth) return false;
            return true;
        }
        return false;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        if (!amount || amount <= 0) {
            setMessage('Please enter a valid donation amount');
            return;
        }
        if (!name.trim()) {
            setMessage('Please enter your name');
            return;
        }
        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setMessage('Please enter a valid email');
            return;
        }
        if (!disaster) {
            setMessage('Please select a disaster');
            return;
        }
        if (cardNumber.replace(/\D/g, '').length !== 16) {
            setMessage('Please enter a valid 16-digit card number');
            return;
        }
        if (!expiry || !validateExpiry(expiry)) {
            setMessage('Please enter a valid expiry date (MM/YY)');
            return;
        }
        if (!cvv || cvv.length !== 3 || !/^\d{3}$/.test(cvv)) {
            setMessage('Please enter a valid 3-digit CVV');
            return;
        }
        if (!cardHolder.trim()) {
            setMessage('Please enter the cardholder name');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/donate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: parseInt(amount),
                    name,
                    email,
                    disaster,
                    cardNumber: cardNumber.replace(/\D/g, ''),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to process donation');
            }

            router.push(
                `/thank-you?amount=${amount}&receiptId=${data.receiptId}&name=${encodeURIComponent(
                    name
                )}&email=${encodeURIComponent(email)}&transactionId=${data.transactionId}&disaster=${encodeURIComponent(
                    disaster
                )}`
            );
        } catch (error) {
            setMessage(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">
            <main className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <div className="mb-6">
                    <Link
                        href="/"
                        className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                        <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                        Back to Home
                    </Link>
                </div>

                {/* Hero Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-indigo-900">
                        Support Disaster Relief
                    </h1>
                    <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                        Your donation brings hope to communities hit by disasters. Choose a cause and make a difference today!
                    </p>
                    <div className="mt-6 flex justify-center gap-4">
                        <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                            500+ donors this month
                        </div>
                        <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                            ₹{currentDisaster.raised.toLocaleString()} raised of ₹
                            {currentDisaster.goal.toLocaleString()} goal
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Donation Form */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 md:p-8">
                        <h2 className="text-2xl font-semibold text-indigo-900 mb-4">
                            Your Donation Counts
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Every rupee helps provide essentials like food, shelter, and medical aid.
                        </p>

                        {message && (
                            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-600 flex items-start rounded-lg">
                                <svg
                                    className="h-5 w-5 mr-2 mt-0.5"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <span>{message}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Name and Email */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label
                                        htmlFor="name"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Your Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-200"
                                        placeholder="Enter your name"
                                        required
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="email"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-200"
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Disaster Selection */}
                            <div>
                                <label
                                    htmlFor="disaster"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Select Disaster
                                </label>
                                <select
                                    id="disaster"
                                    value={disaster}
                                    onChange={(e) => setDisaster(e.target.value)}
                                    className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-200"
                                    required
                                >
                                    <option value="">Choose a disaster...</option>
                                    {disasters.map((d) => (
                                        <option key={d.name} value={d.name}>
                                            {d.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Donation Amount */}
                            <div>
                                <label
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Donation Amount (INR)
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                                    {predefinedAmounts.map((presetAmount) => (
                                        <button
                                            key={presetAmount}
                                            type="button"
                                            onClick={() => setAmount(presetAmount.toString())}
                                            className={`py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 border-2 ${
                                                amount === presetAmount.toString()
                                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                                                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-indigo-50 hover:border-indigo-300'
                                            }`}
                                        >
                                            ₹{presetAmount}
                                        </button>
                                    ))}
                                </div>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500">
                                        ₹
                                    </span>
                                    <input
                                        type="number"
                                        id="amount"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 pl-10 pr-12 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-200"
                                        placeholder="Custom amount"
                                        min="1"
                                        required
                                    />
                                    <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500">
                                        INR
                                    </span>
                                </div>
                            </div>

                            {/* Card Details */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-700">
                                    Payment Details
                                </h3>
                                <div>
                                    <label
                                        htmlFor="cardNumber"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Card Number
                                    </label>
                                    <div className="relative mt-1">
                                        <input
                                            type="text"
                                            id="cardNumber"
                                            value={cardNumber}
                                            onChange={handleCardNumberChange}
                                            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-200 pr-12"
                                            placeholder="1234 5678 9012 3456"
                                            maxLength="19"
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                                            {cardBrand === 'visa' && (
                                                <svg
                                                    className="h-6 w-8"
                                                    viewBox="0 0 24 16"
                                                    fill="none"
                                                >
                                                    <rect
                                                        width="24"
                                                        height="16"
                                                        rx="2"
                                                        fill="#00579F"
                                                    />
                                                    <path
                                                        d="M8 12l2-6h2l-2 6H8zm4 0l2-6h2l-2 6h-2zm4 0l2-6h2l-2 6h-2z"
                                                        fill="#FFFFFF"
                                                    />
                                                </svg>
                                            )}
                                            {cardBrand === 'mastercard' && (
                                                <svg
                                                    className="h-6 w-8"
                                                    viewBox="0 0 24 16"
                                                    fill="none"
                                                >
                                                    <rect
                                                        width="24"
                                                        height="16"
                                                        rx="2"
                                                        fill="#000000"
                                                    />
                                                    <circle
                                                        cx="9"
                                                        cy="8"
                                                        r="5"
                                                        fill="#EB001B"
                                                        fillOpacity="0.8"
                                                    />
                                                    <circle
                                                        cx="15"
                                                        cy="8"
                                                        r="5"
                                                        fill="#F79E1B"
                                                        fillOpacity="0.8"
                                                    />
                                                </svg>
                                            )}
                                            {cardBrand === 'discover' && (
                                                <svg
                                                    className="h-6 w-8"
                                                    viewBox="0 0 24 16"
                                                    fill="none"
                                                >
                                                    <rect
                                                        width="24"
                                                        height="16"
                                                        rx="2"
                                                        fill="#FF6200"
                                                    />
                                                    <path
                                                        d="M6 8h12M12 6v4"
                                                        stroke="#FFFFFF"
                                                        strokeWidth="2"
                                                    />
                                                </svg>
                                            )}
                                            {cardBrand === 'rupay' && (
                                                <svg
                                                    className="h-6 w-8"
                                                    viewBox="0 0 24 16"
                                                    fill="none"
                                                >
                                                    <rect
                                                        width="24"
                                                        height="16"
                                                        rx="2"
                                                        fill="#003087"
                                                    />
                                                    <path
                                                        d="M8 8h8M12 6v4"
                                                        stroke="#FFFFFF"
                                                        strokeWidth="2"
                                                    />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label
                                            htmlFor="expiry"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Expiry (MM/YY)
                                        </label>
                                        <input
                                            type="text"
                                            id="expiry"
                                            value={expiry}
                                            onChange={(e) => {
                                                let value = e.target.value.replace(/\D/g, '');
                                                if (value.length >= 2)
                                                    value = value.slice(0, 2) + '/' + value.slice(2);
                                                setExpiry(value.slice(0, 5));
                                            }}
                                            className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-200"
                                            placeholder="MM/YY"
                                            maxLength="5"
                                        />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="cvv"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            CVV
                                        </label>
                                        <input
                                            type="text"
                                            id="cvv"
                                            value={cvv}
                                            onChange={(e) =>
                                                setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))
                                            }
                                            className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-200"
                                            placeholder="123"
                                            maxLength="3"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label
                                        htmlFor="cardHolder"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Cardholder Name
                                    </label>
                                    <input
                                        type="text"
                                        id="cardHolder"
                                        value={cardHolder}
                                        onChange={(e) => setCardHolder(e.target.value)}
                                        className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-200"
                                        placeholder="Full name on card"
                                    />
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-600 mb-2">
                                    We’re at{' '}
                                    {(
                                        (currentDisaster.raised / currentDisaster.goal) *
                                        100
                                    ).toFixed(1)}
                                    % of our goal for {currentDisaster.name}!
                                </p>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                        className="bg-indigo-600 h-2.5 rounded-full"
                                        style={{
                                            width: `${
                                                (currentDisaster.raised / currentDisaster.goal) * 100
                                            }%`,
                                        }}
                                    ></div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 px-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors duration-200"
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center">
                                        <svg
                                            className="animate-spin h-5 w-5 mr-3 text-white"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            />
                                        </svg>
                                        Processing...
                                    </div>
                                ) : (
                                    'Pay Now'
                                )}
                            </button>
                        </form>

                        {/* Trust Signals */}
                        <div className="mt-6 flex items-center justify-center text-gray-500 text-sm">
                            <svg
                                className="h-5 w-5 mr-1"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            Secure payment processing
                        </div>
                    </div>

                    {/* Impact and Testimonials */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-indigo-100 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-indigo-900 mb-3">
                                Your Impact
                            </h3>
                            <ul className="text-gray-600 space-y-2 text-sm">
                                <li className="flex items-start">
                                    <svg
                                        className="h-5 w-5 text-green-500 mr-2 mt-0.5"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    ₹500 provides meals for a family of 4 for a week.
                                </li>
                                <li className="flex items-start">
                                    <svg
                                        className="h-5 w-5 text-green-500 mr-2 mt-0.5"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    ₹1000 funds emergency medical supplies.
                                </li>
                                <li className="flex items-start">
                                    <svg
                                        className="h-5 w-5 text-green-500 mr-2 mt-0.5"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    ₹5000 rebuilds a temporary shelter.
                                </li>
                            </ul>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-md">
                            <p className="text-gray-600 italic">
                                “Disasterly’s quick response saved my community after the floods.
                                Donating here makes a real difference.”
                            </p>
                            <p className="mt-3 text-sm font-semibold text-indigo-900">
                                — Priya S., Survivor
                            </p>
                        </div>
                    </div>
                </div>

                {/* Urgency Banner */}
                <div className="mt-12 bg-red-100 p-6 rounded-lg text-center">
                    <p className="text-red-800 font-medium">
                        Disaster victims need help now. Your donation can save lives today.
                    </p>
                    <button
                        onClick={() => document.getElementById('amount')?.focus()}
                        className="mt-4 inline-block bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
                    >
                        Donate Now
                    </button>
                </div>
            </main>
        </div>
    );
}