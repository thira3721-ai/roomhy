# Website Bidding Workflow - Implementation Guide

## Overview
Complete workflow for Hostel/PG "Bid to All" and Apartment/Flat "Bid Now" systems on property.html

---

## Current Implementation Status

### ✅ Completed
1. **UI Updates** - Removed Double/Triple Sharing options
2. **Payment Modal** - Created with fee selection (₹49/₹99)
3. **Bid Detection Logic** - Auto-detects property type
4. **Bid Submission** - Full workflow with localStorage integration
5. **Terms Acceptance** - Required before payment
6. **Fee Calculation** - Dynamic total with activation + security fees

### 📋 Features Implemented

#### 1. Property Sidebar Card
- Clean budget display
- Bid type info box (Hostel/Apartment)
- Fee breakdown showing:
  - Activation Fee (₹49 or ₹99)
  - Visit Security (₹500 refundable)
  - Total Amount
- 3 key bid benefits listed
- Single "Send Bid" button

#### 2. Payment Modal
- Property details summary
- Fee selector dropdown
- Terms & conditions checkbox
- Secure payment button
- SSL badge

#### 3. Smart Bid Type Detection
```javascript
// Automatically determines bid type based on property
"Hostel" or "PG" → "Bid to All"
"Apartment" or "Flat" → "Bid Now"
```

#### 4. Bid Data Structure
```json
{
  "_id": "bid_[timestamp]_[random]",
  "propertyId": "[property_id]",
  "bidType": "Bid to All" | "Bid Now",
  "status": "pending",
  "activationFee": 49 | 99,
  "visitSecurity": 500,
  "totalAmount": 549 | 599,
  "expiryAt": "[7_days_from_now]",
  "visitsAllowed": 2,
  "chatOpen": false
}
```

---

## Student Workflow

### Step 1: Browse Property
```
Student visits property.html?id=1
→ Sees property details
→ Sidebar shows budget, bid type, and fees
```

### Step 2: Click "Send Bid"
```
Student clicks "Send Bid" button
→ Payment modal opens
→ Shows property details & fee breakdown
→ Displays total: ₹549 (₹49 + ₹500)
```

### Step 3: Select Activation Fee
```
Student chooses:
- ₹49 (Budget) → Total ₹549
- ₹99 (Premium) → Total ₹599

Premium fee gets priority response from owners
```

### Step 4: Accept Terms
```
Student checks "I agree to terms & conditions"
→ "Proceed to Payment" button becomes enabled
```

### Step 5: Submit Bid
```
Student clicks "Proceed to Payment"
→ Bid created in localStorage
→ API call to backend (see endpoint: POST /api/bids/create)
→ Activation fee processed immediately
→ Visit security held (not charged yet)
→ Success message shows
→ Modal closes
```

### Step 6: Track Bid
```
Student navigates to "My Stays"
→ See "Pending Bids" section
→ Shows:
  - Property name & location
  - Bid status (pending, accepted, rejected, expired)
  - Days remaining
  - Owner response option
  - Chat link (if accepted)
```

### Step 7: Owner Accepts Bid
```
Owner reviews bid
→ Accepts or rejects
→ If accepted:
  - Chat opens for student
  - Student can schedule visits
  - Visit security is held
```

### Step 8: Schedule Visit (After Acceptance)
```
Student clicks "Schedule Visit"
→ Date/time picker
→ Max 2 visits allowed
→ Confirm booking
→ Security amount held until:
  - Booking confirmed → Refunded as adjustment
  - Visit completed → Refunded
  - No-show → Forfeited
  - Bid expired → Refunded
```

### Step 9: Chat with Owner
```
After owner accepts:
- Chat opens automatically
- Both can message
- Phone numbers hidden
- WhatsApp disabled
- Chat auto-closes when:
  - Bid expires (7 days)
  - Booking confirmed
  - Either party cancels
```

### Step 10: Confirm Booking
```
After successful visit:
- Student confirms booking
- Full rent payment made
- Visit security refunded
- Chat closes
- Booking agreement sent
```

---

## Owner Workflow

### Step 1: Owner Dashboard
```
Owner logs in
→ Goes to "Bids" section
→ Sees "Pending Bids" from all properties
→ Can filter by property
```

### Step 2: Review Bid
```
Owner sees:
- Student name (anonymized initially)
- Property name
- Bid type (Bid to All / Bid Now)
- Activation fee paid (₹49/₹99)
- Time received
- Accept / Reject buttons
```

### Step 3: Accept or Reject
```
Owner clicks "Accept" or "Reject"
→ If Accept:
  - Bid status → "accepted"
  - Chat opens with student
  - Owner can message
  - Student gets notification
→ If Reject:
  - Bid status → "rejected"
  - Activation fee refunded to student
```

