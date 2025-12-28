const Enquiry = require('../models/Enquiry');

// Create a new enquiry
exports.createEnquiry = async (req, res) => {
  try {
    // Force status to 'request to connect' if not provided
    const payload = { ...req.body };
    if (!payload.status || payload.status === 'pending') {
      payload.status = 'request to connect';
    }
    const enquiry = await Enquiry.create(payload);
    res.status(201).json(enquiry);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// List all enquiries for an owner
exports.listEnquiries = async (req, res) => {
  try {
    const { ownerLoginId } = req.params;
    const enquiries = await Enquiry.find({ ownerLoginId }).sort({ ts: -1 });
    res.json(enquiries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update enquiry status (accept/reject)
exports.updateEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    // If status is accepted, enable chat
    if (update.status === 'accepted') {
      update.chatOpen = true;
      update.visitAllowed = true;
    }
    if (update.status === 'rejected') {
      update.chatOpen = false;
      update.visitAllowed = false;
    }
    const enquiry = await Enquiry.findByIdAndUpdate(id, update, { new: true });
    if (!enquiry) return res.status(404).json({ error: 'Enquiry not found' });
    res.json(enquiry);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
