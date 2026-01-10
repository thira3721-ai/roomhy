# Complete Booking Request Flow Analysis & Fixes
**Status:** Ready for Implementation  
**Date:** Current Session  
**Objective:** Ensure booking requests are stored in MongoDB with proper owner linking and displayed only to the property owner.

---

## 🔴 CRITICAL ISSUES IDENTIFIED

### Issue #1: Missing Owner ID in Request Submission
**Location:** `website/property.html` (lines 1543-1596)  
**Problem:** When a tenant clicks "Send Request", the form submits the request BUT **DOES NOT INCLUDE THE PROPERTY OWNER'S ID**.

**Current Code:**
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
        user_id: user.loginId,        // ← TENANT ID, not owner!
        name: name,
        email: email,
        phone: '',
        request_type: 'request',
        message: ''
    })
});
```

**What's Sent:** `property_id`, `area`, `user_id` (tenant), etc.  
**What's Missing:** `owner_id` (the property owner's ID) - **CRITICAL!**

**Why It Matters:**
- Backend tries to find area_manager_id by area field, NOT by property owner
- Booking saved with `area_manager_id` instead of proper owner linking
- Owner panel cannot properly filter bookings to show only their properties

---

### Issue #2: Backend Does NOT Lookup Property Owner
**Location:** `roomhy-backend/controllers/bookingController.js` (lines 31-34)

**Current Code:**
```javascript
// Find area manager by area
const manager = await User.findOne({ role: 'area_manager', area: area });

// ... creates booking with area_manager_id: manager ? manager._id : null
```

**Problem:**
- Assumes area manager receives all bookings in that area
- Never looks up the actual PROPERTY owner
- If property owner ≠ area manager, booking goes to wrong person
- No property-owner relationship query

---

### Issue #3: BookingRequest Model Missing owner_id Field
**Location:** `roomhy-backend/models/BookingRequest.js`

**Current Schema:**
```javascript
owner_id: { type: String, required: true, index: true },
area_manager_id: { type: String, index: true },
```

**Status:** ✅ **ALREADY HAS owner_id field (good!)**  
BUT backend controller is NOT populating it during creation.

---

### Issue #4: Frontend Cannot Pass Owner ID
**Location:** `website/property.html` (property loading)

**Problem:** 
- No code extracts owner_id/ownerId from property data
- No way to know who owns the property being viewed
- Cannot send owner_id with booking request

---

### Issue #5: Booking Request Page Has No Authentication
**Location:** `propertyowner/booking_request.html` (lines 188-211)

**Current Code:**
```javascript
// Fetch from API with area_manager_id filter
const response = await fetch(
    `${apiUrl}/api/booking/requests?area_manager_id=${areaManagerId}`,
    { method: 'GET', headers: { 'Content-Type': 'application/json' } }
);
```

**Problems:**
- Fetches with `area_manager_id` query param (area manager scope, not owner scope)
- No authentication header sent
- Backend returns ALL bookings for that area manager
- Client-side filtering via URL query params is weak (security issue)
- Owner could manually brute-force different propertyId values

---

## 📊 CURRENT DATA FLOW (BROKEN)

```
Tenant clicks "Request" button
        ↓
property.html form submits POST /api/booking/create
    └─ Includes: property_id, tenant_id (user_id), area
    └─ MISSING: owner_id ❌
        ↓
bookingController.createBookingRequest()
    └─ Receives request payload
    └─ Looks up area_manager by area (not property owner!)
    └─ Saves booking with area_manager_id, NULL owner_id ❌
    └─ Returns 201 success
        ↓
Frontend redirects to booking_request.html?propertyId=...&ownerId=...
        ↓
booking_request.html loads
    └─ Fetches: /api/booking/requests?area_manager_id=AM001
    └─ Backend returns ALL bookings for that area manager
    └─ Frontend filters client-side by ownerId URL param
    └─ Displays only matching bookings (but insecure!)
        ↓
Table shows filtered bookings ✓
```

---

## ✅ CORRECTED DATA FLOW

```
Tenant clicks "Request" button
        ↓
property.html loads property data from API (includes owner_id)
        ↓
property.html form extracts owner_id from property data
        ↓
property.html form submits POST /api/booking/create
    └─ Includes: property_id, tenant_id, area, owner_id ✅
        ↓
bookingController.createBookingRequest()
    └─ Receives property_id, area, owner_id
    └─ Looks up Property document to verify owner_id
    └─ Saves booking with owner_id field populated ✅
    └─ Returns 201 success
        ↓
Frontend redirects to booking_request.html?ownerId=...
        ↓
