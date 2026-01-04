# COMPLETE BOOKING WORKFLOW - PROPERTY TO AREA MANAGER

## 📋 Workflow Overview

This document explains the complete end-to-end flow of how a user's booking request flows from the property page through to the area manager's dashboard.

---

## STEP 1️⃣ - USER LOGIN CHECK (property.html)

### Location
`website/property.html` - Request and Bid Now buttons

### What Happens
When a user clicks "Request" or "Bid Now" button:

```javascript
// Check login session
const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || 'null');
if (!user || !user.loginId) {
    alert('Please login to submit a request');
    window.location.href = '../index.html';  // Redirect to login
    return;
}
```

### Logic
- ✅ **Logged In** → Continue with booking form
- ❌ **Not Logged In** → Redirect to login.html

### Required User Session Fields
```javascript
{
    loginId: "USER123",        // Unique user ID
    email: "user@email.com",   // User email
    phone: "9876543210",       // User phone
    name: "John Doe"           // User full name
}
```

---

## STEP 2️⃣ - COLLECT REQUIRED DATA (property.html)

### Data Collected from Form

#### Property Details (Auto-collected from page)
```javascript
property_id: "PROP123"           // From URL param ?id=
property_name: "Athena House"    // From page title
area: "Kota"                     // From location element
property_type: "PG"              // From property-type field
rent_amount: 15000               // From rent field
```

#### User Details (From session)
```javascript
user_id: "USER123"               // From localStorage.user.loginId
name: "John Doe"                 // From form input
email: "john@email.com"          // From form input
phone: "9876543210"              // From form input
```

#### Request Details (From form)
```javascript
request_type: "request"          // "request" or "bid"
bid_amount: 500                  // Only if bid (default 500)
message: "Looking for 2BHK"      // Optional message
```

### Validation
- ✅ Name required (3+ characters)
- ✅ Email required (valid format)
- ✅ Phone required (10 digits)
- ✅ All fields validated before submission

---

## STEP 3️⃣ - SEND DATA TO BACKEND (API / Controller)

### API Endpoint

**URL:** `POST /api/booking/create`

**Request Body:**
```json
{
    "property_id": "PROP123",
    "property_name": "Athena House",
    "area": "Kota",
    "property_type": "PG",
    "rent_amount": 15000,
    "user_id": "USER123",
    "name": "John Doe",
    "email": "john@email.com",
    "phone": "9876543210",
    "request_type": "request",
    "bid_amount": 0,
    "message": ""
}
```

**Response (Success 201):**
```json
{
    "message": "Booking request created successfully",
    "booking": {
        "id": "BOK123456",
        "property_id": "PROP123",
        "status": "pending",
        ...
    },
    "area_manager_id": "AM001"
}
```

### Frontend Code (property.html)
```javascript
const response = await fetch(`${apiUrl}/api/booking/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        property_id: propertyId,
        property_name: propertyName,
        area: area,
        property_type: propertyType,
        rent_amount: parseInt(rentAmount),
        user_id: user.loginId,
        name: name,
        email: email,
        phone: phone,
        request_type: 'request',
        message: ''
    })
});
```

---

## STEP 4️⃣ - DATABASE INSERT (booking_requests)

### Backend Controller: `bookingController.js`
**Function:** `createBookingRequest(req, res)`

### What Happens

1. **Validate Input**
   ```javascript
   if (!property_id || !user_id || !name || !email || !phone || !area) {
       return res.status(400).json({ message: 'Missing required fields' });
   }
   ```

2. **Find Area Manager by Area**
   ```javascript
   const areaManagerMap = {
       'Kota': 'AM001',
       'Indore': 'AM002',
       'Ujjain': 'AM003',
       'Ratlam': 'AM004'
   };
   const area_manager_id = areaManagerMap[area] || 'AM000';
   ```

3. **Create MongoDB Record**
   ```javascript
   const newBooking = new BookingRequest({
       property_id,
       property_name,
       area,
       property_type,
       rent_amount,
       user_id,
       name,
       email,
       phone,
       area_manager_id,           // ✅ AUTO-ASSIGNED
       request_type: 'request',
       status: 'pending',          // ✅ DEFAULT
       visit_status: 'not_scheduled', // ✅ DEFAULT
       whatsapp_enabled: true,     // ✅ DEFAULT
       chat_enabled: true,         // ✅ DEFAULT
       created_at: new Date(),
       updated_at: new Date()
   });
   ```

4. **Save to Database**
   ```javascript
   await newBooking.save();
   ```

### MongoDB Schema (BookingRequest)
```javascript
{
    _id: ObjectId,
    property_id: String,
    property_name: String,
    area: String,
    property_type: String,
    rent_amount: Number,
    user_id: String,
    name: String,
    email: String,
    phone: String,
    area_manager_id: String,      // ✅ KEY FOR FILTERING
    request_type: String,         // "request" or "bid"
    bid_amount: Number,
    message: String,
    status: String,               // pending, confirmed, rejected
    visit_status: String,         // not_scheduled, scheduled, completed
    whatsapp_enabled: Boolean,
    chat_enabled: Boolean,
    visit_type: String,           // physical, virtual
    visit_date: Date,
    visit_time_slot: String,      // "10:00-11:00"
    created_at: Date,
    updated_at: Date
}
```

### Single Source of Truth
✅ **MongoDB is the authoritative database** - All data stored here

---

## STEP 5️⃣ - AREA MANAGER FETCHES REQUESTS

### Location
`areamanager/booking_request.html` - Booking Requests page

### When Area Manager Opens Page

```javascript
// 1. Get Area Manager ID from session
const user = JSON.parse(localStorage.getItem('user') || '{}');
const areaManagerId = user.area_manager_id || 'AM001';

