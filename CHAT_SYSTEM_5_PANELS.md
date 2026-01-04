# RoomHy Chat System - 5 Panel Architecture

## System Overview
Complete chat workflow system with 5 different user role panels, each with specific chat types and features.

---

## Panel 1: Super Admin Chat (`superadmin/chatadmin.html`)

### Chat Types:
1. **Direct Chat with Area Managers** 
   - List of all Area Managers added to the system
   - One-to-one conversations with individual managers
   - Real-time messaging

2. **Group Chats**
   - Create groups with multiple Area Managers
   - Broadcast messages to all members
   - Group management (add/remove members)

3. **Direct Support (Customer Support)**
   - Chat with Property Owners or Tenants
   - Initiated via Area Manager connection (Area Manager connects the request)
   - Ticket-based support system

### Room Structure:
```
- Direct Chat: SUPER_ADMIN_[MANAGER_ID]
- Group Chat: GROUP_SUPERADMIN_[GROUP_ID]
- Support Ticket: SUPPORT_SUPERADMIN_[OWNER/TENANT_ID]
```

---

## Panel 2: Area Manager Chat (`areamanager/managerchat.html`)

### Chat Types:
1. **Direct Chat with Super Admin**
   - One-to-one with Super Admin
   - Real-time messaging

2. **Group Chats**
   - Participate in groups created by Super Admin
   - Can create their own groups
   - Communicate with other managers

3. **Customer Support**
   - Chat with Property Owners or Tenants
   - Act as support agent/help desk
   - Manage multiple support conversations

### Room Structure:
```
- Direct Chat: SUPER_ADMIN_[MANAGER_ID]
- Group Chat: GROUP_[GROUP_ID]
- Support Ticket: SUPPORT_[OWNER/TENANT_ID]_[MANAGER_ID]
```

---

## Panel 3: Property Owner Chat (`propertyowner/chat.html`)

### Chat Types:
1. **Chat with Tenants**
   - List of tenants added to rooms/properties
   - Direct messaging with each tenant
   - Property-related discussions

2. **Support Chat with Area Manager**
   - Reach out to assigned Area Manager
   - Get help with issues, complaints, or enquiries
   - Support ticket system

### Room Structure:
```
- Tenant Chat: OWNER_[OWNER_ID]_TENANT_[TENANT_ID]
- Support Ticket: SUPPORT_[OWNER_ID]_[MANAGER_ID]
```

---

## Panel 4: Tenant Chat (`tenant/tenantchat.html`)

### Chat Types:
1. **Chat with Property Owner**
   - Direct messaging with property owner
   - Ask questions about property/rent/maintenance

2. **Support Chat with Area Manager**
   - Escalate issues to support team
   - Get help from customer support
   - Support ticket system

### Room Structure:
```
- Owner Chat: OWNER_[OWNER_ID]_TENANT_[TENANT_ID]
- Support Ticket: SUPPORT_TENANT_[TENANT_ID]_[MANAGER_ID]
```

---

## Panel 5: Website Visitor Chat (`website/chathome.html`)

### Chat Types:
1. **Chat with Property Owner (After Request Approval)**
   - Visitor sends chat request for a property
   - Owner accepts/rejects the request
   - Once accepted: real-time chat between visitor and owner
   - Discuss property details, viewing, etc.

### Room Structure:
```
- Visitor Chat: PROPERTY_[PROPERTY_ID]_VISITOR_[VISITOR_ID]_OWNER_[OWNER_ID]
- Request Status: INQUIRY_REQUEST_[INQUIRY_ID]
```

---

## Database Models Required

### ChatMessage (Existing - Enhance)
```javascript
{
  from: String (userId),
  to: String (userId),
  message: String,
  roomId: String,
  chatType: String ('direct', 'group', 'support', 'inquiry'),
  status: String ('sent', 'delivered', 'read'),
  createdAt: Date,
  updatedAt: Date
}
```

### GroupChat (New)
```javascript
{
  groupId: String,
  name: String,
  members: [String], // Array of user IDs
  createdBy: String,
  createdAt: Date,
  updatedAt: Date
}
```

### SupportTicket (New)
```javascript
{
  ticketId: String,
  from: String (Owner/Tenant),
  assignedTo: String (Manager),
  status: String ('open', 'in-progress', 'resolved', 'closed'),
  subject: String,
  description: String,
  priority: String ('low', 'medium', 'high'),
  messages: [ObjectId], // Reference to ChatMessages
  createdAt: Date,
  updatedAt: Date
}
```

### PropertyInquiry (New - for website visitors)
```javascript
{
  inquiryId: String,
  propertyId: String,
  visitorId: String,
  visitorEmail: String,
  visitorPhone: String,
  ownerId: String,
  status: String ('pending', 'accepted', 'rejected'),
  requestMessage: String,
  chatStarted: Boolean,
  createdAt: Date,
  respondedAt: Date
}
```

---

