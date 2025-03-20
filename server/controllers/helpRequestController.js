const HelpRequest = require('../models/HelpRequest');

// @desc    Create new help request
// @route   POST /api/help-requests
// @access  Public
exports.createHelpRequest = async (req, res) => {
    try {
        const { type, ...formData } = req.body;

        // Prepare the document based on the form type
        let helpRequestData = {
            requestId: HelpRequest.generateRequestId(),
            requestType: type,
            priority: 'normal', // Will be adjusted based on request type and urgency
            userInfo: {},
            requestDetails: {},
            metadata: {
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
                source: 'web-form'
            }
        };

        // Populate the appropriate fields based on request type
        if (type === 'emergency') {
            helpRequestData.priority = 'critical';
            helpRequestData.userInfo = {
                name: formData.name || 'Anonymous',
                location: formData.location,
                contactMethod: formData.contact
            };
            helpRequestData.requestDetails = {
                situation: formData.situation,
                urgencyLevel: 'critical'
            };
        } else {
            // Support request
            helpRequestData.userInfo = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone
            };
            helpRequestData.requestDetails = {
                helpType: formData.helpType,
                urgencyLevel: formData.urgency,
                detailedDescription: formData.details
            };

            // Set priority based on urgency level
            switch (formData.urgency) {
                case 'critical':
                    helpRequestData.priority = 'critical';
                    break;
                case 'urgent':
                    helpRequestData.priority = 'urgent';
                    break;
                case 'important':
                    helpRequestData.priority = 'important';
                    break;
                default:
                    helpRequestData.priority = 'normal';
            }
        }

        // Calculate expected response time
        helpRequestData.expectedResponseTime = HelpRequest.calculateResponseTime(
            helpRequestData.requestType,
            helpRequestData.requestDetails.urgencyLevel
        );

        // Create and save the new request
        const helpRequest = new HelpRequest(helpRequestData);
        await helpRequest.save();

        // Return success with the request ID and expected response time
        res.status(201).json({
            success: true,
            requestId: helpRequest.requestId,
            expectedResponseTime: helpRequest.expectedResponseTime
        });

    } catch (error) {
        console.error('Error creating help request:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit help request',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Get all help requests
// @route   GET /api/help-requests
// @access  Private (would need auth middleware)
exports.getAllHelpRequests = async (req, res) => {
    try {
        const helpRequests = await HelpRequest.find()
            .sort({ createdAt: -1 })
            .select('-__v');

        res.json({
            success: true,
            count: helpRequests.length,
            data: helpRequests
        });
    } catch (error) {
        console.error('Error fetching help requests:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Get help request by ID
// @route   GET /api/help-requests/:id
// @access  Private
exports.getHelpRequestById = async (req, res) => {
    try {
        const helpRequest = await HelpRequest.findOne({ requestId: req.params.id });

        if (!helpRequest) {
            return res.status(404).json({
                success: false,
                message: 'Help request not found'
            });
        }

        res.json({
            success: true,
            data: helpRequest
        });
    } catch (error) {
        console.error('Error fetching help request:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Update help request status
// @route   PUT /api/help-requests/:id/status
// @access  Private
exports.updateRequestStatus = async (req, res) => {
    try {
        const { status, notes } = req.body;
        const { id } = req.params;

        const helpRequest = await HelpRequest.findOne({ requestId: id });

        if (!helpRequest) {
            return res.status(404).json({
                success: false,
                message: 'Help request not found'
            });
        }

        // Update the status
        helpRequest.status = status;

        // Add to response history
        helpRequest.assignment.responseHistory.push({
            action: `Status changed to ${status}`,
            performedBy: req.body.performedBy || 'System',
            notes: notes || ''
        });

        await helpRequest.save();

        res.json({
            success: true,
            data: helpRequest
        });
    } catch (error) {
        console.error('Error updating help request status:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Add note to help request
// @route   POST /api/help-requests/:id/notes
// @access  Private
exports.addNote = async (req, res) => {
    try {
        const { author, text } = req.body;
        const { id } = req.params;

        const helpRequest = await HelpRequest.findOne({ requestId: id });

        if (!helpRequest) {
            return res.status(404).json({
                success: false,
                message: 'Help request not found'
            });
        }

        // Add note
        helpRequest.assignment.notes.push({
            author,
            text,
            timestamp: new Date()
        });

        await helpRequest.save();

        res.json({
            success: true,
            data: helpRequest.assignment.notes
        });
    } catch (error) {
        console.error('Error adding note:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};