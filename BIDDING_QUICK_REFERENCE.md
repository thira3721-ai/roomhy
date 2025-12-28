# Bidding Workflow - Quick Reference Guide

## 🎯 What Was Implemented

### Frontend Changes (property.html)
- ✅ Removed Double Sharing & Triple Sharing options
- ✅ New payment modal with fee selection
- ✅ Smart bid type detection (Hostel/PG vs Apartment)
- ✅ Bid submission workflow with localStorage
- ✅ Dynamic fee calculation (₹49/₹99 + ₹500 security)
- ✅ Terms & conditions acceptance
- ✅ Success/error handling

### Key Files Created
1. **BIDDING_WORKFLOW_API.md** - Complete API documentation
2. **BIDDING_WORKFLOW_IMPLEMENTATION.md** - Implementation guide
3. **BIDDING_BACKEND_TEMPLATE.js** - Node.js/Express backend template

---

## 📱 User Flows

### Student Flow
```
1. Browse Property → 2. Click "Send Bid" 
→ 3. Payment Modal Opens 
→ 4. Select Fee (₹49 or ₹99) 
→ 5. Accept Terms 
→ 6. Submit → 7. Success!
```

### Owner Flow
```
1. Receive Bid → 2. Review → 3. Accept/Reject
→ 4. Chat Opens (if accepted)
→ 5. Manage Visits → 6. Confirm Booking
```

---

## 💰 Fee Structure

| Component | Amount | Status |
|-----------|--------|--------|
| Activation Fee (Budget) | ₹49 | One-time, Non-refundable |
| Activation Fee (Premium) | ₹99 | One-time, Non-refundable |
| Visit Security | ₹500 | Refundable |
| **Total (Budget)** | **₹549** | **After 7 days or booking** |
| **Total (Premium)** | **₹599** | **After 7 days or booking** |

---

## 🔄 Bid Lifecycle

```
CREATED
  ↓
PENDING (0-7 days) ──→ AUTO-EXPIRE (Refund ₹549/₹599)
  ├─→ ACCEPTED (Owner accepts)
  │     ├─→ COMPLETED (Student books) → Refund Security
  │     └─→ EXPIRED (Not accepted)
  └─→ REJECTED (Owner rejects) → Refund Activation Fee
```

---

## 🏠 Property Types

### Hostel / PG
- Shows: **"Bid to All"**
- Description: *"Your bid will be sent to all matching properties in this area"*
- Button: **"Send Bid"**
- Multi-property broadcast

### Apartment / Flat
- Shows: **"Bid Now"**
- Description: *"Your bid will be sent only to this property"*
- Button: **"Bid Now"**
- Single property bid

---

## 📊 Key Business Rules

### Bids
- Max 1 active bid per property per student
- Auto-expire after 7 days
- Chat only after owner accepts
- Can be rejected/accepted by owner

### Visits
- Max 1-2 visits per bid
- Only after owner acceptance
- Minimum 24 hours notice
- No-show forfeits security
- Booking confirmation refunds security

### Chat
- Opens only after acceptance
- Phone numbers blocked
- WhatsApp sharing blocked
- Auto-closes after:
  - Bid expiry (7 days)
  - Booking confirmed
  - Either party cancels

### Payments
- Processed via payment gateway
- Activation fee: Non-refundable (except rejection)
- Security deposit: Refundable on booking/expiry
- No-show: Security forfeited (₹500)

---

## 🔌 API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/bids/create` | Create new bid |
| GET | `/api/bids/student/:id` | Get student's bids |
| PATCH | `/api/bids/:id/respond` | Owner accept/reject |
| POST | `/api/bids/:id/visits` | Schedule visit |
| PATCH | `/api/visits/:id/status` | Update visit status |
| POST | `/api/chats/init` | Open chat |
| POST | `/api/chats/:id/messages` | Send message |
| POST | `/api/payments/process` | Process payment |
| POST | `/api/payments/refund-security` | Refund security |
| POST | `/api/bids/auto-expire` | Auto-expire job |

---

## 📂 File Structure

```
website/
├── property.html                          (✅ Updated with bidding)
├── mystays.html                           (📋 TODO: Show pending bids)
├── ownerlogin.html                        (📋 TODO: Owner dashboard)
│
roomhy-backend/
├── routes/
│   └── bidding.js                         (📋 TODO: Implement API)
├── models/
│   ├── Bid.js                            (📋 TODO: Create model)
│   ├── Visit.js                          (📋 TODO: Create model)
│   ├── Chat.js                           (📋 TODO: Create model)
│   └── Payment.js                        (📋 TODO: Create model)
├── controllers/
│   └── bidController.js                  (📋 TODO: Business logic)
└── middleware/
    └── auth.js                           (✅ Exists, use for auth)

Documentation/
├── BIDDING_WORKFLOW_API.md               (✅ Created)
├── BIDDING_WORKFLOW_IMPLEMENTATION.md    (✅ Created)
└── BIDDING_BACKEND_TEMPLATE.js           (✅ Created)
```

---

## 🚀 Next Steps

### Immediate (Week 1)
- [ ] Test bidding flow manually on property.html
- [ ] Set up MongoDB collections
- [ ] Create Bid, Visit, Chat, Payment models

### Short-term (Week 2-3)
- [ ] Implement backend API endpoints
- [ ] Integrate payment gateway (Razorpay/Stripe)
- [ ] Set up notification system (Email/SMS)
- [ ] Create "My Stays" page with bid tracking

