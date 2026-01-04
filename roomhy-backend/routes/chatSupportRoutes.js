const express = require('express');
const router = express.Router();
const SupportTicket = require('../models/SupportTicket');
const ChatMessage = require('../models/ChatMessage');

// Create support ticket
router.post('/support/create', async (req, res) => {
    try {
        const { from, assignedTo, subject, description, priority } = req.body;
        
        if (!from || !subject) {
            return res.status(400).json({ error: 'from and subject are required' });
        }

        const ticketId = 'TK_' + Date.now();
        
        const ticket = new SupportTicket({
            ticketId,
            from,
            assignedTo: assignedTo || null,
            subject,
            description: description || '',
            priority: priority || 'medium'
        });
        
        await ticket.save();
        
        // Notify via Socket.IO
        const io = req.app.get('io');
        io.emit('new-support-ticket', { 
            ticketId, 
            from, 
            subject,
            priority: ticket.priority
        });
        
        console.log('Support ticket created:', ticketId);
        res.json({ success: true, ticketId, ticket });
    } catch (error) {
        console.error('Error creating support ticket:', error);
        res.status(500).json({ error: error.message });
    }
});

// Send support message
router.post('/support/send', async (req, res) => {
    try {
        const { from, ticketId, assignedTo, message, timestamp } = req.body;
        
        if (!from || !ticketId || !message) {
            return res.status(400).json({ error: 'from, ticketId, and message are required' });
        }

        // Verify ticket exists
        const ticket = await SupportTicket.findOne({ ticketId });
        if (!ticket) {
            return res.status(404).json({ error: 'Support ticket not found' });
        }

        const chatMessage = new ChatMessage({
            from,
            to: assignedTo || ticket.assignedTo || ticket.from,
            message,
            roomId: `SUPPORT_${ticketId}`,
            chatType: 'support',
            ticketId,
            timestamp: timestamp ? new Date(timestamp) : new Date()
        });
        
        await chatMessage.save();
        
        // Update ticket
        await SupportTicket.findOneAndUpdate(
            { ticketId },
            { 
                messageCount: ticket.messageCount + 1,
                respondedAt: ticket.respondedAt || new Date(),
                lastMessage: new Date(),
                updatedAt: new Date()
            }
        );
        
        // Broadcast via Socket.IO
        const io = req.app.get('io');
        io.to(`SUPPORT_${ticketId}`).emit('receive-message', {
            from,
            ticketId,
            message,
            roomId: `SUPPORT_${ticketId}`,
            chatType: 'support',
            timestamp: chatMessage.timestamp,
            _id: chatMessage._id
        });
        
        console.log('Support message sent:', ticketId, 'from', from);
        res.json({ success: true, data: chatMessage });
    } catch (error) {
        console.error('Error sending support message:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update ticket status
router.post('/support/update-status', async (req, res) => {
    try {
        const { ticketId, status } = req.body;
        
        if (!ticketId || !status) {
            return res.status(400).json({ error: 'ticketId and status are required' });
        }

        const validStatuses = ['open', 'in-progress', 'resolved', 'closed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const ticket = await SupportTicket.findOneAndUpdate(
            { ticketId },
            { 
                status,
                closedAt: status === 'closed' ? new Date() : ticket?.closedAt,
                updatedAt: new Date()
            },
            { new: true }
        );
        
        if (!ticket) {
            return res.status(404).json({ error: 'Support ticket not found' });
        }

        // Notify via Socket.IO
        const io = req.app.get('io');
        io.to(`SUPPORT_${ticketId}`).emit('ticket-updated', {
            ticketId,
            status,
            ticket
        });
        
        console.log('Support ticket updated:', ticketId, 'status:', status);
        res.json({ success: true, ticket });
    } catch (error) {
        console.error('Error updating support ticket:', error);
        res.status(500).json({ error: error.message });
    }
});

// Assign ticket to manager
router.post('/support/assign', async (req, res) => {
    try {
        const { ticketId, assignedTo } = req.body;
        
        if (!ticketId || !assignedTo) {
            return res.status(400).json({ error: 'ticketId and assignedTo are required' });
        }

        const ticket = await SupportTicket.findOneAndUpdate(
            { ticketId },
            { 
                assignedTo,
                updatedAt: new Date()
            },
            { new: true }
        );
        
        if (!ticket) {
            return res.status(404).json({ error: 'Support ticket not found' });
        }

        // Notify via Socket.IO
        const io = req.app.get('io');
        io.emit('ticket-assigned', { ticketId, assignedTo });
        
        console.log('Support ticket assigned:', ticketId, 'to', assignedTo);
        res.json({ success: true, ticket });
    } catch (error) {
        console.error('Error assigning support ticket:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get ticket details
router.get('/support/:ticketId', async (req, res) => {
    try {
        const { ticketId } = req.params;
        
        const ticket = await SupportTicket.findOne({ ticketId });
        if (!ticket) {
            return res.status(404).json({ error: 'Support ticket not found' });
        }

        res.json({ success: true, ticket });
    } catch (error) {
        console.error('Error getting support ticket:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get ticket messages
router.get('/support/:ticketId/messages', async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { limit = 50, skip = 0 } = req.query;

        const messages = await ChatMessage.find({ ticketId })
            .sort({ timestamp: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip));

        res.json({ success: true, messages: messages.reverse() });
    } catch (error) {
        console.error('Error getting ticket messages:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get user's tickets
router.get('/support/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { status } = req.query;

        let query = { $or: [{ from: userId }, { assignedTo: userId }] };
        if (status) {
            query.status = status;
        }

        const tickets = await SupportTicket.find(query)
            .sort({ createdAt: -1 });

        res.json({ success: true, tickets });
    } catch (error) {
        console.error('Error getting user tickets:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
