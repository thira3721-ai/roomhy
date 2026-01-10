# 🚀 Booking Request System - Complete Setup & Testing Guide

## 📋 System Overview

The booking request system now works with the following flow:

1. **Property Owner** creates property via `Areamanager/visit.html`
2. **Super Admin** approves property in `superadmin/enquiry.html` → generates unique `loginId`
3. **Tenant** views property on `website/property.html` and submits booking request
4. **System** stores booking in MongoDB with `owner_id` field
5. **Property Owner** logs in to `propertyowner/booking_request.html` to view their bookings

---

## ✅ System Status Checklist

- [x] Backend server running on port 5000
- [x] MongoDB Atlas connection configured
- [x] property.html: Extracts `generatedCredentials.loginId` from approved visits
- [x] bookingController.js: Validates and stores `owner_id`
- [x] booking_request.html: Fetches bookings filtered by `owner_id`
- [x] BookingRequest model: Has `owner_id` field (required, indexed)

---

## 🧪 Step-by-Step Testing

### STEP 1: Verify Backend is Running
```bash
# Check if server is running on port 5000
# You should see: "Seeder: Mongo connected" and "Server running on port 5000"
node server.js
```

---

### STEP 2: Create a Test Property (As Property Owner)

1. Open `Areamanager/visit.html` in browser
2. Login with property owner credentials
3. Fill in property details (name, address, rent, etc.)
4. Click "Submit for Approval"
5. **Check Console**: Should see `ownerLoginId` being stored
6. **Check Browser DevTools → Application → localStorage**:
   - Key: `roomhy_visits`
   - Look for your property with `status: "approved"` and `generatedCredentials.loginId`

---

### STEP 3: Approve Property in Admin Panel

