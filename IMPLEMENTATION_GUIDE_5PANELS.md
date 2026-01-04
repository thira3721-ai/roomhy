# Chat System Implementation Guide - 5 Panels

## Current Status (January 3, 2026)

### ✅ COMPLETED
- **Enhanced socket-chat.js** with full support for:
  - ✅ Direct 1-to-1 messaging (existing)
  - ✅ Group chat methods: `joinGroupChat()`, `sendGroupMessage()`, `leaveGroupChat()`
  - ✅ Support ticket methods: `joinSupportChat()`, `sendSupportMessage()`, `leaveSupportChat()`
  - ✅ Property inquiry methods: `sendInquiryRequest()`, `acceptInquiry()`, `rejectInquiry()`, `joinInquiryChat()`, `sendInquiryMessage()`
  - ✅ Event handlers for all chat types
  - ✅ Callback registration for: group messages, ticket updates, inquiry status changes

### 📋 TODO - Phase 2: Backend API Endpoints
- Create API endpoint: `POST /api/chat/group/send` - Save group messages
- Create API endpoint: `POST /api/chat/support/send` - Save support messages
- Create API endpoint: `POST /api/chat/inquiry/send` - Create inquiry request
- Create API endpoint: `POST /api/chat/inquiry/respond` - Accept/reject inquiry
- Create API endpoint: `POST /api/chat/inquiry/message` - Save inquiry chat messages
- Update Socket.IO handlers to emit events for: `receive-group-message`, `ticket-updated`, `inquiry-status-changed`

### 📋 TODO - Phase 3: UI Updates for Super Admin Panel (`superadmin/chatadmin.html`)
- Add tabs/sections for:
  - Direct Chats with Area Managers
  - Group Chats (create group feature)
  - Direct Support (chat with owners/tenants)
- Update message sending to use appropriate methods based on chat type
- Implement group management (add/remove members)

### 📋 TODO - Phase 4: UI Updates for Area Manager Panel (`areamanager/managerchat.html` or `/areachat.html`)
- Add tabs for:
  - Super Admin Chat
  - Group Chats
  - Customer Support (chat with owners/tenants)
- Implement support ticket status updates

### 📋 TODO - Phase 5: UI Updates for Property Owner Panel (`propertyowner/chat.html`)
- Add tabs for:
  - Tenant Chats (from rooms.html tenants list)
  - Support (chat with assigned Area Manager)
- Add support ticket creation

### 📋 TODO - Phase 6: UI Updates for Tenant Panel (`tenant/tenantchat.html`)
- Add tabs for:
  - Owner Chat
  - Support (chat with assigned Area Manager)

### 📋 TODO - Phase 7: UI Updates for Website Visitor Panel (`website/chathome.html` or new file)
- Inquiry request form (property selection, email, phone, message)
- Request status display
- Chat interface (after acceptance)

---

## Quick Start Guide

### For Super Admin Chat

#### Example: Chat with Area Manager (Direct)
```javascript
// In superadmin/chatadmin.html
window.ChatSocket.init('SUPER_ADMIN');
window.ChatSocket.joinRoom('RYGA6319'); // Area Manager ID

window.ChatSocket.onMessage((data) => {
    console.log('Received message from Area Manager:', data);
    displayMessage(data);
});

// Send message
await window.ChatSocket.sendMessage('Hello Area Manager', 'RYGA6319');
```

#### Example: Group Chat
```javascript
// Join existing group
window.ChatSocket.joinGroupChat('G001'); // Group ID

// Or create new group
// POST /api/chat/group/create { name, members: ['RYGA6319', 'RYGA7154'] }

window.ChatSocket.onGroupMessage((data) => {
    console.log('Group message:', data);
    displayGroupMessage(data);
});

// Send to group
await window.ChatSocket.sendGroupMessage('Hello Group', 'G001');
```

#### Example: Support Chat with Owner/Tenant
```javascript
// Create support ticket first
// POST /api/chat/support/create { from: 'SUPER_ADMIN', to: 'ROOMHY3986', subject, description }
// Returns: ticketId

// Join the support chat
window.ChatSocket.joinSupportChat('TK_001');

window.ChatSocket.onMessage((data) => {
    if (data.chatType === 'support') {
        displaySupportMessage(data);
    }
});

// Send message to owner/tenant
await window.ChatSocket.sendSupportMessage('How can I help?', 'TK_001', 'RYGA6319');
```

---

### For Area Manager Chat

#### Example: Chat with Super Admin
```javascript
// In areamanager/managerchat.html
window.ChatSocket.init('RYGA6319'); // Manager ID
window.ChatSocket.joinRoom('SUPER_ADMIN');

window.ChatSocket.onMessage((data) => {
    displayMessage(data);
});

await window.ChatSocket.sendMessage('Hi Super Admin', 'SUPER_ADMIN');
```

#### Example: Customer Support
```javascript
// Chat with tenant
window.ChatSocket.joinSupportChat('TK_001');
await window.ChatSocket.sendSupportMessage('Your issue details?', 'TK_001', 'TNTKO9862');
```

---

### For Property Owner Chat

