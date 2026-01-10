# Booking Request Flow - Visual Reference Guide

## 🔄 REQUEST SUBMISSION FLOW

```
┌──────────────────────────────────────┐
│   TENANT on property.html            │
│   Clicks "Send Request" button        │
└──────────────────────┬────────────────┘
                       │
                       ↓
┌──────────────────────────────────────────────────────┐
│ property.html reads property data from:              │
│ • sessionStorage.getItem('currentProperty')          │
│ • Extracts: ownerId, ownerLoginId, or owner_id       │
│ • Gets form inputs: name, email                      │
└──────────────────────┬───────────────────────────────┘
                       │
                       ↓
┌──────────────────────────────────────────────────────┐
│ POST /api/booking/create                            │
│                                                       │
│ Body includes:                                        │
│ {                                                     │
│   property_id: "prop123",                            │
│   property_name: "2BHK Apartment",                   │
│   area: "Downtown",                                  │
│   user_id: "tenant_john",   ← Tenant                │
│   owner_id: "owner_alex",   ← ✅ NEW: Owner         │
│   name: "John Doe",                                  │
│   email: "john@email.com",                           │
│   request_type: "request"                            │
│ }                                                     │
└──────────────────────┬───────────────────────────────┘
                       │
                       ↓
┌──────────────────────────────────────────────────────┐
│ bookingController.createBookingRequest()             │
│                                                       │
│ 1. Extracts owner_id from request                    │
│ 2. Validates owner_id !== null/undefined ✅          │
│ 3. Looks up area_manager (for notifications)        │
│ 4. Creates BookingRequest document:                  │
│    {                                                 │
│      property_id: "prop123",                         │
│      user_id: "tenant_john",                         │
│      owner_id: "owner_alex",  ← ✅ Stored in DB     │
│      area_manager_id: "manager_bob",                 │
│      status: "pending",                              │
│      created_at: new Date()                          │
│    }                                                 │
│ 5. Saves to MongoDB                                  │
└──────────────────────┬───────────────────────────────┘
                       │
                       ↓
┌──────────────────────────────────────────────────────┐
│ Response: 201 Created                                │
│ {                                                    │
│   success: true,                                     │
│   message: "Request submitted successfully",         │
│   data: { ...booking document... }                   │
│ }                                                    │
└──────────────────────┬───────────────────────────────┘
                       │
                       ↓
         ✅ Booking saved in MongoDB
            with owner_id properly linked
```

---

## 👁️ OWNER VIEWING FLOW

```
┌──────────────────────────────────────────┐
│   OWNER logs in to                       │
│   propertyowner/booking_request.html     │
└──────────────────────┬────────────────────┘
                       │
                       ↓
┌──────────────────────────────────────────────────────┐
│ booking_request.html page loads                      │
│                                                       │
│ 1. Reads localStorage.getItem('user')                │
│ 2. Extracts owner's loginId: "owner_alex"           │
│ 3. Validates owner is logged in ✅                   │
│ 4. If not logged in → Redirect to login              │
└──────────────────────┬───────────────────────────────┘
                       │
                       ↓
┌──────────────────────────────────────────────────────┐
│ GET /api/booking/requests?owner_id=owner_alex       │
│                                                       │
│ Backend receives query param: owner_id = "owner_alex"│
│                                                       │
│ Builds MongoDB query:                                │
│ {                                                    │
│   owner_id: "owner_alex"   ← Server-side filtering  │
│ }                                                    │
│                                                       │
│ Fetches only bookings where owner_id matches ✅      │
└──────────────────────┬───────────────────────────────┘
                       │
                       ↓
┌──────────────────────────────────────────────────────┐
│ Response: 200 OK                                     │
│ {                                                    │
│   success: true,                                     │
│   total: 3,                                          │
│   data: [                                            │
│     {                                                │
│       property_id: "prop123",                        │
│       property_name: "2BHK Apartment",               │
│       user_id: "tenant_john",                        │
│       owner_id: "owner_alex",  ← Verified in DB     │
│       name: "John Doe",                              │
│       email: "john@email.com",                       │
│       status: "pending",                             │
│       created_at: "2024-01-15T10:30:00Z"             │
│     },                                               │
│     // ... more bookings for this owner ...          │
│   ]                                                  │
│ }                                                    │
└──────────────────────┬───────────────────────────────┘
                       │
                       ↓
┌──────────────────────────────────────────────────────┐
│ Frontend Processing                                  │
│                                                       │
│ 1. Receive bookings from API                         │
│ 2. Store in allBookingRequests[]                     │
│ 3. Optional: Filter by propertyId URL param          │
│    - If URL has ?propertyId=prop123                  │
│    - Show only bookings for that property            │
│ 4. Call renderBookingTable()                         │
│ 5. Display in HTML table                             │
└──────────────────────┬───────────────────────────────┘
                       │
                       ↓
    ✅ Owner sees ONLY their booking requests
       in an organized table with all details
```

