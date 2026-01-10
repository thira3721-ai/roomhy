# DEPLOYMENT CHECKLIST - CHAT SYSTEM

**Project:** Roomhy Chat System  
**Date:** January 9, 2026  
**Version:** 1.0 STABLE

---

## PRE-DEPLOYMENT VERIFICATION

### ✅ Backend Code
- [x] ChatRoom.js model created with proper schema
- [x] ChatMessage.js model created with proper schema
- [x] chatController.js with 8 endpoints implemented
- [x] chatRoutes.js with all routes defined
- [x] server.js updated with chat route integration
- [x] Booking status check implemented (CRITICAL)
- [x] Role-based access control implemented
- [x] Error handling on all endpoints
- [x] Input validation on all endpoints

### ✅ Frontend Code
- [x] propertyowner/chat.html created
- [x] website/chat.html created
- [x] tenant/chat.html created
- [x] Areamanager/chat.html created
- [x] superadmin/chat-analytics.html created
- [x] propertyowner/booking_request.html modified (Chat button added)
- [x] Chat button only shows when booking.status === 'accepted'
- [x] Real-time polling implemented (3-second intervals)
- [x] Read receipt indicators working
- [x] Unread badge tracking working

### ✅ Database
- [x] ChatRoom schema defined with indexes
- [x] ChatMessage schema defined with indexes
- [x] room_id index (unique) created
- [x] participants.user_id index created
- [x] sent_at index created
- [x] room_id + sent_at compound index created
- [x] context.booking_id index created

