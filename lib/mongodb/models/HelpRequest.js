// lib/mongodb/models/HelpRequest.js

const mongoose = require('mongoose');
const { Schema } = mongoose;

const HelpRequestSchema = new Schema({
    requestId: {
        type: String,
        required: true,
        unique: true
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    helpType: {
        type: String,
        required: true,
        enum: ['volunteers', 'medical', 'resources', 'donation', 'transport', 'psychosocial', 'technical', 'other']
    },
    skills: {
        type: String,
        trim: true
    },
    availability: {
        type: String,
        required: true
    },
    transportation: String,
    additionalInfo: String,
    status: {
        type: String,
        default: 'pending',
        enum: ['pending', 'approved', 'assigned', 'completed', 'cancelled']
    },
    assignedTo: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: Date
});

// Generate a unique request ID before saving
HelpRequestSchema.pre('save', async function(next) {
    if (this.isNew) {
        // Create a format like HELP-YYYYMMDD-XXXX where XXXX is a random string
        const date = new Date();
        const dateStr = date.getFullYear().toString() +
            (date.getMonth() + 1).toString().padStart(2, '0') +
            date.getDate().toString().padStart(2, '0');
        const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
        this.requestId = `HELP-${dateStr}-${randomStr}`;
    }
    this.updatedAt = Date.now();
    next();
});

// Create indexes for efficient queries
HelpRequestSchema.index({ requestId: 1 });
HelpRequestSchema.index({ helpType: 1 });
HelpRequestSchema.index({ status: 1 });
HelpRequestSchema.index({ location: 1 });
HelpRequestSchema.index({ createdAt: 1 });

module.exports = mongoose.models.HelpRequest || mongoose.model('HelpRequest', HelpRequestSchema);