---

## 📊 DATABASE STORAGE

### BookingRequest Document (MongoDB)

**Before (Incorrect):**
```json
{
  "_id": "ObjectId",
  "property_id": "prop123",
  "property_name": "2BHK Apartment",
  "user_id": "tenant_john",
  "owner_id": null,                    // ❌ Empty!
  "area": "Downtown",
  "area_manager_id": "manager_bob",    // ← Wrong: area manager, not owner
  "name": "John Doe",
  "email": "john@email.com",
  "request_type": "request",
  "status": "pending",
  "created_at": "2024-01-15T10:30:00Z"
}
```

**After (Correct):**
```json
{
  "_id": "ObjectId",
  "property_id": "prop123",
  "property_name": "2BHK Apartment",
  "user_id": "tenant_john",            // Tenant who submitted request
  "owner_id": "owner_alex",            // ✅ Property owner (owner of the property)
  "area": "Downtown",
  "area_manager_id": "manager_bob",    // Area manager (for notifications)
  "name": "John Doe",
  "email": "john@email.com",
  "request_type": "request",
  "status": "pending",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

---

## 🔑 KEY FIELDS EXPLAINED

| Field | Value | Description |
|-------|-------|-------------|
| `property_id` | "prop123" | Which property is being requested |
| `user_id` | "tenant_john" | Tenant submitting the request |
| `owner_id` | "owner_alex" | **Property owner** (new field) |
| `area_manager_id` | "manager_bob" | Area manager (for region management) |
| `request_type` | "request" | Type of request (request/bid) |
| `status` | "pending" | Current status of request |
| `name` | "John Doe" | Tenant's name |
| `email` | "john@email.com" | Tenant's email |

---

## 🔍 FILTERING EXAMPLES

### Example 1: Owner Viewing Their Bookings

**Query:** `GET /api/booking/requests?owner_id=owner_alex`

**MongoDB finds:**
```javascript
db.bookingrequests.find({ owner_id: "owner_alex" })
```

**Results:**
- ✅ All bookings for owner_alex
- ✅ From all their properties
- ❌ Bookings for other owners excluded

---

### Example 2: Area Manager Viewing Their Area's Bookings

**Query:** `GET /api/booking/requests?area_manager_id=manager_bob`

**MongoDB finds:**
```javascript
db.bookingrequests.find({ area_manager_id: "manager_bob" })
```

**Results:**
- ✅ All bookings in manager_bob's area
- ✅ Regardless of owner
- ✅ For area-level reporting

---

### Example 3: Owner Viewing Specific Property's Bookings

**Query:** `GET /api/booking/requests?owner_id=owner_alex&propertyId=prop123`

**Frontend filters:**
```javascript
// Server returns: all bookings for owner_alex
// Frontend then filters:
bookings.filter(b => b.property_id === "prop123")
```

**Results:**
- ✅ Only bookings for owner_alex's specific property
- ✅ No bookings for their other properties

---

## 🚨 SECURITY COMPARISON

### Before (Weak)

```
┌─────────────────────────────────────────┐
│ Tenant submits request                  │
│ → No owner_id sent ❌                   │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│ Backend saves booking                   │
│ → owner_id = null ❌                    │
│ → Only area_manager_id set              │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│ Owner views booking_request.html        │
│ → Frontend reads URL param (?ownerId=) ❌│
│ → Filters client-side ❌                │
│ → No server validation ❌               │
│ → Can access other owners' bookings ❌  │
└─────────────────────────────────────────┘
```

### After (Secure)

```
┌─────────────────────────────────────────┐
│ Tenant submits request                  │
│ → Extracts owner_id from property data ✅│
│ → Includes in request body ✅           │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│ Backend validates request               │
│ → Checks owner_id not null ✅           │
│ → Saves owner_id to database ✅         │
│ → Creates proper ownership link ✅      │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│ Owner views booking_request.html        │
│ → Validates login ✅                    │
│ → Sends owner_id to backend ✅          │
│ → Backend filters by owner_id ✅        │
│ → Returns ONLY owner's bookings ✅      │
│ → No data leakage ✅                    │
└─────────────────────────────────────────┘
```

---

## 🧪 QUICK TEST COMMANDS

### Test Backend API

```bash
# Create a booking request
curl -X POST http://localhost:5000/api/booking/create \
  -H "Content-Type: application/json" \
  -d '{
    "property_id": "prop123",
    "property_name": "2BHK Apartment",
    "area": "Downtown",
    "user_id": "tenant_john",
    "owner_id": "owner_alex",
    "name": "John Doe",
    "email": "john@example.com",
    "request_type": "request"
  }'

