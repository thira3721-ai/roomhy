# 5-Panel Chat System - Quick Implementation Checklist

## Status Overview
- ✅ **DONE**: Enhanced socket-chat.js with all methods
- ⏳ **TODO**: Backend API endpoints
- ⏳ **TODO**: Database models
- ⏳ **TODO**: UI Updates for each panel

---

## Part 1: Database Models Setup

### Step 1.1: Create GroupChat Model
**File**: `models/GroupChat.js` (Create new)

```javascript
const mongoose = require('mongoose');

const groupChatSchema = new mongoose.Schema({
    groupId: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    description: String,
    members: [{
        userId: String,
        joinedAt: { type: Date, default: Date.now }
    }],
    createdBy: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('GroupChat', groupChatSchema);
```

### Step 1.2: Create SupportTicket Model
**File**: `models/SupportTicket.js` (Create new)

```javascript
const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
    ticketId: { type: String, unique: true, required: true },
    from: String,  // Owner or Tenant ID
    assignedTo: String,  // Manager ID
    status: { 
        type: String, 
        enum: ['open', 'in-progress', 'resolved', 'closed'],
        default: 'open'
    },
    subject: String,
    description: String,
    priority: { 
        type: String, 
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    messageCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    respondedAt: Date,
    closedAt: Date,
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
```

### Step 1.3: Create PropertyInquiry Model
**File**: `models/PropertyInquiry.js` (Create new)

```javascript
const mongoose = require('mongoose');

const propertyInquirySchema = new mongoose.Schema({
    inquiryId: { type: String, unique: true, required: true },
    propertyId: String,
    ownerId: String,
    visitorId: String,
    visitorEmail: String,
    visitorPhone: String,
    requestMessage: String,
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    chatStarted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    respondedAt: Date,
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PropertyInquiry', propertyInquirySchema);
```

### Step 1.4: Update ChatMessage Model
**File**: `models/ChatMessage.js` (Modify existing)

Add these fields to existing schema:
```javascript
chatType: { 
    type: String, 
    enum: ['direct', 'group', 'support', 'inquiry'],
    default: 'direct'
},
groupId: String,  // For group chats
ticketId: String,  // For support tickets
inquiryId: String  // For inquiry chats
```

---

## Part 2: Backend API Endpoints

### Step 2.1: Create Group Chat Routes
**File**: `routes/chatGroupRoutes.js` (Create new)

```javascript
const express = require('express');
const router = express.Router();
const GroupChat = require('../models/GroupChat');
const ChatMessage = require('../models/ChatMessage');

// Create group
router.post('/group/create', async (req, res) => {
    try {
        const { name, members, createdBy } = req.body;
        const groupId = 'G_' + Date.now();
        
        const group = new GroupChat({
            groupId,
            name,
            description: req.body.description || '',
            members: members.map(m => ({ userId: m })),
            createdBy
        });
        
        await group.save();
        res.json({ success: true, groupId, group });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Send group message
router.post('/group/send', async (req, res) => {
    try {
        const { from, groupId, message, timestamp } = req.body;
        
        const chatMessage = new ChatMessage({
            from,
            to: groupId,
            message,
            roomId: `GROUP_${groupId}`,
            chatType: 'group',
            groupId,
            timestamp: new Date(timestamp)
        });
        
        await chatMessage.save();
        
        // Broadcast via Socket.IO
        const io = req.app.get('io');
        io.to(`GROUP_${groupId}`).emit('receive-group-message', {
            from,
            groupId,
            message,
            roomId: `GROUP_${groupId}`,
            timestamp,
            _id: chatMessage._id
        });
        
        res.json({ success: true, data: chatMessage });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add member to group
router.post('/group/add-member', async (req, res) => {
    try {
        const { groupId, userId } = req.body;
        
        const group = await GroupChat.findOneAndUpdate(
            { groupId },
            { 
                $push: { members: { userId, joinedAt: new Date() } },
                updatedAt: new Date()
            },
            { new: true }
        );
        
        res.json({ success: true, group });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
```

### Step 2.2: Create Support Ticket Routes
**File**: `routes/chatSupportRoutes.js` (Create new)

