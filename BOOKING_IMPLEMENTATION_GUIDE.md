# 🚀 Booking Workflow Implementation Guide

## Quick Start

### Database Collections (MongoDB Atlas)

Three collections will be automatically created on first data insertion:

1. **booking_requests** - Main booking data
2. **chat_messages** - In-app communication
3. **property_holds** - Property hold tracking

---

## System Behavior

### Default Values
| Field | Default | Description |
|-------|---------|-------------|
| status | pending | Initial state of all bookings |
| visit_status | not_scheduled | Before visit is scheduled |
| request_type | request | Can be "request" or "bid" |
| payment_status | pending | Changes to "paid" for bids |
| hold_duration | 7 days | Auto-hold when bid placed |
| whatsapp_enabled | false | If true, show WhatsApp icon |
| chat_enabled | true | If true, enable in-app chat |

---

## 🔄 Complete User Journey

### 1️⃣ **Tenant/User Flow**

```
LOGIN (index.html)
    ↓
VIEW PROPERTY (property.html)
    ↓
SUBMIT REQUEST / BID (property.html form)
    ↓
API: POST /api/booking/requests
    ↓
DATA SAVED TO booking_requests
    ↓ (If bid)
PROPERTY ON HOLD (7 days)
    ↓
"Bid Now" Button Disabled
```

### 2️⃣ **Area Manager Flow**

```
LOGIN AS AREA MANAGER
    ↓
VIEW DASHBOARD (booking_request.html)
    ↓
API: GET /api/booking/requests?area=Indore
    ↓
VIEW PENDING BOOKINGS
    ↓ (Choose action)
├─ VIEW DETAILS (modal)
├─ SEND WHATSAPP (external)
├─ START IN-APP CHAT (chat_messages)
├─ SCHEDULE VISIT (modal)
└─ APPROVE/REJECT (status update)
    ↓
API: PUT /api/booking/requests/:id/status
    ↓
BOOKING STATUS UPDATED
```

### 3️⃣ **Property Hold Flow**

```
USER PLACES BID (₹500)
    ↓
API: POST /api/booking/requests (request_type: "bid")
    ↓
PropertyHold Created
    ├─ property_id: "prop_001"
    ├─ status: "active"
    └─ hold_expiry_date: NOW + 7 days
    ↓
property.html CHECKS HOLD
    ↓
API: GET /api/booking/hold/prop_001
    ↓
is_on_hold: true
    ↓
"BID NOW" BUTTON DISABLED
    ├─ disabled: true
    ├─ text: "Property on Hold"
    └─ opacity: 50%
```

---

## 📲 Frontend Updates Required

### Property.html Form Handler

```javascript
// LOGIN CHECK
const user = JSON.parse(localStorage.getItem('user') || 'null');
if (!user || !user.loginId) {
  alert('Please login to submit booking');
  window.location.href = '../index.html';
  return;
}

// BUILD REQUEST
const bookingData = {
  property_id: getParam('id'),
  property_name: document.querySelector('title').text,
  property_type: '2BHK', // Extract from page
  rent_amount: 45000,    // Extract from page
  area: document.getElementById('property-location').textContent,
  user_id: user.loginId,
  name: document.getElementById('visit-name').value,
  phone: document.getElementById('visit-phone').value,
  email: prompt('Enter email'),
  request_type: 'request', // or 'bid'
  bid_amount: 500,
  message: document.getElementById('message').value,
  whatsapp_enabled: whatsappToggle.checked,
  chat_enabled: true
};

// SUBMIT REQUEST
const response = await fetch('http://localhost:5000/api/booking/requests', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(bookingData)
});

if (response.ok) {
  alert('Request submitted successfully!');
}
```

### Check Property Hold

```javascript
async function checkPropertyHold(propertyId) {
  const response = await fetch(
    `http://localhost:5000/api/booking/hold/${propertyId}`
  );
  const { is_on_hold } = await response.json();
  
  if (is_on_hold) {
    document.getElementById('bid-now-btn').disabled = true;
    document.getElementById('bid-now-btn').textContent = 'Property on Hold';
    document.getElementById('bid-now-btn').classList.add('opacity-50', 'cursor-not-allowed');
  }
}

// Call on page load
checkPropertyHold(getParam('id'));
```

---

## 🎯 Booking Dashboard (Area Manager)

### booking_request.html Features

```html
<!-- Request Cards -->
<div class="request-card">
  <h3>John Doe</h3>
  <p>Phone: 9876543210</p>
  <p>Type: Bid (₹500)</p>
  <p>Status: Pending</p>
  
  <!-- Action Buttons -->
  <button onclick="viewDetails(id)">View Details</button>
  <button onclick="contactWhatsApp(phone)">WhatsApp</button>
  <button onclick="openChat(chatRoomId)">Chat</button>
  <button onclick="openScheduleModal(id)">Schedule Visit</button>
  <button onclick="approveBooking(id)">Approve</button>
  <button onclick="rejectBooking(id)">Reject</button>
