# QUICK REFERENCE - Exact Code Changes Made

## File 1: website/property.html

**Location:** Lines 1531-1610  
**Function:** Schedule form submission handler for booking requests

### BEFORE: (Missing owner_id)
```javascript
// Schedule Visit Form (Request)
if (scheduleForm) {
    scheduleForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || 'null');
        if (!user || !user.loginId) {
            alert('Please login to submit a request');
            window.location.href = '../index.html';
            return;
        }

        const name = document.getElementById('visit-name').value;
        const emailInput = document.getElementById('visit-email').value;
        const email = emailInput || user.email || '';

        if (!name || !email) {
            alert('Please fill in all required fields');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address');
            return;
        }

        const propertyId = getParam('id') || '1';
        const propertyName = document.getElementById('property-title')?.textContent || 'Property';
        const area = document.querySelector('[id="property-location"]')?.textContent || 'Unknown';
        const propertyType = document.querySelector('[data-field="property-type"]')?.textContent || 'PG';
        const rentAmount = document.querySelector('[data-field="rent-amount"]')?.textContent?.replace(/₹|,/g, '') || 0;

        try {
            const apiUrl = API_URL;

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
                    phone: '',
                    request_type: 'request',
                    message: ''
                })
            });

            if (response.ok) {
                const result = await response.json();
                alert(`Thank you ${name}! Your request has been sent to the area manager. We'll contact you soon.`);
                scheduleForm.reset();
            } else {
                const error = await response.json();
                alert('Error: ' + (error.message || 'Could not submit request'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error submitting request. Please check your connection.');
        }
    });
}
```

### AFTER: (Includes owner_id)
```javascript
// Schedule Visit Form (Request)
if (scheduleForm) {
    scheduleForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || 'null');
        if (!user || !user.loginId) {
            alert('Please login to submit a request');
            window.location.href = '../index.html';
            return;
        }

        const name = document.getElementById('visit-name').value;
        const emailInput = document.getElementById('visit-email').value;
        const email = emailInput || user.email || '';

        if (!name || !email) {
            alert('Please fill in all required fields');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address');
            return;
        }

        const propertyId = getParam('id') || '1';
        const propertyName = document.getElementById('property-title')?.textContent || 'Property';
        const area = document.querySelector('[id="property-location"]')?.textContent || 'Unknown';
        const propertyType = document.querySelector('[data-field="property-type"]')?.textContent || 'PG';
        const rentAmount = document.querySelector('[data-field="rent-amount"]')?.textContent?.replace(/₹|,/g, '') || 0;

        // ✅ NEW: Extract property owner ID from sessionStorage
        let propertyOwnerId = null;
        const currentPropertyStr = sessionStorage.getItem('currentProperty');
        if (currentPropertyStr) {
            try {
                const propData = JSON.parse(currentPropertyStr);
                propertyOwnerId = propData.ownerId || propData.ownerLoginId || propData.owner_id;
            } catch (e) {
                console.warn('Could not extract property owner ID:', e.message);
            }
        }

        try {
            const apiUrl = API_URL;

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
                    owner_id: propertyOwnerId,  // ✅ ADD OWNER ID
                    name: name,
                    email: email,
                    phone: '',
                    request_type: 'request',
                    message: ''
                })
            });

            if (response.ok) {
                const result = await response.json();
                alert(`Thank you ${name}! Your request has been sent to the property owner. We'll contact you soon.`);
                scheduleForm.reset();
            } else {
                const error = await response.json();
                alert('Error: ' + (error.message || 'Could not submit request'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error submitting request. Please check your connection.');
        }
    });
}
```

**Changes:**
1. Added owner_id extraction from sessionStorage.currentProperty (lines before fetch)
2. Added `owner_id: propertyOwnerId` to request body (in JSON.stringify)
3. Updated alert message from "area manager" to "property owner"

---

## File 2: roomhy-backend/controllers/bookingController.js

### Change 2.1: createBookingRequest Function Signature

**BEFORE:**
```javascript
exports.createBookingRequest = async (req, res) => {
    try {
        const { 
            property_id, property_name, area, property_type, rent_amount,
            user_id, name, phone, email, request_type, bid_amount, message,
            whatsapp_enabled, chat_enabled
        } = req.body;

        // Validation
        if (!property_id || !user_id || !request_type) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required fields: property_id, user_id, request_type' 
            });
        }
```

**AFTER:**
```javascript
exports.createBookingRequest = async (req, res) => {
    try {
        const { 
            property_id, property_name, area, property_type, rent_amount,
            user_id, owner_id, name, phone, email, request_type, bid_amount, message,
            whatsapp_enabled, chat_enabled
        } = req.body;

        // Validation
        if (!property_id || !user_id || !request_type) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required fields: property_id, user_id, request_type' 
            });
        }

        // ✅ NEW: Validate owner_id is present
        if (!owner_id) {
            return res.status(400).json({
                success: false,
                message: 'Property owner ID is required'
            });
        }
