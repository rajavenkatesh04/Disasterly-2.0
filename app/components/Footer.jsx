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
        <footer className="bg-white/80 backdrop-blur-sm py-6 border-t border-gray-100 mt-10 ">
            <div className="container mx-auto px-4">

                <div className="text-center text-sm text-gray-500 mt-6 pt-4 border-t border-gray-100">
                    © 2025 Disasterly. All rights reserved.
                </div>
            </div>
        </footer>
    );
}