const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
    sender_id: { type: String, required: true },
    sender_name: String,
    sender_role: { type: String, enum: ['tenant', 'area_manager', 'owner', 'super_admin'], required: true },
    message: String,
    file_url: String,
    file_type: String, // 'image', 'document', etc.
    timestamp: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }
});

const chatSchema = new mongoose.Schema({
    // Chat identification
    chat_id: { type: String, unique: true, required: true },
    chat_type: { 
        type: String, 
        enum: ['tenant_manager_booking', 'manager_owner_helpdesk', 'tenant_owner_support'],
        required: true 
    },
    
    // Participants
    participants: [{
        user_id: String,
        user_name: String,
        user_role: { type: String, enum: ['tenant', 'area_manager', 'owner', 'super_admin'] },
        joined_at: { type: Date, default: Date.now }
    }],
    
    // Context data
    booking_id: String, // Only for tenant_manager_booking
    property_id: String,
    property_name: String,
    area: String,
    
    // Messages
    messages: [chatMessageSchema],
    
    // Visit scheduling (only for booking chats)
    scheduled_visits: [{
        visit_type: { type: String, enum: ['physical', 'virtual'] },
        scheduled_date: Date,
        scheduled_time: String,
        status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
        created_at: Date
    }],
    
    // Chat metadata
    status: { type: String, enum: ['active', 'closed', 'archived'], default: 'active' },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    last_message_at: { type: Date, default: Date.now }
}, { timestamps: true });

// Index for quick lookups
chatSchema.index({ 'participants.user_id': 1 });
chatSchema.index({ booking_id: 1 });
chatSchema.index({ property_id: 1 });
chatSchema.index({ chat_type: 1 });

module.exports = mongoose.model('Chat', chatSchema);
