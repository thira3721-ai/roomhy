const BookingRequest = require('../models/BookingRequest');
const ChatMessage = require('../models/ChatMessage');
const Chat = require('../models/Chat');
const User = require('../models/user');

// ==================== BOOKING REQUEST OPERATIONS ====================

/**
 * CREATE BOOKING REQUEST OR BID
 * Auto-generates chat_room_id, routes to area manager, creates property hold if bid
 */
exports.createBookingRequest = async (req, res) => {
    try {
        const { 
            property_id, property_name, area, property_type, rent_amount,
            user_id, name, phone, email, request_type, bid_amount, message,
            whatsapp_enabled, chat_enabled
        } = req.body;

        // Validation
        if (!property_id || !user_id || !request_type) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required fields: property_id, user_id, request_type' 
            });
        }

        // Find area manager by area
        const manager = await User.findOne({ role: 'area_manager', area: area });
        
        // Generate unique chat room ID
        const chatRoomId = `chat_${property_id}_${Date.now()}`;

        // Create new booking request
        const newRequest = new BookingRequest({
            property_id,
            property_name,
            area,
            property_type,
            rent_amount,
            user_id,
            name,
            phone,
            email,
            request_type,
            bid_amount: request_type === 'bid' ? (bid_amount || 500) : 0,
            message,
            whatsapp_enabled: whatsapp_enabled || true,
            chat_enabled: chat_enabled || true,
            area_manager_id: manager ? manager._id : null,
            chat_room_id: chatRoomId,
            status: 'pending',
            visit_status: 'not_scheduled'
        });

        await newRequest.save();

        // Auto-create chat between tenant and area manager for booking chats
        if (manager && request_type === 'booking') {
            try {
                const chat_id = `tenant_manager_booking_${[user_id, manager._id].sort().join('_')}_${newRequest._id}`;
                
                let chat = await Chat.findOne({ chat_id });
                if (!chat) {
                    chat = new Chat({
                        chat_id,
                        chat_type: 'tenant_manager_booking',
                        participants: [
                            { user_id: user_id, user_name: name, user_role: 'tenant' },
                            { user_id: manager._id.toString(), user_name: manager.name, user_role: 'area_manager' }
                        ],
                        booking_id: newRequest._id.toString(),
                        property_id,
                        property_name,
                        area,
                        messages: [{
                            sender_id: user_id,
                            sender_name: name,
                            sender_role: 'tenant',
                            message: `${message || `Booking request for ${property_name}`}`,
                            timestamp: new Date(),
                            read: false
                        }],
                        scheduled_visits: []
                    });
                    await chat.save();
                }
            } catch (chatError) {
                console.warn('Warning: Chat creation failed for booking:', chatError.message);
                // Don't fail the entire booking request if chat creation fails
            }
        }
        if (request_type === 'bid') {
            const holdExpiry = new Date();
            holdExpiry.setDate(holdExpiry.getDate() + 7); // 7-day hold
            
            // Store hold info in booking (simplified approach)
            newRequest.hold_expiry_date = holdExpiry;
            newRequest.payment_status = 'paid';
            await newRequest.save();
        }

        res.status(201).json({ 
            success: true, 
            message: `${request_type.charAt(0).toUpperCase() + request_type.slice(1)} submitted successfully`,
            data: newRequest 
        });
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

/**
 * GET ALL BOOKING REQUESTS
 * Supports filtering by area, request_type, status, manager_id
 */
