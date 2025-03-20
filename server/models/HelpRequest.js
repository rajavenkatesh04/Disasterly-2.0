const mongoose = require('mongoose');

// Define the schema for help request notes
const NoteSchema = new mongoose.Schema({
    author: String,
    text: String,
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Define the schema for response history
const ResponseHistorySchema = new mongoose.Schema({
    action: String,
    performedBy: String,
    timestamp: {
        type: Date,
        default: Date.now
    },
    notes: String
});

// Main Help Request Schema
const HelpRequestSchema = new mongoose.Schema({
    requestId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    requestType: {
        type: String,
        enum: ["emergency", "support"],
        required: true
    },
    status: {
        type: String,
        enum: ["new", "assigned", "in-progress", "resolved", "closed", "escalated"],
        default: "new"
    },
    priority: {
        type: String,
        enum: ["critical", "urgent", "important", "normal"],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    expectedResponseTime: {
        type: Date,
        required: true
    },

    // User Information
    userInfo: {
        name: {
            type: String,
            required: true
        },
        email: String,
        phone: String,
        location: String,
        contactMethod: String
    },

    // Request Details
    requestDetails: {
        helpType: {
            type: String,
            enum: ["evacuation", "shelter", "medical", "supplies", "loved-ones", "other"]
        },
        situation: String,
        urgencyLevel: {
            type: String,
            enum: ["critical", "urgent", "important", "planning"]
        },
        detailedDescription: String
    },

    // Assignment and Resolution
    assignment: {
        assignedTo: String,
        assignedAt: Date,
        notes: [NoteSchema],
        responseHistory: [ResponseHistorySchema]
    },

    // Metadata
    metadata: {
        ipAddress: String,
        userAgent: String,
        deviceInfo: String,
        locationCoordinates: {
            latitude: Number,
            longitude: Number
        },
        source: {
            type: String,
            default: "web-form"
        }
    }
});

// Set up automatic updating of the updatedAt field
HelpRequestSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Helper function to calculate expected response time
HelpRequestSchema.statics.calculateResponseTime = function(requestType, urgencyLevel) {
    let responseTimeHours = 24; // Default for normal priority

    if (requestType === "emergency" || urgencyLevel === "critical") {
        responseTimeHours = 0.25; // 15 minutes
    } else if (urgencyLevel === "urgent") {
        responseTimeHours = 1; // 1 hour
    } else if (urgencyLevel === "important") {
        responseTimeHours = 4; // 4 hours
    }

    const expectedResponseTime = new Date();
    expectedResponseTime.setHours(expectedResponseTime.getHours() + responseTimeHours);
    return expectedResponseTime;
};

// Helper method to generate a request ID
HelpRequestSchema.statics.generateRequestId = function() {
    const timestamp = new Date().getTime().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `DIS-${timestamp.substring(timestamp.length - 5)}-${randomStr}`;
};

module.exports = mongoose.model('HelpRequest', HelpRequestSchema);