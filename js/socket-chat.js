// Common Socket.IO Chat Client for all RoomHy chat interfaces
// This file provides a unified interface for real-time messaging across all chat panels

class RoomHyChatSocket {
    constructor() {
        this.socket = null;
        this.currentRoomId = null;
        this.userId = null;
        this.isConnected = false;
        this.messageCallbacks = [];
        this.connectionCallbacks = [];
        this.disconnectionCallbacks = [];
        
        // NEW: Support for different chat types
        this.currentChatType = null; // 'direct', 'group', 'support', 'inquiry'
        this.activeGroups = []; // Groups user is member of
        this.activeTickets = []; // Support tickets user is involved in
        
        // NEW: Callbacks for different chat types
        this.groupMessageCallbacks = [];
        this.ticketUpdateCallbacks = [];
        this.inquiryStatusCallbacks = [];
    }

    // Initialize the socket connection
    init(userId) {
        if (this.socket) {
            this.socket.disconnect();
        }

        this.userId = userId;
        // Always connect to localhost:5000
        const serverUrl = 'http://localhost:5000';

        try {
            if (typeof io === 'undefined') {
                console.error('Socket.IO: io library not loaded. Make sure socket.io script is loaded before socket-chat.js');
                // Retry after 500ms
                setTimeout(() => this.init(userId), 500);
                return;
            }
            
            console.log('Socket.IO: Initializing connection to', serverUrl, 'with user ID:', userId);
            
            this.socket = io(serverUrl, {
                transports: ['polling', 'websocket'], // Try polling first for better compatibility
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                reconnectionAttempts: 10,
                forceNew: true,
                secure: false,
                rejectUnauthorized: false
            });

            this.socket.on('connect', () => {
                console.log('Socket.IO: Connected to server successfully');
                this.isConnected = true;
                this.connectionCallbacks.forEach(callback => callback());
            });

            this.socket.on('disconnect', () => {
                console.log('Socket.IO: Disconnected from server');
                this.isConnected = false;
                this.disconnectionCallbacks.forEach(callback => callback());
            });

            this.socket.on('receive-message', (data) => {
                console.log('Socket.IO: Message received', data);
                // Dispatch custom event for backward compatibility
                window.dispatchEvent(new CustomEvent('chat-message-received', { detail: data }));
                // Also call registered callbacks
                this.messageCallbacks.forEach(callback => callback(data));
            });

            // NEW: Group message handler
            this.socket.on('receive-group-message', (data) => {
                console.log('Socket.IO: Group message received', data);
                this.groupMessageCallbacks.forEach(callback => callback(data));
            });

            // NEW: Support ticket update handler
            this.socket.on('ticket-updated', (data) => {
                console.log('Socket.IO: Support ticket updated', data);
                this.ticketUpdateCallbacks.forEach(callback => callback(data));
            });

            // NEW: Inquiry status change handler
            this.socket.on('inquiry-status-changed', (data) => {
                console.log('Socket.IO: Inquiry status changed', data);
                this.inquiryStatusCallbacks.forEach(callback => callback(data));
            });

            this.socket.on('connect_error', (error) => {
                console.error('Socket.IO: Connection error', error);
            });

            this.socket.on('error', (error) => {
                console.error('Socket.IO: General error', error);
            });

        } catch (error) {
            console.error('Socket.IO: Failed to initialize', error);
        }
    }

    // Join a chat room
    joinRoom(otherUserId) {
        if (!otherUserId) {
            console.warn('Socket.IO: No other user ID provided');
            return;
        }

        let retryCount = 0;
        const maxRetries = 20; // Max 10 seconds (20 * 500ms)

        const attemptJoin = () => {
            if (!this.socket || !this.isConnected) {
                retryCount++;
                if (retryCount > maxRetries) {
                    console.error('Socket.IO: Failed to connect after', maxRetries, 'attempts. Server may be unreachable at localhost:5002');
                    return;
                }
                // Try again in 500ms if not connected yet
                console.log(`Socket.IO: Waiting for connection... (attempt ${retryCount}/${maxRetries})`);
                setTimeout(attemptJoin, 500);
                return;
            }

            if (this.currentRoomId) {
                this.socket.emit('leave-room', this.currentRoomId);
            }

            // Create consistent room ID by sorting user IDs
            this.currentRoomId = [this.userId, otherUserId].sort().join('_');
            this.socket.emit('join-room', this.currentRoomId);
            console.log('Socket.IO: Joined room', this.currentRoomId, 'for conversation between', this.userId, 'and', otherUserId);
        };

        attemptJoin();
    }

