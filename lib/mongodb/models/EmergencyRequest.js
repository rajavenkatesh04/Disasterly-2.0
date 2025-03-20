// lib/mongodb/models/EmergencyRequest.js

const mongoose = require('mongoose');
const { Schema } = mongoose;

const EmergencyRequestSchema = new Schema({
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
    contactInfo: {
        email: String,
        phone: {
            type: String,
            required: true
        },
        alternatePhone: String
    },
    location: {
        address: String,
        city: String,
        state: String,
        postalCode: String,
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    needType: {
        type: String,
        required: true,
        enum: ['shelter', 'food', 'medical', 'evacuation', 'supplies', 'rescue', 'other']
    },
    urgency: {
        type: String,
        required: true,
        enum: ['critical', 'high', 'medium', 'low']
    },
    numberOfPeople: {
        type: Number,
        default: 1,
        min: 1
    },
    specialNeeds: {
        medicalConditions: Boolean,
        disabilities: Boolean,
        elderly: Boolean,
        infants: Boolean,
        details: String
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'new',
        enum: ['new', 'assigned', 'inProgress', 'resolved', 'closed', 'cancelled']
    },
    assignedHelpers: [{
        type: Schema.Types.ObjectId,
        ref: 'HelpRequest'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: Date,
    resolvedAt: Date
});

// Generate a unique request ID before saving
EmergencyRequestSchema.pre('save', async function(next) {
    if (this.isNew) {
        // Create a format like SOS-YYYYMMDD-XXXX where XXXX is a random string
        const date = new Date();
        const dateStr = date.getFullYear().toString() +
            (date.getMonth() + 1).toString().padStart(2, '0') +
            date.getDate().toString().padStart(2, '0');
        const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
        this.requestId = `SOS-${dateStr}-${randomStr}`;
    }
    this.updatedAt = Date.now();
    next();
});

// Add indexes for efficient querying
EmergencyRequestSchema.index({ requestId: 1 });
EmergencyRequestSchema.index({ 'location.city': 1, 'location.state': 1 });
EmergencyRequestSchema.index({ urgency: 1 });
EmergencyRequestSchema.index({ status: 1 });
EmergencyRequestSchema.index({ needType: 1 });
EmergencyRequestSchema.index({ createdAt: 1 });

module.exports = mongoose.models.EmergencyRequest || mongoose.model('EmergencyRequest', EmergencyRequestSchema);