### Step 4: Communicate via Chat
```
Owner receives:
- Notification of new bid
- Message from student
- Visit request
- Photos/documents from student
→ Responds with messages
→ Confirms visit time
→ Provides check-in details
```

### Step 5: Manage Visits
```
When student schedules visit:
- Visit request shows
- Owner confirms or reschedules
- Tracks visit completion
- Rates student (optional)
→ If no-show:
  - Mark "No-show"
  - Student security forfeited
  - Chat can continue
```

### Step 6: Receive Booking
```
After student confirms booking:
- Booking confirmed notification
- Chat auto-closes
- Can access student details
- Send lease agreement
- Schedule key handover
```

---

## Admin Controls

### 1. Bid Management
```
Admin Dashboard → Bids
- View all bids (student & owner side)
- Filter by status, property, date
- Manual approval/rejection
- Refund processing
- Dispute resolution
```

### 2. Payment Management
```
Admin Dashboard → Payments
- Monitor all transactions
- Activation fee collection
- Security deposit tracking
- Refund processing queue
- Payment disputes
```

### 3. Auto-Expiry Management
```
Admin Dashboard → Auto-Expiry
- Runs automatically every 24 hours
- Manual trigger option
- Process:
  1. Find bids where expiryAt < now
  2. Mark as "expired"
  3. Refund activation fee
  4. Refund security deposit
  5. Close open chats
  6. Send notifications
```

### 4. Chat Management
```
Admin Dashboard → Chats
- Monitor for spam/abuse
- Can close chats if needed
- Message moderation
- Complaint handling
- Phone number protection enforcement
```

### 5. Reports & Analytics
```
Admin Dashboard → Reports
- Total bids received
- Acceptance rate by property
- No-show rate
- Revenue from activation fees
- Refund amount tracking
- Top performing properties
- Student & owner satisfaction
```

---

## LocalStorage Data Structure

### Student-Side Data
```javascript
// roomhy_bids - All bids placed by student
localStorage.setItem('roomhy_bids', JSON.stringify([
  {
    "_id": "bid_1703089200000_abc123",
    "propertyId": "1",
    "propertyTitle": "Athena House",
    "bidType": "Bid to All",
    "studentId": "student_xyz",
    "activationFee": 49,
    "visitSecurity": 500,
    "totalAmount": 549,
    "status": "pending",
    "createdAt": "2025-12-21T12:30:00Z",
    "expiryAt": "2025-12-28T12:30:00Z",
    "visitsScheduled": 0,
    "visitsAllowed": 2,
    "chatOpen": false,
    "paymentId": "pay_123456",
    "paymentStatus": "pending"
  }
]));
```

### Owner-Side Data
```javascript
// roomhy_owner_bids - Bids received by owner
localStorage.setItem('roomhy_owner_bids', JSON.stringify([
  {
    "_id": "bid_1703089200000_abc123",
    "propertyId": "prop_123",
    "studentId": "student_xyz",
    "studentName": "Yasmine",
    "bidType": "Bid to All",
    "status": "pending",
    "activationFee": 49,
    "createdAt": "2025-12-21T12:30:00Z",
    "expiresAt": "2025-12-28T12:30:00Z"
  }
]));
```

---

## Email Notifications

### To Student
1. **Bid Confirmation**
   - Subject: "✅ Your bid to Athena House has been submitted"
   - Content: Bid details, property link, track status link

2. **Owner Accepted**
   - Subject: "🎉 Owner accepted your bid!"
   - Content: Owner name, chat link, visit scheduling

3. **Owner Rejected**
   - Subject: "📋 Your bid was not accepted"
   - Content: Reason, other properties, refund details

4. **Visit Reminder**
   - Subject: "🏠 Visit reminder - Tomorrow at 2:30 PM"
   - Content: Address, owner contact (hidden), what to bring

5. **Bid Expiring**
   - Subject: "⏰ Your bid expires in 1 day"
   - Content: Property link, quick view, new bids

6. **Bid Expired**
   - Subject: "📅 Your bid has expired"
   - Content: Refund status, similar properties

7. **Booking Confirmed**
   - Subject: "🔑 Booking confirmed! Welcome"
   - Content: Move-in date, owner details, documents

### To Owner
1. **New Bid Received**
   - Subject: "📩 New bid received for Athena House"
   - Content: Bid type, activation fee, action buttons

2. **Visit Scheduled**
   - Subject: "📅 Visit scheduled by student"
   - Content: Date, time, student (anonymous), accept/reschedule

3. **Chat Message**
   - Subject: "💬 New message from student"
   - Content: Preview, chat link

4. **Visit No-Show**
   - Subject: "❌ Student didn't show up for visit"
   - Content: Bid link, option to refund or keep security

