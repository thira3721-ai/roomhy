# Socket.IO Architecture - Visual Diagrams

## System Overview Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ROOMHY CHAT SYSTEM ARCHITECTURE                     │
└─────────────────────────────────────────────────────────────────────────────┘

                    BROWSER 1 (SuperAdmin)
                    ┌─────────────────────┐
                    │  chatadmin.html     │
                    │                     │
                    │ [User Opens Chat]   │
                    │ → onClick handler   │
                    │ → openConversation()│
                    │ → joinRoom(id)      │
                    └──────────┬──────────┘
                               │
                        Socket.IO Library
                    window.ChatSocket.joinRoom()
                               │
                    ┌──────────▼──────────────┐
                    │ Generate Room ID:       │
                    │ [SUPERADMIN,           │
                    │  AREAMANAGER_001]      │
                    │  .sort().join('_')     │
                    │ = AREAMANAGER_001_     │
                    │   SUPERADMIN           │
                    └──────────┬─────────────┘
                               │
              ┌────────────────▼────────────────┐
              │                                  │
              │  Server @ localhost:5000        │
              │  ┌─────────────────────────────┐│
              │  │ Socket.IO Connection        ││
              │  ├─────────────────────────────┤│
              │  │ socket.on('join-room', ..)  ││
              │  │ socket.join(roomId)         ││
              │  │                             ││
              │  │ Room: AREAMANAGER_001_     ││
              │  │       SUPERADMIN           ││
              │  │ Members: 2 sockets         ││
              │  └─────────────────────────────┘│
              └────────────────┬────────────────┘
                               │
                    BROWSER 2 (Area Manager)
                    ┌─────────────────────┐
                    │  areachat.html      │
                    │                     │
                    │ [User Opens Chat]   │
                    │ → onClick handler   │
                    │ → openChat()        │
                    │ → joinRoom(id)      │
                    └──────────┬──────────┘
                               │
                        Socket.IO Library
                    window.ChatSocket.joinRoom()
                               │
                    ┌──────────▼──────────────┐
                    │ Generate Room ID:       │
                    │ [AREAMANAGER_001,      │
                    │  SUPERADMIN]           │
                    │  .sort().join('_')     │
                    │ = AREAMANAGER_001_     │
                    │   SUPERADMIN           │
                    │                        │
                    │ ✅ SAME AS BROWSER 1!  │
                    └────────────────────────┘
```

---

## Message Flow Sequence Diagram

```
Browser 1 (SuperAdmin)      Server                    Browser 2 (Area Manager)
      │                       │                              │
      │                       │                              │
      │  Step 1: Connect      │                              │
      ├──────────────────────>│                              │
      │   (socket.io init)    │                              │
      │                       │                              │
      │                       │          Step 2: Connect     │
      │                       │<─────────────────────────────┤
      │                       │    (socket.io init)          │
      │                       │                              │
      │  Step 3: Join Room    │                              │
      ├──────────────────────>│                              │
      │  join-room:           │                              │
      │  AREAMANAGER_001_     │                              │
      │  SUPERADMIN           │                              │
      │                       │                              │
      │                       │ Step 4: Join Same Room       │
      │                       │<─────────────────────────────┤
      │                       │  join-room:                  │
      │                       │  AREAMANAGER_001_SUPERADMIN │
      │                       │                              │
      │                       │  ✅ Both in same room now!  │
      │                       │                              │
      │  Step 5: Send Message │                              │
      ├──────────────────────>│                              │
      │  send-message:        │                              │
      │  roomId: ...          │                              │
      │  from: SUPERADMIN     │                              │
      │  message: "Hello"     │                              │
      │                       │                              │
      │                       │ Step 6: Broadcast to Room   │
      │                       │  io.to(roomId).emit(...)    │
      │                       │                              │
      │                       │  Step 7: Receive Message    │
      │                       ├────────────────────────────>│
      │                       │  receive-message:           │
      │                       │  from: SUPERADMIN           │
      │                       │  message: "Hello"           │
      │                       │                              │
      │                       │  Step 8: Trigger Event      │
      │                       │  customEvent(...) fired     │
      │                       │                              │
      │                       │  Step 9: Re-render UI       │
      │                       │  renderMessages() called    │
      │                       │                              │
      │                       │  ✅ Message appears!        │
      │                       │                              │
      │                       │  Step 10: Send Reply        │
      │                       │<─────────────────────────────┤
      │                       │  send-message:              │
      │                       │  from: AREAMANAGER_001      │
      │                       │  message: "Hi!"             │
      │                       │                              │
      │  Step 11: Broadcast   │                              │
      │<──────────────────────┤                              │
      │  receive-message:     │                              │
      │  from: AREAMANAGER_001│                              │
      │  message: "Hi!"       │                              │
      │                       │                              │
      │  Step 12: Render Reply│                              │
      │  renderMessages()     │                              │
      │                       │                              │
      │  ✅ Reply appears!    │                              │
      │                       │                              │