```

**Changes:**
1. Added `owner_id` to destructuring (line 2)
2. Added validation check for owner_id (new if statement)

### Change 2.2: BookingRequest Document Creation

**BEFORE:**
```javascript
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
    bid_amount: request_type === 'bid' ? (bid_amount || 500) : 0,
    message,
    whatsapp_enabled: whatsapp_enabled || true,
    chat_enabled: chat_enabled || true,
    area_manager_id: manager ? manager._id : null,
    chat_room_id: chatRoomId,
    status: 'pending',
    visit_status: 'not_scheduled'
});
```

**AFTER:**
```javascript
// ✅ UPDATED: Create booking with owner_id properly set
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
    owner_id,                      // ✅ SET OWNER ID FROM REQUEST
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
```

**Changes:**
1. Added `owner_id,` to the BookingRequest document (maintains property order)

### Change 2.3: getBookingRequests Function

**BEFORE:**
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

**AFTER:**
```javascript
exports.getBookingRequests = async (req, res) => {
    try {
        const { area, manager_id, owner_id, type, status } = req.query;
        let query = {};

        // ✅ NEW: Support owner_id query param for property owner panel
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

**Changes:**
1. Added `owner_id` to destructuring
2. Added owner_id filter logic (if-else statement for owner_id vs manager_id)
3. Kept area, type, status filter logic unchanged

---

## File 3: propertyowner/booking_request.html

### Change 3.1: loadBookingRequests Function

**BEFORE:**
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
            {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            }
        );

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        allBookingRequests = data.data || data.bookings || [];
        
        // ... rest of function
    }
}
```

**AFTER:**
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
            {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            }
        );

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        allBookingRequests = data.data || data.bookings || [];
        
        // ... rest of function (unchanged)
    }
}
```

**Changes:**
1. Changed user extraction to get owner ID instead of area_manager_id
2. Added login validation check
3. Added owner ID fallback checks (loginId, id, ownerLoginId)
4. Changed fetch URL from `area_manager_id=` to `owner_id=` parameter
5. Added encodeURIComponent() for safer URL encoding

### Change 3.2: applyQueryFilters Function

**BEFORE:**
```javascript
// Apply query param filters (propertyId, ownerId) to the requests list
function applyQueryFilters() {
    try {
        const params = new URLSearchParams(window.location.search);
        const propParam = params.get('propertyId');
        const ownerParam = params.get('ownerId');

        if (!propParam && !ownerParam) {
            // No query filters, render everything
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
                // Some records may store manager/owner under different keys; also allow matching area_manager_id as fallback
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

**AFTER:**
```javascript
// ✅ UPDATED: Apply query param filters (propertyId only) to the requests list
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

**Changes:**
1. Removed ownerId URL parameter handling
2. Simplified to only handle propertyId filtering
3. Removed complex fallback owner matching logic
4. Added comment explaining that data is server-filtered
5. Cleaner, more maintainable code

---

## 📋 SUMMARY OF CHANGES

| File | Lines | Change Type | What Changed |
|------|-------|------------|--------------|
| property.html | ~1535-1585 | Feature Add | Extract owner_id from property data, send with request |
| bookingController.js | 12-25 | Validation Add | Extract and validate owner_id from request |
| bookingController.js | ~42-45 | Document Update | Add owner_id to BookingRequest document |
| bookingController.js | ~108-138 | Logic Update | Support owner_id query param in GET endpoint |
| booking_request.html | ~184-215 | Logic Update | Get owner_id from logged-in user, fetch with owner_id |
| booking_request.html | ~367-401 | Logic Simplify | Remove ownerId URL param handling |

---

## ✅ VERIFICATION

### Did the changes work?

1. **Property.html:** Check DevTools → Network → POST /api/booking/create → Payload should include `owner_id`
2. **Backend:** Check server logs should show requests with owner_id field
3. **MongoDB:** `db.bookingrequests.findOne()` should have `owner_id` field populated
4. **booking_request.html:** Check DevTools → Network → GET /api/booking/requests?owner_id=... should work

---

## 🔄 DEPLOYMENT ORDER

1. ✅ Deploy backend changes first (controllers)
2. ✅ Restart backend server
3. ✅ Deploy frontend changes (property.html, booking_request.html)
4. ✅ Clear browser cache (Ctrl+Shift+Delete or Cmd+Shift+Delete)
5. ✅ Test in development environment
6. ✅ Deploy to production