## Socket.IO Events

### Core Events (Already Implemented)
- `join-room`: Join a specific room
- `leave-room`: Leave a specific room
- `send-message`: Send a message to a room
- `receive-message`: Receive message from room

### New Events (To Implement)
- `create-group`: Create a new group
- `add-to-group`: Add member to group
- `remove-from-group`: Remove member from group
- `create-support-ticket`: Create support ticket
- `update-ticket-status`: Update support ticket status
- `send-inquiry-request`: Visitor sends inquiry request
- `accept-inquiry`: Owner accepts visitor request
- `reject-inquiry`: Owner rejects visitor request

---

## Enhanced Socket.Chat.js Methods

### Existing Methods (Keep)
- `init(userId)`
- `joinRoom(otherUserId)`
- `leaveRoom()`
- `sendMessage(message, to)`
- `onMessage(callback)`

### New Methods (Add)
```javascript
// Group Chat
joinGroupChat(groupId)
leaveGroupChat(groupId)
createGroup(groupName, members)
addToGroup(groupId, userId)
removeFromGroup(groupId, userId)
onGroupMessage(callback)

// Support Tickets
createSupportTicket(assignedTo, subject, description, priority)
updateTicketStatus(ticketId, status)
onSupportTicketUpdate(callback)

// Inquiry System
sendInquiryRequest(propertyId, ownerId, message, email, phone)
acceptInquiry(inquiryId)
rejectInquiry(inquiryId)
onInquiryStatusChange(callback)
```

---

## Room ID Naming Convention

| Chat Type | Room ID Format | Example |
|-----------|---|---|
| Direct 1-to-1 | `[USER1]_[USER2]` (sorted) | `RYGA6319_SUPER_ADMIN` |
| Group Chat | `GROUP_[GROUP_ID]` | `GROUP_SUPERADMIN_G001` |
| Support Ticket | `SUPPORT_[TICKET_ID]` | `SUPPORT_TK_001` |
| Property Inquiry | `INQUIRY_[INQUIRY_ID]` | `INQUIRY_INQ_001` |
| Tenant to Owner | `OWNER_[OWNER_ID]_TENANT_[TENANT_ID]` | `OWNER_ROOMHY3986_TENANT_TNTKO9862` |

---

## Implementation Steps

### Phase 1: Backend (server.js & routes)
1. ✅ Keep existing send-message endpoint
2. ⬜ Add API endpoints for groups
3. ⬜ Add API endpoints for support tickets
4. ⬜ Add API endpoints for inquiries
5. ⬜ Add Socket.IO handlers for new events

### Phase 2: Socket.IO Client Enhancement (socket-chat.js)
1. ✅ Keep existing init, joinRoom, sendMessage
2. ⬜ Add group chat methods
3. ⬜ Add support ticket methods
4. ⬜ Add inquiry methods
5. ⬜ Add event handlers for new types

### Phase 3: UI Implementation
1. ⬜ Super Admin Panel (Groups, Direct, Support)
2. ⬜ Area Manager Panel (Direct, Groups, Support)
3. ⬜ Property Owner Panel (Tenants, Support)
4. ⬜ Tenant Panel (Owner, Support)
5. ⬜ Website Visitor Panel (Inquiry Request, Chat)

### Phase 4: Testing
1. ⬜ Test each panel's chat types
2. ⬜ Test cross-role communications
3. ⬜ Test group functionality
4. ⬜ Test support tickets
5. ⬜ Test inquiry workflow

---

## Current Status

### ✅ Completed
- Basic Socket.IO setup
- Direct 1-to-1 messaging
- Message persistence to MongoDB
- Real-time message reception

### ⏳ In Progress
- Message reception on client side (fixing callbacks)

### ⬜ Not Started
- Group chat functionality
- Support ticket system
- Property inquiry system
- Multi-panel UI redesign

---

## Testing Checklist

### Super Admin Panel
- [ ] Can see list of Area Managers
- [ ] Can start direct chat with manager
- [ ] Can create group with multiple managers
- [ ] Can send messages in group chat
- [ ] Can receive support requests from owners/tenants
- [ ] Can chat with owner/tenant in support mode

### Area Manager Panel
- [ ] Can chat directly with Super Admin
- [ ] Can see and join groups
- [ ] Can start support chat with owners/tenants
- [ ] Can send/receive messages
- [ ] Can update support ticket status

### Property Owner Panel
- [ ] Can see list of tenants
- [ ] Can start direct chat with tenant
- [ ] Can reach out to support (Area Manager)
- [ ] Can send/receive messages

### Tenant Panel
- [ ] Can chat with property owner
- [ ] Can reach out to support (Area Manager)
- [ ] Can send/receive messages

### Website Visitor Panel
- [ ] Can send inquiry request for property
- [ ] Can see request status (pending/accepted/rejected)
- [ ] Once accepted, can chat with owner
- [ ] Can send/receive messages

