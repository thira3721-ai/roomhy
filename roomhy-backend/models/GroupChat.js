const mongoose = require('mongoose');

const groupChatSchema = new mongoose.Schema({
    groupId: { 
        type: String, 
        unique: true, 
        required: true,
        index: true
    },
    name: { 
        type: String, 
        required: true 
    },
    description: {
        type: String,
        default: ''
    },
    members: [{
        userId: String,
        joinedAt: { 
            type: Date, 
            default: Date.now 
        }
    }],
    createdBy: {
        type: String,
        required: true
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
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Auto-update updatedAt on save
groupChatSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('GroupChat', groupChatSchema);
