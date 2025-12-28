# Bidding Workflow - Complete API Documentation

## Overview
This document outlines the complete bidding system for the Roomhy platform, including two different workflows:
- **Hostel/PG**: "Bid to All" - Broadcast bid to matching properties
- **Apartment/Flat**: "Bid Now" - Single property bid

## Key Features
- No token system
- Student pays activation fee (₹49/₹99) to avoid spam
- Visit security (₹500 refundable) when scheduling visit
- Chat opens only after owner acceptance
- Auto-expiry logic (7 days)
- Payment & refund system

---

## API Endpoints

### 1. Create Bid
**POST** `/api/bids/create`

**Authentication:** Required (Bearer Token)

**Request Body:**
```json
{
  "propertyId": "prop_123456",
  "propertyTitle": "Athena House",
  "bidType": "Bid to All",
  "studentId": "student_xyz",
  "activationFee": 49,
  "visitSecurity": 500,
  "totalAmount": 549,
  "status": "pending",
  "expiryAt": "2025-12-28T12:30:00Z",
  "visitsAllowed": 2,
  "paymentId": "pay_123456"
}
```

**Response (Success):**
```json
{
  "success": true,
  "bidId": "bid_123456",
  "message": "Bid created successfully",
  "data": {
    "_id": "bid_123456",
    "propertyId": "prop_123456",
    "studentId": "student_xyz",
    "status": "pending",
    "createdAt": "2025-12-21T12:30:00Z",
    "expiryAt": "2025-12-28T12:30:00Z"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Payment failed",
  "statusCode": 400
}
```

---

### 2. Get Student Bids
**GET** `/api/bids/student/:studentId`

**Authentication:** Required

**Query Parameters:**
- `status` (optional): "pending", "accepted", "rejected", "expired"
- `limit` (optional): Default 20
- `skip` (optional): Default 0

**Response:**
```json
{
  "success": true,
  "bids": [
    {
      "_id": "bid_123456",
      "propertyId": "prop_123456",
      "propertyTitle": "Athena House",
      "bidType": "Bid to All",
      "status": "pending",
      "activationFee": 49,
      "visitSecurity": 500,
      "totalAmount": 549,
      "createdAt": "2025-12-21T12:30:00Z",
      "expiryAt": "2025-12-28T12:30:00Z",
      "visitsScheduled": 0,
      "visitsAllowed": 2,
      "chatOpen": false,
      "paymentStatus": "success"
    }
  ],
  "total": 5,
  "page": 1
}
```

---

### 3. Accept/Reject Bid (Owner)
**PATCH** `/api/bids/:bidId/respond`

**Authentication:** Required (Owner)

**Request Body:**
```json
{
  "action": "accept",
  "propertyOwnerId": "owner_123",
  "message": "Welcome! We're excited to show you our property."
}
```

**Response:**
```json
{
  "success": true,
  "bidId": "bid_123456",
  "status": "accepted",
  "chatEnabled": true,
  "message": "Bid accepted successfully. Chat is now open."
}
```

---

### 4. Schedule Visit
**POST** `/api/bids/:bidId/visits`

**Authentication:** Required (Student)

**Request Body:**
```json
{
  "studentId": "student_xyz",
  "visitDate": "2025-12-25",
  "visitTime": "14:30",
  "notes": "I'm interested in the double occupancy option"
}
```

**Validations:**
- Visit allowed only AFTER owner acceptance
- Max 1-2 visits per bid
- Visit date must be minimum 24 hours in future
- Student security must be paid

**Response:**
```json
{
  "success": true,
  "visitId": "visit_123456",
  "bidId": "bid_123456",
  "visitDate": "2025-12-25T14:30:00Z",
  "status": "scheduled",
  "visitNumber": "1 of 2",
  "securityStatus": "held",
  "securityAmount": 500,
  "message": "Visit scheduled successfully. Please arrive 10 minutes early."
}
```

---

### 5. Update Visit Status
**PATCH** `/api/visits/:visitId/status`

**Authentication:** Required (Owner)

**Request Body:**
```json
{
  "status": "completed",
  "notes": "Student showed good interest, waiting for feedback"
}
```

**Status Options:**
- `scheduled` - Visit is booked
- `completed` - Student attended
- `no-show` - Student didn't attend (security forfeited)
- `cancelled` - Visit cancelled

**Response:**
```json
{
  "success": true,
  "visitId": "visit_123456",
  "status": "completed",
  "securityStatus": "held",
  "message": "Visit marked as completed"
}
```

---

### 6. Open Chat (After Acceptance)
**POST** `/api/chats/init`

**Authentication:** Required

**Request Body:**
```json
{
  "bidId": "bid_123456",
  "studentId": "student_xyz",
  "propertyOwnerId": "owner_123"
}
```

**Constraints:**
- Chat only opens AFTER owner accepts bid
- Chat auto-closes after:
  - Booking confirmed (student pays full rent)
  - Bid expires (7 days)
  - Both parties reject