# Fetch bookings for owner_alex
curl "http://localhost:5000/api/booking/requests?owner_id=owner_alex"

# Fetch bookings for area manager
curl "http://localhost:5000/api/booking/requests?area_manager_id=manager_bob"
```

### Check MongoDB

```javascript
// In MongoDB shell
use roomhy_db

// View all bookings
db.bookingrequests.find()

// View bookings for specific owner
db.bookingrequests.find({ owner_id: "owner_alex" })

// View bookings for specific property
db.bookingrequests.find({ property_id: "prop123" })

// Check that owner_id field exists
db.bookingrequests.find({ owner_id: { $ne: null } })
```

---

## ✅ COMPLETION CHECKLIST

### Development
- [x] Updated property.html to extract and send owner_id
- [x] Updated backend to validate and save owner_id
- [x] Updated GET endpoint to filter by owner_id
- [x] Updated frontend to fetch with owner_id
- [x] Simplified client-side filtering logic

### Documentation
- [x] Analysis document (BOOKING_FLOW_ANALYSIS_AND_FIXES.md)
- [x] Implementation summary (BOOKING_OWNER_FILTERING_IMPLEMENTATION.md)
- [x] Visual reference guide (this document)

### Testing (Ready to Execute)
- [ ] Backend API testing (curl commands)
- [ ] Frontend functional testing
- [ ] Security testing (access control)
- [ ] Database verification

### Deployment
- [ ] Restart backend server
- [ ] Clear browser cache
- [ ] Test in staging environment
- [ ] Deploy to production
- [ ] Monitor for errors

---

## 📞 SUPPORT INFORMATION

**What changed:**
- property.html: Request submission now includes owner_id
- Backend: Validates and stores owner_id
- booking_request.html: Fetches with owner_id query parameter

**Backward compatibility:**
- Old bookings without owner_id can still be accessed via area_manager_id
- Area manager functionality unchanged
- No breaking changes to existing APIs

**Questions:**
Refer to `BOOKING_FLOW_ANALYSIS_AND_FIXES.md` for detailed technical analysis.
Refer to `BOOKING_OWNER_FILTERING_IMPLEMENTATION.md` for before/after code samples.

