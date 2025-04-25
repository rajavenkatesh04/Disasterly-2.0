"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, ShoppingCart, Trash2, ArrowRight, Home, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Resources() {
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === 'admin';

    const [isClient, setIsClient] = useState(false);
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showCartModal, setShowCartModal] = useState(false);
    const [cart, setCart] = useState([]);
    const [animateCart, setAnimateCart] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'firstaid',
        price: '',
        inStock: '',
        imageUrl: '',
        priority: 3,
        tags: '',
        expiryDate: ''
    });
    const [formError, setFormError] = useState(null);

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
        setIsClient(true);

        // Load cart from localStorage
        const storedCart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCart(storedCart);

        async function fetchResources() {
            try {
                const response = await fetch('/api/resources');
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const result = await response.json();
                if (result.success) {
                    setResources(result.data || []);
                } else {
                    setError(result.message || 'Failed to fetch supplies');
                    setResources([]);
                }
            } catch (error) {
                console.error('Error fetching supplies:', error);
                setError('Failed to connect to the server');
                setResources([]);
            } finally {
                setLoading(false);
            }
        }

        fetchResources();
    }, []);

    useEffect(() => {
        // Save cart to localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const categories = [
        { id: 'all', name: 'All Supplies' },
        { id: 'firstaid', name: 'First Aid' },
        { id: 'food', name: 'Emergency Food' },
        { id: 'water', name: 'Water & Purification' },
        { id: 'shelter', name: 'Shelter & Protection' },
        { id: 'tools', name: 'Tools & Equipment' },
        { id: 'hygiene', name: 'Hygiene' },
        { id: 'communication', name: 'Communication' },
        { id: 'other', name: 'Other Supplies' },
    ];

    const categoryOptions = [
        'firstaid',
        'food',
        'water',
        'shelter',
        'tools',
        'hygiene',
        'communication',
        'other'
    ];

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setFormError(null);

        try {
            const dataToSend = {
                ...formData,
                price: parseFloat(formData.price) || 0,
                inStock: parseInt(formData.inStock) || 0,
                priority: parseInt(formData.priority) || 3,
                tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
                expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : undefined
            };

            const response = await fetch('/api/resources', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const result = await response.json();
            if (result.success) {
                setResources(prev => [...prev, result.data]);
                setShowModal(false);
                setFormData({
                    name: '',
                    description: '',
                    category: 'firstaid',
                    price: '',
                    inStock: '',
                    imageUrl: '',
                    priority: 3,
                    tags: '',
                    expiryDate: ''
                });
            } else {
                setFormError(result.message || 'Failed to add supply');
            }
        } catch (error) {
            console.error('Error adding supply:', error);
            setFormError('Failed to add supply');
        }
    };

    const addToCart = (resource) => {
        setCart(prev => {
            const existingItem = prev.find(item => item._id === resource._id);
            if (existingItem) {
                if (existingItem.quantity < resource.inStock) {
                    return prev.map(item =>
                        item._id === resource._id ? { ...item, quantity: item.quantity + 1 } : item
                    );
                }
                return prev;
            }
            return [...prev, { ...resource, quantity: 1 }];
        });
        setAnimateCart(true);
        setTimeout(() => setAnimateCart(false), 1000); // Reset animation after 1s
    };

    const updateCartQuantity = (resourceId, newQuantity) => {
        setCart(prev => {
            const resource = resources.find(r => r._id === resourceId);
            if (newQuantity <= 0) {
                return prev.filter(item => item._id !== resourceId);
            }
            if (newQuantity > resource.inStock) {
                return prev;
            }
            return prev.map(item =>
                item._id === resourceId ? { ...item, quantity: newQuantity } : item
            );
        });
    };

    const removeFromCart = (resourceId) => {
        setCart(prev => prev.filter(item => item._id !== resourceId));
    };

    const filteredResources = isClient && Array.isArray(resources) ? resources.filter(resource => {
        const matchesCategory = filter === 'all' || resource.category === filter;
        const matchesSearch =
            resource.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            resource.description?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    }) : [];

    if (!isClient) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="container mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold text-red-600 mb-2">Disaster Preparedness Supplies</h1>
                    <p className="text-gray-600 mb-8">Essential items for floods, earthquakes, and other emergencies</p>
                    <div className="flex justify-center items-center h-64">
                        <div className="h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                {/* Redesigned Header Section */}
                <div className="bg-white shadow-sm rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 bg-red-50 rounded-full">
                            <Link href="/" className="text-red-600">
                                <Home size={24} />
                            </Link>
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl sm:text-3xl font-bold text-red-600">Disaster Preparedness Supplies</h1>
                            <p className="text-gray-600 text-sm sm:text-base">Essential items for floods, earthquakes, and other emergencies</p>
                        </div>
                        <div className="flex gap-3">
                            {isAdmin && (
                                <button
                                    onClick={() => setShowModal(true)}
                                    className="flex items-center justify-center w-10 h-10 bg-red-600 text-white rounded-full shadow-md hover:bg-red-700 transition-colors"
                                    aria-label="Add New Supply"
                                >
                                    <Plus size={20} />
                                </button>
                            )}
                            <button
                                onClick={() => setShowCartModal(true)}
                                className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700 transition-colors relative"
                                aria-label="View Cart"
                            >
                                <motion.div
                                    animate={animateCart ? { scale: [1, 1.2, 1], opacity: [1, 0.8, 1] } : {}}
                                    transition={{ duration: 0.5 }}
                                >
                                    <ShoppingCart size={20} />
                                </motion.div>
                                <span className="absolute -top-1 -right-1 bg-yellow-500 text-xs text-white rounded-full w-5 h-5 flex items-center justify-center">
                                    {cart.reduce((total, item) => total + item.quantity, 0)}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            placeholder="Search supplies..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm sm:text-base"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute right-3 top-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <div className="flex overflow-x-auto space-x-2 pb-2">
                        {categories.map(category => (
                            <button
                                key={category.id}
                                className={`px-3 py-1 sm:px-4 sm:py-2 whitespace-nowrap rounded-full text-xs sm:text-sm font-medium ${
                                    filter === category.id
                                        ? 'bg-red-600 text-white'
                                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                                }`}
                                onClick={() => setFilter(category.id)}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>

                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold">Add New Supply</h2>
                                <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                                    <X size={24} />
                                </button>
                            </div>
                            {formError && (
                                <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
                                    {formError}
                                </div>
                            )}
                            <form onSubmit={handleFormSubmit}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">Name</label>
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
                                    <label className="block text-sm font-medium text-gray-700">Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleFormChange}
                                        required
                                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                        rows="4"
                                    ></textarea>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">Category</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleFormChange}
                                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    >
                                        {categoryOptions.map(option => (
                                            <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">Price (₹)</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleFormChange}
                                        required
                                        min="0"
                                        step="0.01"
                                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">In Stock</label>
                                    <input
                                        type="number"
                                        name="inStock"
                                        value={formData.inStock}
                                        onChange={handleFormChange}
                                        required
                                        min="0"
                                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">Image URL (optional, preferably from Amazon India)</label>
                                    <input
                                        type="url"
                                        name="imageUrl"
                                        value={formData.imageUrl}
                                        onChange={handleFormChange}
                                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">Priority (1-5, 1 is highest)</label>
                                    <input
                                        type="number"
                                        name="priority"
                                        value={formData.priority}
                                        onChange={handleFormChange}
                                        min="1"
                                        max="5"
                                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">Tags (comma-separated, optional)</label>
                                    <input
                                        type="text"
                                        name="tags"
                                        value={formData.tags}
                                        onChange={handleFormChange}
                                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">Expiry Date (optional)</label>
                                    <input
                                        type="date"
                                        name="expiryDate"
                                        value={formData.expiryDate}
                                        onChange={handleFormChange}
                                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                                    >
                                        Add Supply
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {showCartModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold">Your Cart</h2>
                                <button onClick={() => setShowCartModal(false)} className="text-gray-500 hover:text-gray-700">
                                    <X size={24} />
                                </button>
                            </div>
                            {cart.length === 0 ? (
                                <p className="text-gray-600 text-center">Your cart is empty.</p>
                            ) : (
                                <>
                                    <AnimatePresence>
                                        {cart.map(item => (
                                            <motion.div
                                                key={item._id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                transition={{ duration: 0.3 }}
                                                className="flex justify-between items-center mb-4 border-b pb-4"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 relative">
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
                                                            <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-sm sm:text-base">{item.name}</h3>
                                                        <p className="text-gray-600 text-xs sm:text-sm">₹{item.price.toFixed(2)} x {item.quantity}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max={item.inStock}
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
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                    <div className="flex justify-between items-center mt-4">
                                      <span className="font-bold text-sm sm:text-base">
                                        Total: ₹{cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}
                                      </span>
                                        <Link
                                            href="/checkout"
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm sm:text-base"
                                            onClick={() => setShowCartModal(false)}
                                        >
                                            Proceed to Checkout
                                            <ArrowRight size={16} />
                                        </Link>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="text-xl font-medium">{error}</p>
                        <p className="text-sm mt-2">Please try again later</p>
                    </div>
                ) : filteredResources.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredResources.map(resource => (
                            <div key={resource._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                                <div className="relative h-32 sm:h-48 bg-gray-200">
                                    {resource.imageUrl ? (
                                        <div className="relative h-full w-full">
                                            {isImageDomainAllowed(resource.imageUrl) ? (
                                                <Image
                                                    src={resource.imageUrl}
                                                    alt={resource.name || 'Supply image'}
                                                    fill
                                                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <img
                                                    src={resource.imageUrl}
                                                    alt={resource.name || 'Supply image'}
                                                    className="w-full h-full object-cover"
                                                />
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center h-full bg-gray-200">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 sm:h-12 w-8 sm:w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    )}
                                    {resource.inStock <= 5 && resource.inStock > 0 && (
                                        <span className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                                          Only {resource.inStock} left
                                        </span>
                                    )}
                                    {resource.inStock === 0 && (
                                        <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                          Out of Stock
                                        </span>
                                    )}
                                    {resource.priority === 1 && (
                                        <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                                          Critical
                                        </span>
                                    )}
                                </div>
                                <div className="p-4">
                                    <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">{resource.category}</span>
                                    <h3 className="font-bold text-sm sm:text-base text-gray-900 mt-1">{resource.name}</h3>
                                    <p className="text-gray-600 text-xs sm:text-sm mt-1 line-clamp-2">{resource.description}</p>
                                    <div className="mt-4 flex flex-col gap-2">
                                        <span className="font-bold text-sm sm:text-base text-gray-900">₹{resource.price?.toFixed(2) || '0.00'}</span>
                                        <button
                                            onClick={() => addToCart(resource)}
                                            className={`w-full px-3 py-1 rounded text-xs sm:text-sm font-medium flex items-center justify-center gap-2 ${
                                                resource.inStock > 0
                                                    ? 'bg-red-600 text-white hover:bg-red-700'
                                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            }`}
                                            disabled={resource.inStock === 0}
                                        >
                                            <ShoppingCart size={14} />
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-xl font-medium">No supplies found</p>
                        <p className="text-sm mt-2">Try adjusting your search or filter criteria</p>
                    </div>
                )}
            </div>
        </div>
    );
}