    // Leave current room
    leaveRoom() {
        if (this.socket && this.currentRoomId) {
            this.socket.emit('leave-room', this.currentRoomId);
            console.log('Socket.IO: Left room', this.currentRoomId);
            this.currentRoomId = null;
        }
    }

    // Send a message - Hybrid approach: REST API for persistence + Socket.IO for broadcast
    async sendMessage(message, to = null) {
        if (!this.socket || !this.currentRoomId) {
            console.warn('Socket.IO: Cannot send message - not connected or no room');
            return false;
        }

        if (!to) {
            console.warn('Socket.IO: No recipient specified');
            return false;
        }

        try {
            // Step 1: Save to database via REST API (ensures persistence)
            const apiPayload = {
                from: this.userId,
                to: to,
                message: message,
                type: 'text',
                timestamp: new Date().toISOString()
            };

            console.log('Socket.IO: Saving message via REST API...', apiPayload);
            const apiResponse = await fetch('http://localhost:5002/api/chat/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(apiPayload)
            });

            if (!apiResponse.ok) {
                console.error('Socket.IO: REST API failed:', apiResponse.status);
                return false;
            }

            const apiResult = await apiResponse.json();
            console.log('Socket.IO: Message saved to DB:', apiResult.data._id);
            // Server automatically emits Socket.IO broadcast after saving
            
            return true;
        } catch (error) {
            console.error('Socket.IO: Error sending message:', error);
            return false;
        }
    }

    // Register callback for incoming messages
    onMessage(callback) {
        this.messageCallbacks.push(callback);
    }

    // NEW: Register callback for group messages
    onGroupMessage(callback) {
        this.groupMessageCallbacks.push(callback);
    }

    // NEW: Register callback for ticket updates
    onTicketUpdate(callback) {
        this.ticketUpdateCallbacks.push(callback);
    }

    // NEW: Register callback for inquiry status changes
    onInquiryStatusChange(callback) {
        this.inquiryStatusCallbacks.push(callback);
    }

    // Register callback for connection
    onConnect(callback) {
        this.connectionCallbacks.push(callback);
    }

    // Register callback for disconnection
    onDisconnect(callback) {
        this.disconnectionCallbacks.push(callback);
    }

    // ==================== GROUP CHAT METHODS ====================

    // Join a group chat
    joinGroupChat(groupId) {
        if (!groupId) {
            console.warn('Socket.IO: No group ID provided');
            return;
        }

        let retryCount = 0;
        const maxRetries = 20;

        const attemptJoin = () => {
            if (!this.socket || !this.isConnected) {
                retryCount++;
                if (retryCount > maxRetries) {
                    console.error('Socket.IO: Failed to join group after', maxRetries, 'attempts');
                    return;
                }
                setTimeout(attemptJoin, 500);
                return;
            }

            this.currentRoomId = `GROUP_${groupId}`;
            this.currentChatType = 'group';
            this.socket.emit('join-room', this.currentRoomId);
            if (!this.activeGroups.includes(groupId)) {
                this.activeGroups.push(groupId);
            }
            console.log('Socket.IO: Joined group chat', this.currentRoomId);
        };

        attemptJoin();
    }

    // Leave group chat
    leaveGroupChat(groupId) {
        const roomId = `GROUP_${groupId}`;
        if (this.socket) {
            this.socket.emit('leave-room', roomId);
        }
        this.activeGroups = this.activeGroups.filter(g => g !== groupId);
        if (this.currentRoomId === roomId) {
            this.currentRoomId = null;
            this.currentChatType = null;
        }
        console.log('Socket.IO: Left group chat', roomId);
    }

    // Send message to group
    async sendGroupMessage(message, groupId) {
        if (!this.socket || !this.isConnected) {
            console.warn('Socket.IO: Cannot send group message - not connected');
            return false;
        }

        try {
            const roomId = `GROUP_${groupId}`;
            const apiPayload = {
                from: this.userId,
                groupId: groupId,
                message: message,
                chatType: 'group',
                timestamp: new Date().toISOString()
            };

            console.log('Socket.IO: Saving group message via REST API...', apiPayload);
            const apiResponse = await fetch('http://localhost:5002/api/chat/group/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(apiPayload)
            });

            if (!apiResponse.ok) {
                console.error('Socket.IO: REST API failed to save group message:', apiResponse.status);
                return false;
            }

            const socketPayload = {
                roomId: roomId,
                message: message,
                from: this.userId,
                groupId: groupId,
                timestamp: new Date().toISOString()
            };

            this.socket.emit('send-message', socketPayload);
            console.log('Socket.IO: Group message emitted to socket');
            return true;
        } catch (error) {
            console.error('Socket.IO: Error sending group message:', error);
            return false;
        }
    }

    // ==================== SUPPORT TICKET METHODS ====================

    // Join support ticket chat
    joinSupportChat(ticketId) {
        if (!ticketId) {
            console.warn('Socket.IO: No ticket ID provided');
            return;
        }

        let retryCount = 0;
        const maxRetries = 20;

        const attemptJoin = () => {
            if (!this.socket || !this.isConnected) {
                retryCount++;
                if (retryCount > maxRetries) {
                    console.error('Socket.IO: Failed to join support chat after', maxRetries, 'attempts');
                    return;
                }
                setTimeout(attemptJoin, 500);
                return;
            }

            this.currentRoomId = `SUPPORT_${ticketId}`;
            this.currentChatType = 'support';
            this.socket.emit('join-room', this.currentRoomId);
            if (!this.activeTickets.includes(ticketId)) {
                this.activeTickets.push(ticketId);
            }
            console.log('Socket.IO: Joined support chat', this.currentRoomId);
        };

        attemptJoin();
    }

    // Leave support ticket chat
    leaveSupportChat(ticketId) {
        const roomId = `SUPPORT_${ticketId}`;
        if (this.socket) {
            this.socket.emit('leave-room', roomId);
        }
        this.activeTickets = this.activeTickets.filter(t => t !== ticketId);
        if (this.currentRoomId === roomId) {
            this.currentRoomId = null;
            this.currentChatType = null;
        }
        console.log('Socket.IO: Left support chat', roomId);
    }

    // Send support ticket message
    async sendSupportMessage(message, ticketId, assignedTo) {
        if (!this.socket || !this.isConnected) {
            console.warn('Socket.IO: Cannot send support message - not connected');
            return false;
        }

        try {
            const roomId = `SUPPORT_${ticketId}`;
            const apiPayload = {
                from: this.userId,
                ticketId: ticketId,
                assignedTo: assignedTo,
                message: message,
                chatType: 'support',
                timestamp: new Date().toISOString()
            };

            console.log('Socket.IO: Saving support message via REST API...', apiPayload);
            const apiResponse = await fetch('http://localhost:5002/api/chat/support/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(apiPayload)
            });

            if (!apiResponse.ok) {
                console.error('Socket.IO: REST API failed to save support message:', apiResponse.status);
                return false;
            }

            const socketPayload = {
                roomId: roomId,
                message: message,
                from: this.userId,
                ticketId: ticketId,
                timestamp: new Date().toISOString()
            };

            this.socket.emit('send-message', socketPayload);
            console.log('Socket.IO: Support message emitted to socket');
            return true;
        } catch (error) {
            console.error('Socket.IO: Error sending support message:', error);
            return false;
        }
    }

    // ==================== PROPERTY INQUIRY METHODS ====================

    // Send property inquiry request
    async sendInquiryRequest(propertyId, ownerId, visitorEmail, visitorPhone, message) {
        try {
            const apiPayload = {
                propertyId: propertyId,
                ownerId: ownerId,
                visitorId: this.userId,
                visitorEmail: visitorEmail,
                visitorPhone: visitorPhone,
                message: message,
                timestamp: new Date().toISOString()
            };

            console.log('Socket.IO: Sending inquiry request...', apiPayload);
            const apiResponse = await fetch('http://localhost:5002/api/chat/inquiry/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(apiPayload)
            });

            if (!apiResponse.ok) {
                console.error('Socket.IO: REST API failed to send inquiry:', apiResponse.status);
                return false;
            }

            const result = await apiResponse.json();
            console.log('Socket.IO: Inquiry request sent successfully:', result);
            
            if (this.socket) {
                this.socket.emit('send-inquiry-request', apiPayload);
            }
            return true;
        } catch (error) {
            console.error('Socket.IO: Error sending inquiry:', error);
            return false;
        }
    }

    // Accept inquiry (owner accepting visitor request)
    async acceptInquiry(inquiryId) {
        try {
            const apiPayload = {
                inquiryId: inquiryId,
                status: 'accepted',
                timestamp: new Date().toISOString()
            };

            console.log('Socket.IO: Accepting inquiry...', apiPayload);
            const apiResponse = await fetch('http://localhost:5002/api/chat/inquiry/respond', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(apiPayload)
            });

            if (!apiResponse.ok) {
                console.error('Socket.IO: REST API failed to accept inquiry:', apiResponse.status);
                return false;
            }

            if (this.socket) {
                this.socket.emit('accept-inquiry', apiPayload);
            }
            return true;
        } catch (error) {
            console.error('Socket.IO: Error accepting inquiry:', error);
            return false;
        }
    }

    // Reject inquiry (owner rejecting visitor request)
    async rejectInquiry(inquiryId) {
        try {
            const apiPayload = {
                inquiryId: inquiryId,
                status: 'rejected',
                timestamp: new Date().toISOString()
            };

            console.log('Socket.IO: Rejecting inquiry...', apiPayload);
            const apiResponse = await fetch('http://localhost:5002/api/chat/inquiry/respond', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(apiPayload)
            });

            if (!apiResponse.ok) {
                console.error('Socket.IO: REST API failed to reject inquiry:', apiResponse.status);
                return false;
            }

            if (this.socket) {
                this.socket.emit('reject-inquiry', apiPayload);
            }
            return true;
        } catch (error) {
            console.error('Socket.IO: Error rejecting inquiry:', error);
            return false;
        }
    }

    // Join inquiry chat (after acceptance)
    joinInquiryChat(inquiryId) {
        if (!inquiryId) {
            console.warn('Socket.IO: No inquiry ID provided');
            return;
        }

        let retryCount = 0;
        const maxRetries = 20;

        const attemptJoin = () => {
            if (!this.socket || !this.isConnected) {
                retryCount++;
                if (retryCount > maxRetries) {
                    console.error('Socket.IO: Failed to join inquiry chat after', maxRetries, 'attempts');
                    return;
                }
                setTimeout(attemptJoin, 500);
                return;
            }

            this.currentRoomId = `INQUIRY_${inquiryId}`;
            this.currentChatType = 'inquiry';
            this.socket.emit('join-room', this.currentRoomId);
            console.log('Socket.IO: Joined inquiry chat', this.currentRoomId);
        };

        attemptJoin();
    }

    // Send inquiry chat message
    async sendInquiryMessage(message, inquiryId) {
        if (!this.socket || !this.isConnected) {
            console.warn('Socket.IO: Cannot send inquiry message - not connected');
            return false;
        }

        try {
            const roomId = `INQUIRY_${inquiryId}`;
            const apiPayload = {
                from: this.userId,
                inquiryId: inquiryId,
                message: message,
                chatType: 'inquiry',
                timestamp: new Date().toISOString()
            };

            console.log('Socket.IO: Saving inquiry message via REST API...', apiPayload);
            const apiResponse = await fetch('http://localhost:5002/api/chat/inquiry/message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(apiPayload)
            });

            if (!apiResponse.ok) {
                console.error('Socket.IO: REST API failed to save inquiry message:', apiResponse.status);
                return false;
            }

            const socketPayload = {
                roomId: roomId,
                message: message,
                from: this.userId,
                inquiryId: inquiryId,
                timestamp: new Date().toISOString()
            };

            this.socket.emit('send-message', socketPayload);
            console.log('Socket.IO: Inquiry message emitted to socket');
            return true;
        } catch (error) {
            console.error('Socket.IO: Error sending inquiry message:', error);
            return false;
        }
    }
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
            this.currentRoomId = null;
        }
    }

    // Get current connection status
    getStatus() {
        return {
            connected: this.isConnected,
            roomId: this.currentRoomId,
            userId: this.userId
        };
    }
}

// Create global instance
window.ChatSocket = new RoomHyChatSocket();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for io library to be fully loaded
    setTimeout(() => {
        // IMPORTANT: Do NOT auto-initialize here
        // Let each page explicitly call window.ChatSocket.init() with the correct user ID
        // This prevents mismatches between page user IDs and Socket.IO user IDs
        console.log('Socket.IO: DOMContentLoaded - waiting for explicit initialization');
    }, 500);
});

