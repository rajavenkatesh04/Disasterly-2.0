"use client";
import { Heart, Mail, Phone, Twitter, ExternalLink, BookOpen } from "lucide-react";

export default function Footer() {
    const footerLinks = [
        { href: "/map", label: "Map", icon: <ExternalLink size={14} /> },
        { href: "/gethelp", label: "Get Help", icon: <Heart size={14} /> },
        { href: "/contacts", label: "Emergency Contacts", icon: <Phone size={14} /> },
        { href: "/about", label: "About Us", icon: <BookOpen size={14} /> },
    ];

    return (
        <footer className="bg-white/80 backdrop-blur-sm py-6 border-t border-gray-100 mt-25 ">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Section 1: Logo and Mission Statement */}
                    <div className="flex flex-col items-center md:items-start">
                        <a href="/public" className="flex items-center gap-2 group">
                            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-500 rounded-lg text-white font-bold shadow-md">
                                D
                            </div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent group-hover:from-blue-500 group-hover:to-purple-600 transition-all duration-300">
                                Disasterly
                            </h1>
                        </a>
                        <p className="mt-2 text-sm text-gray-600 text-center md:text-left">
                            Dedicated to providing immediate assistance and connecting people during times of crisis.
                        </p>
                    </div>

                    {/* Section 2: Navigation Links */}
                    <div className="flex flex-col items-center md:items-start">
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">Quick Links</h2>
                        <ul className="space-y-1">
                            {footerLinks.map((link) => (
                                <li key={link.href}>
                                    <a
                                        href={link.href}
                                        className="relative px-3 py-1.5 text-sm text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 flex items-center gap-1.5 overflow-hidden group"
                                    >
                                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute inset-0 bg-gradient-to-r from-purple-50 to-blue-50 z-0"></span>
                                        <span className="z-10 flex items-center gap-1.5">
                                            {link.icon}
                                            {link.label}
                                        </span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Section 3: Contact Info */}
                    <div className="flex flex-col items-center md:items-start">
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">Contact Us</h2>
                        <div className="space-y-1">
                            <a href="mailto:support@disasterrelief.org" className="relative px-3 py-1.5 text-sm text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 flex items-center gap-1.5 overflow-hidden group">
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute inset-0 bg-gradient-to-r from-purple-50 to-blue-50 z-0"></span>
                                <span className="z-10 flex items-center gap-1.5">
                                    <Mail size={14} />
                                    support@disasterrelief.org
                                </span>
                            </a>
                            <a href="tel:+18001234567" className="relative px-3 py-1.5 text-sm text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 flex items-center gap-1.5 overflow-hidden group">
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute inset-0 bg-gradient-to-r from-purple-50 to-blue-50 z-0"></span>
                                <span className="z-10 flex items-center gap-1.5">
                                    <Phone size={14} />
                                    +1 (800) 123-4567
                                </span>
                            </a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="relative px-3 py-1.5 text-sm text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 flex items-center gap-1.5 overflow-hidden group">
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute inset-0 bg-gradient-to-r from-purple-50 to-blue-50 z-0"></span>
                                <span className="z-10 flex items-center gap-1.5">
                                    <Twitter size={14} />
                                    Follow us on Twitter
                                </span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Footer Bottom */}
                <div className="text-center text-sm text-gray-500 mt-6 pt-4 border-t border-gray-100">
                    © 2025 Disasterly. All rights reserved.
                </div>
            </div>
        </footer>
    );
}