```

---

## Room ID Generation Flowchart

```
┌──────────────────────────────────────────────────────┐
│ User Opens Chat Window                               │
│ ├─ Browser 1: Click on AREAMANAGER_001              │
│ └─ Browser 2: Click on SUPERADMIN                    │
└──────────────────┬───────────────────────────────────┘
                   │
        ┌──────────▼─────────────┐
        │ openConversation()     │
        │ openChat()             │
        │ →                      │
        │ joinRoom(otherId)      │
        └──────────┬─────────────┘
                   │
        ┌──────────▼──────────────────────────────────┐
        │ RoomHyChatSocket.joinRoom(otherUserId)     │
        └──────────┬──────────────────────────────────┘
                   │
        ┌──────────▼──────────────────────────────────┐
        │ Create Room ID Using Algorithm:             │
        │ [this.userId, otherUserId].sort()          │
        │   .join('_')                                │
        └──────────┬──────────────────────────────────┘
                   │
          ┌────────▼────────┐
          │ Browser 1:       │          │
          │ userId:          │          │ Browser 2:
          │ SUPERADMIN       │          │ userId:
          │ otherId:         │          │ AREAMANAGER_001
          │ AREAMANAGER_001  │          │ otherId:
          │                  │          │ SUPERADMIN
          └────────┬─────────┘          │
                   │                    │
        ┌──────────▼──────────────┐    │
        │ Array to Sort:           │    │
        │ [SUPERADMIN,             │    │
        │  AREAMANAGER_001]        │    │
        │                          │    │
        │ After .sort():           │    │
        │ [AREAMANAGER_001,        │    │
        │  SUPERADMIN]             │    │
        └──────────┬───────────────┘    │
                   │                    │
        ┌──────────▼──────────────┐    │
        │ Join with '_':           │    │
        │ AREAMANAGER_001_SUPERADM │    │
        │ IN                       │    │
        └──────────┬───────────────┘    │
                   │                    │
                   │          ┌─────────▼──────────────┐
                   │          │ Array to Sort:          │
                   │          │ [AREAMANAGER_001,       │
                   │          │  SUPERADMIN]            │
                   │          │                         │
                   │          │ After .sort():          │
                   │          │ [AREAMANAGER_001,       │
                   │          │  SUPERADMIN]            │
                   │          └─────────┬──────────────┘
                   │                    │
                   │          ┌─────────▼──────────────┐
                   │          │ Join with '_':          │
                   │          │ AREAMANAGER_001_SUPERADM│
                   │          │ IN                      │
                   │          └─────────┬──────────────┘
                   │                    │
                   └────────┬───────────┘
                            │
             ┌──────────────▼─────────────┐
             │ ✅ SAME ROOM ID ON BOTH:  │
             │ AREAMANAGER_001_SUPERADMIN│
             └──────────┬─────────────────┘
                        │
             ┌──────────▼──────────┐
             │ socket.emit         │
             │ ('join-room',       │
             │  'AREAMANAGER_...') │
             └──────────┬──────────┘
                        │
             ┌──────────▼──────────┐
             │ Server receives:    │
             │ socket.join(roomId) │
             │ Both in same room! ✅
             └─────────────────────┘