// 2. Fetch from API with filter
const response = await fetch(
    `${apiUrl}/api/booking/requests?area_manager_id=${areaManagerId}`,
    { method: 'GET', headers: { 'Content-Type': 'application/json' } }
);

// 3. Backend returns all requests for this area manager
const data = await response.json();
// Returns: { count: 5, bookings: [...] }
```

### API Endpoint

**URL:** `GET /api/booking/requests?area_manager_id=AM001`

**Backend Function:** `getBookingRequests(req, res)`

**Query Processing:**
```javascript
// Query database for this area manager
const bookings = await BookingRequest.find({ area_manager_id: 'AM001' })
    .sort({ created_at: -1 });

// Return all matching requests
return res.status(200).json({
    count: bookings.length,
    bookings: bookings
});
```

**Response (Success 200):**
```json
{
    "count": 5,
    "bookings": [
        {
            "_id": "BOK123",
            "property_id": "PROP123",
            "property_name": "Athena House",
            "area": "Kota",
            "user_id": "USER123",
            "name": "John Doe",
            "email": "john@email.com",
            "phone": "9876543210",
            "request_type": "request",
            "status": "pending",
            "visit_status": "not_scheduled",
            "created_at": "2024-01-03T10:30:00Z",
            "updated_at": "2024-01-03T10:30:00Z"
        },
        ...
    ]
}
```

---

## STEP 6️⃣ - DISPLAY DATA IN BOOKING_REQUEST.HTML

### Table Display

Each booking appears as a row in the table with columns:

| Column | Value | Example |
|--------|-------|---------|
| Property ID | `req.property_id` | PROP123 |
| Property Name | `req.property_name` | Athena House |
| Area | `req.area` | Kota |
| Type | `req.property_type` | PG |
| Rent | `req.rent_amount` | ₹15,000 |
| User ID | `req.user_id` | USER123 |
| Name | `req.name` | John Doe |
| Phone | `req.phone` | 9876543210 |
| Email | `req.email` | john@email.com |
| Request Type | `req.request_type` | request |
| Status | `req.status` | pending |
| Visit Status | `req.visit_status` | not_scheduled |
| Created | `req.created_at` | Jan 3, 2024 |

### Status Badges

```javascript
function getStatusBadgeClass(status) {
    return {
        'pending': 'bg-yellow-100 text-yellow-800',      // Yellow
        'confirmed': 'bg-green-100 text-green-800',      // Green
        'rejected': 'bg-red-100 text-red-800',           // Red
        'booked': 'bg-blue-100 text-blue-800'            // Blue
    }[status];
}
```

### Visual Indicators

✅ Green background = Confirmed
❌ Red background = Rejected
⏳ Yellow background = Pending
🔵 Blue background = Visited/Booked

---

## STEP 7️⃣ - COMMUNICATION ACTIONS

### WhatsApp Icon 📲

```javascript
<a href="https://wa.me/${req.phone?.replace(/\D/g, '')}" target="_blank">
    WhatsApp
