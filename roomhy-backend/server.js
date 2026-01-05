const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

// Enable Socket.IO diagnostic logging
process.env.DEBUG = 'socket.io*';

const app = express();

// Middleware
// allow larger JSON bodies for base64 recording uploads
app.use(express.json({ limit: '200mb' }));
app.use(cors());
const path = require('path');

// MongoDB Connection
const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/roomhy';
if (!process.env.MONGO_URI) {
    console.warn('Warning: MONGO_URI not set. Falling back to local MongoDB at', mongoUri);
}
mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.error("DB Connection Error:", err));

// API Routes (MUST come before static file serving)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/properties', require('./routes/propertyRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/tenants', require('./routes/tenantRoutes'));
app.use('/api/visits', require('./routes/visitRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/website-enquiry', require('./routes/websiteEnquiryRoutes'));
app.use('/api/owners', require('./routes/ownerRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/chats', require('./routes/chatRoutes')); // New unified chat routes
app.use('/api/chat', require('./routes/chatRoutes')); // Backward compatibility
app.use('/api/booking', require('./routes/bookingRoutes'));
app.use('/api', require('./routes/uploadRoutes'));

// Serve recording files
app.use('/recordings', express.static(path.join(__dirname, 'public', 'recordings')));

// Favicon route (prevent 404 errors in console)
app.get('/favicon.ico', (req, res) => {
    res.status(204).send(); // No content - prevents 404
});

// Specific Page Routes (MUST come before general static file serving)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.get('/propertyowner', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'propertyowner', 'index.html'));
});

app.get('/website', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'website', 'index.html'));
});

// Serve static website files (MUST come after specific routes)
app.use('/website', express.static(path.join(__dirname, '..', 'website')));
app.use('/propertyowner', express.static(path.join(__dirname, '..', 'propertyowner')));
app.use(express.static(path.join(__dirname, '..', 'website'))); // Default to website for other requests
app.use(express.static(path.join(__dirname, '..')));

// --- Socket.IO Setup ---
const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Attach io to app for access in routes
app.set('io', io);

// Import and setup new unified chat Socket.IO handlers
const setupChatSocket = require('./socketIO');
setupChatSocket(io);

// Legacy Socket.IO support (for backward compatibility)
io.on('connection', (socket) => {
    console.log('Socket.IO: User connected', socket.id);

    // Legacy: Join room by user id/loginId for private messaging
    socket.on('join-room', (roomId) => {
        if (roomId) {
            socket.join(roomId);
            console.log('Socket.IO: User joined room', roomId);
        }
    });

    socket.on('leave-room', (roomId) => {
        if (roomId) {
            socket.leave(roomId);
            console.log('Socket.IO: User left room', roomId);
        }
    });

    // Legacy: Handle chat message sending and broadcasting
    socket.on('send-message', (data) => {
        const { roomId, message, from, to, timestamp } = data;
        console.log('Socket.IO: Message received', { roomId, from, to, message: message.substring(0, 50) + '...' });

        // Broadcast to all clients in the room (including sender for consistency)
        io.to(roomId).emit('receive-message', {
            roomId,
            message,
            from,
            to,
            timestamp: timestamp || new Date().toISOString()
        });

        console.log('Socket.IO: Message broadcast sent to rooms:', roomId);
    });

    socket.on('disconnect', () => {
        console.log('Socket.IO: User disconnected', socket.id);
    });
});

// Start Server with Socket.IO
const PORT = process.env.PORT || 10;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});