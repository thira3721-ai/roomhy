const express = require('express');
const router = express.Router();
const PropertyInquiry = require('../models/PropertyInquiry');
const ChatMessage = require('../models/ChatMessage');

// Send property inquiry request
router.post('/inquiry/send', async (req, res) => {
    try {
        const { propertyId, ownerId, visitorId, visitorEmail, visitorPhone, message } = req.body;
        
        if (!propertyId || !ownerId || !visitorId || !visitorEmail) {
            return res.status(400).json({ error: 'propertyId, ownerId, visitorId, and visitorEmail are required' });
        }

        const inquiryId = 'INQ_' + Date.now();
        
        const inquiry = new PropertyInquiry({
            inquiryId,
            propertyId,
            ownerId,
            visitorId,
            visitorEmail,
            visitorPhone: visitorPhone || '',
            requestMessage: message || ''
        });
        
        await inquiry.save();
        
        // Notify owner
        const io = req.app.get('io');
        io.emit('new-inquiry-request', {
            inquiryId,
            propertyId,
            visitorEmail,
            visitorPhone,
            message
        });
        
        console.log('Inquiry request sent:', inquiryId);
        res.json({ success: true, inquiryId, inquiry });
    } catch (error) {
        console.error('Error sending inquiry:', error);
        res.status(500).json({ error: error.message });
    }
});

// Accept/Reject inquiry
router.post('/inquiry/respond', async (req, res) => {
    try {
        const { inquiryId, status } = req.body;
        
        if (!inquiryId || !status) {
            return res.status(400).json({ error: 'inquiryId and status are required' });
        }

        const validStatuses = ['accepted', 'rejected'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Status must be accepted or rejected' });
        }

        const inquiry = await PropertyInquiry.findOneAndUpdate(
            { inquiryId },
            { 
                status,
                respondedAt: new Date(),
                updatedAt: new Date()
            },
            { new: true }
        );
        
        if (!inquiry) {
            return res.status(404).json({ error: 'Inquiry not found' });
        }

        // Notify via Socket.IO
        const io = req.app.get('io');
        io.emit('inquiry-status-changed', {
            inquiryId,
            status,
            inquiry
        });
        
        console.log('Inquiry response sent:', inquiryId, 'status:', status);
        res.json({ success: true, inquiry });
    } catch (error) {
        console.error('Error responding to inquiry:', error);
        res.status(500).json({ error: error.message });
    }
});

// Send inquiry chat message
router.post('/inquiry/message', async (req, res) => {
    try {
        const { from, inquiryId, message, timestamp } = req.body;
        
        if (!from || !inquiryId || !message) {
            return res.status(400).json({ error: 'from, inquiryId, and message are required' });
        }

        // Verify inquiry exists
        const inquiry = await PropertyInquiry.findOne({ inquiryId });
        if (!inquiry) {
            return res.status(404).json({ error: 'Inquiry not found' });
        }

        const to = from === inquiry.visitorId ? inquiry.ownerId : inquiry.visitorId;
        
        const chatMessage = new ChatMessage({
            from,
            to,
            message,
            roomId: `INQUIRY_${inquiryId}`,
            chatType: 'inquiry',
            inquiryId,
            timestamp: timestamp ? new Date(timestamp) : new Date()
        });
        
        await chatMessage.save();
        
        // Update inquiry to mark chat as started
        await PropertyInquiry.findOneAndUpdate(
            { inquiryId },
            { 
                chatStarted: true,
                messageCount: inquiry.messageCount + 1,
                updatedAt: new Date()
            }
        );
        
        // Broadcast via Socket.IO
        const io = req.app.get('io');
        io.to(`INQUIRY_${inquiryId}`).emit('receive-message', {
            from,
            inquiryId,
            message,
            roomId: `INQUIRY_${inquiryId}`,
            chatType: 'inquiry',
            timestamp: chatMessage.timestamp,
            _id: chatMessage._id
        });
        
        console.log('Inquiry message sent:', inquiryId, 'from', from);
        res.json({ success: true, data: chatMessage });
    } catch (error) {
        console.error('Error sending inquiry message:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get inquiry details
router.get('/inquiry/:inquiryId', async (req, res) => {
    try {
        const { inquiryId } = req.params;
        
        const inquiry = await PropertyInquiry.findOne({ inquiryId });
        if (!inquiry) {
            return res.status(404).json({ error: 'Inquiry not found' });
        }

        res.json({ success: true, inquiry });
    } catch (error) {
        console.error('Error getting inquiry:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get inquiry messages
router.get('/inquiry/:inquiryId/messages', async (req, res) => {
    try {
        const { inquiryId } = req.params;
        const { limit = 50, skip = 0 } = req.query;

        const messages = await ChatMessage.find({ inquiryId })
            .sort({ timestamp: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip));

        res.json({ success: true, messages: messages.reverse() });
    } catch (error) {
        console.error('Error getting inquiry messages:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get inquiries for property
router.get('/inquiry/property/:propertyId', async (req, res) => {
    try {
        const { propertyId } = req.params;
        const { status } = req.query;

        let query = { propertyId };
        if (status) {
            query.status = status;
        }

        const inquiries = await PropertyInquiry.find(query)
            .sort({ createdAt: -1 });

        res.json({ success: true, inquiries });
    } catch (error) {
        console.error('Error getting property inquiries:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get visitor's inquiries
router.get('/inquiry/visitor/:visitorId', async (req, res) => {
    try {
        const { visitorId } = req.params;

        const inquiries = await PropertyInquiry.find({ visitorId })
            .sort({ createdAt: -1 });

        res.json({ success: true, inquiries });
    } catch (error) {
        console.error('Error getting visitor inquiries:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