1. Open `superadmin/enquiry.html` in **INCOGNITO** mode (different browser session)
2. Find your submitted property in "Pending Approvals" tab
3. Click the ✓ (Approve) button
4. Choose "Yes, Upload" to make it live on website
5. Copy the generated **loginId** and **Password** (you'll need these!)
6. **Check Console**: Should confirm "Visit approved"
7. **Check localStorage**: Property should now have:
   - `status: "approved"`
   - `isLiveOnWebsite: true`
   - `generatedCredentials: { loginId: "ROOMHY****", tempPassword: "****" }`

---

### STEP 4: Submit Booking Request (As Tenant)

1. Open `website/property.html` in **NORMAL** mode (clear any owner session)
2. Clear browser cache (Ctrl+Shift+Delete)
3. Navigate to the property you just approved
4. Fill in tenant details (name, email)
5. Click "Request" button
6. **Console should show**:
   - "✅ Loaded from localStorage" (visits)
   - "Found visit matching property ID"
   - "Extracted owner ID from visit: ROOMHY****"
   - "POST to /api/booking/create"

---

### STEP 5: Verify Booking in MongoDB

1. Go to **MongoDB Atlas** → Your Cluster → `roomhy_db` collection → `bookingrequests`
2. Look for a document with:
   ```json
   {
     "_id": "...",
     "property_id": "v_1234567890",
     "property_name": "Your Property Name",
     "owner_id": "ROOMHY****",  // ← This must be present!
     "user_id": "tenant_id",
     "name": "Tenant Name",
     "email": "tenant@email.com",
     "status": "pending",
     "created_at": "2024-01-08T..."
   }
   ```

---

### STEP 6: View Bookings in Owner Panel

1. Open `propertyowner/booking_request.html`
2. **If you get "No owner ID found" error**:
   - Go to `propertyowner/booking_debug.html` to diagnose
   - Follow instructions in debug panel

3. **Once owner ID is found**:
   - Should load bookings from MongoDB
   - Display table with booking details
   - Actions available: WhatsApp, Chat, Approve, Reject, Schedule Visit

4. **Console should show**:
   - "Loading bookings for owner: ROOMHY****"
   - "API Response: { data: [...], success: true }"
   - "✓ Loaded X bookings from API"

---

## 🔧 Troubleshooting

### Issue: "Error: Could not identify property owner"

**Cause**: Property doesn't have `generatedCredentials.loginId`

**Solution**:
1. Ensure property was approved by super admin
2. Check in superadmin/enquiry.html that property shows "approved" status
3. Clear cache and reload website/property.html
4. Try again

---

### Issue: No bookings appear in owner panel

**Solutions** (in order):

1. **Check Debug Panel**:
   - Open `propertyowner/booking_debug.html`
   - Click "List Approved Properties" - should see your property with loginId
   - Click "Test API Connection" - should show API is reachable
   - Click "Fetch Bookings from API" - should show your booking

2. **Verify Owner ID**:
   - Open browser DevTools → Console
   - Type: `localStorage.getItem('ownerLoginId')`
   - Should return: `"ROOMHY****"` (or similar)

3. **Check MongoDB**:
   - Go to MongoDB Atlas
   - Find your booking document
   - Verify `owner_id` field matches the owner's loginId

4. **Verify API is working**:
   - In browser console, run:
   ```javascript
   const owner_id = localStorage.getItem('ownerLoginId');
   fetch(`https://roomhy-backend.onrender.com/api/booking/requests?owner_id=${owner_id}`)
     .then(r => r.json())
     .then(data => console.log(data))
   ```

---

### Issue: API returns empty list but booking exists in MongoDB

**Cause**: `owner_id` in booking doesn't match the owner's loginId

**Solution**:
1. Verify booking has `owner_id` field in MongoDB
2. Verify `owner_id` matches the property's `generatedCredentials.loginId`
3. If not, booking request was submitted before approval - resubmit

---

### Issue: Backend shows "Cannot find module ./routes/favoritesRoutes"

**Solution**:
```bash
# Kill any running node processes
Stop-Process -Name node -Force

# Restart server
cd roomhy-backend
node server.js
```

---

## 📱 API Endpoints

### Create Booking Request
```
POST /api/booking/create
Body: {
  property_id, property_name, area, property_type, rent_amount,
  user_id, name, email, phone,
  owner_id,              // ← REQUIRED! (from property's generatedCredentials.loginId)
  request_type: "booking" | "bid",
  message, bid_amount
}
```

### Get Bookings (Filtered by Owner)
```
GET /api/booking/requests?owner_id=ROOMHY1234
Response: { success: true, data: [...] }
```

---

## 🔐 Owner Panel Login Flow

**Current Method**: Uses localStorage

The owner ID is automatically detected from:
1. `localStorage.get('ownerLoginId')`
2. `localStorage.get('user').loginId`
3. First approved property's `generatedCredentials.loginId`

**Future Enhancement**: Implement proper login page with username/password

---

## 📊 Data Structure

### Visit Object (property)
```json
{
  "_id": "v_1704741234567",
  "status": "approved",
  "isLiveOnWebsite": true,
  "generatedCredentials": {
    "loginId": "ROOMHY1234",
    "tempPassword": "abc12345"
  },
  "propertyInfo": {
    "name": "2 BHK Apartment",
    "address": "123 Main St",
    "propertyType": "Apartment",
    "monthlyRent": 5000,
    "amenities": ["WiFi", "Parking", "Gym"]
  }
}
```

### Booking Request Object
```json
{
  "_id": "ObjectId()",
  "property_id": "v_1704741234567",
  "property_name": "2 BHK Apartment",
  "user_id": "tenant_123",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "owner_id": "ROOMHY1234",        // ← Links to property owner
  "request_type": "booking",
  "status": "pending",
  "created_at": "2024-01-08T10:30:00Z"
}
```

---

## 🎯 Key Files Modified

| File | Change |
|------|--------|
| `website/property.html` | Extracts `generatedCredentials.loginId` from approved visit |
| `propertyowner/booking_request.html` | Detects owner ID from localStorage, fetches bookings with filter |
| `roomhy-backend/controllers/bookingController.js` | Validates `owner_id`, supports filtering by `owner_id` |
| `roomhy-backend/models/BookingRequest.js` | `owner_id` field (required, indexed) |

---

## 💡 Tips

- **Clear Cache Often**: Ctrl+Shift+Delete before each test
- **Use Debug Panel**: `propertyowner/booking_debug.html` shows real-time status
- **Check Console**: Browser DevTools → Console shows detailed logs
- **MongoDB Monitoring**: Refresh MongoDB Atlas collection to verify documents are being created

---

## ✨ Expected Success Indicators

✅ Property created and approved
✅ Booking submitted successfully
✅ No console errors
✅ Booking appears in MongoDB with `owner_id` field
✅ Booking appears in owner panel when logging in
✅ Owner can approve/reject/schedule visit for their booking

---

Last Updated: January 8, 2026
