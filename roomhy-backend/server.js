const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
// allow larger JSON bodies for base64 recording uploads
app.use(express.json({ limit: '200mb' }));
app.use(cors());
const path = require('path');

// Serve recording files
app.use('/recordings', express.static(path.join(__dirname, 'public', 'recordings')));

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

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/properties', require('./routes/propertyRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/tenants', require('./routes/tenantRoutes'));
app.use('/api/visits', require('./routes/visitRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

app.use('/api/owners', require('./routes/ownerRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api', require('./routes/uploadRoutes'));

// Root route - for testing
app.get('/', (req, res) => {
    res.send("Backend is running successfully 🚀");
});

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

io.on('connection', (socket) => {
    console.log('Socket.IO: User connected', socket.id);
    // Join room by user id/loginId for private messaging
    socket.on('join', (userId) => {
        if (userId) {
            socket.join(userId);
            console.log('Socket.IO: User joined room', userId);
        }
    });
    socket.on('disconnect', () => {
        console.log('Socket.IO: User disconnected', socket.id);
    });
});

// Start Server with Socket.IO
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});