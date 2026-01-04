const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware (JSON parsing & Security)
app.use(express.json());
app.use(cors());

// Create HTTP server and attach Socket.IO
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, { 
    cors: { 
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: false
    },
    transports: ['polling', 'websocket'],
    pingInterval: 25000,
    pingTimeout: 60000,
    allowEIO3: true
});
app.set('io', io);

io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    socket.on('join-room', (roomId) => {
        try {
            socket.join(roomId);
            console.log('Socket', socket.id, 'joined room:', roomId);
        } catch(e) {
            console.error('Error joining room:', e);
        }
    });

    socket.on('leave-room', (roomId) => {
        try {
            socket.leave(roomId);
            console.log('Socket', socket.id, 'left room:', roomId);
        } catch(e) {
            console.error('Error leaving room:', e);
        }
    });

    socket.on('send-message', async (data) => {
        try {
            const { roomId, message, from, to, timestamp, type, isEscalated } = data;
            console.log('Message received from', from, 'in room', roomId, ':', message);

            // Save message to database
            const ChatMessage = require('./roomhy-backend/models/ChatMessage');
            const chatMessage = new ChatMessage({
                from,
                to,
                message,
                roomId,
                timestamp: timestamp || new Date(),
                type: type || 'text',
                isEscalated: isEscalated || false
            });
            
            try {
                await chatMessage.save();
                console.log('Message saved to database:', chatMessage._id);
            } catch (dbError) {
                console.error('Error saving message to database:', dbError);
                // Still broadcast even if save fails
            }

            // Broadcast to all clients in the room (including sender for consistency)
            io.to(roomId).emit('receive-message', {
                ...chatMessage.toObject(),
                message,
                from,
                to,
                timestamp: timestamp || new Date().toISOString(),
                type: type || 'text',
                isEscalated: isEscalated || false,
                roomId
            });

            console.log('Socket.IO: Message broadcasted to room:', roomId);
        } catch(e) {
            console.error('Error sending message:', e);
        }
    });

    // NEW: Group chat handlers
    socket.on('join-group', (groupId) => {
        try {
            socket.join(`GROUP_${groupId}`);
            console.log('Socket', socket.id, 'joined group:', groupId);
        } catch(e) {
            console.error('Error joining group:', e);
        }
    });

    socket.on('leave-group', (groupId) => {
        try {
            socket.leave(`GROUP_${groupId}`);
            console.log('Socket', socket.id, 'left group:', groupId);
        } catch(e) {
            console.error('Error leaving group:', e);
        }
    });

    socket.on('send-group-message', (data) => {
        try {
            console.log('Group message from', data.from, 'to group', data.groupId);
            io.to(`GROUP_${data.groupId}`).emit('receive-group-message', data);
        } catch(e) {
            console.error('Error sending group message:', e);
        }
    });

    // NEW: Support ticket handlers
    socket.on('join-support', (ticketId) => {
        try {
            socket.join(`SUPPORT_${ticketId}`);
            console.log('Socket', socket.id, 'joined support ticket:', ticketId);
        } catch(e) {
            console.error('Error joining support ticket:', e);
        }
    });

    socket.on('leave-support', (ticketId) => {
        try {
            socket.leave(`SUPPORT_${ticketId}`);
            console.log('Socket', socket.id, 'left support ticket:', ticketId);
        } catch(e) {
            console.error('Error leaving support ticket:', e);
        }
    });

    socket.on('send-support-message', (data) => {
        try {
            console.log('Support message from', data.from, 'to ticket', data.ticketId);
            io.to(`SUPPORT_${data.ticketId}`).emit('receive-message', data);
        } catch(e) {
            console.error('Error sending support message:', e);
        }
    });

    // NEW: Inquiry handlers
    socket.on('join-inquiry', (inquiryId) => {
        try {
            socket.join(`INQUIRY_${inquiryId}`);
            console.log('Socket', socket.id, 'joined inquiry:', inquiryId);
        } catch(e) {
            console.error('Error joining inquiry:', e);
        }
    });

    socket.on('leave-inquiry', (inquiryId) => {
        try {
            socket.leave(`INQUIRY_${inquiryId}`);
            console.log('Socket', socket.id, 'left inquiry:', inquiryId);
        } catch(e) {
            console.error('Error leaving inquiry:', e);
        }
    });

    socket.on('send-inquiry-message', (data) => {
        try {
            console.log('Inquiry message from', data.from, 'to inquiry', data.inquiryId);
            io.to(`INQUIRY_${data.inquiryId}`).emit('receive-message', data);
        } catch(e) {
            console.error('Error sending inquiry message:', e);
        }
    });

    socket.on('disconnect', () => console.log('Socket disconnected:', socket.id));
});