**Response:**
```json
{
  "success": true,
  "chatId": "chat_123456",
  "participants": [
    {
      "userId": "student_xyz",
      "role": "student",
      "name": "Yasmine",
      "phone": null,
      "whatsapp": null
    },
    {
      "userId": "owner_123",
      "role": "owner",
      "name": "John Doe",
      "phone": null,
      "whatsapp": null
    }
  ],
  "status": "active",
  "expiresAt": "2025-12-28T12:30:00Z",
  "message": "Chat opened successfully. Phone/WhatsApp numbers are hidden for security."
}
```

---

### 7. Send Chat Message
**POST** `/api/chats/:chatId/messages`

**Authentication:** Required

**Request Body:**
```json
{
  "senderId": "student_xyz",
  "message": "Hi! Can you tell me more about the rooms?",
  "attachments": []
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "msg_123456",
  "timestamp": "2025-12-21T13:45:00Z",
  "status": "delivered"
}
```

---

### 8. Process Payment (Bid Activation + Security)
**POST** `/api/payments/process`

**Authentication:** Required

**Request Body:**
```json
{
  "bidId": "bid_123456",
  "studentId": "student_xyz",
  "amount": 549,
  "activationFee": 49,
  "visitSecurity": 500,
  "paymentMethod": "upi",
  "upiId": "student@upi",
  "orderId": "order_123456"
}
```

**Payment Gateway Integration:**
- Razorpay / Stripe
- UPI, Card, Net Banking support

**Response:**
```json
{
  "success": true,
  "paymentId": "pay_123456",
  "transactionId": "txn_123456",
  "bidId": "bid_123456",
  "amount": 549,
  "status": "success",
  "details": {
    "activationFeeCharged": 49,
    "visitSecurityHeld": 500
  },
  "receipt": "https://payments.roomhy.com/receipt/pay_123456"
}
```

---

### 9. Refund Visit Security
**POST** `/api/payments/refund-security`

**Authentication:** Required (Admin/System)

**Request Body:**
```json
{
  "visitId": "visit_123456",
  "bidId": "bid_123456",
  "studentId": "student_xyz",
  "reason": "booking_confirmed",
  "refundAmount": 500
}
```

**Refund Reasons:**
- `booking_confirmed` - Student booked the property
- `bid_expired` - Bid expired without booking
- `student_cancelled` - Student cancelled the bid
- `property_cancelled` - Owner cancelled (full refund)

**Response:**
```json
{
  "success": true,
  "refundId": "rfnd_123456",
  "amount": 500,
  "status": "processed",
  "estimatedCredit": "2-3 business days",
  "message": "Refund initiated successfully"
}
```

---

### 10. Auto-Expire Bids (Scheduled Task)
**POST** `/api/bids/auto-expire`

**Authentication:** Required (System/Admin)

**Description:** Runs automatically every hour

**Logic:**
```
For each bid where status = "pending":
  If expiryAt < now():
    - Update bid status to "expired"
    - Refund activation fee to student
    - Refund visit security to student
    - Close any open chats
    - Send notification to student
```

**Response:**
```json
{
  "success": true,
  "message": "Auto-expiry processed",
  "expired": 15,
  "refunded": 15,
  "totalRefunded": 7500
}
```

---

### 11. Confirm Booking
**POST** `/api/bookings/confirm`

**Authentication:** Required (Student)

**Request Body:**
```json
{
  "bidId": "bid_123456",
  "propertyId": "prop_123456",
  "studentId": "student_xyz",
  "moveInDate": "2026-01-15",
  "duration": 12,
  "roomType": "single",
  "monthlyRent": 12000
}
```

**Logic:**
- After booking confirmation:
  - Refund visit security to student
  - Close chat
  - Mark bid as "completed"
  - Generate booking agreement
  - Send welcome email

**Response:**
```json
{
  "success": true,
  "bookingId": "book_123456",
  "moveInDate": "2026-01-15",
  "duration": 12,
  "monthlyRent": 12000,
  "securityRefunded": 500,
  "agreement": "https://documents.roomhy.com/book_123456.pdf"
}
```

---

### 12. Get Owner Bids
**GET** `/api/bids/owner/:propertyOwnerId`

**Authentication:** Required (Owner)

**Query Parameters:**
- `propertyId` (optional): Filter by property
- `status` (optional): "pending", "accepted", "rejected", "expired"

**Response:**
```json
{
  "success": true,
  "bids": [
    {
      "_id": "bid_123456",
      "propertyId": "prop_123456",
      "propertyTitle": "Athena House",
      "studentId": "student_xyz",
      "studentName": "Yasmine",
      "studentPhone": "hidden",
      "bidType": "Bid to All",
      "status": "pending",
      "createdAt": "2025-12-21T12:30:00Z",
      "expiresIn": "7 days",
      "visitsScheduled": 0,
      "chatOpen": false
    }
  ],
  "total": 12,
  "pending": 8,
  "accepted": 3,
  "rejected": 1
}
```

---

## Database Schema