```

---

## Event Name Reference

```
┌──────────────────────────────────────────────────────────┐
│                    EVENT NAMES REFERENCE                  │
├──────────────────────────────────────────────────────────┤
│                                                            │
│  CLIENT TO SERVER:                                        │
│  ┌────────────────────────────────────────────────────┐  │
│  │ socket.emit('join-room', roomId)                  │  │
│  │ socket.emit('send-message', {                     │  │
│  │   roomId,                                         │  │
│  │   message,                                        │  │
│  │   from,                                           │  │
│  │   to,                                             │  │
│  │   timestamp                                       │  │
│  │ })                                                │  │
│  │ socket.emit('leave-room', roomId)                 │  │
│  └────────────────────────────────────────────────────┘  │
│                                                            │
│  SERVER PROCESSING:                                       │
│  ┌────────────────────────────────────────────────────┐  │
│  │ socket.on('join-room', (roomId) => {              │  │
│  │   socket.join(roomId)                             │  │
│  │ })                                                │  │
│  │                                                    │  │
│  │ socket.on('send-message', (data) => {             │  │
│  │   io.to(data.roomId).emit('receive-message', ...) │  │
│  │ })                                                │  │
│  │                                                    │  │
│  │ socket.on('leave-room', (roomId) => {             │  │
│  │   socket.leave(roomId)                            │  │
│  │ })                                                │  │
│  └────────────────────────────────────────────────────┘  │
│                                                            │
│  SERVER TO CLIENT:                                        │
│  ┌────────────────────────────────────────────────────┐  │
│  │ io.to(roomId).emit('receive-message', data)       │  │
│  └────────────────────────────────────────────────────┘  │
│                                                            │
│  CLIENT RECEIVING:                                        │
│  ┌────────────────────────────────────────────────────┐  │
│  │ socket.on('receive-message', (data) => {          │  │
│  │   // Dispatch custom event for HTML listeners     │  │
│  │   window.dispatchEvent(new CustomEvent(           │  │
│  │     'chat-message-received',                      │  │
│  │     { detail: data }                              │  │
│  │   ))                                              │  │
│  │ })                                                │  │
│  └────────────────────────────────────────────────────┘  │
│                                                            │
│  HTML RECEIVING:                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │ window.addEventListener(                          │  │
│  │   'chat-message-received',                        │  │
│  │   (event) => {                                    │  │
│  │     renderMessages()  // Re-render chat          │  │
│  │   }                                               │  │
│  │ )                                                 │  │
│  └────────────────────────────────────────────────────┘  │
│                                                            │
└──────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     DATA FLOW OVERVIEW                       │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ INPUT: User Types Message                                    │
└──────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│ sendMessage() Function Called                                │
│ ├─ Get text from input field                                │
│ ├─ Check if text is not empty                               │
│ └─ Create message object                                    │
└──────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│ Send via REST API (for persistence)                          │
│ POST /api/chat/send                                          │
│ ├─ Save to MongoDB                                           │
│ └─ Return result                                            │
└──────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│ Send via Socket.IO (for real-time)                           │
│ ChatSocket.sendMessage(text, activeChatId)                   │
│ ├─ Create payload with roomId                                │
│ ├─ Emit 'send-message' event                                │
│ └─ Return success/failure                                    │
└──────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│ SERVER RECEIVES 'send-message'                               │
│ ├─ Extract roomId, message, from, to                         │
│ ├─ Save to database (ChatMessage model)                      │
│ └─ Broadcast to room                                        │
└──────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│ SERVER BROADCASTS to Room                                    │
│ io.to(roomId).emit('receive-message', data)                  │
│ ├─ Target: All sockets in room                               │
│ ├─ Payload: Full message data                                │
│ └─ Includes: from, to, message, timestamp                    │
└──────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│ CLIENT RECEIVES 'receive-message'                            │
│ socket.on('receive-message', (data) => { ... })              │
│ ├─ Validate message is for active chat                       │
│ ├─ Add to message cache                                      │
│ └─ Dispatch custom event                                     │
└──────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│ HTML EVENT LISTENER                                          │
│ addEventListener('chat-message-received')                    │
│ ├─ Check if message is for active chat                       │
│ └─ Call renderMessages()                                     │
└──────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│ RENDER MESSAGES                                              │
│ ├─ Clear message container                                   │
│ ├─ Fetch all messages from cache/API                         │
│ ├─ Loop through each message                                 │
│ ├─ Create HTML elements with styling                         │
│ ├─ Add to container                                          │
│ └─ Scroll to bottom                                          │
└──────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│ OUTPUT: Message Appears in Chat Window                       │
│ ✅ Message visible to user                                   │
└──────────────────────────────────────────────────────────────┘
```

---

## File Dependency Graph

```
┌────────────────────────────────────────────────────────┐
│           FILE DEPENDENCY GRAPH                         │
└────────────────────────────────────────────────────────┘