</a>
```

**What Happens:**
- Opens WhatsApp with pre-filled phone number
- No database update required
- Direct communication with user

### Chat Icon 💬

```javascript
<a href="areachat.html?user=${req.user_id}">
    Chat
</a>
```

**What Happens:**
- Opens in-app chat interface
- Creates chat room with user
- Establishes real-time messaging
- Chat data persisted with booking request

---

## STEP 8️⃣ - AREA MANAGER ACTIONS

### Action Buttons

Each booking row has action buttons (only shown when appropriate):

#### 1. Approve Booking ✅

**Visibility:** Only shown when `status === 'pending'`

```javascript
// Button
<button onclick="approveBooking('${req._id}')">
    <i class="check-icon"></i>
</button>

// Function
async function approveBooking(bookingId) {
    const response = await fetch(
        `/api/booking/requests/${bookingId}/approve`,
        { method: 'PUT' }
    );
    // Updates: status = 'confirmed'
}
```

**API Endpoint:** `PUT /api/booking/requests/:id/approve`

**Updates:**
```javascript
{
    status: 'confirmed',
    updated_at: new Date()
}
```

**Response:**
```json
{
    "message": "Booking approved",
    "booking": { ... }
}
```

#### 2. Reject Booking ❌

**Visibility:** Only shown when `status === 'pending'`

```javascript
// Button
<button onclick="rejectBooking('${req._id}')">
    <i class="x-icon"></i>
</button>

// Function
async function rejectBooking(bookingId) {
    const reason = prompt('Enter rejection reason:');
    const response = await fetch(
        `/api/booking/requests/${bookingId}/reject`,
        {
            method: 'PUT',
            body: JSON.stringify({ reason: reason })
        }
    );
    // Updates: status = 'rejected'
}
```

**API Endpoint:** `PUT /api/booking/requests/:id/reject`

**Updates:**
```javascript
{
    status: 'rejected',
    rejection_reason: 'User provided reason',
    updated_at: new Date()
}
```

#### 3. Schedule Visit 📅

**Visibility:** Only shown when `visit_status !== 'scheduled'` AND `status !== 'rejected'`

```javascript
// Button
<button onclick="scheduleVisitClick('${req._id}')">
    <i class="calendar-icon"></i>
</button>

// Function
async function scheduleVisit(bookingId, visitType, visitDate, timeSlot) {
    const response = await fetch(
        `/api/booking/requests/${bookingId}/schedule-visit`,
        {
            method: 'POST',
            body: JSON.stringify({
                visit_type: visitType,        // "physical" or "virtual"
                visit_date: visitDate,        // "2024-01-05"
                visit_time_slot: timeSlot     // "10:00-11:00"
            })
        }
    );
    // Updates: visit_status = 'scheduled'
}
```

**API Endpoint:** `POST /api/booking/requests/:id/schedule-visit`

**Updates:**
```javascript
{
    visit_type: 'physical',
    visit_date: new Date('2024-01-05'),
    visit_time_slot: '10:00-11:00',
    visit_status: 'scheduled',
    updated_at: new Date()
}
```

---

## 📊 Complete Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                  PROPERTY PAGE (property.html)              │
│  User clicks "Request" or "Bid Now" button                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │  STEP 1: LOGIN CHECK         │
        │  ✅ Logged in? Continue      │
        │  ❌ Not? Redirect to login   │
        └──────────────┬───────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │  STEP 2: COLLECT DATA        │
        │  Property: ID, name, area    │
        │  User: ID, email, phone      │
        │  Request: type, bid, message │
        └──────────────┬───────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │  STEP 3: SEND TO BACKEND     │
        │  POST /api/booking/create    │
        └──────────────┬───────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │  STEP 4: DATABASE INSERT     │
        │  Identify area_manager_id    │
        │  Set default statuses        │
        │  Save to MongoDB             │
        └──────────────┬───────────────┘
                       │
                       ▼
    ┌──────────────────────────────────────┐
    │    MONGODB (Single Source of Truth)  │
    │  booking_requests collection         │
    │  Status: pending (default)           │
    │  Visit Status: not_scheduled         │
    └──────────────┬───────────────────────┘
                   │
                   ▼
   ┌────────────────────────────────────────┐
   │  AREA MANAGER DASHBOARD                │
   │  (areamanager/booking_request.html)    │
   │                                        │
   │  STEP 5: Fetch for this area manager   │
   │  GET /api/booking/requests?area_mgrId  │
   └────────────┬─────────────────────────┘
                │
                ▼
   ┌────────────────────────────────────────┐
   │  STEP 6: Display in Table              │
   │  Show all booking requests with:       │
   │  - Property info                       │
   │  - User info                           │
   │  - Status badges                       │
   │  - Action buttons                      │
   └────────────┬─────────────────────────┘
                │
                ▼
   ┌────────────────────────────────────────┐
   │  STEP 7: Communications                │
   │  📲 WhatsApp link                      │
   │  💬 In-app Chat                        │
   └────────────┬─────────────────────────┘
                │
                ▼
   ┌────────────────────────────────────────┐
   │  STEP 8: Area Manager Actions          │
   │  ✅ Approve → status: confirmed        │
   │  ❌ Reject → status: rejected          │
   │  📅 Schedule → visit_status: scheduled │
   │                                        │
   │  Updates → PUT /api/booking/requests   │
   │  Updates MongoDB document              │
   └────────────────────────────────────────┘
```

