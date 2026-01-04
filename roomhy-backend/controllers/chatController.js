const Chat = require('../models/Chat');

// Get or create chat room
exports.getOrCreateChat = async (req, res) => {
    try {
        const { user1_id, user1_name, user1_role, user2_id, user2_name, user2_role, chat_type, booking_id, property_id, property_name, area } = req.body;

        // Generate chat_id based on participants and chat type
        const ids = [user1_id, user2_id].sort();
        const chat_id = `${chat_type}_${ids.join('_')}_${booking_id || 'helpdesk'}`;

        let chat = await Chat.findOne({ chat_id });

        if (!chat) {
            chat = new Chat({
                chat_id,
                chat_type,
                participants: [
                    { user_id: user1_id, user_name: user1_name, user_role: user1_role },
                    { user_id: user2_id, user_name: user2_name, user_role: user2_role }
                ],
                booking_id,
                property_id,
                property_name,
                area,
                messages: []
            });

            await chat.save();
        }

        res.status(200).json({ success: true, chat });
    } catch (error) {
        console.error('Error creating chat:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get chat messages
exports.getChatMessages = async (req, res) => {
    try {
        const { chat_id } = req.params;
        const chat = await Chat.findOne({ chat_id }).select('messages scheduled_visits');

        if (!chat) {
            return res.status(404).json({ success: false, message: 'Chat not found' });
        }

        res.status(200).json({ success: true, messages: chat.messages, visits: chat.scheduled_visits });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get user chats
exports.getUserChats = async (req, res) => {
    try {
        const { user_id } = req.params;
        const chats = await Chat.find({ 'participants.user_id': user_id })
            .select('chat_id chat_type participants property_name area messages last_message_at')
            .sort({ last_message_at: -1 });

        res.status(200).json({ success: true, chats });
    } catch (error) {
        console.error('Error fetching user chats:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Save message (backup - Socket.IO should be primary)
exports.saveMessage = async (req, res) => {
    try {
        const { chat_id, sender_id, sender_name, sender_role, message, file_url } = req.body;

        const chat = await Chat.findOneAndUpdate(
            { chat_id },
            {
                $push: {
                    messages: {
                        sender_id,
                        sender_name,
                        sender_role,
                        message,
                        file_url,
                        timestamp: new Date()
                    }
                },
                $set: { last_message_at: new Date() }
            },
            { new: true }
        );

        if (!chat) {
            return res.status(404).json({ success: false, message: 'Chat not found' });
        }

        res.status(200).json({ success: true, message: 'Message saved' });
    } catch (error) {
        console.error('Error saving message:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Schedule visit (booking chat only)
exports.scheduleVisit = async (req, res) => {
    try {
        const { chat_id, visit_type, scheduled_date, scheduled_time } = req.body;

        // Verify this is a booking chat
        const chat = await Chat.findOne({ chat_id });
        if (!chat || chat.chat_type !== 'tenant_manager_booking') {
            return res.status(400).json({ success: false, message: 'Visit scheduling only available for booking chats' });
        }

        const visit = {
            visit_type,
            scheduled_date: new Date(scheduled_date),
            scheduled_time,
            status: 'pending',
            created_at: new Date()
        };

        const updated = await Chat.findOneAndUpdate(
            { chat_id },
            { $push: { scheduled_visits: visit } },
            { new: true }
        );

        res.status(200).json({ success: true, visit, chat: updated });
    } catch (error) {
        console.error('Error scheduling visit:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all chats for super admin (monitoring)
exports.getAllChats = async (req, res) => {
    try {
        const { chat_type, user_id, property_id } = req.query;
        let query = {};

        if (chat_type) query.chat_type = chat_type;
        if (user_id) query['participants.user_id'] = user_id;
        if (property_id) query.property_id = property_id;

        const chats = await Chat.find(query)
            .select('chat_id chat_type participants property_name area last_message_at status')
            .sort({ last_message_at: -1 })
            .limit(100);

        res.status(200).json({ success: true, chats });
    } catch (error) {
        console.error('Error fetching all chats:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Close chat
exports.closeChat = async (req, res) => {
    try {
        const { chat_id } = req.params;

        const chat = await Chat.findOneAndUpdate(
            { chat_id },
            { status: 'closed', updated_at: new Date() },
            { new: true }
        );

        if (!chat) {
            return res.status(404).json({ success: false, message: 'Chat not found' });
        }

        res.status(200).json({ success: true, chat });
    } catch (error) {
        console.error('Error closing chat:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get conversation between admin and user (for admin routes)
exports.getConversation = async (req, res) => {
    try {
        const { loginId } = req.params;
        const chats = await Chat.find({ 'participants.user_id': loginId })
            .select('chat_id chat_type participants property_name messages last_message_at')
            .sort({ last_message_at: -1 });

        res.status(200).json({ success: true, chats });
    } catch (error) {
        console.error('Error fetching conversation:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Post message (for admin routes)
exports.postMessage = async (req, res) => {
    try {
        const { loginId } = req.params;
        const { chat_id, sender_id, sender_name, sender_role, message } = req.body;

        if (!chat_id || !message) {
            return res.status(400).json({ success: false, message: 'chat_id and message required' });
        }

        const chat = await Chat.findOneAndUpdate(
            { chat_id },
            {
                $push: {
                    messages: {
                        sender_id,
                        sender_name,
                        sender_role,
                        message,
                        timestamp: new Date()
                    }
                },
                $set: { last_message_at: new Date() }
            },
            { new: true }
        );

        if (!chat) {
            return res.status(404).json({ success: false, message: 'Chat not found' });
        }

        res.status(200).json({ success: true, message: 'Message posted', chat });
    } catch (error) {
        console.error('Error posting message:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
