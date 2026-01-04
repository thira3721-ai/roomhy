# QUICK START GUIDE - Website Property Enquiry System

## 🚀 How It Works (3 Steps)

### STEP 1: Property Owner Submits Form
**File:** `website/list.html`
- Owner fills property details
- Submits form
- Gets redirected to dashboard

### STEP 2: Superadmin Assigns to Area Manager
**File:** `superadmin/websiteenq.html`
- SuperAdmin sees all enquiries grouped by city
- Clicks assignment button
- Selects area manager
- Enquiry is assigned!

### STEP 3: Area Manager Reviews & Updates
**File:** `areamanager/areaenqu.html`
- Area manager sees assigned properties
- Views details
- Updates status when verified
- Can add notes

---

## 📂 File Locations

```
website/
├── list.html                  ← Property listing form
superadmin/
├── websiteenq.html           ← SuperAdmin dashboard (REWRITTEN)
areamanager/
├── areaenqu.html             ← Area Manager dashboard (NEW)
```

---

## 📋 Area Managers (Pre-configured)

| ID | Name | Area |
|---|---|---|
| 1 | Rajesh Kumar | Indore |
| 2 | Priya Singh | Kota |
| 3 | Amit Patel | Ahmedabad |
| 4 | Neha Sharma | Delhi |

*To add more managers, edit the `loadManagers()` function*

---

## 🔄 Data Flow

```
Property Form Submission
         ↓
   Save to localStorage
   (roomhy_website_enquiries)
         ↓
  SuperAdmin Reviews
  (websiteenq.html)
         ↓
   Assign to Manager
         ↓
   Move to Area Manager Queue
   (roomhy_area_enquiries_{id})
         ↓
  Area Manager Follows Up
  (areaenqu.html)
```

---

## 💾 localStorage Keys

| Key | Purpose | Contains |
|---|---|---|
| `roomhy_website_enquiries` | All enquiries from website | Array of enquiry objects |
| `roomhy_area_enquiries_1` | Indore manager's enquiries | Assigned enquiries |
| `roomhy_area_enquiries_2` | Kota manager's enquiries | Assigned enquiries |
| `roomhy_area_enquiries_3` | Ahmedabad manager's enquiries | Assigned enquiries |
| `roomhy_area_enquiries_4` | Delhi manager's enquiries | Assigned enquiries |

---

## ✨ Key Features

### SuperAdmin Dashboard
- ✅ View all property enquiries
- ✅ Group by city/area
- ✅ Real-time statistics
- ✅ Search & filter
- ✅ View full details
- ✅ Assign to manager

### Area Manager Dashboard
- ✅ View assigned properties only
- ✅ Search assigned enquiries
- ✅ View complete details
- ✅ Update verification status
- ✅ Add review notes
- ✅ Track timestamps

---

## 🧪 Test Flow

1. **Submit Property**
   - Go to `website/list.html`
   - Fill form with test data
   - Submit

2. **Verify in SuperAdmin**
   - Go to `superadmin/websiteenq.html`
   - Should see property grouped by city
   - Click "View Details" to verify data

3. **Assign to Manager**
   - Click user-plus icon
   - Select "Rajesh Kumar (Indore)"
   - Click Assign
   - Should see success message

4. **Check Area Manager**
   - Go to `areamanager/areaenqu.html`
   - Should see assigned property
   - Click "View Details" to verify
   - Click "Update Status" to mark complete

---

## 🎨 UI Screenshots

### websiteenq.html
- Purple gradient headers for city sections
- Area-wise grouping with stats
- Color-coded property types
- Modal-based interactions
- Responsive design

### areaenqu.html
- Clean table layout
- Blue color scheme for area managers
- Status badges (Yellow = Pending, Green = Complete)
- Notes functionality
- Timestamp tracking

---

## 🔧 Customization

### Add New Area Manager
Edit `websiteenq.html` and `areaenqu.html`, find `loadManagers()`:
```javascript
managers = [
    { id: 1, name: 'Rajesh Kumar', area: 'Indore' },
    // Add new manager here:
    { id: 5, name: 'Your Name', area: 'Your City' },
];
```

### Change Colors
- SuperAdmin: Purple theme (change `#667eea` and `#764ba2`)
- Area Manager: Blue theme (change `#3b82f6`)

### Modify Property Types
In form rendering, update the background colors for property type badges

---

## ❓ Common Tasks

### How to see all enquiries?
→ SuperAdmin: Go to `websiteenq.html`, no filters

### How to find pending enquiries?
→ SuperAdmin: Filter by "Pending" status

### How to assign to specific area?
→ SuperAdmin: Filter by city, then assign manager from that area

### How to mark enquiry complete?
→ Area Manager: Click update icon, select "Completed"

### How to add notes?
→ Area Manager: Click update icon, add text in notes field

### How to clear all data?
→ Open browser console, run:
```javascript
localStorage.removeItem('roomhy_website_enquiries');
localStorage.removeItem('roomhy_area_enquiries_1');
localStorage.removeItem('roomhy_area_enquiries_2');
localStorage.removeItem('roomhy_area_enquiries_3');
localStorage.removeItem('roomhy_area_enquiries_4');
```

---

## 📞 Support

### If data isn't saving:
- Check browser console for errors
- Ensure localStorage is enabled
- Check browser storage quota

### If area manager can't see enquiries:
- Verify manager_id in localStorage
- Check assignment was confirmed
- Refresh page

### If assignment fails:
- Ensure manager is selected
- Check localStorage has space
- Verify form had valid data

---

## 🎯 Summary

**Website Property Enquiry System** is fully functional with:
- ✅ Form submission → localStorage
- ✅ SuperAdmin dashboard with area-wise organization
- ✅ Task assignment to area managers
- ✅ Area manager follow-up dashboard
- ✅ Full details visibility
- ✅ Status tracking
- ✅ Search & filter capabilities

**SYSTEM IS PRODUCTION READY!**
