const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const server = http.createServer(app);
// Socket.io
const io = new Server(server, {
    cors: { origin: '*' }
});

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
app.use('/api/booking', require('./routes/bookingRoutes'));
app.use('/api/favorites', require('./routes/favoritesRoutes'));
app.use('/api/bids', require('./routes/bidsRoutes'));
app.use('/api/kyc', require('./routes/kycRoutes'));
app.use('/api/cities', require('./routes/citiesRoutes'));
app.use('/api', require('./routes/uploadRoutes'));
// Chat API
app.use('/api/chat', require('./routes/chatRoutes'));

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

// Serve static files from public directory (MUST come after API routes but before catch-all)
app.use(express.static(path.join(__dirname, 'public')));

// Serve recording files
app.use('/recordings', express.static(path.join(__dirname, 'public', 'recordings')));

// Serve static website files (MUST come after specific routes)
app.use('/website', express.static(path.join(__dirname, '..', 'website')));
app.use('/propertyowner', express.static(path.join(__dirname, '..', 'propertyowner')));
app.use(express.static(path.join(__dirname, '..', 'website'))); // Default to website for other requests
app.use(express.static(path.join(__dirname, '..')));

// Global 404 Error Handler for API calls (must be after all routes)
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    // API route not found - return JSON
    return res.status(404).json({
      success: false,
      message: 'API endpoint not found',
      path: req.path,
      method: req.method,
      timestamp: new Date()
    });
  }
  // For non-API routes, serve index.html (SPA fallback)
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Socket.io handlers - Enhanced for room-based subscriptions
io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    // When user joins, subscribe them to their user-specific room
    socket.on('user_join', (payload) => {
        try {
            const { user_id, user_role } = payload || {};
            if (user_id) {
                socket.join(user_id); // Subscribe to user-specific room
                console.log(`User ${user_id} joined room: ${user_id}`);
            }
            
            // Super admin joins all rooms to see all chats
            if (user_role === 'superadmin' || user_role === 'super-admin') {
                socket.join('admin_all_chats');
                console.log(`Super Admin ${user_id} joined all chats room`);
            }
        } catch (e) { console.error(e); }
    });

    // When user opens a specific chat room
    socket.on('join_room', (payload) => {
        try {
            const { room_id, user_id } = payload || {};
            if (room_id && user_id) {
                socket.join(room_id);
                console.log(`User ${user_id} joined room: ${room_id}`);
                
                // Notify room that user is online
                io.to(room_id).emit('user_online', { user_id, room_id });
            }
        } catch (e) { console.error(e); }
    });

    // When user leaves a chat room
    socket.on('leave_room', (payload) => {
        try {
            const { room_id, user_id } = payload || {};
            if (room_id && user_id) {
                socket.leave(room_id);
                console.log(`User ${user_id} left room: ${room_id}`);
                
                // Notify room that user is offline
                io.to(room_id).emit('user_offline', { user_id, room_id });
            }
        } catch (e) { console.error(e); }
    });

    // When a new message is sent
    socket.on('send_message', (payload) => {
        try {
            const { room_id, user_id, message } = payload || {};
            if (!room_id || !message) {
                console.error('Invalid message payload');
                return;
            }
            
            // Emit to all users in the room
            io.to(room_id).emit('new_message', {
                room_id,
                user_id,
                message,
                timestamp: new Date()
            });
            
            // Also emit to admin all-chats room
            io.to('admin_all_chats').emit('new_message', {
                room_id,
                user_id,
                message,
                timestamp: new Date()
            });
        } catch (e) { console.error(e); }
    });

    // Typing indicator
    socket.on('user_typing', (payload) => {
        try {
            const { room_id, user_id, is_typing } = payload || {};
            if (room_id) {
                io.to(room_id).emit('user_typing', { user_id, is_typing });
            }
        } catch (e) { console.error(e); }
    });

    // Mark messages as read
    socket.on('mark_read', (payload) => {
        try {
            const { room_id, user_id } = payload || {};
            if (room_id && user_id) {
                io.to(room_id).emit('messages_read', { room_id, user_id });
            }
        } catch (e) { console.error(e); }
    });

    socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id);
    });
});

// Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});