#### Example: Chat with Tenant
```javascript
// In propertyowner/chat.html
window.ChatSocket.init('ROOMHY3986'); // Owner ID

// Get list of tenants from rooms (already exists in your system)
// For each tenant, create room ID
window.ChatSocket.joinRoom('TNTKO9862'); // Tenant ID

window.ChatSocket.onMessage((data) => {
    displayMessage(data);
});

await window.ChatSocket.sendMessage('Hi Tenant', 'TNTKO9862');
```

#### Example: Support Chat
```javascript
// Request support from Area Manager
window.ChatSocket.joinSupportChat('TK_002');
await window.ChatSocket.sendSupportMessage('Need help with maintenance', 'TK_002', 'RYGA6319');
```

---

### For Tenant Chat

#### Example: Chat with Owner
```javascript
// In tenant/tenantchat.html
window.ChatSocket.init('TNTKO9862'); // Tenant ID
window.ChatSocket.joinRoom('ROOMHY3986'); // Owner ID

window.ChatSocket.onMessage((data) => {
    displayMessage(data);
});

await window.ChatSocket.sendMessage('Hi Owner', 'ROOMHY3986');
```

---

### For Website Visitor Chat

#### Example: Send Property Inquiry
```javascript
// In website/chathome.html (or new chat interface)
window.ChatSocket.init('VISITOR_' + Date.now()); // Anonymous visitor ID

// Send inquiry for property
await window.ChatSocket.sendInquiryRequest(
    propertyId: 'ROOMHY3986',
    ownerId: 'ROOMHY3986',
    visitorEmail: 'visitor@example.com',
    visitorPhone: '+919876543210',
    message: 'Interested in viewing the property'
);

window.ChatSocket.onInquiryStatusChange((data) => {
    if (data.status === 'accepted') {
        // Owner accepted! Now can chat
        window.ChatSocket.joinInquiryChat(data.inquiryId);
    }
});
```

#### Example: Chat After Acceptance
```javascript
window.ChatSocket.onMessage((data) => {
    if (data.chatType === 'inquiry') {
        displayInquiryMessage(data);
    }
});

await window.ChatSocket.sendInquiryMessage('When can I view?', inquiryId);
```

---

## Database Models to Create

### 1. GroupChat Model
```javascript
{
  groupId: String (unique),
  name: String,
  description: String,
  members: [{ userId: String, joinedAt: Date }],
  createdBy: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 2. SupportTicket Model
```javascript
{
  ticketId: String (unique),
  from: String (owner/tenant ID),
  assignedTo: String (area manager ID),
  status: String ('open', 'in-progress', 'resolved', 'closed'),
  subject: String,
  description: String,
  priority: String ('low', 'medium', 'high'),
  messageCount: Number,
  createdAt: Date,
  respondedAt: Date,
  closedAt: Date,
  updatedAt: Date
}
```

### 3. PropertyInquiry Model
```javascript
{
  inquiryId: String (unique),
  propertyId: String,
  ownerId: String,
  visitorId: String,
  visitorEmail: String,
  visitorPhone: String,
  requestMessage: String,
  status: String ('pending', 'accepted', 'rejected'),
  chatStarted: Boolean (false),
  createdAt: Date,
  respondedAt: Date,
  updatedAt: Date
}
```

### 4. Update ChatMessage Model
```javascript
{
  from: String,
  to: String,
  message: String,
  roomId: String,
  chatType: String ('direct', 'group', 'support', 'inquiry'),
  groupId: String (optional, for group chats),
  ticketId: String (optional, for support),
  inquiryId: String (optional, for inquiries),
  status: String ('sent', 'delivered', 'read'),
  createdAt: Date,
  updatedAt: Date
}
```

---

## Next Steps

1. **Backend Developer**: Implement API endpoints for groups, support tickets, and inquiries
2. **Frontend Developer**: Update each HTML panel to use new chat methods based on user role
3. **Database**: Create the new models and update existing ChatMessage schema
4. **Testing**: Test each user role with their specific chat workflows

---

## Key Points

- ✅ All Socket.IO client methods are ready in `js/socket-chat.js`
- ✅ Event handlers are set up for all chat types
- ⏳ Backend API endpoints need to be created
- ⏳ UI panels need to be updated to support multiple chat types
- ⏳ Database models need to be created/updated

---

## Testing Checklist Template

### Super Admin
- [ ] Can see area managers list
- [ ] Can start direct chat with manager
- [ ] Can create group with multiple managers
- [ ] Can send/receive messages in direct chat
- [ ] Can send/receive messages in group chat
- [ ] Can initiate support chat with owner/tenant
- [ ] Messages persist in MongoDB
- [ ] Real-time message delivery works

### Area Manager
- [ ] Can chat with Super Admin
- [ ] Can join groups created by Super Admin
- [ ] Can send/receive group messages
- [ ] Can chat with owners/tenants for support
- [ ] Can update support ticket status

### Property Owner
- [ ] Can see list of their tenants
- [ ] Can start direct chat with tenant
- [ ] Can send/receive messages with tenant
- [ ] Can request support from Area Manager
- [ ] Can chat in support ticket

### Tenant
- [ ] Can chat with property owner
- [ ] Can request support from Area Manager
- [ ] Can chat in support ticket

### Website Visitor
- [ ] Can send property inquiry request
- [ ] Can see inquiry status (pending/accepted/rejected)
- [ ] Once accepted, can chat with owner
- [ ] Can send/receive messages in inquiry chat

