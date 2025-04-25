// models/Resource.js
import mongoose from 'mongoose';

const ResourceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a resource name'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Please provide a resource description'],
    },
    category: {
        type: String,
        required: [true, 'Please specify a category'],
        enum: ['firstaid', 'food', 'water', 'shelter', 'tools', 'hygiene', 'communication', 'other'],
    },
    price: {
        type: Number,
        required: [true, 'Please specify a price'],
        min: 0,
    },
    inStock: {
        type: Number,
        required: [true, 'Please specify available quantity'],
        min: 0,
        default: 0,
    },
    imageUrl: {
        type: String,
    },
    priority: {
        type: Number,
        default: 3, // 1 (highest) to 5 (lowest)
    },
    tags: {
        type: [String],
        default: [],
    },
    expiryDate: {
        type: Date,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.Resource || mongoose.model('Resource', ResourceSchema);