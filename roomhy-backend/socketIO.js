const Chat = require('./models/Chat');

module.exports = function setupSocketIO(io) {
    const connectedUsers = new Map(); // Map of userId -> socketId

    io.on('connection', (socket) => {
        console.log(`🔌 User connected: ${socket.id}`);

        // ============ EVENT: USER JOIN ============
        socket.on('user_join', ({ user_id, user_name, user_role }) => {
            connectedUsers.set(user_id, socket.id);
            console.log(`✅ User joined: ${user_name} (${user_role})`);
            
            // Notify all connected users
            io.emit('user_online', { user_id, user_name, user_role, status: 'online' });
        });

        // ============ EVENT: JOIN CHAT ROOM ============
        socket.on('join_chat', ({ chat_id, user_id, user_name, user_role }) => {
            socket.join(chat_id);
            console.log(`🚪 ${user_name} joined chat: ${chat_id}`);
            
            io.to(chat_id).emit('user_joined_chat', {
                chat_id,
                user_id,
                user_name,
                user_role,
                message: `${user_name} joined the chat`,
                timestamp: new Date()
            });
        });

        // ============ EVENT: SEND MESSAGE ============
        socket.on('send_message', async ({ chat_id, sender_id, sender_name, sender_role, message, file_url }) => {
            try {
                // Save to database
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
                    socket.emit('error', { message: 'Chat not found' });
                    return;
                }

                // Broadcast to all users in this chat room
                io.to(chat_id).emit('new_message', {
                    chat_id,
                    sender_id,
                    sender_name,
                    sender_role,
                    message,
                    file_url,
                    timestamp: new Date()
                });

                console.log(`💬 Message in ${chat_id}: ${sender_name} - ${message}`);
            } catch (error) {
                console.error('Error saving message:', error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        // ============ EVENT: SCHEDULE VISIT (Booking Chats Only) ============
        socket.on('schedule_visit', async ({ chat_id, sender_id, sender_name, visit_type, scheduled_date, scheduled_time }) => {
            try {
                const chat = await Chat.findOne({ chat_id });

                // Verify this is a booking chat
                if (!chat || chat.chat_type !== 'tenant_manager_booking') {
                    socket.emit('error', { message: 'Visit scheduling only available for booking chats' });
                    return;
                }

                const visit = {
                    visit_type,
                    scheduled_date: new Date(scheduled_date),
                    scheduled_time,
                    status: 'pending',
                    created_at: new Date()
                };

                // Save visit to database
                const updated = await Chat.findOneAndUpdate(
                    { chat_id },
                    { $push: { scheduled_visits: visit } },
                    { new: true }
                );

                // Add system message
                await Chat.findOneAndUpdate(
                    { chat_id },
                    {
                        $push: {
                            messages: {
                                sender_id,
                                sender_name,
                                sender_role: 'system',
                                message: `📅 Visit Scheduled: ${visit_type} visit on ${scheduled_date} at ${scheduled_time}`,
                                timestamp: new Date()
                            }
                        }
                    }
                );

                // Broadcast to all users in this chat
                io.to(chat_id).emit('visit_scheduled', {
                    chat_id,
                    visit_type,
                    scheduled_date,
                    scheduled_time,
                    scheduled_by: sender_name,
                    message: `${sender_name} scheduled a ${visit_type} visit for ${scheduled_date} at ${scheduled_time}`,
                    timestamp: new Date()
                });

                console.log(`📅 Visit scheduled in ${chat_id}: ${visit_type} on ${scheduled_date}`);
            } catch (error) {
                console.error('Error scheduling visit:', error);
                socket.emit('error', { message: 'Failed to schedule visit' });
            }
        });

        // ============ EVENT: TYPING INDICATOR ============
        socket.on('user_typing', ({ chat_id, user_name, user_id }) => {
            io.to(chat_id).emit('typing_indicator', {
                chat_id,
                user_id,
                user_name,
                is_typing: true
            });
        });

        socket.on('user_stop_typing', ({ chat_id, user_id }) => {
            io.to(chat_id).emit('typing_indicator', {
                chat_id,
                user_id,
                is_typing: false
            });
        });

        // ============ EVENT: READ RECEIPT ============
        socket.on('mark_as_read', async ({ chat_id, user_id }) => {
            try {
                // Update read status in database
                await Chat.findOneAndUpdate(
                    { chat_id, 'messages.sender_id': { $ne: user_id } },
                    { $set: { 'messages.$[elem].read': true } },
                    { arrayFilters: [{ 'elem.sender_id': { $ne: user_id } } ], new: true }
                );

                // Notify others
                io.to(chat_id).emit('messages_read', { chat_id, read_by: user_id });
            } catch (error) {
                console.error('Error marking messages as read:', error);
            }
        });

        // ============ EVENT: CLOSE CHAT ============
        socket.on('close_chat', async ({ chat_id, closed_by, reason }) => {
            try {
                const updated = await Chat.findOneAndUpdate(
                    { chat_id },
                    { status: 'closed', updated_at: new Date() },
                    { new: true }
                );

                io.to(chat_id).emit('chat_closed', {
                    chat_id,
                    closed_by,
                    reason,
                    timestamp: new Date()
                });

                console.log(`❌ Chat closed: ${chat_id}`);
            } catch (error) {
                console.error('Error closing chat:', error);
            }
        });

        // ============ EVENT: USER DISCONNECT ============
        socket.on('disconnect', () => {
            // Find and remove user from map
            for (let [userId, socketId] of connectedUsers.entries()) {
                if (socketId === socket.id) {
                    connectedUsers.delete(userId);
                    io.emit('user_online', { user_id: userId, status: 'offline' });
                    console.log(`🔌 User disconnected: ${userId}`);
                    break;
                }
            }
        });

        // ============ ERROR HANDLING ============
        socket.on('error', (error) => {
            console.error('Socket error:', error);
        });
    });
};
