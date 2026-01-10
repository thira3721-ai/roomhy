const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// Get messages for a room
router.get('/messages/:room_id', chatController.getMessages);

// Mark messages as read
router.post('/mark-read/:room_id', chatController.markAsRead);

// Get unread count
router.get('/unread/:room_id', chatController.getUnreadCount);

// Delete a message
router.delete('/message/:message_id', chatController.deleteMessage);

module.exports = router;
