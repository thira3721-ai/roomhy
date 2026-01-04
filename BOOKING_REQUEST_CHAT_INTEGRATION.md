# Booking Requests ↔ Chat Integration

## Overview
Booking request members from `booking_request.html` now automatically appear in `areachat.html` for Area Managers to communicate with tenants.

## Changes Made

### 1. Backend: Auto-Create Chat on Booking Request
**File**: `/roomhy-backend/controllers/bookingController.js`

✅ **Added Chat Import**:
```javascript
const Chat = require('../models/Chat');
```

✅ **Auto-Create Chat in `createBookingRequest` function**:
- When a tenant submits a booking request, a chat is automatically created
- Chat type: `tenant_manager_booking`
- Participants: Tenant and Area Manager (based on property area)
- Initial message contains the booking request details
- Gracefully handles chat creation failures without blocking the booking

### 2. Frontend: Area Manager Chat Integration
**File**: `/Areamanager/areachat.html`

✅ **Enhanced `loadUserChats()` function**:
- Loads existing chats from `/api/chats/user/:user_id`
- Fetches pending booking requests from `/api/booking/requests?area=...`
- Merges booking requests with active chats
- Marks booking requests with `is_booking_request: true` flag

✅ **Updated `filterAndDisplayChats()` function**:
- Shows **Pending Booking Requests** section first (with red highlight)
- Displays tenant name and phone number for each request
- Shows booking status (pending, confirmed, etc.)
- Separates active chats below in a secondary section
- Visual distinction between booking requests and active chats

✅ **New `selectChat()` logic**:
- Detects pending booking requests
- Displays booking request summary instead of empty chat
- Shows "Accept & Chat" button to initialize the conversation
- Once accepted, converts to regular chat and creates Socket.IO connection

✅ **New `acceptBookingRequest()` function**:
- Triggered when Area Manager clicks "Accept & Chat"
- Calls `/api/chats/room/create` endpoint
- Creates unified chat with tenant
- Removes booking request from list
- Loads the new chat conversation

## Data Flow

### Booking Request → Chat Creation

```
1. Tenant submits booking request (property.html)
   ↓
2. Backend receives request (POST /api/booking)
   ↓
3. BookingController creates BookingRequest document
   ↓
4. **NEW**: Auto-creates Chat document with:
   - chat_id
   - chat_type: 'tenant_manager_booking'
   - participants: [tenant, area_manager]
   - booking_id reference
   - Initial message with booking details
   ↓
5. Area Manager opens areachat.html
   ↓
6. **NEW**: Page fetches both:
   - Existing chats from /api/chats/user/:user_id
   - Pending booking requests from /api/booking/requests
   ↓
7. Displays in unified list:
   - 📋 PENDING BOOKING REQUESTS (red section)
     └─ Tenant name, phone, status
   - 💬 ACTIVE CHATS (gray section)
     └─ Properties with ongoing conversations
```

## UI Components

### Pending Booking Request Display
```
📋 PENDING BOOKING REQUESTS
┌─ 🔴 Property Name
│  👤 Tenant Name
│  📞 +91 9876543210
│  Status: pending
└─ [✓ Accept & Chat Button]
```

### Active Chat Display
```
💬 ACTIVE CHATS
┌─ Property Name
│  👤 Tenant - Booking (or 🏢 Owner - Help Desk)
│  10 messages
└─ [Click to open]
```

## Features

✅ **Automatic Chat Creation**
- No manual chat creation needed
- Chat starts with booking request message

✅ **One-Click Acceptance**
- Area Manager clicks "Accept & Chat"
- Conversation begins immediately

✅ **Unified Chat List**
- Booking requests and active chats in one place
- Clear visual hierarchy (pending first)

✅ **Contact Information**
- Tenant name and phone visible before opening chat
- Easy identification of booking requests

✅ **Status Tracking**
- Booking status (pending, confirmed, cancelled, etc.)
- Shows in both list and detail view

## API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/chats/user/:user_id` | GET | Fetch area manager's chats |
| `/api/booking/requests?area=...` | GET | Fetch pending booking requests |
| `/api/chats/room/create` | POST | Create chat from booking request |
| `/api/chats/messages/:chat_id` | GET | Fetch chat messages |

## Benefits

🎯 **Streamlined Workflow**
- Tenants don't need to manually initiate chat
- Automatic chat creation when booking request made

🎯 **Better Organization**
- Pending requests clearly separated from active chats
- Area Managers see all interactions in one place

🎯 **Improved Communication**
- Contact info visible before opening chat
- Status indicator helps prioritize responses

🎯 **Seamless Integration**
- Booking system and chat system now unified
- No data duplication or sync issues

## Testing Checklist

- [ ] Tenant submits booking request on property.html
- [ ] Booking appears in area manager's booking_request.html
- [ ] Booking request automatically appears in areachat.html
- [ ] Area Manager can see tenant name and phone in list
- [ ] Clicking "Accept & Chat" creates conversation
- [ ] Messages between tenant and area manager work
- [ ] Visit scheduling available for booking chats
- [ ] Previous chats still appear in active list
- [ ] Chat list updates when new booking arrives
- [ ] Socket.IO connection established after accepting

## Notes

- Booking requests show with red highlight and alert emoji for visibility
- Chat auto-creation includes initial request message
- Chat creation failures don't block the booking (graceful degradation)
- Area manager's area is used to filter relevant booking requests
- Phone number displayed from booking request data
- Status field helps Area Manager prioritize responses

---

**Status**: ✅ Implementation Complete
**Integration**: Booking requests ↔ Chat system fully unified
