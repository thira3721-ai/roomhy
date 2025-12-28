// Socket.IO client connection for all panels
// Usage: include this script in all HTML panels that need chat

// Set your backend URL here if not same origin
const SOCKET_IO_URL = window.SOCKET_IO_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5002' : window.location.origin.replace(/^http/, 'ws'));

window.io = window.io || undefined;
(function loadSocketIo() {
    if (window.io) return;
    const script = document.createElement('script');
    script.src = 'https://cdn.socket.io/4.7.5/socket.io.min.js';
    script.onload = () => {
        window.io = window.io || window.io;
        window.connectSocket = function(userId) {
            if (!window.io) return null;
            const socket = window.io(SOCKET_IO_URL, { transports: ['websocket'] });
            if (userId) socket.emit('join', userId);
            window._socket = socket;
            return socket;
        };
    };
    document.head.appendChild(script);
})();
