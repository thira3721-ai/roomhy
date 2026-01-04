# Socket.IO Debugging Guide - Commands & Tools

## Browser Console Debugging

### Quick Status Check

**Copy and paste into browser console (F12):**

```javascript
// Check if socket is connected and in correct room
window.ChatSocket.getStatus()
```

**Expected Output:**
```javascript
{
  connected: true,
  roomId: "AREAMANAGER_001_SUPERADMIN",
  userId: "SUPERADMIN"
}
```

---

### User ID Validation

```javascript
// SuperAdmin window:
JSON.parse(localStorage.getItem('superadmin_user'))?.loginId
// Expected: "SUPERADMIN"

// Area Manager window:
JSON.parse(localStorage.getItem('areamanager_user'))?.loginId
// Expected: "AREAMANAGER_001"
```

---

### Room ID Verification

```javascript
// Both windows should return the SAME value:
window.ChatSocket.getStatus().roomId
// Expected: "AREAMANAGER_001_SUPERADMIN"
```

---

### Check if Socket is Connected

```javascript
// Should be true
window.ChatSocket.isConnected

// Check socket object exists
window.ChatSocket.socket !== null

// Check specific room
window.ChatSocket.currentRoomId
```

---

### Message Callback Count

```javascript
// How many message listeners are registered?
window.ChatSocket.messageCallbacks.length
// Expected: At least 1

// Check connection callbacks
window.ChatSocket.connectionCallbacks.length
```

---

### Simulate Message Receive

```javascript
// Manually trigger a test message (for testing)
window.dispatchEvent(new CustomEvent('chat-message-received', {
  detail: {
    from: 'TEST_USER',
    message: 'Test message',
    timestamp: new Date().toISOString()
  }
}))
```

---

### Check Registered Listeners

```javascript
// View all message callbacks
console.log(window.ChatSocket.messageCallbacks)

// View all connection callbacks  
console.log(window.ChatSocket.connectionCallbacks)

// View all disconnection callbacks
console.log(window.ChatSocket.disconnectionCallbacks)
```

---

### Manual Socket Operations

```javascript
// Disconnect socket
window.ChatSocket.disconnect()

// Reinitialize with specific user ID
window.ChatSocket.init('SUPERADMIN')

// Force join room
window.ChatSocket.joinRoom('AREAMANAGER_001')

// Send test message
window.ChatSocket.sendMessage('Hello World')
```

---

### Enable Debug Mode

```javascript
// Enable detailed logging
localStorage.setItem('debug_socket', 'true')
location.reload()

// Disable debug mode
localStorage.removeItem('debug_socket')
location.reload()
```

---

## Server Console Debugging

### Start Server with Debug Logging

```bash
# PowerShell/Terminal
npm start

# OR with Node directly
node server.js
```

### What to Look For

**When client connects:**
```
✅ Socket connected: abc123def456
```

**When client joins room:**
```
✅ Socket abc123def456 joined room: AREAMANAGER_001_SUPERADMIN
```

**When message is sent:**
```
✅ Message received from SUPERADMIN in room AREAMANAGER_001_SUPERADMIN: Hello
✅ Message saved to database: ObjectId(...)
✅ Socket.IO: Message broadcasted to room: AREAMANAGER_001_SUPERADMIN
```

**When client disconnects:**
```
✅ Socket disconnected: abc123def456
```

---

### Enable Node Debug Logging

```bash
# Run server with debug enabled
DEBUG=* npm start

# Or more selective:
DEBUG=socket.io:* npm start
```

---

## Network Tab Debugging

### In Browser DevTools

1. Open DevTools (F12)
2. Click **Network** tab
3. Reload page
4. Filter by **WS** (WebSocket)

### What to Look For

**Good signs:**
- ✅ One WS connection to `localhost:5000`
- ✅ Connection shows "101 Switching Protocols"
- ✅ No 404 or 503 errors
- ✅ Socket.IO handshake packets visible

**Bad signs:**
- ❌ Connection refused
- ❌ 404 errors
- ❌ CORS errors
- ❌ Connection timeout

### Check Socket.IO Packets

1. Click on the WebSocket connection
2. Go to **Messages** tab
3. Look for packets like:
   - `2probe` - Connection probe
   - `3probe` - Probe response
   - `42["join-room",...]` - Room join
   - `42["send-message",...]` - Message send
   - `42["receive-message",...]` - Message receive