```javascript
const express = require('express');
const router = express.Router();
const SupportTicket = require('../models/SupportTicket');
const ChatMessage = require('../models/ChatMessage');

// Create support ticket
router.post('/support/create', async (req, res) => {
    try {
        const { from, assignedTo, subject, description, priority } = req.body;
        const ticketId = 'TK_' + Date.now();
        
        const ticket = new SupportTicket({
            ticketId,
            from,
            assignedTo,
            subject,
            description,
            priority: priority || 'medium'
        });
        
        await ticket.save();
        
        // Notify area manager
        const io = req.app.get('io');
        io.emit('new-support-ticket', { ticketId, from, subject });
        
        res.json({ success: true, ticketId, ticket });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Send support message
router.post('/support/send', async (req, res) => {
    try {
        const { from, ticketId, assignedTo, message, timestamp } = req.body;
        
        const chatMessage = new ChatMessage({
            from,
            to: assignedTo,
            message,
            roomId: `SUPPORT_${ticketId}`,
            chatType: 'support',
            ticketId,
            timestamp: new Date(timestamp)
        });
        
        await chatMessage.save();
        
        // Update ticket
        await SupportTicket.findOneAndUpdate(
            { ticketId },
            { 
                messageCount: (await ChatMessage.countDocuments({ ticketId })),
                respondedAt: from === assignedTo ? new Date() : undefined,
                updatedAt: new Date()
            }
        );
        
        // Broadcast via Socket.IO
        const io = req.app.get('io');
        io.to(`SUPPORT_${ticketId}`).emit('receive-message', {
            from,
            ticketId,
            message,
            roomId: `SUPPORT_${ticketId}`,
            chatType: 'support',
            timestamp,
            _id: chatMessage._id
        });
        
        res.json({ success: true, data: chatMessage });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update ticket status
router.post('/support/update-status', async (req, res) => {
    try {
        const { ticketId, status } = req.body;
        
        const ticket = await SupportTicket.findOneAndUpdate(
            { ticketId },
            { 
                status,
                closedAt: status === 'closed' ? new Date() : undefined,
                updatedAt: new Date()
            },
            { new: true }
        );
        
        const io = req.app.get('io');
        io.to(`SUPPORT_${ticketId}`).emit('ticket-updated', {
            ticketId,
            status,
            ticket
        });
        
        res.json({ success: true, ticket });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
```

### Step 2.3: Create Inquiry Routes
**File**: `routes/chatInquiryRoutes.js` (Create new)

```javascript
const express = require('express');
const router = express.Router();
const PropertyInquiry = require('../models/PropertyInquiry');
const ChatMessage = require('../models/ChatMessage');

// Send inquiry request
router.post('/inquiry/send', async (req, res) => {
    try {
        const { propertyId, ownerId, visitorId, visitorEmail, visitorPhone, message } = req.body;
        const inquiryId = 'INQ_' + Date.now();
        
        const inquiry = new PropertyInquiry({
            inquiryId,
            propertyId,
            ownerId,
            visitorId,
            visitorEmail,
            visitorPhone,
            requestMessage: message
        });
        
        await inquiry.save();
        
        // Notify owner
        const io = req.app.get('io');
        io.emit('new-inquiry-request', {
            inquiryId,
            propertyId,
            visitorEmail,
            visitorPhone
        });
        
        res.json({ success: true, inquiryId, inquiry });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Accept/Reject inquiry
router.post('/inquiry/respond', async (req, res) => {
    try {
        const { inquiryId, status } = req.body;
        
        const inquiry = await PropertyInquiry.findOneAndUpdate(
            { inquiryId },
            { 
                status,
                respondedAt: new Date(),
                updatedAt: new Date()
            },
            { new: true }
        );
        
        const io = req.app.get('io');
        io.emit('inquiry-status-changed', {
            inquiryId,
            status,
            inquiry
        });
        
        res.json({ success: true, inquiry });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Send inquiry chat message
router.post('/inquiry/message', async (req, res) => {
    try {
        const { from, inquiryId, message, timestamp } = req.body;
        
        const inquiry = await PropertyInquiry.findOne({ inquiryId });
        const to = from === inquiry.visitorId ? inquiry.ownerId : inquiry.visitorId;
        
        const chatMessage = new ChatMessage({
            from,
            to,
            message,
            roomId: `INQUIRY_${inquiryId}`,
            chatType: 'inquiry',
            inquiryId,
            timestamp: new Date(timestamp)
        });
        
        await chatMessage.save();
        
        // Update inquiry to mark chat as started
        await PropertyInquiry.findOneAndUpdate(
            { inquiryId },
            { 
                chatStarted: true,
                updatedAt: new Date()
            }
        );
        
        // Broadcast via Socket.IO
        const io = req.app.get('io');
        io.to(`INQUIRY_${inquiryId}`).emit('receive-message', {
            from,
            inquiryId,
            message,
            roomId: `INQUIRY_${inquiryId}`,
            chatType: 'inquiry',
            timestamp,
            _id: chatMessage._id
        });
        
        res.json({ success: true, data: chatMessage });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
```