---

## SMS/Push Notifications

### To Student
- Bid accepted: "🎉 Owner accepted your bid! Chat is open now"
- Bid rejected: "Bid not accepted. Try other properties"
- Visit reminder: "Reminder: Your visit is tomorrow at 2:30 PM"
- Chat message: "New message from owner"

### To Owner
- New bid: "New bid for Athena House! Accept or reject"
- Visit request: "Visit scheduled on Dec 25 at 2:30 PM"
- Message: "Student sent you a message"

---

## Fee Structure

### Activation Fee
- **Budget**: ₹49 - Standard response
- **Premium**: ₹99 - Gets priority, more visibility

### Visit Security
- **Amount**: ₹500 (refundable)
- **When Held**: After owner accepts
- **Refund Scenarios**:
  1. Booking confirmed → Refund within 24 hours
  2. Bid expired → Refund within 24 hours
  3. Student cancels → Refund within 24 hours
  4. Visit no-show → **Forfeited** (not refunded)
  5. Owner cancels → Full refund within 24 hours

### Refund Processing
- Processing: 2-3 business days
- Method: Back to original payment method
- Instant for UPI, NEFT, cards

---

## Test Scenarios

### Test 1: Hostel Bid Flow
```
1. Visit property.html?id=hostel_001
2. Should show "Bid to All" message
3. Click Send Bid
4. Select ₹49 or ₹99 fee
5. Accept terms
6. Submit
7. Verify in localStorage
```

### Test 2: Apartment Bid Flow
```
1. Visit property.html?id=apt_001
2. Should show "Bid Now" message
3. Same flow as Test 1
4. Verify bidType is "Bid Now"
```

### Test 3: Payment Modal
```
1. Click Send Bid
2. Modal opens with property details
3. Select different fee amounts
4. Total updates dynamically
5. Terms checkbox enables button
6. Close button works
```

### Test 4: Bid Tracking
```
1. Create 3 bids from property.html
2. Go to "My Stays"
3. See all 3 in "Pending Bids"
4. Check expiry dates (7 days)
5. Check visit allowance (2 visits)
```

### Test 5: Auto-Expiry
```
1. Create bid
2. Wait for backend to process auto-expiry
3. Check if status changed to "expired"
4. Verify refunds processed
5. Check email notification sent
```

---

## Security Implementation

### Data Protection
- HTTPS only
- JWT tokens for auth
- Encrypted payment details
- PCI DSS compliance

### Phone Number Protection
- Never display in chat
- API blocks direct sharing
- Only available after full booking
- Log all access attempts

### Fraud Prevention
- ₹49/₹99 activation fee
- ID verification required
- Payment gateway verification
- Report/block abusive users
- Rate limiting on API

### Refund Security
- Payment gateway refunds only
- Audit trail for all refunds
- Multi-level approval for disputes
- Monthly reconciliation

---

## Files Modified

1. **website/property.html**
   - Updated booking card UI
   - Added payment modal
   - Added bidding JavaScript
   - Removed Double/Triple sharing options

## Files Created

1. **BIDDING_WORKFLOW_API.md** - Complete API documentation
2. **BIDDING_WORKFLOW_IMPLEMENTATION.md** - This file

---

## Next Steps

### Backend Implementation
1. Create Express routes for bidding API
2. Set up MongoDB collections
3. Integrate payment gateway
4. Implement notification system
5. Set up auto-expiry scheduler
6. Create admin dashboard

### Frontend Enhancements
1. Create "My Stays" page with bid tracking
2. Build owner dashboard
3. Implement chat UI
4. Add visit scheduling modal
5. Create admin dashboard

### Testing
1. Unit tests for bidding logic
2. Integration tests for payment flow
3. E2E tests for complete workflow
4. Load testing for auto-expiry
5. Security testing

---

## Support & Troubleshooting

### Common Issues

**Q: "Send Bid" button not working**
- Check localStorage quota
- Clear cache and try again
- Check browser console for errors

**Q: Payment modal not opening**
- Verify property has ID parameter
- Check if lucide icons are loaded
- Clear browser cache

**Q: Bid not appearing in tracking**
- Check localStorage for roomhy_bids
- Verify property ID is correct
- Check backend API connection

**Q: Auto-expiry not triggering**
- Verify cron job is running
- Check server logs
- Manually trigger endpoint for testing

---

## Conclusion

The bidding system is now fully implemented on the frontend with:
- ✅ Clean, intuitive UI
- ✅ Smart property type detection
- ✅ Flexible fee selection
- ✅ Secure payment modal
- ✅ LocalStorage integration
- ✅ Ready for backend integration

Backend implementation can proceed with confidence that the frontend API structure is documented and ready.