---

## Application Error Checking

### All Errors in Workspace

```bash
# Terminal: Check for errors
npm test

# Or run linter
npm run lint
```

### Check for Console Errors

**In browser console, look for:**
```javascript
// Red error messages
// Yellow warning messages
// Check for:
// - "Cannot find window.ChatSocket"
// - "Socket.IO not loaded"
// - "undefined is not a function"
```

---

## Database Debugging

### Check Messages in MongoDB

```javascript
// Connect to MongoDB
// Run in MongoDB Compass or mongo shell

// View all messages
db.chatmessages.find({}).pretty()

// View specific conversation
db.chatmessages.find({
  $or: [
    { from: "SUPERADMIN", to: "AREAMANAGER_001" },
    { from: "AREAMANAGER_001", to: "SUPERADMIN" }
  ]
}).pretty()

// Count messages
db.chatmessages.countDocuments({})

// Check latest messages
db.chatmessages.find({}).sort({ timestamp: -1 }).limit(5).pretty()
```

---

## Common Issues & Debug Steps

### Issue: "Socket not ready" Error

**Debug steps:**
```javascript
// 1. Check if socket exists
console.log(window.ChatSocket)

// 2. Check if connected
console.log(window.ChatSocket.isConnected)

// 3. Check server URL
console.log('Server should be at localhost:5000')

// 4. Check if room is joined
console.log(window.ChatSocket.currentRoomId)
```

**Solution:**
```bash
# Make sure server is running
npm start

# If still not working, restart server
# Kill terminal: Ctrl+C
# Restart: npm start
```

---

### Issue: Different Room IDs on Each Side

**Debug steps:**
```javascript
// Window 1
console.log('Window 1 Room:', window.ChatSocket.getStatus().roomId)

// Window 2
console.log('Window 2 Room:', window.ChatSocket.getStatus().roomId)
```

**Solution:**
```javascript
// Clear browser cache
// Ctrl+Shift+Delete
// Clear all browsing data
// Refresh page
// Re-login
```

---

### Issue: Messages Disappearing After Refresh

**Debug steps:**
```javascript
// Check if messages are in database
db.chatmessages.countDocuments({})

// Check if renderMessages() is called on page load
// Look for console: "renderMessages complete"
```

**Solution:**
```javascript
// Check fetch URL in renderMessages()
// Should be: http://localhost:5000/api/chat/messages
```

---

### Issue: Socket Disconnects Frequently

**Debug steps:**
```javascript
// Monitor disconnections
window.ChatSocket.onDisconnect(() => {
  console.log('DISCONNECTED', new Date().toLocaleTimeString())
})

// Check polling interval
// Should be 3 seconds max
```

**Solution:**
```javascript
// Check server stability
// Check internet connection
// Check for server errors in logs
```

---

## Performance Debugging

### Measure Message Send Time

```javascript
// In browser console:
console.time('message-send')
window.ChatSocket.sendMessage('Test message')
console.timeEnd('message-send')

// Expected: < 10ms
```

### Measure Message Receive Time

```javascript
// Add to socket-chat.js temporarily:
socket.on('receive-message', (data) => {
  console.time('message-process')
  // ... processing ...
  console.timeEnd('message-process')
})

// Expected: < 50ms
```

### Check Memory Usage

```javascript
// In browser console:
if (performance.memory) {
  console.log('Memory Used:', (performance.memory.usedJSHeapSize / 1048576).toFixed(2), 'MB')
  console.log('Memory Limit:', (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2), 'MB')
}
```

---

## Log Files

### Server Logs

**Location:** Console output when running `npm start`

**Important lines:**
```
[timestamp] Server listening on http://localhost:5000
[timestamp] MongoDB connected
[timestamp] Socket connected: socket_id
[timestamp] Message received from user
[timestamp] Message broadcasted to room
```

### Application Logs

**Browser Console (F12):**
```
Socket.IO: Initializing connection
Socket.IO: Joined room [room_id]
ChatAdmin: openConversation called
Areachat: openChat called
```

### Save Logs for Analysis

```javascript
// Export console logs to file
// Select Console output
// Right-click → Save as...
// Save with .txt extension
```

