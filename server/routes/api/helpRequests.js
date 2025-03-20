const express = require('express');
const router = express.Router();
const {
    createHelpRequest,
    getAllHelpRequests,
    getHelpRequestById,
    updateRequestStatus,
    addNote
} = require('../../controllers/helpRequestController');

// @route   POST /api/help-requests
// @desc    Create a new help request
// @access  Public
router.post('/', createHelpRequest);

// @route   GET /api/help-requests
// @desc    Get all help requests
// @access  Private (will need auth middleware)
router.get('/', getAllHelpRequests);

// @route   GET /api/help-requests/:id
// @desc    Get help request by ID
// @access  Private
router.get('/:id', getHelpRequestById);

// @route   PUT /api/help-requests/:id/status
// @desc    Update help request status
// @access  Private
router.put('/:id/status', updateRequestStatus);

// @route   POST /api/help-requests/:id/notes
// @desc    Add a note to help request
// @access  Private
router.post('/:id/notes', addNote);

module.exports = router;