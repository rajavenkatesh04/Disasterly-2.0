"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
    Menu,
    X,
    Home,
    Bell,
    Heart,
    BookOpen,
    LayoutDashboard,
    CircleUserRound,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LoginButton from "@/app/components/ui/LoginButton";

export default function Navbar() {
    const { data: session } = useSession();
    const userRole = session?.user?.role;

    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { href: "/user", label: "Profile", icon: <CircleUserRound size={16} /> },
        { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
        { href: "/donate", label: "Donate", icon: <Heart size={16} /> },
        { href: "/provide-help", label: "Volunteer", icon: <Heart size={16} /> },
        { href: "/resources", label: "Resources", icon: <BookOpen size={16} /> },
    ];

    // Conditionally add admin-only link
    if (userRole === "admin") {
        navLinks.push({
            href: "/personnel",
            label: "Alerts",
            icon: <Bell size={16} />,
        });
    }

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-300 ${
                scrolled
                    ? "bg-white/95 backdrop-blur-md shadow-md py-2"
                    : "bg-white/80 backdrop-blur-sm py-4"
            }`}
        >
            <div className="container mx-auto px-4 flex justify-between items-center">
                {/* Logo */}
                <a href="/public" className="flex items-center gap-2 group">
                    <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-500 rounded-lg text-white font-bold shadow-md">
                        D
                    </div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent group-hover:from-blue-500 group-hover:to-purple-600 transition-all duration-300">
                        Disasterly
                    </h1>
                </a>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center">
                    <ul className="flex gap-1">
                        {navLinks.map((link) => (
                            <li key={link.href}>
                                <a
                                    href={link.href}
                                    className="relative px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 flex items-center gap-1 overflow-hidden group"
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

                {/* Google Login Button & Mobile Menu Button */}
                <div className="flex items-center gap-2">
                    <LoginButton />
                    <button
                        className="md:hidden flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 text-gray-700 transition-colors duration-200"
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label="Toggle menu"
                    >
                        {isOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="md:hidden overflow-hidden"
                    >
                        <div className="bg-white/95 backdrop-blur-md shadow-md border-t border-gray-100 px-4 py-6">
                            <ul className="flex flex-col gap-4">
                                {navLinks.map((link) => (
                                    <li key={link.href}>
                                        <a
                                            href={link.href}
                                            className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors duration-200"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            {link.icon}
                                            <span>{link.label}</span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