---

## 🔄 Status Transitions

### Booking Status Flow

```
                    PENDING
                      │
              ┌───────┴────────┐
              ▼                ▼
          CONFIRMED        REJECTED
              │
              ▼
           BOOKED
```

### Visit Status Flow

```
            NOT_SCHEDULED
                 │
                 ▼
            SCHEDULED
                 │
                 ▼
            COMPLETED
                 │
                 ▼
            CANCELLED (optional)
```

---

## 🛠️ Files Modified/Created

### Frontend Files
✅ **website/property.html**
   - Updated Request form submission
   - Updated Bid form submission
   - Enhanced data collection
   - Added login checks

✅ **areamanager/booking_request.html**
   - Updated to fetch from API
   - Added area_manager_id filtering
   - Added approve button functionality
   - Added reject button functionality
   - Added schedule visit button functionality

### Backend Files
✅ **roomhy-backend/routes/bookingRoutes.js**
   - Added POST /create endpoint

✅ **roomhy-backend/controllers/bookingController.js**
   - `createBookingRequest()` - Creates new booking
   - `getBookingRequests()` - Fetches for area manager
   - `approveBooking()` - Approves booking
   - `rejectBooking()` - Rejects booking
   - `scheduleVisit()` - Schedules visit

✅ **roomhy-backend/models/BookingRequest.js**
   - Schema with all required fields

---

## ✅ Verification Checklist

- [ ] User login check works on property.html
- [ ] Request form collects all required data
- [ ] Bid form collects all required data
- [ ] API endpoint POST /api/booking/create receives data
- [ ] Area manager ID is auto-assigned based on area
- [ ] Data saved to MongoDB booking_requests collection
- [ ] Area manager sees booking requests on booking_request.html
- [ ] API filters by area_manager_id correctly
- [ ] Approve button updates status to confirmed
- [ ] Reject button updates status to rejected
- [ ] Schedule visit button updates visit_status to scheduled
- [ ] WhatsApp link opens with user phone
- [ ] Chat link opens chat interface
- [ ] All statuses display with correct badges

---

## 🧪 Testing Steps

### 1. Test User Login Check
```
1. Open property.html
2. Click "Request" button
3. Should redirect to login if not logged in
4. Login and try again - should show form
```

### 2. Test Data Collection
```
1. Open property.html (logged in)
2. Fill in Request form
3. Submit
4. Check browser console for API call
```

### 3. Test Backend Processing
```
1. Submit request from property.html
2. Check MongoDB Collections tab in Atlas
3. Verify record created with area_manager_id
```

### 4. Test Area Manager Fetch
```
1. Open booking_request.html as area manager
2. Should see all requests for that area
3. Check API response in browser Network tab
```

### 5. Test Actions
```
1. Click Approve button
2. Verify status changed in table
3. Click Reject button - verify status
4. Click Schedule Visit - verify visit_status
```

---

## 🚀 Deployment Notes

1. **Ensure MongoDB is connected** with MONGO_URI in .env
2. **Verify area manager mapping** in bookingController.js
3. **Test API endpoints** with Postman before going live
4. **Update area mapping** if new areas are added
5. **Train area managers** on new booking interface

---

## 📞 Support

For issues:
1. Check browser console for errors
2. Check server logs for API errors
3. Verify MongoDB connection
4. Verify area manager ID is set correctly

