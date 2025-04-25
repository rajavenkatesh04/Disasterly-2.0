"use client";

import { useState, useRef, useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { LogOut, ChevronDown } from "lucide-react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

// Avatar components incorporated directly without cn utility
function Avatar({ className = "", ...props }) {
    return (
        <AvatarPrimitive.Root
            data-slot="avatar"
            className={`relative flex size-8 shrink-0 overflow-hidden rounded-full ${className}`}
            {...props}
        />
    );
}

function AvatarImage({ className = "", ...props }) {
    return (
        <AvatarPrimitive.Image
            data-slot="avatar-image"
            className={`aspect-square size-full ${className}`}
            {...props}
        />
    );
}

function AvatarFallback({ className = "", ...props }) {
    return (
        <AvatarPrimitive.Fallback
            data-slot="avatar-fallback"
            className={`bg-muted flex size-full items-center justify-center rounded-full ${className}`}
            {...props}
        />
    );
}

export default function LoginButton() {
    const { data: session } = useSession();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [imageError, setImageError] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Reset image error state when session changes
    useEffect(() => {
        setImageError(false);
    }, [session]);

    // Get time-based greeting
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    };

    // User initials for the avatar fallback
    const userInitials = session?.user?.name
        ? session.user.name.split(' ').map(n => n[0]).join('').toUpperCase()
        : 'U';

    if (!session) {
        return (
            <button
                onClick={() => signIn("google")}
                className="flex items-center gap-2 border-green-800 bg-green-200 text-green-600 hover:bg-green-300 text-white-600 px-3 py-2 rounded-full transition duration-200"
            >
                {/* Avatar for mobile mode */}
                <Avatar className="h-8 w-8 border border-gray-200 md:hidden">
                    <AvatarFallback>Login</AvatarFallback>
                </Avatar>
                {/* Full button for desktop mode */}
                <span className="hidden md:inline-flex items-center gap-2">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Sign In
                </span>
            </button>
        );
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-full transition duration-200"
            >
                {/* Avatar for both mobile and desktop */}
                <Avatar className="h-8 w-8 border border-gray-200">
                    {!imageError && session.user.image && (
                        <AvatarImage
                            src={session.user.image}
                            alt={session.user.name || "User"}
                            onError={() => setImageError(true)}
                        />
                    )}
                    <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
                {/* Greeting and user name for desktop only */}
                <span className="hidden md:inline text-sm font-medium">
                    {getGreeting()}, {session.user.name?.split(' ')[0]}
                </span>
                <ChevronDown size={16} className={`hidden md:inline text-gray-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown menu */}
            {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-100">
                    <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm text-gray-500">Signed in as</p>
                        <p className="text-sm font-medium text-gray-900 truncate">{session.user.email}</p>
                    </div>
                    <a
                        href="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                        Dashboard
                    </a>
                    <a
                        href="/user"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                        Profile
                    </a>
                    <button
                        onClick={() => signOut()}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                    >
                        <LogOut size={14} />
                        Sign Out
                    </button>
                </div>
            )}
        </div>
    );
}