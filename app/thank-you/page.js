"use client";

import { useSearchParams } from "next/navigation";
import { useRef, Suspense } from "react";
import Link from "next/link";

function ThankYouContent() {
    const searchParams = useSearchParams();
    const amount = searchParams.get("amount") || "0";
    const receiptId = searchParams.get("receiptId") || "N/A";
    const name = searchParams.get("name") || "Valued Donor";
    const email = searchParams.get("email") || "N/A";
    const transactionId = searchParams.get("transactionId") || "N/A";
    const disaster = searchParams.get("disaster") || "Disaster Relief";
    const receiptRef = useRef();

    const handlePrint = () => {
        const printContent = receiptRef.current.innerHTML;
        const printWindow = window.open("", "_blank");
        printWindow.document.write(`
            <html>
                <head>
                    <title>Donation Receipt</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        .receipt { max-width: 600px; margin: auto; border: 2px solid #4f46e5; padding: 30px; border-radius: 12px; background: #ffffff; }
                        .header { text-align: center; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; }
                        .header h2 { color: #1f2937; font-size: 24px; margin: 0; }
                        .header p { color: #6b7280; margin: 5px 0; }
                        .details { margin-top: 20px; }
                        .details p { margin: 10px 0; font-size: 16px; }
                        .details strong { color: #1f2937; }
                    </style>
                </head>
                <body>
                    ${printContent}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12">
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
                                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                            />
                        </svg>
                        Back to Home
                    </Link>
                </div>

                <div className="text-center">
                    <h1 className="text-4xl font-bold text-indigo-900">
                        You’re a Lifesaver, {name}!
                    </h1>
                    <p className="mt-4 text-lg text-gray-600">
                        Your generous donation of <span className="font-semibold">₹{amount}</span>{' '}
                        will help rebuild lives affected by {disaster}. Thank you for your incredible
                        kindness!
                    </p>
                </div>

                <div
                    ref={receiptRef}
                    className="mt-8 bg-gray-50 p-6 rounded-lg border-2 border-indigo-600"
                >
                    <div className="header">
                        <h2 className="text-2xl font-semibold text-indigo-900">
                            Donation Receipt
                        </h2>
                        <p className="text-gray-600">Disasterly Relief Fund</p>
                    </div>
                    <div className="details mt-6 space-y-3">
                        <p>
                            <strong>Receipt ID:</strong> {receiptId}
                        </p>
                        <p>
                            <strong>Transaction ID:</strong> {transactionId}
                        </p>
                        <p>
                            <strong>Donor Name:</strong> {name}
                        </p>
                        <p>
                            <strong>Email:</strong> {email}
                        </p>
                        <p>
                            <strong>Disaster:</strong> {disaster}
                        </p>
                        <p>
                            <strong>Amount:</strong> ₹{amount}
                        </p>
                        <p>
                            <strong>Date:</strong>{' '}
                            {new Date().toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                            })}
                        </p>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <button
                        onClick={handlePrint}
                        className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <svg
                            className="h-5 w-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                        </svg>
                        Print Receipt
                    </button>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-gray-600 mb-4">
                        Champions like you make our mission unstoppable. Ready to help even more?
                    </p>
                    <a
                        href="/donate"
                        className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        Donate Again
                    </a>
                </div>

                <div className="mt-8 bg-indigo-100 p-4 rounded-lg text-center">
                    <p className="text-indigo-800 text-sm">
                        Join over 500 donors who’ve helped us raise ₹75,000 this month. Together,
                        we’re transforming lives!
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function ThankYouPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex justify-center items-center">Loading...</div>}>
            <ThankYouContent />
        </Suspense>
    );
}