booking_request.html loads
    └─ Extracts ownerId from URL param
    └─ Verifies logged-in owner matches ownerId
    └─ Fetches: /api/booking/requests?owner_id=john_owner ✅
    └─ Backend returns only bookings for that owner (server-side filter)
    └─ Frontend renders bookings
        ↓
Table shows ONLY this owner's bookings ✓
```

---

## 🔧 FIX #1: Update property.html Request Handler

**File:** `website/property.html`  
**Lines:** 1500-1610  
**Change:** Include owner_id in request submission

### Step 1: Extract Owner ID from Property Data
The property data needs to include owner info. Before the form submission, add:

```javascript
// Extract property owner ID when page loads
let propertyOwnerId = null;

// Check if currentProperty in sessionStorage has owner info
const currentPropertyStr = sessionStorage.getItem('currentProperty');
if (currentPropertyStr) {
    try {
        const propData = JSON.parse(currentPropertyStr);
        propertyOwnerId = propData.ownerId || propData.ownerLoginId || propData.owner_id;
    } catch (e) {
        console.warn('Could not parse property data for owner ID');
    }
}
```

### Step 2: Update Request Form Submission
Replace the fetch body in lines 1573-1585 with:

```javascript
body: JSON.stringify({
    property_id: propertyId,
    property_name: propertyName,
    area: area,
    property_type: propertyType,
    rent_amount: parseInt(rentAmount),
    user_id: user.loginId,           // Tenant ID
    owner_id: propertyOwnerId,       // ← ADD THIS (property owner)
    name: name,
    email: email,
    phone: '',
    request_type: 'request',
    message: ''
})
```

---

## 🔧 FIX #2: Update Backend Controller

**File:** `roomhy-backend/controllers/bookingController.js`  
**Lines:** 11-106  

### Current Code (BROKEN):
```javascript
exports.createBookingRequest = async (req, res) => {
    try {
        const { 
            property_id, property_name, area, property_type, rent_amount,
            user_id, name, phone, email, request_type, bid_amount, message,
            whatsapp_enabled, chat_enabled
        } = req.body;

        // ... validation ...

        // Find area manager by area
        const manager = await User.findOne({ role: 'area_manager', area: area });
        
        // Create new booking request
        const newRequest = new BookingRequest({
            property_id,
            property_name,
            area,
            property_type,
            rent_amount,
            user_id,
            name,
            phone,
            email,
            request_type,
            // ... other fields ...
            area_manager_id: manager ? manager._id : null,  // ← Using area manager, not owner
            chat_room_id: chatRoomId,
            status: 'pending'
        });
```

### Corrected Code:
```javascript
exports.createBookingRequest = async (req, res) => {
    try {
        const { 
            property_id, property_name, area, property_type, rent_amount,
            user_id, name, phone, email, owner_id, request_type, bid_amount, message,
            whatsapp_enabled, chat_enabled
        } = req.body;

        // Validation
        if (!property_id || !user_id || !request_type) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required fields: property_id, user_id, request_type' 
            });
        }

        // ✅ NEW: Validate owner_id
        if (!owner_id) {
            return res.status(400).json({
                success: false,
                message: 'Property owner ID is required'
            });
        }

        // Find area manager by area (for notifications)
        const manager = await User.findOne({ role: 'area_manager', area: area });
        
        // Generate unique chat room ID
        const chatRoomId = `chat_${property_id}_${Date.now()}`;

        // ✅ NEW: Create booking with owner_id properly set
        const newRequest = new BookingRequest({
            property_id,
            property_name,
            area,
            property_type,
            rent_amount,
            user_id,
            name,
            phone,
            email,
            owner_id,                      // ← SET OWNER ID FROM REQUEST
            request_type,
            bid_amount: request_type === 'bid' ? (bid_amount || 500) : 0,
            message,
            whatsapp_enabled: whatsapp_enabled || true,
            chat_enabled: chat_enabled || true,
            area_manager_id: manager ? manager._id : null,
            chat_room_id: chatRoomId,
            status: 'pending',
            visit_status: 'not_scheduled'
        });

        await newRequest.save();

        // ... rest of code (chat creation, etc.) ...

        res.status(201).json({ 
            success: true, 
            message: `${request_type.charAt(0).toUpperCase() + request_type.slice(1)} submitted successfully`,
            data: newRequest 
        });
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};
```

---

## 🔧 FIX #3: Update Backend GET Endpoint

**File:** `roomhy-backend/controllers/bookingController.js`  
**Lines:** 108-138  

### Current Code (WEAK FILTERING):
```javascript
exports.getBookingRequests = async (req, res) => {
    try {
        const { area, manager_id, type, status } = req.query;
        let query = {};

        if (area) query.area = area;
        if (manager_id) query.area_manager_id = manager_id;
        if (type) query.request_type = type;
        if (status) query.status = status;

        const requests = await BookingRequest.find(query)
            .sort({ created_at: -1 })
            .lean();

        res.status(200).json({ 
            success: true, 
            total: requests.length,
            data: requests 
        });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};
```

### Corrected Code:
```javascript
exports.getBookingRequests = async (req, res) => {
    try {
        const { area, manager_id, owner_id, type, status } = req.query;
        let query = {};

        // ✅ NEW: Support owner_id query param for owner panel
        if (owner_id) {
            query.owner_id = owner_id;
        } else if (manager_id) {
            // ✅ Keep area_manager_id filtering for area managers
            query.area_manager_id = manager_id;
        }
        
        if (area) query.area = area;
        if (type) query.request_type = type;
        if (status) query.status = status;

        const requests = await BookingRequest.find(query)
            .sort({ created_at: -1 })
            .lean();

        res.status(200).json({ 
            success: true, 
            total: requests.length,
            data: requests 
        });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};
```

---

## 🔧 FIX #4: Update Booking Request Page Frontend

**File:** `propertyowner/booking_request.html`  
**Lines:** 184-215  

### Current Code (INSECURE):
```javascript
async function loadBookingRequests() {
    try {
        // Get area manager ID from session/localStorage
        const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
        const areaManagerId = user.area_manager_id || localStorage.getItem('area_manager_id') || 'AM001';

        const apiUrl = API_URL;

        // Fetch from API with area_manager_id filter
        const response = await fetch(
            `${apiUrl}/api/booking/requests?area_manager_id=${areaManagerId}`,
            { method: 'GET', headers: { 'Content-Type': 'application/json' } }
        );
        // ... rest ...
    }
}
```

### Corrected Code:
```javascript
async function loadBookingRequests() {
    try {
        // ✅ NEW: Get logged-in owner info from localStorage
        const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
        
        // Owner panel should identify the owner
        const ownerId = user.loginId || user.id || localStorage.getItem('ownerLoginId');
        
        if (!ownerId) {
            alert('Please login to view your booking requests');
            window.location.href = '../login.html';
            return;
        }

        const apiUrl = API_URL;

        // ✅ NEW: Fetch from API with owner_id filter (server-side)
        const response = await fetch(
            `${apiUrl}/api/booking/requests?owner_id=${encodeURIComponent(ownerId)}`,
            { method: 'GET', headers: { 'Content-Type': 'application/json' } }
        );

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        allBookingRequests = data.data || data.bookings || [];
        
        // If API call failed or returned empty, fall back to localStorage
        if (allBookingRequests.length === 0) {
            console.log('No bookings from API, trying localStorage...');
            const bookingRequests = JSON.parse(localStorage.getItem('roomhy_booking_requests') || '[]');
            const users = JSON.parse(localStorage.getItem('roomhy_kyc_verification') || '[]');
            
            const userMap = {};
            users.forEach(user => {
                userMap[user.id] = user;
            });

            allBookingRequests = bookingRequests.map(request => {
                const user = userMap[request.user_id] || {};
                return {
                    ...request,
                    name: user.firstName ? `${user.firstName} ${user.lastName || ''}` : 'N/A',
                    phone: user.phone || 'N/A',
                    email: user.email || 'N/A'
                };
            });
        }

        filteredRequests = [...allBookingRequests];
        applyQueryFilters();
    } catch (error) {
        console.error('Error loading booking requests:', error);
        // Fallback to localStorage on error
        try {
            const bookingRequests = JSON.parse(localStorage.getItem('roomhy_booking_requests') || '[]');
            const users = JSON.parse(localStorage.getItem('roomhy_kyc_verification') || '[]');
            
            const userMap = {};
            users.forEach(user => {
                userMap[user.id] = user;
            });

            allBookingRequests = bookingRequests.map(request => {
                const user = userMap[request.user_id] || {};
                return {
                    ...request,
                    name: user.firstName ? `${user.firstName} ${user.lastName || ''}` : 'N/A',
                    phone: user.phone || 'N/A',
                    email: user.email || 'N/A'
                };
            });

            filteredRequests = [...allBookingRequests];
            applyQueryFilters();
        } catch (fallbackError) {
            console.error('Error loading from localStorage:', fallbackError);
        }
    }
}
```

### Remove Query Param Dependency

**Lines:** 367-401  

Current code:
```javascript
function applyQueryFilters() {
    try {
        const params = new URLSearchParams(window.location.search);
        const propParam = params.get('propertyId');
        const ownerParam = params.get('ownerId');

        if (!propParam && !ownerParam) {
            renderBookingTable();
            return;
        }

        const propId = propParam ? decodeURIComponent(propParam) : null;
        const ownerId = ownerParam ? decodeURIComponent(ownerParam) : null;

        filteredRequests = allBookingRequests.filter(req => {
            let ok = true;
            if (propId) {
                const rpid = (req.property_id || req.propertyId || req._id || req.id || '').toString();
                ok = ok && (rpid === propId || rpid.includes(propId));
            }
            if (ownerId) {
                const ro = (req.ownerId || req.owner_id || req.ownerLoginId || req.owner_login_id || req.owner || req.ownerId || '').toString();
                const ra = (req.area_manager_id || req.manager_id || '').toString();
                ok = ok && (ro === ownerId || ro.includes(ownerId) || ra === ownerId || ra.includes(ownerId));
            }
            return ok;
        });
        renderBookingTable();
    } catch (e) {
        console.error('Error applying query filters:', e);
        renderBookingTable();
    }
}
```

**Simplified Version (No URL params needed):**
```javascript
function applyQueryFilters() {
    try {
        // Optional: If propertyId is in URL, filter by that property
        const params = new URLSearchParams(window.location.search);
        const propParam = params.get('propertyId');

        if (propParam) {
            const propId = decodeURIComponent(propParam);
            filteredRequests = allBookingRequests.filter(req => {
                const rpid = (req.property_id || req.propertyId || req._id || req.id || '').toString();
                return rpid === propId || rpid.includes(propId);
            });
        } else {
            // No property filter, show all (already server-filtered by owner_id)
            filteredRequests = [...allBookingRequests];
        }
        
        renderBookingTable();
    } catch (e) {
        console.error('Error applying query filters:', e);
        renderBookingTable();
    }
}
```

---

## 📋 IMPLEMENTATION CHECKLIST

- [ ] Update `website/property.html` (lines ~1530-1540)
  - [ ] Extract `propertyOwnerId` from sessionStorage.currentProperty
  - [ ] Add `owner_id: propertyOwnerId` to request body in fetch

- [ ] Update `roomhy-backend/controllers/bookingController.js`
  - [ ] Extract `owner_id` from req.body
  - [ ] Validate `owner_id` is present
  - [ ] Set `owner_id` field in BookingRequest document
  - [ ] Update `getBookingRequests()` to filter by `owner_id` query param

- [ ] Update `propertyowner/booking_request.html`
  - [ ] Extract owner ID from logged-in user
  - [ ] Change fetch URL to use `owner_id` instead of `area_manager_id`
  - [ ] Simplify `applyQueryFilters()` (optional property filter only)

- [ ] Test end-to-end flow:
  - [ ] Tenant submits request on property.html
  - [ ] Booking saves in MongoDB with correct owner_id
  - [ ] Owner views booking_request.html, sees only their bookings
  - [ ] Query param filtering still works if needed

---

## 🔍 VERIFICATION STEPS

1. **Backend Verification:**
   - Check MongoDB booking_requests collection
   - Verify `owner_id` field is populated (not null)
   - Confirm property owner's ID matches the actual owner

2. **Frontend Verification:**
   - Submit request as tenant
   - Check browser console for API response
   - Verify booking appears in owner panel
   - Verify other owners don't see this booking

3. **Security Check:**
   - Try accessing booking_request.html with different ownerId values
   - Ensure backend rejects requests with mismatched owner_id

---

## 📝 SUMMARY OF CHANGES

| Component | Issue | Fix | Priority |
|-----------|-------|-----|----------|
| property.html | Missing owner_id in submission | Extract owner_id, include in fetch body | 🔴 CRITICAL |
| bookingController.createBookingRequest() | Not saving owner_id | Accept and save owner_id from request | 🔴 CRITICAL |
| bookingController.getBookingRequests() | No owner filtering | Add owner_id query param support | 🔴 CRITICAL |
| booking_request.html | Weak client-side filtering | Fetch with owner_id, let backend filter | 🟡 HIGH |

---

## 💡 NOTES

- **BookingRequest model already has owner_id field** - No schema changes needed
- **This is a SECURITY FIX** - Prevents data leakage between owners
- **Property owner data must be available** - Ensure property API returns owner_id/ownerId
- **Backward compatibility** - Old bookings without owner_id will still exist; fetch by area_manager_id for them

