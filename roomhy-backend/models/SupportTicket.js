const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
    ticketId: { 
        type: String, 
        unique: true, 
        required: true,
        index: true
    },
    from: {
        type: String,
        required: true,
        index: true
    },
    assignedTo: {
        type: String,
        default: null,
        index: true
    },
    status: { 
        type: String, 
        enum: ['open', 'in-progress', 'resolved', 'closed'],
        default: 'open',
        index: true
    },
    subject: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    priority: { 
        type: String, 
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    messageCount: { 
        type: Number, 
        default: 0 
    },
    lastMessage: {
        type: Date,
        default: null
    },
    createdAt: { 
        type: Date, 
        default: Date.now,
        index: true
    },
    respondedAt: {
        type: Date,
        default: null
    },
    closedAt: {
        type: Date,
        default: null
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Auto-update updatedAt on save
supportTicketSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
