"use client";

import { signIn } from "next-auth/react";
import { Suspense } from "react";
import { useState } from "react";

function SignInContent({ callbackUrl }) {
    const [error, setError] = useState("");

    const handleGoogleSignIn = async () => {
        try {
            await signIn("google", { callbackUrl });
        } catch (err) {
            setError("Failed to sign in. Please try again.");
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                <div className="flex flex-col items-center mb-8">
                    <h1 className="text-xl font-medium text-gray-700">Sign in</h1>
                    <p className="text-gray-500 text-sm mt-2">Continue to your account</p>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                <button
                    onClick={handleGoogleSignIn}
                    className="w-full flex justify-center items-center py-3 px-4 border border-gray-200 rounded-full shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 mb-6"
                >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                        <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                        />
                        <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                    </svg>
                    Sign in with Google
                </button>

                <div className="border-t border-gray-200 pt-6">
                    <p className="text-xs text-center text-gray-500">
                        By continuing, you agree to our <a href="#" className="text-blue-500 hover:text-blue-700">Terms of Service</a> and <a href="#" className="text-blue-500 hover:text-blue-700">Privacy Policy</a>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function SignInPage() {
    const callbackUrl = "/"; // Hardcoded to default to /user

    return (
        <Suspense fallback={<div className="min-h-screen flex justify-center items-center">Loading...</div>}>
            <SignInContent callbackUrl={callbackUrl} />
        </Suspense>
    );
}
