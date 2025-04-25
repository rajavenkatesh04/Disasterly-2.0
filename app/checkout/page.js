"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Checkout() {
    const [cart, setCart] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
    });
    const [formError, setFormError] = useState(null);
    const [orderConfirmed, setOrderConfirmed] = useState(false);

    // List of configured domains from next.config.js
    const allowedImageDomains = [
        'lh3.googleusercontent.com',
        'm.media-amazon.com',
        'www.maydaysupplies.com',
    ];

    // Check if image domain is allowed
    const isImageDomainAllowed = (url) => {
        try {
            const hostname = new URL(url).hostname;
            return allowedImageDomains.includes(hostname);
        } catch (e) {
            return false;
        }
    };

    useEffect(() => {
        // Load cart from localStorage
        const storedCart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCart(storedCart);

        // Listen for storage events to sync cart across tabs
        const handleStorageChange = (e) => {
            if (e.key === 'cart') {
                setCart(JSON.parse(e.newValue || '[]'));
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    useEffect(() => {
        // Save cart to localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const updateCartQuantity = (resourceId, newQuantity) => {
        setCart(prev => {
            if (newQuantity <= 0) {
                return prev.filter(item => item._id !== resourceId);
            }
            return prev.map(item =>
                item._id === resourceId ? { ...item, quantity: newQuantity } : item
            );
        });
    };

    const removeFromCart = (resourceId) => {
        setCart(prev => prev.filter(item => item._id !== resourceId));
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckoutSubmit = (e) => {
        e.preventDefault();
        setFormError(null);

        // Basic form validation
        if (!formData.name || !formData.address || !formData.phone) {
            setFormError('Please fill in all fields.');
            return;
        }

        // Simulate checkout process
        setOrderConfirmed(true);
        setCart([]);
        localStorage.setItem('cart', '[]');
    };

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/resources" className="text-gray-600 hover:text-red-600">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="text-2xl sm:text-3xl font-bold text-red-600">Checkout</h1>
                </div>

                {orderConfirmed ? (
                    <div className="bg-green-100 text-green-700 p-6 rounded-lg text-center">
                        <h2 className="text-xl sm:text-2xl font-bold mb-4">Order Confirmed!</h2>
                        <p className="text-sm sm:text-base">Thank you for your purchase. Your disaster preparedness supplies will be delivered soon.</p>
                        <Link href="/resources" className="mt-4 inline-block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm sm:text-base">
                            Back to Supplies
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold mb-4">Cart Summary</h2>
                            {cart.length === 0 ? (
                                <p className="text-gray-600 text-sm sm:text-base">Your cart is empty.</p>
                            ) : (
                                <AnimatePresence>
                                    {cart.map(item => (
                                        <motion.div
                                            key={item._id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ duration: 0.3 }}
                                            className="flex items-center mb-4 border-b pb-4"
                                        >
                                            <div className="w-12 h-12 sm:w-16 sm:h-16 relative mr-2 sm:mr-4">
                                                {item.imageUrl ? (
                                                    isImageDomainAllowed(item.imageUrl) ? (
                                                        <Image
                                                            src={item.imageUrl}
                                                            alt={item.name}
                                                            fill
                                                            className="object-cover rounded"
                                                        />
                                                    ) : (
                                                        <img
                                                            src={item.imageUrl}
                                                            alt={item.name}
                                                            className="w-full h-full object-cover rounded"
                                                        />
                                                    )
                                                ) : (
                                                    <div className="flex items-center justify-center w-full h-full bg-gray-200 rounded">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 sm:h-8 w-6 sm:w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-sm sm:text-base">{item.name}</h3>
                                                <p className="text-gray-600 text-xs sm:text-sm">₹{item.price.toFixed(2)} x {item.quantity}</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={item.quantity}
                                                        onChange={(e) => updateCartQuantity(item._id, parseInt(e.target.value))}
                                                        className="w-16 px-2 py-1 border rounded-lg text-sm"
                                                    />
                                                    <button
                                                        onClick={() => removeFromCart(item._id)}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            )}
                            {cart.length > 0 && (
                                <div className="mt-4">
                                    <p className="font-bold text-sm sm:text-lg">Total: ₹{total}</p>
                                </div>
                            )}
                        </div>

                        <div>
                            <h2 className="text-lg sm:text-xl font-bold mb-4">Shipping Details</h2>
                            {formError && (
                                <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm sm:text-base">
                                    {formError}
                                </div>
                            )}
                            <form onSubmit={handleCheckoutSubmit}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleFormChange}
                                        required
                                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">Address</label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleFormChange}
                                        required
                                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                        rows="4"
                                    ></textarea>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleFormChange}
                                        required
                                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm sm:text-base"
                                >
                                    Place Order
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}