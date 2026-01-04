const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// ================= UNIFIED CHAT ROUTES =================

// Get or create chat room
router.post('/room/create', chatController.getOrCreateChat);

// Get chat messages and visits
router.get('/messages/:chat_id', chatController.getChatMessages);

// BACKWARD COMPATIBILITY: Get messages with from/to query params
router.get('/messages', async (req, res) => {
    try {
        const { from, to, limit = 500 } = req.query;
        if (!from || !to) {
            return res.status(400).json({ error: 'from and to parameters required' });
        }
        // For backward compatibility, create a chat_id from from/to
        const chat_id = [from, to].sort().join('-');
        
        // Call the existing getChatMessages with chat_id
        req.params.chat_id = chat_id;
        return chatController.getChatMessages(req, res);
    } catch (error) {
        console.error('Error getting messages:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get all chats for a user
router.get('/user/:user_id', chatController.getUserChats);

// Save message (backup)
router.post('/message/save', chatController.saveMessage);

// BACKWARD COMPATIBILITY: Send message (POST to /api/chat/send)
router.post('/send', async (req, res) => {
    try {
        const { from, to, message, timestamp } = req.body;
        if (!from || !to || !message) {
            return res.status(400).json({ error: 'from, to, and message required' });
        }
        
        // Create a chat_id from from/to
        const chat_id = [from, to].sort().join('-');
        
        // Call the existing saveMessage
        req.body.chat_id = chat_id;
        req.body.sender_id = from;
        req.body.sender_name = from;
        req.body.timestamp = timestamp || new Date();
        
        return chatController.saveMessage(req, res);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: error.message });
    }
});

// BACKWARD COMPATIBILITY: Test reply endpoint
router.post('/test-reply', async (req, res) => {
    try {
        const { to, message } = req.body;
        if (!to || !message) {
            return res.status(400).json({ error: 'to and message required' });
        }
        
        // Save a test message from superadmin to the recipient
        const chat_id = ['superadmin', to].sort().join('-');
        
        req.body.chat_id = chat_id;
        req.body.sender_id = 'superadmin';
        req.body.sender_name = 'SuperAdmin';
        req.body.timestamp = new Date();
        
        return chatController.saveMessage(req, res);
    } catch (error) {
        console.error('Error creating test reply:', error);
        res.status(500).json({ error: error.message });
    }
});

// Schedule visit (only for booking chats)
router.post('/visit/schedule', chatController.scheduleVisit);

// Get all chats (Super Admin monitoring)
router.get('/', chatController.getAllChats);

// Close chat
router.put('/:chat_id/close', chatController.closeChat);

module.exports = router;