index.html
  │
  ├─ index page (entry point)
  │
  └─ Links to:
     │
     ├─ superadmin/chatadmin.html
     │  ├─ CDN: tailwindcss
     │  ├─ CDN: lucide icons
     │  ├─ CDN: socket.io.min.js ✅
     │  └─ LOCAL: js/socket-chat.js ✅
     │     │
     │     └─ Depends on:
     │        ├─ Global: io (from socket.io CDN)
     │        └─ Server: localhost:5000
     │           │
     │           └─ server.js
     │              ├─ Express (HTTP server)
     │              ├─ Socket.IO (WebSocket)
     │              ├─ MongoDB (Database)
     │              └─ Models/ChatMessage.js
     │
     └─ Areamanager/areachat.html
        ├─ CDN: tailwindcss
        ├─ CDN: lucide icons
        ├─ CDN: socket.io.min.js ✅
        ├─ LOCAL: js/socket-chat.js ✅
        └─ LOCAL: website/js/area-manager-profile.js
           │
           └─ Depends on:
              ├─ Global: io (from socket.io CDN)
              └─ Server: localhost:5000
                 (same server as above)
```

---

## Browser Local Storage Structure

```
┌─────────────────────────────────────────────────────┐
│       BROWSER LOCAL STORAGE / SESSION STORAGE        │
└─────────────────────────────────────────────────────┘

┌─────────────────────┐
│ Browser 1 (Admin)   │
│                     │
│ localStorage:       │
│ ├─ superadmin_user  │
│ │  {                │
│ │   loginId:        │
│ │   "SUPERADMIN",   │
│ │   name: "Admin",  │
│ │   ...             │
│ │  }                │
│ │                   │
│ │ sessionStorage:   │
│ │ ├─ Similar data   │
│ │ └─ (if logged in) │
│ └─────────────────  │
│                     │
│ Socket.ChatSocket:  │
│ ├─ userId:         │
│ │  "SUPERADMIN"    │
│ ├─ isConnected:    │
│ │  true            │
│ ├─ currentRoomId:  │
│ │  "AREAMANAGER... │
│ └─ callbacks: []   │
└─────────────────────┘

┌──────────────────────┐
│ Browser 2 (Manager)  │
│                      │
│ localStorage:        │
│ ├─ areamanager_user  │
│ │  {                 │
│ │   loginId:         │
│ │   "AREAMANAGER...  │
│ │   name: "Manager", │
│ │   ...              │
│ │  }                 │
│ │                    │
│ │ sessionStorage:    │
│ │ ├─ Similar data    │
│ │ └─ (if logged in)  │
│ └─────────────────   │
│                      │
│ Socket.ChatSocket:   │
│ ├─ userId:          │
│ │  "AREAMANAGER_001"│
│ ├─ isConnected:     │
│ │  true             │
│ ├─ currentRoomId:   │
│ │  "AREAMANAGER_001_│
│ │   SUPERADMIN"     │
│ └─ callbacks: []    │
└──────────────────────┘

     ┌────────────────────┐
     │ Room ID MUST Match! │
     │ AREAMANAGER_001_   │
     │ SUPERADMIN         │
     │ (on both sides)    │
     └────────────────────┘
