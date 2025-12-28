const Property = require('../models/Property');
const Enquiry = require('../models/Enquiry');
const Employee = require('../models/Employee');
const Notification = require('../models/Notification');

// Get ALL Properties (For Super Admin & Area Manager lists)
exports.getAllProperties = async (req, res) => {
    try {
        // Populate owner details to show name and phone
        const properties = await Property.find()
            .populate('owner', 'name phone email')
            .sort({ createdAt: -1 }); // Newest first

        res.json({ success: true, properties });
    } catch (err) {
        console.error("Get Properties Error:", err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Publish property (Super Admin action)
exports.publishProperty = async (req, res) => {
    try {
        const propId = req.params.id;
        const property = await Property.findById(propId);
        if (!property) return res.status(404).json({ message: 'Property not found' });

        property.status = 'active';
        property.isPublished = true;
        await property.save();

        res.json({ success: true, property });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Submit property enquiry (from list.html)
exports.submitEnquiry = async (req, res) => {
    try {
        const enquiryData = req.body;

        // Find area manager based on city/locality
        const city = enquiryData.city || enquiryData.locality;
        let assignedManager = null;

        if (city) {
            // Try to find area manager by city or area code
            assignedManager = await Employee.findOne({
                role: 'areamanager',
                $or: [
                    { city: new RegExp(city, 'i') },
                    { area: new RegExp(city, 'i') },
                    { areaCode: new RegExp(city.substring(0, 2), 'i') },
                    { locationCode: new RegExp(city.substring(0, 2), 'i') }
                ],
                isActive: true
            });
        }

        // If no specific manager found, assign to first available area manager
        if (!assignedManager) {
            assignedManager = await Employee.findOne({
                role: 'areamanager',
                isActive: true
            });
        }

        // Create the enquiry
        const enquiry = new Enquiry({
            ...enquiryData,
            status: 'pending_review',
            assignedTo: assignedManager ? assignedManager.loginId : null,
            ts: Date.now()
        });

        await enquiry.save();

        // Send notification to area manager if assigned
        if (assignedManager) {
            const notification = new Notification({
                to: assignedManager.loginId,
                from: 'SYSTEM',
                type: 'property_enquiry',
                title: 'New Property Enquiry',
                message: `New property enquiry from ${enquiryData.owner_name || 'Unknown'} for ${enquiryData.property_name || 'Property'} in ${city || 'Unknown location'}`,
                data: {
                    enquiryId: enquiry._id,
                    propertyName: enquiryData.property_name,
                    ownerName: enquiryData.owner_name,
                    city: city
                },
                read: false,
                createdAt: new Date()
            });

            await notification.save();
        }

        res.json({
            success: true,
            message: 'Property enquiry submitted successfully',
            enquiry: enquiry,
            assignedTo: assignedManager ? `${assignedManager.name} (${assignedManager.loginId})` : 'No area manager found'
        });

    } catch (err) {
        console.error('Submit Enquiry Error:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to submit enquiry',
            error: err.message
        });
    }
};