### Step 2.4: Register Routes in server.js
**File**: `server.js` (Modify)

Add these lines in server.js after other route definitions:

```javascript
// Import new routes
const chatGroupRoutes = require('./routes/chatGroupRoutes');
const chatSupportRoutes = require('./routes/chatSupportRoutes');
const chatInquiryRoutes = require('./routes/chatInquiryRoutes');

// Register routes
app.use('/api/chat', chatGroupRoutes);
app.use('/api/chat', chatSupportRoutes);
app.use('/api/chat', chatInquiryRoutes);
```

---

## Part 3: Update Socket.IO Handlers in server.js

Add these handlers to the Socket.IO connection block:

```javascript
io.on('connection', (socket) => {
    // ... existing code ...

    // NEW: Group chat handlers
    socket.on('send-group-message', (data) => {
        console.log('Socket.IO: Group message received from', data.from);
        io.to(data.roomId).emit('receive-group-message', data);
    });

    // NEW: Support ticket handlers
    socket.on('create-support-ticket', (data) => {
        console.log('Socket.IO: Support ticket created:', data.ticketId);
        // Notify all managers
        io.emit('new-support-ticket', data);
    });

    socket.on('update-ticket-status', (data) => {
        console.log('Socket.IO: Ticket status updated:', data.ticketId);
        io.to(`SUPPORT_${data.ticketId}`).emit('ticket-updated', data);
    });

    // NEW: Inquiry handlers
    socket.on('send-inquiry-request', (data) => {
        console.log('Socket.IO: Inquiry request sent:', data.inquiryId);
        // Notify property owner
        io.emit('new-inquiry-request', data);
    });

    socket.on('accept-inquiry', (data) => {
        console.log('Socket.IO: Inquiry accepted:', data.inquiryId);
        io.emit('inquiry-status-changed', data);
    });

    socket.on('reject-inquiry', (data) => {
        console.log('Socket.IO: Inquiry rejected:', data.inquiryId);
        io.emit('inquiry-status-changed', data);
    });

    socket.on('join-inquiry-chat', (inquiryId) => {
        socket.join(`INQUIRY_${inquiryId}`);
        console.log('Socket.IO: User joined inquiry chat:', inquiryId);
    });
});
```

---

## Part 4: Quick Testing

### Test Group Chat
```javascript
// Open console in Super Admin panel
window.ChatSocket.init('SUPER_ADMIN');
window.ChatSocket.joinGroupChat('G001');
window.ChatSocket.sendGroupMessage('Test group message', 'G001');
```

### Test Support Ticket
```javascript
// Open console in Property Owner panel
window.ChatSocket.init('ROOMHY3986');
window.ChatSocket.joinSupportChat('TK_001');
window.ChatSocket.sendSupportMessage('Need help', 'TK_001', 'RYGA6319');
```

### Test Inquiry
```javascript
// Open console in Website Visitor panel
window.ChatSocket.init('VISITOR_' + Date.now());
window.ChatSocket.sendInquiryRequest('ROOMHY3986', 'ROOMHY3986', 'test@email.com', '9876543210', 'Interested');
```

---

## Implementation Order

1. **Step 1**: Create all 4 model files
2. **Step 2**: Create all 3 route files
3. **Step 3**: Update server.js with new routes and Socket.IO handlers
4. **Step 4**: Test backend with Postman or curl
5. **Step 5**: Update UI panels to use new methods (optional - existing chat still works)

---

## Summary

✅ **Frontend Client** (socket-chat.js) - READY
⏳ **Backend APIs** - 3 files to create
⏳ **Database Models** - 3 files to create + 1 update
⏳ **Socket Handlers** - To add to server.js
⏳ **UI Updates** - Optional (existing chat still works)