```

---

## Troubleshooting Decision Tree

```
                 Is messaging broken?
                        │
            ┌───────────┴───────────┐
            │                       │
        NO (works)            YES (broken)
            │                       │
        Great!                      │
        ✅                  Check step 1
                                    │
                        Is server running?
                                    │
                        ┌───────────┴───────────┐
                        │                       │
                    NO              YES
                        │                       │
                  Start server          Check step 2
                  npm start                     │
                        │              Are room IDs same
                        │              on both browsers?
                        │                       │
                        │           ┌───────────┴───────────┐
                        │           │                       │
                        │        NO              YES
                        │           │                       │
                        │      Clear cache          Check step 3
                        │      Ctrl+Shift+Delete            │
                        │      Refresh                Are sockets
                        │           │                in same room?
                        │           │                       │
                        │           │           ┌───────────┴────────────┐
                        │           │           │                        │
                        │           │        NO              YES
                        │           │           │                        │
                        │           │      Restart both      Check Browser
                        │           │      browsers              Network
                        │           │           │                Tab
                        │           │           │                │
                        │           └──────┬────┘      Are WebSocket
                        │                  │           messages flowing?
                        │                  │                │
                        │                  │       ┌────────┴───────┐
                        │                  │       │                │
                        │                  │    NO              YES
                        │                  │       │                │
                        │                  │   Check server     Check custom
                        │                  │   logs for          event
                        │                  │   errors            listeners
                        │                  │       │                │
                        │                  │       ▼                │
                        │                  │   [Continue          [Continue
                        │                  │    debugging]         debugging]
                        │                  │                        │
                        └──────────┬───────┴────────────────────────┘
                                   │
                            ✅ Debugging path defined
```

---

## Performance Optimization Overview

```
┌────────────────────────────────────────────────────────┐
│         PERFORMANCE METRICS & OPTIMIZATION              │
└────────────────────────────────────────────────────────┘

Room ID Generation:
  Algorithm: [id1, id2].sort().join('_')
  Time Complexity: O(n log n) where n=2
  Actual Time: < 0.001ms ✅ Negligible

Message Send:
  Step 1: Create payload           < 1ms
  Step 2: Socket emit              < 5ms
  Step 3: Server receive           < 10ms
  Step 4: Save to DB              < 50ms (varies)
  Step 5: Broadcast to room        < 5ms
  Step 6: Client receive           < 5ms
  ─────────────────────────────────
  Total: < 100ms (typical) ✅

Polling Fallback:
  Interval: 3 seconds
  API Calls: 1 per 3 seconds
  Data Transferred: ~1KB per call
  Server Load: Minimal ✅

Memory Usage:
  Per Socket: ~50KB
  Per User: ~100KB (socket + UI state)
  Typical Load: < 10MB per browser ✅
```

---

## System Health Indicators

```
┌───────────────────────────────────────────────────────┐
│           SYSTEM HEALTH CHECKLIST                      │
└───────────────────────────────────────────────────────┘

✅ Socket Connected
   └─ window.ChatSocket.isConnected === true

✅ User ID Valid  
   └─ JSON.parse(localStorage.getItem('superadmin_user')).loginId
      returns non-empty string

✅ Room ID Consistent
   └─ Both browsers show same roomId in console

✅ Event Listener Active
   └─ window.ChatSocket.messageCallbacks.length > 0

✅ Messages Flowing
   └─ Server logs show "broadcasted to room"

✅ UI Updates Working
   └─ renderMessages() executes without errors

✅ Performance Acceptable
   └─ Messages appear < 500ms

✅ No Memory Leaks
   └─ Memory usage stable over time
```

---

**End of Diagrams**

All visual representations are designed to help understand the socket.io messaging flow and architecture.
