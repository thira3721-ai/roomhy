const Complaint = require('../models/Complaint');

// Get all complaints for a specific tenant
exports.getTenantComplaints = async (req, res) => {
    try {
        const { tenantId } = req.params;
        const complaints = await Complaint.find({ tenantId }).sort({ createdAt: -1 });
        res.json({ success: true, complaints });
    } catch (err) {
        console.error("Get Tenant Complaints Error:", err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Create a new complaint
exports.createComplaint = async (req, res) => {
    try {
        const { tenantId, tenantName, tenantPhone, property, roomNo, bedNo, category, description, priority } = req.body;

        const complaint = new Complaint({
            tenantId,
            tenantName: tenantName || 'Unknown',
            tenantPhone: tenantPhone || 'N/A',
            property: property || 'N/A',
            roomNo: roomNo || 'N/A',
            bedNo: bedNo || 'N/A',
            category: category || 'Other',
            description,
            priority: priority || 'Low',
            status: 'Open'
        });

        await complaint.save();

        res.status(201).json({
            success: true,
            message: 'Complaint submitted successfully',
            complaint
        });
    } catch (err) {
        console.error("Create Complaint Error:", err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update complaint status
exports.updateComplaintStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const complaint = await Complaint.findByIdAndUpdate(
            id,
            { status, updatedAt: new Date() },
            { new: true }
        );
        
        if (!complaint) {
            return res.status(404).json({ success: false, message: 'Complaint not found' });
        }
        
        res.json({ success: true, message: 'Complaint updated', complaint });
    } catch (err) {
        console.error("Update Complaint Status Error:", err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get all complaints
exports.getAllComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find().sort({ createdAt: -1 });
        res.json({ success: true, complaints });
    } catch (err) {
        console.error("Get All Complaints Error:", err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Delete a complaint
exports.deleteComplaint = async (req, res) => {
    try {
        const { id } = req.params;
        
        const complaint = await Complaint.findByIdAndDelete(id);
        if (!complaint) {
            return res.status(404).json({ success: false, message: 'Complaint not found' });
        }
        
        res.json({ success: true, message: 'Complaint deleted successfully' });
    } catch (err) {
        console.error("Delete Complaint Error:", err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
