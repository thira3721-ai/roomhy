const express = require('express');
const router = express.Router();
const GroupChat = require('../models/GroupChat');
const ChatMessage = require('../models/ChatMessage');

// Create group
router.post('/group/create', async (req, res) => {
    try {
        const { name, members, createdBy, description } = req.body;
        
        if (!name || !createdBy) {
            return res.status(400).json({ error: 'Name and createdBy are required' });
        }

        const groupId = 'G_' + Date.now();
        
        const group = new GroupChat({
            groupId,
            name,
            description: description || '',
            members: (members || []).map(m => ({ userId: m })),
            createdBy
        });
        
        await group.save();
        
        // Notify via Socket.IO
        const io = req.app.get('io');
        io.emit('group-created', { groupId, name, createdBy });
        
        console.log('Group created:', groupId);
        res.json({ success: true, groupId, group });
    } catch (error) {
        console.error('Error creating group:', error);
        res.status(500).json({ error: error.message });
    }
});

// Send group message
router.post('/group/send', async (req, res) => {
    try {
        const { from, groupId, message, timestamp } = req.body;
        
        if (!from || !groupId || !message) {
            return res.status(400).json({ error: 'from, groupId, and message are required' });
        }

        // Verify group exists
        const group = await GroupChat.findOne({ groupId });
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        const chatMessage = new ChatMessage({
            from,
            to: groupId,
            message,
            roomId: `GROUP_${groupId}`,
            chatType: 'group',
            groupId,
            timestamp: timestamp ? new Date(timestamp) : new Date()
        });
        
        await chatMessage.save();
        
        // Update group message count and last message time
        await GroupChat.findOneAndUpdate(
            { groupId },
            {
                messageCount: group.messageCount + 1,
                lastMessage: new Date()
            }
        );
        
        // Broadcast via Socket.IO
        const io = req.app.get('io');
        io.to(`GROUP_${groupId}`).emit('receive-group-message', {
            from,
            groupId,
            message,
            roomId: `GROUP_${groupId}`,
            timestamp: chatMessage.timestamp,
            _id: chatMessage._id
        });
        
        console.log('Group message sent:', groupId, 'from', from);
        res.json({ success: true, data: chatMessage });
    } catch (error) {
        console.error('Error sending group message:', error);
        res.status(500).json({ error: error.message });
    }
});

// Add member to group
router.post('/group/add-member', async (req, res) => {
    try {
        const { groupId, userId } = req.body;
        
        if (!groupId || !userId) {
            return res.status(400).json({ error: 'groupId and userId are required' });
        }

        const group = await GroupChat.findOneAndUpdate(
            { groupId },
            { 
                $push: { members: { userId, joinedAt: new Date() } },
                updatedAt: new Date()
            },
            { new: true }
        );
        
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        // Notify via Socket.IO
        const io = req.app.get('io');
        io.to(`GROUP_${groupId}`).emit('member-added', { groupId, userId });
        
        console.log('Member added to group:', groupId, userId);
        res.json({ success: true, group });
    } catch (error) {
        console.error('Error adding member to group:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get group details
router.get('/group/:groupId', async (req, res) => {
    try {
        const { groupId } = req.params;
        
        const group = await GroupChat.findOne({ groupId });
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        res.json({ success: true, group });
    } catch (error) {
        console.error('Error getting group:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get group messages
router.get('/group/:groupId/messages', async (req, res) => {
    try {
        const { groupId } = req.params;
        const { limit = 50, skip = 0 } = req.query;

        const messages = await ChatMessage.find({ groupId })
            .sort({ timestamp: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip));

        res.json({ success: true, messages: messages.reverse() });
    } catch (error) {
        console.error('Error getting group messages:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
