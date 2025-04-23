'use client';

import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-white/80 backdrop-blur-sm py-8 border-t border-gray-100 mt-10">
            <div className="container mx-auto px-4">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand Section */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <div className="h-8 w-8 rounded-md bg-indigo-600 flex items-center justify-center">
                                <span className="text-white font-bold">D</span>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Disasterly</h2>
                        </div>
                        <p className="text-sm text-gray-600">
                            Empowering communities to respond and recover from disasters with compassion and efficiency.
                        </p>
                        <div className="flex space-x-4">
                            <a
                                href="https://facebook.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-500 hover:text-indigo-600 transition-colors"
                                aria-label="Facebook"
                            >
                                <Facebook className="h-5 w-5" />
                            </a>
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-500 hover:text-indigo-600 transition-colors"
                                aria-label="Twitter"
                            >
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a
                                href="https://instagram.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-500 hover:text-indigo-600 transition-colors"
                                aria-label="Instagram"
                            >
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a
                                href="https://linkedin.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-500 hover:text-indigo-600 transition-colors"
                                aria-label="LinkedIn"
                            >
                                <Linkedin className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                            Explore
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/about"
                                    className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                                >
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/get-help"
                                    className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                                >
                                    Get Help
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/donate"
                                    className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                                >
                                    Donate
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/volunteer"
                                    className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                                >
                                    Volunteer
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                            Resources
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/faq"
                                    className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                                >
                                    FAQ
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/blog"
                                    className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                                >
                                    Blog
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/privacy"
                                    className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                                >
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/terms"
                                    className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                                >
                                    Terms of Service
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                            Contact
                        </h3>
                        <ul className="space-y-3">
                            <li className="flex items-center">
                                <Mail className="h-5 w-5 text-gray-500 mr-2" />
                                <a
                                    href="mailto:support@disasterly.org"
                                    className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                                >
                                    support@disasterly.org
                                </a>
                            </li>
                            <li className="flex items-center">
                                <Phone className="h-5 w-5 text-gray-500 mr-2" />
                                <a
                                    href="tel:+1234567890"
                                    className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                                >
                                    +1 (234) 567-890
                                </a>
                            </li>
                            <li className="flex items-start">
                                <MapPin className="h-5 w-5 text-gray-500 mr-2 mt-1" />
                                <span className="text-sm text-gray-600">
                  123 Relief Road, Suite 100
                  <br />
                  Hope City, HC 12345
                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="text-center text-sm text-gray-500 mt-8 pt-6 border-t border-gray-100">
                    © 2025 Disasterly. All rights reserved.
                </div>
            </div>
        </footer>
    );
}