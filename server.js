const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

// Middleware (JSON parsing & Security)
app.use(express.json());
app.use(cors());

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
app.use('/api/booking', require('./roomhy-backend/routes/bookingRoutes'));
app.use('/api/employees', require('./roomhy-backend/routes/employeeRoutes'));
app.use('/api/complaints', require('./roomhy-backend/routes/complaintRoutes'));
app.use('/api/favorites', require('./roomhy-backend/routes/favoritesRoutes'));
app.use('/api/bids', require('./roomhy-backend/routes/bidsRoutes'));
app.use('/api/kyc', require('./roomhy-backend/routes/kycRoutes'));
app.use('/api/cities', require('./roomhy-backend/routes/citiesRoutes'));
app.use('/api', require('./roomhy-backend/routes/uploadRoutes'));

// NEW: Website Enquiry Routes (for property enquiries from website form)
app.use('/api/website-enquiry', require('./roomhy-backend/routes/websiteEnquiryRoutes'));

// NEW: Data Sync Routes (for MongoDB Atlas integration)
app.use('/api/data', require('./roomhy-backend/routes/dataSync'));

// Chat API Routes
app.use('/api/chat', require('./roomhy-backend/routes/chatRoutes'));

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

// Socket.IO Logic
const ChatRoom = require('./roomhy-backend/models/ChatRoom');
const ChatMessage = require('./roomhy-backend/models/ChatMessage');

io.on('connection', (socket) => {
    console.log('🔌 User Connected:', socket.id);

    // Join Room - room_id is always the receiver's loginId
    socket.on('join_room', async (data) => {
        const { room_id, user_id, user_role } = data;
        socket.join(room_id);
        console.log(`👤 ${user_id} (${user_role}) joined room: ${room_id}`);

        // Add participant to room if not already present
        try {
            await ChatRoom.findOneAndUpdate(
                { room_id },
                {
                    $addToSet: { participants: { loginId: user_id, role: user_role } },
                    updated_at: new Date()
                },
                { upsert: true, new: true }
            );
        } catch (error) {
            console.error('Error updating room participants:', error);
        }

        // Super Admin joins ALL user rooms in read-only mode
        if (user_role === 'superadmin') {
            try {
                // Find all rooms (all user loginIds have rooms)
                const allRooms = await ChatRoom.find({});
                allRooms.forEach(room => {
                    socket.join(room.room_id);
                });
                console.log(`Super Admin joined ${allRooms.length} rooms for monitoring`);
            } catch (error) {
                console.error('Error joining super admin to all rooms:', error);
            }
        }
    });

    // Send Message
    socket.on('send_message', async (data) => {
        const { room_id, sender_id, sender_role, message } = data;

        // Super Admin cannot send messages (read-only)
        if (sender_role === 'superadmin') return;

        try {
            // Save message
            const newMessage = await ChatMessage.create({
                room_id,
                sender_id,
                sender_role,
                message,
                created_at: new Date()
            });

            // Update room last message
            await ChatRoom.findOneAndUpdate(
                { room_id },
                {
                    last_message: message,
                    last_message_sender_id: sender_id,
                    last_message_time: new Date(),
                    updated_at: new Date()
                }
            );

            // Emit to room
            io.to(room_id).emit('new_message', newMessage);
        } catch (error) {
            console.error('❌ Send Message Error:', error);
        }
    });

    // Escalate Room
    socket.on('escalate_room', async (data) => {
        const { room_id, level, reason, escalated_by_id, escalated_by_role } = data;

        try {
            // Update escalation level
            await ChatRoom.findOneAndUpdate(
                { room_id },
                { escalation_level: level, updated_at: new Date() }
            );

            // Create escalation message
            const escalationMessage = await ChatMessage.create({
                room_id,
                sender_id: escalated_by_id,
                sender_role: escalated_by_role,
                message: `Chat escalated to level ${level}: ${reason}`,
                created_at: new Date()
            });

            io.to(room_id).emit('room_escalated', {
                room_id,
                escalation_level: level,
                message: `Chat escalated to level ${level}: ${reason}`
            });

            // Emit escalation message
            io.to(room_id).emit('new_message', escalationMessage);
        } catch (error) {
            console.error('❌ Escalation Error:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('🔌 User Disconnected');
    });
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

server.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));

