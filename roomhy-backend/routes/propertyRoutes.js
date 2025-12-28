const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Get All Properties (Protected)
router.get('/', protect, propertyController.getAllProperties);

// Superadmin publishes property
router.post('/:id/publish', protect, authorize('superadmin'), propertyController.publishProperty);

// Submit property enquiry (from list.html)
router.post('/property-enquiry/submit', propertyController.submitEnquiry);

module.exports = router;