### Medium-term (Week 4-5)
- [ ] Build owner dashboard
- [ ] Implement auto-expiry cron job
- [ ] Chat system with WebSocket
- [ ] Admin dashboard & reporting

### Long-term (Week 6+)
- [ ] Mobile app version
- [ ] Advanced analytics
- [ ] Referral system
- [ ] Premium features

---

## 🧪 Testing Checklist

### Frontend Testing
- [ ] Click "Send Bid" on Hostel property
- [ ] See "Bid to All" message
- [ ] Click "Send Bid" on Apartment property
- [ ] See "Bid Now" message
- [ ] Open payment modal
- [ ] Select different activation fees
- [ ] Total amount updates correctly
- [ ] Terms checkbox enables submit button
- [ ] Submit bid successfully
- [ ] Check localStorage for bid data
- [ ] Close modal with X button

### Backend Testing (When Ready)
- [ ] Create bid with POST /api/bids/create
- [ ] Get bids with GET /api/bids/student/:id
- [ ] Accept bid with PATCH /api/bids/:id/respond
- [ ] Schedule visit with POST /api/bids/:id/visits
- [ ] Send chat message with POST /api/chats/:id/messages
- [ ] Process payment with POST /api/payments/process
- [ ] Refund security with POST /api/payments/refund-security
- [ ] Auto-expire with POST /api/bids/auto-expire

### Integration Testing
- [ ] End-to-end bid + payment flow
- [ ] Notification delivery
- [ ] Chat opening rules
- [ ] Visit security handling
- [ ] Auto-expiry + refund processing
- [ ] Multiple concurrent bids

---

## 🔐 Security Checklist

- [ ] JWT authentication on all endpoints
- [ ] Phone number protection in chat
- [ ] Payment gateway integration (PCI compliant)
- [ ] Input validation on all endpoints
- [ ] Rate limiting on API
- [ ] HTTPS enforcement
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF tokens
- [ ] Audit logging for all transactions

---

## 📊 Database Schema Quick Reference

### Bids
```javascript
{
  _id, propertyId, studentId, propertyOwnerId,
  status, expiryAt, chatId, chatOpen,
  activationFee, visitSecurity, totalAmount,
  paymentId, paymentStatus, visitsAllowed
}
```

### Visits
```javascript
{
  _id, bidId, studentId, propertyId,
  visitDate, status, securityStatus, securityAmount
}
```

### Chats
```javascript
{
  _id, bidId, studentId, propertyOwnerId,
  status, messages[], expiresAt
}
```

### Payments
```javascript
{
  _id, bidId, studentId, amount, type,
  status, transactionId, reason
}
```

---

## 💬 Communication Protocol

### Email Templates Needed
1. Bid confirmation
2. Owner accepted
3. Owner rejected
4. Visit reminder
5. Bid expiring
6. Bid expired
7. Booking confirmed
8. Refund processed

### SMS/Push Templates
1. Bid accepted notification
2. Visit reminder
3. New chat message
4. Bid expired alert
5. Refund confirmation

---

## 📞 Support Reference

### Common Issues & Solutions

**Issue**: "Bid not saving to localStorage"
**Solution**: 
- Check browser storage quota
- Clear cache and try again
- Verify property ID is in URL

**Issue**: "Payment modal not opening"
**Solution**:
- Ensure lucide icons are loaded
- Check console for errors
- Verify property.html loaded completely

**Issue**: "Bid type showing wrong"
**Solution**:
- Verify propertyType in localStorage property
- Check if property contains "Hostel", "PG", "Apartment", "Flat"
- Manual property type in database if needed

---

## 🎓 Code Examples

### Getting Bid Data from localStorage
```javascript
const bids = JSON.parse(localStorage.getItem('roomhy_bids') || '[]');
const activeBids = bids.filter(b => b.status === 'pending');
```

### Submitting a Bid (Frontend)
```javascript
const bidData = {
  propertyId: "1",
  bidType: "Bid to All",
  activationFee: 49,
  visitSecurity: 500
};
// Data already handled in property.html JavaScript
```

### Creating Bid (Backend - Express)
```javascript
router.post('/api/bids/create', auth, async (req, res) => {
  const bid = new Bid(req.body);
  await bid.save();
  // Process payment, send notifications, etc.
});
```

---

## 📈 Metrics to Track

- [ ] Bids created per day
- [ ] Acceptance rate %
- [ ] Average response time
- [ ] Visits scheduled per bid
- [ ] No-show rate %
- [ ] Booking conversion rate %
- [ ] Revenue from activation fees
- [ ] Refund amount processed
- [ ] Chat message count
- [ ] User satisfaction rating

---

## 🎉 Success Criteria

✅ **When This Feature is Live:**
1. Students can place bids on properties
2. Owners receive and respond to bids
3. Chat opens only after acceptance
4. Visits are tracked with security deposit
5. Bids auto-expire after 7 days
6. Payments are processed securely
7. Refunds are automated
8. Admin can track all transactions

---

## 📞 Contact & Support

For questions about implementation:
1. Check the API documentation: `BIDDING_WORKFLOW_API.md`
2. Review implementation guide: `BIDDING_WORKFLOW_IMPLEMENTATION.md`
3. Use backend template: `BIDDING_BACKEND_TEMPLATE.js`
4. Test on property.html directly

---

**Last Updated**: December 21, 2025
**Status**: ✅ Frontend Complete | 📋 Backend Ready for Implementation
**Ready for**: Backend development, testing, deployment