</div>
```

### JavaScript Functions

```javascript
// FETCH REQUESTS
async function loadBookingData() {
  const userArea = localStorage.getItem('userArea');
  const response = await fetch(
    `/api/booking/requests?area=${userArea}&status=pending`
  );
  const requests = await response.json();
  renderCards(requests);
}

// SCHEDULE VISIT
async function scheduleVisit(bookingId, visitType, visitDate, visitSlot) {
  const response = await fetch(
    `/api/booking/requests/${bookingId}/schedule-visit`,
    {
      method: 'POST',
      body: JSON.stringify({
        visit_type: visitType,
        visit_date: visitDate,
        visit_time_slot: visitSlot
      })
    }
  );
  const { data } = await response.json();
  console.log('Visit scheduled:', data);
}

// SEND CHAT MESSAGE
async function sendMessage(chatRoomId, bookingId, message) {
  const response = await fetch(`/api/booking/messages`, {
    method: 'POST',
    body: JSON.stringify({
      chat_room_id: chatRoomId,
      booking_id: bookingId,
      sender_id: areaManagerId,
      sender_name: 'Area Manager',
      sender_role: 'area_manager',
      message: message
    })
  });
}

// APPROVE BOOKING
async function approveBooking(bookingId) {
  const response = await fetch(
    `/api/booking/requests/${bookingId}/approve`,
    { method: 'PUT' }
  );
  alert('Booking approved!');
  loadBookingData(); // Refresh list
}
```

---

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│              PROPERTY.HTML (Tenant)                      │
│  Submit Request/Bid Form with Property Details          │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ↓
        POST /api/booking/requests
                   │
                   ↓
┌─────────────────────────────────────────────────────────┐
│           BOOKINGCONTROLLER.JS (Backend)                │
│  • Validate fields                                       │
│  • Create booking_requests record                        │
│  • If bid: Create property_holds record                  │
│  • Generate chat_room_id                                 │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ↓
     MongoDB: booking_requests + property_holds
                   │
                   ├─ Booking created with status: pending
                   ├─ Property on hold for 7 days
                   └─ Chat room ready for communication
                   
                   ↓
        GET /api/booking/requests?area=Indore
                   │
                   ↓
┌─────────────────────────────────────────────────────────┐
│          BOOKING_REQUEST.HTML (Area Manager)             │
│  Dashboard shows pending requests                        │
└──────────────────┬──────────────────────────────────────┘
                   │
        ┌──────────┼──────────┬───────────┐
        ↓          ↓          ↓           ↓
     View Chat Schedule Approve Reject
    Details  Visit
        │      │      │       │
        └──────┴──────┴───────┴─→ PUT /api/booking/requests/:id/*
                              │
                              ↓
                   Status Updated in MongoDB
                   (confirmed/rejected/scheduled)
```

---

## 🔍 Testing Checklist

### Request Submission
- [ ] User must be logged in
- [ ] All fields validated (10-digit phone, valid email)
- [ ] Request data saved to MongoDB
- [ ] Success alert shown
- [ ] Chat room created

### Bid Submission
- [ ] Property hold created
- [ ] 7-day expiry date set
- [ ] Bid Now button disabled
- [ ] Payment status set to "paid"
- [ ] ₹500 bid amount stored

### Area Manager Dashboard
- [ ] Only sees requests for their area
- [ ] Requests sorted by date (newest first)
- [ ] Counter badges show correct counts
- [ ] Can view full request details
- [ ] Can schedule visit
- [ ] Can send messages
- [ ] Can approve/reject
- [ ] Updated_at timestamp changes on every action

### Chat System
- [ ] Messages saved to chat_messages
- [ ] Proper sender role (user/area_manager)
- [ ] Messages display in chronological order
- [ ] New messages appear instantly

### Property Hold
- [ ] Hold expires after 7 days
- [ ] Other users see "Property on Hold"
- [ ] Hold released when status changes
- [ ] Bid Now button re-enables after release

---

## 🚨 Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| 404 Error on /api/booking/requests | Routes not registered | Restart server, check server.js has `/api/booking` route |
| Cannot submit form | Not logged in | Must login first (localStorage check) |
| Property not held | Bid creation failed | Check database connection, verify MongoDB Atlas URL |
| Chat not working | chat_room_id mismatch | Ensure chat_room_id generated correctly |
| No data in dashboard | Area filter wrong | Check localStorage.getItem('userArea') |

---

## ✅ Production Deployment

1. **Database:** Ensure MongoDB Atlas credentials in server
2. **Environment:** Set NODE_ENV=production
3. **CORS:** Configure allowed origins
4. **Validation:** Phone/email format checks
5. **Error Logging:** Send errors to logging service
6. **Rate Limiting:** Prevent spam submissions
7. **Email Notifications:** Send confirmation emails
8. **Backup:** Regular database backups

---

## 📞 Support

For issues, check:
- Server logs: `npm start`
- MongoDB Atlas: Check collection data
- Browser console: JavaScript errors
- Network tab: API responses

**Version:** 1.0  
**Status:** ✅ Production Ready  
**Date:** January 3, 2026