### Bids Collection
```javascript
{
  _id: ObjectId,
  propertyId: String,
  propertyTitle: String,
  bidType: String, // "Bid to All" or "Bid Now"
  studentId: String,
  propertyOwnerId: String,
  status: String, // "pending", "accepted", "rejected", "expired", "completed"
  activationFee: Number,
  visitSecurity: Number,
  totalAmount: Number,
  paymentId: String,
  paymentStatus: String, // "pending", "success", "failed", "refunded"
  createdAt: Date,
  expiryAt: Date,
  acceptedAt: Date,
  rejectedAt: Date,
  visitsScheduled: Number,
  visitsAllowed: Number,
  chatId: String,
  chatOpen: Boolean,
  chatOpenedAt: Date,
  chatClosedAt: Date,
  bookingConfirmed: Boolean,
  bookingId: String
}
```

### Visits Collection
```javascript
{
  _id: ObjectId,
  bidId: String,
  studentId: String,
  propertyId: String,
  propertyOwnerId: String,
  visitDate: Date,
  visitTime: String,
  status: String, // "scheduled", "completed", "no-show", "cancelled"
  notes: String,
  createdAt: Date,
  securityStatus: String, // "held", "refunded", "forfeited"
  securityAmount: Number
}
```

### Payments Collection
```javascript
{
  _id: ObjectId,
  paymentId: String,
  bidId: String,
  studentId: String,
  amount: Number,
  type: String, // "activation", "security", "refund"
  status: String, // "pending", "success", "failed"
  paymentGateway: String, // "razorpay", "stripe"
  transactionId: String,
  receipt: String,
  createdAt: Date,
  completedAt: Date
}
```

### Chats Collection
```javascript
{
  _id: ObjectId,
  chatId: String,
  bidId: String,
  studentId: String,
  propertyOwnerId: String,
  status: String, // "active", "closed"
  openedAt: Date,
  closedAt: Date,
  expiresAt: Date,
  messages: [
    {
      _id: ObjectId,
      senderId: String,
      message: String,
      timestamp: Date,
      status: String // "delivered", "read"
    }
  ]
}
```

---

## Frontend Data Storage (LocalStorage)

### Student Bids (roomhy_bids)
```json
[
  {
    "_id": "bid_123456",
    "propertyId": "prop_123456",
    "propertyTitle": "Athena House",
    "bidType": "Bid to All",
    "status": "pending",
    "activationFee": 49,
    "visitSecurity": 500,
    "totalAmount": 549,
    "createdAt": "2025-12-21T12:30:00Z",
    "expiryAt": "2025-12-28T12:30:00Z",
    "visitsScheduled": 0,
    "visitsAllowed": 2,
    "chatOpen": false
  }
]
```

---

## Notification System

### To Student
1. **Bid Confirmation Email**
   - Bid accepted/rejected
   - Chat link
   - Expiry reminder

2. **Visit Scheduled**
   - Visit confirmation
   - Property address
   - Owner contact (hidden)

3. **Chat Messages**
   - New message from owner
   - Push notification

4. **Auto-Expiry Alert**
   - Bid expiring in 1 day
   - Refund status

### To Owner
1. **New Bid Received**
   - Student bid details
   - Property name
   - Action required: Accept/Reject

2. **Visit Scheduled**
   - Date & time
   - Student availability

3. **Chat Messages**
   - New message from student
   - Push notification

---

## Security Considerations

### Phone/WhatsApp Protection
- Phone numbers are never displayed in chat
- Communication happens only through in-app messaging
- No direct contact sharing until booking confirmed

### Payment Security
- All payments processed through secure gateways
- PCI DSS compliant
- SSL encryption for all transactions
- No card data stored on servers

### Fraud Prevention
- Activation fee (₹49/₹99) prevents spam bids
- Visit security deposit prevents no-shows
- Student verification before bidding
- Owner verification before accepting bids

---

## Business Logic Rules

### Bid Lifecycle
```
PENDING (Created)
  ├─> ACCEPTED (Owner accepts) → Chat Opens
  │     ├─> COMPLETED (Student books)
  │     └─> EXPIRED (Auto-expiry)
  ├─> REJECTED (Owner rejects)
  └─> EXPIRED (Auto-expiry after 7 days)
```

### Visit Rules
- 1-2 visits allowed per bid
- Visit only after owner acceptance
- No-show forfeits security
- Security refunded on booking confirmation

### Chat Rules
- Opens only after owner acceptance
- Auto-closes after bid expiry
- Auto-closes after booking confirmation
- Phone numbers blocked
- WhatsApp sharing blocked

### Payment Rules
- ₹49-99 activation fee (non-refundable)
- ₹500 visit security (refundable)
- Refund on booking or bid expiry
- No-show visits forfeit security

---

## Testing Checklist

- [ ] Bid creation with payment
- [ ] Bid expiry auto-processing
- [ ] Visit scheduling & security
- [ ] Chat opening rules
- [ ] Payment processing
- [ ] Refund processing
- [ ] Notification system
- [ ] Owner bid management
- [ ] Student bid tracking
- [ ] Auto-close chat on booking

---

## Implementation Roadmap

1. **Phase 1**: Bid creation & payment system
2. **Phase 2**: Owner response & notifications
3. **Phase 3**: Visit scheduling & security
4. **Phase 4**: Chat system with auto-close
5. **Phase 5**: Auto-expiry & refund automation
6. **Phase 6**: Admin dashboard & reporting