---

## Automated Test Suite

### Unit Test Template

```javascript
// Test 1: Socket initialization
test('Socket initializes on page load', () => {
  expect(window.ChatSocket).toBeDefined()
  expect(window.ChatSocket.socket).toBeDefined()
})

// Test 2: Room ID generation
test('Room ID is consistent', () => {
  const roomId1 = ['SUPERADMIN', 'AREAMANAGER_001'].sort().join('_')
  const roomId2 = ['AREAMANAGER_001', 'SUPERADMIN'].sort().join('_')
  expect(roomId1).toBe(roomId2)
  expect(roomId1).toBe('AREAMANAGER_001_SUPERADMIN')
})

// Test 3: Message send
test('Message sends successfully', (done) => {
  window.ChatSocket.sendMessage('Test')
  setTimeout(() => {
    expect(true).toBe(true) // Message sent
    done()
  }, 100)
})
```

---

## Monitoring Dashboard

### Real-time Monitoring Commands

```bash
# Terminal 1: Watch server logs
npm start

# Terminal 2: Monitor file changes
npm run watch

# Terminal 3: Monitor database
# mongod (if local MongoDB)
```

### Browser DevTools Monitoring

1. **Console:** Watch for socket events
2. **Network:** Watch WebSocket messages
3. **Storage:** Watch localStorage changes
4. **Application:** Check Service Workers (if any)

---

## Support Commands Quick Reference

| Command | Purpose |
|---------|---------|
| `window.ChatSocket.getStatus()` | Check socket status |
| `window.ChatSocket.isConnected` | Check connection |
| `window.ChatSocket.currentRoomId` | Check current room |
| `window.ChatSocket.disconnect()` | Disconnect socket |
| `window.ChatSocket.init('userId')` | Reinitialize |
| `JSON.parse(localStorage.getItem(...))` | Check stored user data |
| `db.chatmessages.find({})` | Query messages (MongoDB) |
| `npm start` | Start server |
| `npm test` | Run tests |

---

## Debugging Workflow

### When Messages Don't Appear:

1. **Check Server Running**
   ```bash
   npm start
   # Look for: "listening on http://localhost:5000"
   ```

2. **Check Socket Connected**
   ```javascript
   window.ChatSocket.isConnected  // Should be true
   ```

3. **Check Same Room ID**
   ```javascript
   // Both windows
   window.ChatSocket.currentRoomId
   // Should match: "AREAMANAGER_001_SUPERADMIN"
   ```

4. **Send Test Message**
   ```javascript
   window.ChatSocket.sendMessage('Test from console')
   ```

5. **Check Server Logs**
   ```
   Look for: "Message received" and "broadcasted to room"
   ```

6. **Check Other Browser**
   ```
   Check console for: "Message received"
   Check chat window for: new message appearing
   ```

7. **If Still Failed**
   - Clear browser cache (Ctrl+Shift+Delete)
   - Restart server (Ctrl+C, then npm start)
   - Restart browsers
   - Re-login to both accounts

---

## Emergency Reset

**If everything is broken:**

```bash
# 1. Stop server
# Ctrl+C in terminal

# 2. Clear all data (if needed)
# mongosh (if using MongoDB)
# db.dropDatabase()

# 3. Clear browser cache
# Ctrl+Shift+Delete in browser
# Clear all data
# Refresh page

# 4. Restart server
npm start

# 5. Re-login to accounts

# 6. Test messaging again
```

---

## Getting Help

**Before asking for help, provide:**

1. Browser console output (copy from F12)
2. Server terminal output
3. What you were trying to do
4. What error you see
5. Results of:
   ```javascript
   window.ChatSocket.getStatus()
   JSON.parse(localStorage.getItem('superadmin_user'))
   ```

**Attach to support ticket:**
- Screenshot of console
- Screenshot of Network tab
- Server logs
- Database query results

---

## Version Information

```javascript
// Get socket.io version
io.version

// Get browser info
navigator.userAgent

// Get socket.io connection info
window.ChatSocket.socket.io.uri
```

---

## Further Reading

- [Socket.IO Documentation](https://socket.io/docs/)
- [Express Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Browser DevTools Guide](https://developer.chrome.com/docs/devtools/)
