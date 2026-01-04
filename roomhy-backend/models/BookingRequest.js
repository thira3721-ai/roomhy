const mongoose = require('mongoose');

const bookingRequestSchema = new mongoose.Schema({
    property_id: { type: String, required: true, index: true },
    property_name: { type: String, required: true },
    area: { type: String, required: true, index: true },
    property_type: { type: String },
    rent_amount: { type: Number },

    user_id: { type: String, required: true, index: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },

    area_manager_id: { type: String, index: true },

    request_type: { 
        type: String, 
        enum: ['request', 'bid'], 
        required: true 
    },
    bid_amount: { type: Number, default: 0 },
    message: { type: String },

    status: { 
        type: String, 
        enum: ['pending', 'confirmed', 'rejected', 'booked'], 
        default: 'pending' 
    },

    visit_type: { 
        type: String, 
        enum: ['physical', 'virtual', null], 
        default: null 
    },
    visit_date: { type: Date },
    visit_time_slot: { type: String },
    visit_status: { 
        type: String, 
        enum: ['not_scheduled', 'scheduled', 'completed'], 
        default: 'not_scheduled' 
    },

    whatsapp_enabled: { type: Boolean, default: true },
    chat_enabled: { type: Boolean, default: true },
    chat_room_id: { type: String },

    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

// Middleware to update the updated_at timestamp
bookingRequestSchema.pre('save', function(next) {
    this.updated_at = Date.now();
    next();
});

module.exports = mongoose.model('BookingRequest', bookingRequestSchema);