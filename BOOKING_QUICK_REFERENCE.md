# 🎯 Booking System - Quick Reference

## 🚀 How It Works (Simple Version)

```
Property Owner Creates Property → Super Admin Approves & Generates LoginId
                                        ↓
                        Property becomes available on website
                                        ↓
Tenant Views Property & Submits Booking Request → Stores in MongoDB with owner_id
                                        ↓
Owner Views Their Bookings in Panel Using LoginId → Approve/Reject/Schedule
```

---

## 🧪 Testing Checklist

### ✅ Pre-Test Requirements
- [ ] Backend server running: `node server.js` (port 5000)
- [ ] MongoDB Atlas connected
- [ ] Browser cache cleared (Ctrl+Shift+Delete)

### ✅ Test Flow
1. **Create Property** → Areamanager/visit.html
2. **Approve Property** → superadmin/enquiry.html (generates loginId)
3. **Submit Booking** → website/property.html (as tenant)
4. **Check MongoDB** → Verify booking has `owner_id` field
5. **View Bookings** → propertyowner/booking_request.html

---

## 🔍 Debugging Tools

| Tool | Location | Purpose |
|------|----------|---------|
| Debug Panel | `propertyowner/booking_debug.html` | Check system status, view owner ID, test API |
| Browser Console | DevTools → Console | See detailed logs |
| MongoDB Atlas | Atlas Dashboard | Verify booking documents |

---

## 📍 Key Locations

### Property Management
- **Create**: `Areamanager/visit.html`
- **Approve**: `superadmin/enquiry.html`
- **View**: `website/property.html`

### Booking Management
- **Submit**: `website/property.html` (Request button)
- **View**: `propertyowner/booking_request.html` (Owner panel)
- **Debug**: `propertyowner/booking_debug.html` (Troubleshooting)

### Backend
- **API Endpoints**: `roomhy-backend/routes/bookingRoutes.js`
- **Logic**: `roomhy-backend/controllers/bookingController.js`
- **Database**: `roomhy-backend/models/BookingRequest.js`

---

## ⚡ Quick Commands

```bash
# Start backend
cd roomhy-backend
node server.js

# Kill if stuck
Stop-Process -Name node -Force
```

---

## 🆘 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| "Could not identify property owner" | Property not approved in superadmin yet |
| No bookings in owner panel | Check debug panel for owner ID |
| API connection failed | Verify backend is running on port 5000 |
| MongoDB not found | Check MongoDB Atlas connection string in .env |

---

## 📊 Data Flow

```
property.html                bookingController.js              MongoDB
    ↓                              ↓                              ↓
Extract loginId      →    Validate owner_id    →    Store booking with owner_id
from approved visit          Create booking record        Index by owner_id
    ↓
Send POST request
with owner_id


propertyowner/booking_request.html          bookingController.js
    ↓                                              ↓
Get owner loginId              →        Query: find({ owner_id: loginId })
Send GET request with owner_id         Return filtered bookings
    ↓
Display bookings for owner only
```

---

## ✅ Success Indicators

- ✓ Booking submitted without errors
- ✓ Booking visible in MongoDB with owner_id field
- ✓ Booking appears in owner panel when filtered by owner_id
- ✓ Owner can perform actions (approve, reject, schedule)

---

**Created**: January 8, 2026
**Status**: All components integrated and ready for testing