exports.getBookingRequests = async (req, res) => {
    try {
        const { area, manager_id, type, status } = req.query;
        let query = {};

        if (area) query.area = area;
        if (manager_id) query.area_manager_id = manager_id;
        if (type) query.request_type = type;
        if (status) query.status = status;

        const requests = await BookingRequest.find(query)
            .sort({ created_at: -1 })
            .lean();

        res.status(200).json({ 
            success: true, 
            total: requests.length,
            data: requests 
        });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

/**
 * GET BOOKING REQUEST BY ID
 */
exports.getBookingRequestById = async (req, res) => {
    try {
        const request = await BookingRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ 
                success: false, 
                message: 'Booking request not found' 
            });
        }

        res.status(200).json({ 
            success: true, 
            data: request 
        });
    } catch (error) {
        console.error('Error fetching booking:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

/**
 * UPDATE BOOKING STATUS
 * Handles status change and optional visit information
 */
exports.updateBookingStatus = async (req, res) => {
    try {
        const { status, visit_type, visit_date, visit_time_slot, visit_status } = req.body;

        const updateData = {
            status,
            updated_at: Date.now()
        };

        // Update visit info if provided
        if (visit_type) updateData.visit_type = visit_type;
        if (visit_date) updateData.visit_date = visit_date;
        if (visit_time_slot) updateData.visit_time_slot = visit_time_slot;
        if (visit_status) updateData.visit_status = visit_status;

        const request = await BookingRequest.findByIdAndUpdate(
            req.params.id, 
            updateData, 
            { new: true }
        );

        if (!request) {
            return res.status(404).json({ 
                success: false, 
                message: 'Booking request not found' 
            });
        }

        res.status(200).json({ 
            success: true, 
            message: 'Booking status updated',
            data: request 
        });
    } catch (error) {
        console.error('Error updating booking status:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

/**
 * APPROVE BOOKING
 * Changes status to 'confirmed'
 */
exports.approveBooking = async (req, res) => {
    try {
        const request = await BookingRequest.findByIdAndUpdate(
            req.params.id,
            {
                status: 'confirmed',
                updated_at: Date.now()
            },
            { new: true }
        );

        if (!request) {
            return res.status(404).json({ 
                success: false, 
                message: 'Booking request not found' 
            });
        }

        res.status(200).json({ 
            success: true, 
            message: 'Booking approved',
            data: request 
        });
    } catch (error) {
        console.error('Error approving booking:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

/**
 * REJECT BOOKING
 * Changes status to 'rejected'
 */
exports.rejectBooking = async (req, res) => {
    try {
        const request = await BookingRequest.findByIdAndUpdate(
            req.params.id,
            {
                status: 'rejected',
                updated_at: Date.now()
            },
            { new: true }
        );

        if (!request) {
            return res.status(404).json({ 
                success: false, 
                message: 'Booking request not found' 
            });
        }

        res.status(200).json({ 
            success: true, 
            message: 'Booking rejected',
            data: request 
        });
    } catch (error) {
        console.error('Error rejecting booking:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

/**
 * SCHEDULE VISIT
 * Updates visit details and changes visit_status to 'scheduled'
 */
exports.scheduleVisit = async (req, res) => {
    try {
        const { visit_type, visit_date, visit_time_slot } = req.body;

        if (!visit_type || !visit_date || !visit_time_slot) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required fields: visit_type, visit_date, visit_time_slot' 
            });
        }

        const request = await BookingRequest.findByIdAndUpdate(
            req.params.id,
            {
                visit_type,
                visit_date,
                visit_time_slot,
                visit_status: 'scheduled',
                status: 'confirmed',
                updated_at: Date.now()
            },
            { new: true }
        );

        if (!request) {
            return res.status(404).json({ 
                success: false, 
                message: 'Booking request not found' 
            });
        }

        res.status(200).json({ 
            success: true, 
            message: 'Visit scheduled successfully',
            data: request 
        });
    } catch (error) {
        console.error('Error scheduling visit:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

/**
 * DELETE BOOKING
 */
exports.deleteBooking = async (req, res) => {
    try {
        const request = await BookingRequest.findByIdAndDelete(req.params.id);

        if (!request) {
            return res.status(404).json({ 
                success: false, 
                message: 'Booking request not found' 
            });
        }

        res.status(200).json({ 
            success: true, 
            message: 'Booking deleted successfully',
            data: request 
        });
    } catch (error) {
        console.error('Error deleting booking:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// ==================== CHAT MESSAGE OPERATIONS ====================

/**
 * SEND MESSAGE
 * Creates a chat message linked to a booking
 */
exports.sendMessage = async (req, res) => {
    try {
        const { chat_room_id, booking_id, sender_id, sender_name, sender_role, message, attachment_url } = req.body;

        if (!chat_room_id || !sender_id || !message) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required fields: chat_room_id, sender_id, message' 
            });
        }

        const newMessage = new ChatMessage({
            roomId: chat_room_id,
            from: sender_id,
            message,
            metadata: {
                booking_id,
                sender_name,
                sender_role
            },
            type: 'text',
            read: false,
            timestamp: Date.now()
        });

        await newMessage.save();

        res.status(201).json({ 
            success: true, 
            message: 'Message sent successfully',
            data: newMessage 
        });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

/**
 * GET CHAT MESSAGES
 * Retrieves chat history for a booking
 */
exports.getChatMessages = async (req, res) => {
    try {
        const { chat_room_id } = req.params;

        const messages = await ChatMessage.find({ roomId: chat_room_id })
            .sort({ timestamp: 1 })
            .lean();

        res.status(200).json({ 
            success: true, 
            total: messages.length,
            data: messages 
        });
    } catch (error) {
        console.error('Error fetching chat messages:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// ==================== PROPERTY HOLD OPERATIONS ====================

/**
 * CHECK PROPERTY HOLD
 * Returns whether a property is currently on hold
 */
exports.checkPropertyHold = async (req, res) => {
    try {
        const { property_id } = req.params;

        // Find active bid/request for this property
        const booking = await BookingRequest.findOne({
            property_id,
            request_type: 'bid',
            status: { $in: ['pending', 'confirmed'] }
        });

        if (!booking) {
            return res.status(200).json({ 
                success: true, 
                is_on_hold: false,
                message: 'Property is not on hold'
            });
        }

        const now = new Date();
        const isOnHold = booking.hold_expiry_date && new Date(booking.hold_expiry_date) > now;

        res.status(200).json({ 
            success: true, 
            is_on_hold: isOnHold,
            booking_id: booking._id,
            hold_expiry_date: booking.hold_expiry_date,
            message: isOnHold ? 'Property is currently on hold' : 'Hold has expired'
        });
    } catch (error) {
        console.error('Error checking property hold:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

/**
 * RELEASE PROPERTY HOLD
 * Releases the hold on a property
 */
exports.releasePropertyHold = async (req, res) => {
    try {
        const { property_id } = req.params;

        const booking = await BookingRequest.findOneAndUpdate(
            {
                property_id,
                request_type: 'bid'
            },
            {
                hold_expiry_date: null,
                updated_at: Date.now()
            },
            { new: true }
        );

        if (!booking) {
            return res.status(404).json({ 
                success: false, 
                message: 'No active hold found for this property' 
            });
        }

        res.status(200).json({ 
            success: true, 
            message: 'Property hold released successfully',
            data: booking 
        });
    } catch (error) {
        console.error('Error releasing property hold:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};