// Serve Static Files (HTML, CSS, JS, Images)
app.use(express.static('.')); // Serve all files from root directory
app.use('/Areamanager', express.static('./Areamanager'));
app.use('/propertyowner', express.static('./propertyowner'));
app.use('/tenant', express.static('./tenant'));
app.use('/superadmin', express.static('./superadmin'));
app.use('/images', express.static('./images'));
app.use('/js', express.static('./js'));

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// Run seeder (creates a default superadmin) - best effort, non-blocking
try {
    const seed = require('./roomhy-backend/seeder');
    seed().catch(err => console.error('Seeder error:', err));
} catch (err) {
    console.warn('Seeder not available or failed to load:', err.message);
}

// Routes (Endpoints)
// Routes live under the `roomhy-backend/routes` folder
app.use('/api/auth', require('./roomhy-backend/routes/authRoutes'));
app.use('/api/properties', require('./roomhy-backend/routes/propertyRoutes'));
app.use('/api/admin', require('./roomhy-backend/routes/adminRoutes'));
app.use('/api/tenants', require('./roomhy-backend/routes/tenantRoutes'));
app.use('/api/visits', require('./roomhy-backend/routes/visitRoutes'));
app.use('/api/rooms', require('./roomhy-backend/routes/roomRoutes'));
app.use('/api/notifications', require('./roomhy-backend/routes/notificationRoutes'));
app.use('/api/owners', require('./roomhy-backend/routes/ownerRoutes'));
app.use('/api/chat', require('./roomhy-backend/routes/chatRoutes'));

// NEW: Chat system routes (groups, support, inquiries)
app.use('/api/chat', require('./roomhy-backend/routes/chatGroupRoutes'));
app.use('/api/chat', require('./roomhy-backend/routes/chatSupportRoutes'));
app.use('/api/chat', require('./roomhy-backend/routes/chatInquiryRoutes'));

app.use('/api/booking', require('./roomhy-backend/routes/bookingRoutes'));
app.use('/api/employees', require('./roomhy-backend/routes/employeeRoutes'));
app.use('/api/complaints', require('./roomhy-backend/routes/complaintRoutes'));
app.use('/api', require('./roomhy-backend/routes/uploadRoutes'));

// NEW: Website Enquiry Routes (for property enquiries from website form)
app.use('/api/website-enquiry', require('./roomhy-backend/routes/websiteEnquiryRoutes'));

// NEW: Data Sync Routes (for MongoDB Atlas integration)
app.use('/api/data', require('./roomhy-backend/routes/dataSync'));

// Test endpoint: seed a test owner for development
app.post('/api/test/seed-owner', async (req, res) => {
    try {
        const Owner = require('./roomhy-backend/models/Owner');
        const testOwner = await Owner.create({
            loginId: 'TESTOWNER2024',
            name: 'Test Property Owner',
            phone: '9999999999',
            address: '123 Test Street, Test City',
            locationCode: 'LOC001',
            credentials: { password: 'test@123' },
            kyc: { status: 'verified' }
        });
        res.status(201).json({ message: 'Test owner created', owner: testOwner });
    } catch (err) {
        if (err.code === 11000) {
            res.status(200).json({ message: 'Test owner already exists' });
        } else {
            res.status(500).json({ error: err.message });
        }
    }
});

const PORT = process.env.PORT || 5000;

// Fallback middleware: serve index.html for any unmatched route (SPA fallback)
// Must come AFTER all other routes and static middleware
const path = require('path');
const fs = require('fs');
app.use((req, res, next) => {
    // Only respond to requests for non-API, non-static routes
    if (req.path.startsWith('/api/')) {
        return next(); // Pass API requests to 404 handler
    }
    const indexPath = path.join(__dirname, 'index.html');
    if (fs.existsSync(indexPath)) {
        return res.sendFile(indexPath);
    }
    return res.status(404).send('Not Found');
});

server.listen(PORT, 'localhost', () => console.log(`Server running on port ${PORT}`));