### ✅ Integration
- [x] Chat routes integrated in server.js
- [x] Chat button integrated in booking_request.html
- [x] API endpoints accessible at /api/chat/*
- [x] CORS configured for cross-origin requests
- [x] Session storage for chat context working
- [x] User authentication flowing through chat system

---

## DEPLOYMENT STEPS

### Step 1: Backend Deployment

#### 1.1 Deploy to Render/Heroku/Cloud Platform
```bash
# If using Render (current setup):
git push origin main
# Render auto-deploys on push

# If using Heroku:
git push heroku main
```

#### 1.2 Verify Backend is Running
```bash
curl https://roomhy-backend.onrender.com/api/health
# Should return 200 OK
```

#### 1.3 Verify Chat Routes are Loaded
```bash
curl https://roomhy-backend.onrender.com/api/chat/rooms
# Should return 400 Bad Request (missing params) not 404
# If 404, chat routes not integrated
```

#### 1.4 Check MongoDB Connection
```javascript
// In Node.js console or backend logs:
// Should see: "MongoDB connected successfully"
// Should NOT see any connection errors
```

### Step 2: Frontend Deployment

#### 2.1 Deploy Chat HTML Files
```bash
# Upload these files to web server:
- /propertyowner/chat.html
- /website/chat.html
- /tenant/chat.html
- /Areamanager/chat.html
- /superadmin/chat-analytics.html

# Ensure they're accessible at:
- https://domain.com/propertyowner/chat.html
- https://domain.com/website/chat.html
- etc.
```

#### 2.2 Verify HTML Files Load
```bash
curl -I https://domain.com/propertyowner/chat.html
# Should return 200 OK, not 404
```

#### 2.3 Update booking_request.html
```bash
# Ensure modified version is deployed with:
# - Chat column header added
# - Chat button in each row
# - openChat() function defined
```

### Step 3: Database Setup

#### 3.1 Create MongoDB Collections (if not auto-created)
```javascript
// In MongoDB Atlas console:

// Create ChatRoom collection
db.createCollection("ChatRoom", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["room_id"],
      properties: {
        room_id: { bsonType: "string" }
      }
    }
  }
});

// Create ChatMessage collection
db.createCollection("ChatMessage");
```

#### 3.2 Create Indexes
```javascript
// In MongoDB Atlas console:

// ChatRoom indexes
db.ChatRoom.createIndex({ room_id: 1 }, { unique: true });
db.ChatRoom.createIndex({ "participants.user_id": 1 });
db.ChatRoom.createIndex({ room_type: 1 });
db.ChatRoom.createIndex({ "context.booking_id": 1 });

// ChatMessage indexes
db.ChatMessage.createIndex({ room_id: 1 });
db.ChatMessage.createIndex({ sent_at: 1 });
db.ChatMessage.createIndex({ "sender.user_id": 1 });
db.ChatMessage.createIndex({ room_id: 1, sent_at: 1 });
```

#### 3.3 Verify Indexes
```javascript
// In MongoDB Atlas console:
db.ChatRoom.getIndexes();
db.ChatMessage.getIndexes();
// Should see all indexes created above
```

### Step 4: Configuration Check

#### 4.1 Verify API_URL in HTML Files
```javascript
// In all chat.html files, check:
const API_URL = 'https://roomhy-backend.onrender.com';
// Should match your actual backend URL
```

#### 4.2 Verify CORS Headers
```bash
curl -H "Origin: https://yourdomain.com" \
     -H "Access-Control-Request-Method: POST" \
     https://roomhy-backend.onrender.com/api/chat/rooms
# Should return CORS headers allowing requests
```

#### 4.3 Verify User Session Storage
```javascript
// In browser console on property.html:
console.log(JSON.parse(localStorage.getItem('user')));
// Should show user object with loginId, name, etc.
```

### Step 5: Testing - Critical Rule

#### 5.1 Test Booking Status Check
```javascript
// Test 1: Chat with PENDING booking
// Create booking with status='pending'
// Try to access chat API
// Expected: 403 Forbidden

// Test 2: Chat with ACCEPTED booking
// Update booking to status='accepted'
// Try to access chat API
// Expected: 200 OK with room created
```

#### 5.2 Test Chat Button Visibility
```javascript
// In browser DevTools on booking_request.html
// For pending booking: Chat button should NOT appear
// For accepted booking: Chat button SHOULD appear
```

#### 5.3 Test Role-Based Access
```javascript
// Super Admin: Try to send message
// Expected: 403 Forbidden error

// Website User: Try to send message
// Expected: 200 OK, message created
```

### Step 6: Testing - All Workflows

#### 6.1 Website User Flow
- [ ] Login as website user
- [ ] Book a property
- [ ] Owner accepts booking (manually update DB or through admin)
- [ ] Chat button appears in property details
- [ ] Click Chat → opens chat.html
- [ ] Can send message
- [ ] Can receive message from owner
- [ ] Unread badge shows

#### 6.2 Property Owner Flow
- [ ] Login as property owner
- [ ] Go to Booking Requests page
- [ ] Find accepted booking
- [ ] Chat button visible in table
- [ ] Click Chat → opens chat.html
- [ ] Can see conversation history
- [ ] Can send message
- [ ] Receives real-time updates

#### 6.3 Tenant Flow
- [ ] Login as tenant
- [ ] Navigate to /tenant/chat.html
- [ ] See chats with property owners (if any accepted bookings)
- [ ] Can send message to owner
- [ ] Green-themed UI displays correctly

#### 6.4 Area Manager Flow
- [ ] Login as area manager
- [ ] Navigate to /Areamanager/chat.html
- [ ] See support conversations
- [ ] Can respond to messages
- [ ] Sender role badges display correctly

#### 6.5 Super Admin Flow
- [ ] Login as super admin
- [ ] Navigate to /superadmin/chat-analytics.html
- [ ] Analytics tab shows statistics
- [ ] Messages tab can view all conversations
- [ ] Cannot send message (input disabled + API blocked)
- [ ] Charts display room distribution and activity

### Step 7: Performance Testing

#### 7.1 Response Time
```bash
# Test API response time
time curl https://roomhy-backend.onrender.com/api/chat/messages/test_room
# Should be < 200ms
```

#### 7.2 Load Testing
```bash
# Test with concurrent users (using Apache Bench or similar)
ab -n 1000 -c 10 https://roomhy-backend.onrender.com/api/chat/rooms?user_id=test&user_role=website-user
# Should handle 1000+ requests without errors
```

#### 7.3 Message Polling
```javascript
// Monitor network tab while viewing chat
// Should see GET requests every 3 seconds
// Each request should be < 100ms
```

---

## POST-DEPLOYMENT VERIFICATION

### ✅ Production Checks

- [ ] Chat button appears in booking_request.html for accepted bookings
- [ ] Chat button does NOT appear for pending bookings
- [ ] Website users can chat with owners
- [ ] Property owners can chat with multiple tenants
- [ ] Tenants can chat with property owners
- [ ] Area managers can see support chats
- [ ] Super admin can view all chats but cannot send
- [ ] Unread badges appear and update correctly
- [ ] Read receipts (✓ sent, ✓✓ read) work
- [ ] Messages persist after page refresh
- [ ] Real-time polling updates every 3 seconds
- [ ] No JavaScript errors in browser console
- [ ] No 404 errors for chat HTML files
- [ ] No 403 errors for authorized users
- [ ] Database indexes are being used (check MongoDB slow query log)
- [ ] CORS errors are resolved

### ✅ Backend Logs Check

```bash
# Check for these logs:
[INFO] Chat routes initialized
[INFO] ChatRoom model loaded
[INFO] ChatMessage model loaded
[INFO] MongoDB connected

# Should NOT see:
[ERROR] Cannot find module 'chatController'
[ERROR] ChatRoom collection not found
[ERROR] MongoDB connection failed
```

### ✅ Error Monitoring

- [ ] No 500 errors in production logs
- [ ] All 403 errors are intentional (blocked super-admin, unauthorized access)
- [ ] No unhandled promise rejections
- [ ] All API errors return proper JSON response

---

## ROLLBACK PLAN

If issues occur, rollback steps:

### Option 1: Quick Rollback
```bash
# Remove chat routes from server.js
# Redeploy backend
git revert <commit_hash>
git push origin main
```

### Option 2: Database Cleanup
```bash
# If data is corrupted, drop collections and start fresh:
db.ChatRoom.drop();
db.ChatMessage.drop();
# Collections will be recreated on first use
```

### Option 3: Disable Chat Feature
```javascript
// In server.js, comment out chat routes:
// app.use('/api/chat', require('./routes/chatRoutes'));
// Redeploy
```

---

## MONITORING & MAINTENANCE

### Daily Checks (First Week)
- [ ] Check backend uptime
- [ ] Verify no 500 errors in logs
- [ ] Test chat with multiple users
- [ ] Check database size growth
- [ ] Monitor polling frequency

### Weekly Checks
- [ ] Check database indexes performance
- [ ] Review error logs
- [ ] Test all 5 user roles
- [ ] Verify unread badge accuracy
- [ ] Test booking status check

### Monthly Checks
- [ ] Analyze chat usage statistics
- [ ] Check database disk space
- [ ] Review slow query logs
- [ ] Update API response times
- [ ] Clean up old/archived chats (if implemented)

### Database Maintenance
```javascript
// Monthly: Check index usage
db.ChatRoom.stats();
db.ChatMessage.stats();

// Monthly: Rebuild indexes if needed
db.ChatMessage.reIndex();

// Quarterly: Archive old messages (if needed)
db.ChatMessage.deleteMany({ sent_at: { $lt: new Date(Date.now() - 90*24*60*60*1000) } });
```

---

## SUCCESS CRITERIA

✅ **Deployment is successful when:**

1. **Chat Button Works**
   - Appears only for accepted bookings
   - Opens chat.html in new window
   - Shows user context correctly

2. **Messages Flow**
   - Users can send messages
   - Messages appear in real-time
   - Read receipts show correctly
   - Messages persist across page refresh

3. **All Roles Work**
   - Website users can chat with owners
   - Owners can chat with multiple users
   - Tenants can chat with owners
   - Area managers can handle support
   - Super admin can view but not send

4. **Performance**
   - Chat loads in < 2 seconds
   - Messages appear within 3 seconds
   - No noticeable lag during typing
   - API responses < 100ms

5. **Security**
   - Booking status check enforced
   - Super admin cannot send (403)
   - Only participants can access
   - No unauthorized access

6. **No Errors**
   - No 404 errors for chat files
   - No 500 errors from API
   - No CORS errors in browser
   - No JavaScript errors in console

---

## SIGN-OFF

**Backend Developer:** _______________  
**Frontend Developer:** _______________  
**QA Tester:** _______________  
**DevOps Engineer:** _______________  
**Project Manager:** _______________  

**Date Deployed:** _______________  
**Production URL:** _______________  
**Issues Found:** _______________  
**Status:** [ ] LIVE [ ] ISSUES [ ] ROLLBACK

---

## ADDITIONAL RESOURCES

- **Technical Doc:** CHAT_SYSTEM_IMPLEMENTATION_COMPLETE.md
- **Quick Ref:** CHAT_SYSTEM_QUICK_REFERENCE.md
- **API Tests:** CHAT_API_TESTING_EXAMPLES.md
- **Backend Code:** /roomhy-backend/controllers/chatController.js
- **Frontend Code:** /{propertyowner,website,tenant,Areamanager,superadmin}/chat.html
- **Database Models:** /roomhy-backend/models/{ChatRoom,ChatMessage}.js

---

**Deployment Guide Version:** 1.0  
**Last Updated:** January 9, 2026  
**Status:** READY FOR PRODUCTION DEPLOYMENT ✅
