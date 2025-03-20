// lib/mongodb/models/Disaster.js

const mongoose = require('mongoose');
const { Schema } = mongoose;

const DisasterSchema = new Schema({
    disasterId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['hurricane', 'earthquake', 'flood', 'fire', 'tornado', 'pandemic', 'other']
    },
    status: {
        type: String,
        default: 'active',
        enum: ['active', 'recovery', 'closed']
    },
    severity: {
        type: String,
        enum: ['low', 'moderate', 'high', 'severe', 'catastrophic']
    },
    locations: [{
        name: String,
        state: String,
        country: String,
        coordinates: {
            lat: Number,
            lng: Number
        },
        affectedArea: String, // Could be a GeoJSON polygon in a production app
        impactLevel: {
            type: String,
            enum: ['minimal', 'moderate', 'severe']
        }
    }],
    startDate: {
        type: Date,
        required: true
    },
    endDate: Date,
    description: String,
    resources: [{
        type: {
            type: String,
            enum: ['shelter', 'food', 'medical', 'volunteers', 'supplies']
        },
        name: String,
        location: String,
        contact: String,
        availableUntil: Date
    }],
    updates: [{
        timestamp: {
            type: Date,
            default: Date.now
        },
        content: String,
        author: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: Date
});

// Generate a unique disaster ID before saving
DisasterSchema.pre('save', async function(next) {
    if (this.isNew) {
        const date = new Date();
        const year = date.getFullYear().toString();
        const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
        this.disasterId = `DSTR-${year}-${randomStr}`;
    }
    this.updatedAt = Date.now();
    next();
});

// Add indexes
DisasterSchema.index({ disasterId: 1 });
DisasterSchema.index({ type: 1 });
DisasterSchema.index({ status: 1 });
DisasterSchema.index({ 'locations.state': 1, 'locations.country': 1 });
DisasterSchema.index({ startDate: 1 });

module.exports = mongoose.models.Disaster || mongoose.model('Disaster', DisasterSchema);