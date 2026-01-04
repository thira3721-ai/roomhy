# COMPLETE WORKFLOW - QUICK TESTING GUIDE

## 🚀 READY TO TEST - 8-STEP WORKFLOW

This guide walks you through testing the complete booking workflow from property page to area manager dashboard.

---

## ✅ PRE-TEST CHECKLIST

Before testing, ensure:
- [ ] MongoDB Atlas connection is active (MONGO_URI in .env)
- [ ] Server is running: `npm run dev`
- [ ] No errors in console
- [ ] Browser localStorage is accessible

---

## 🧪 TEST SCENARIO

### Test Setup
- **User Role:** Tenant (logged in)
- **Area:** Kota
- **Area Manager ID:** AM001

---

## TEST FLOW

### STEP 1️⃣ - LOGIN CHECK ✅

**Location:** `http://localhost:5000/website/property.html?id=PROP123`

**Test Case 1A: Not Logged In**
```
1. Open property.html in NEW incognito window
2. Click "Request" button
3. Expected: Redirect to login page
✅ PASS if redirected to index.html
❌ FAIL if form shows without login
```

**Test Case 1B: Logged In**
```
1. Login with any tenant account
2. Open property.html?id=PROP123
3. Click "Request" button
4. Expected: Form appears
✅ PASS if form displays
❌ FAIL if redirected to login
```

**Browser Console Check:**
```javascript
// Check session
console.log(localStorage.getItem('user'));
// Should output: {"loginId": "...", "email": "...", ...}
```

---

### STEP 2️⃣ - COLLECT DATA ✅

**Location:** `property.html` → Request Form

**Test Case 2: Form Data Collection**

```
1. Open property.html (logged in)
2. Scroll to "Request a Visit" section
3. Fill form with:
   - Name: "Test Tenant"
   - Email: "test@email.com"
   - Phone: "9876543210"
4. Click "Submit Request" button

Expected values sent to API:
{
    property_id: "PROP123"
    property_name: "Athena House, Hinjawadi"
    area: "Kota"
    property_type: "PG"
    rent_amount: 15000
    user_id: "USER123"
    name: "Test Tenant"
    email: "test@email.com"
    phone: "9876543210"
    request_type: "request"
}
```

**Console Check:**
```javascript
// Open DevTools → Network tab
// Look for POST request to /api/booking/create
// Check Request body - should contain all fields above
```

---

### STEP 3️⃣ - SEND TO BACKEND ✅

**Location:** Network tab in DevTools

**Test Case 3: API Call Success**

```
1. Complete STEP 2 form submission
2. Open DevTools → Network tab
3. Look for POST request to: /api/booking/create
4. Status should be: 201 (Created)

Expected Response:
{
    "message": "Booking request created successfully",
    "booking": {
        "id": "BOK123456",
        "status": "pending",
        ...
    },
    "area_manager_id": "AM001"
}
```

✅ **PASS if:**
- Status is 201
- Response has booking object
- area_manager_id is "AM001"

❌ **FAIL if:**
- Status is 400/500
- Error message in response
- Missing area_manager_id

---

### STEP 4️⃣ - DATABASE INSERT ✅

**Location:** MongoDB Atlas → Collections

**Test Case 4: Verify MongoDB Record**

```
1. Login to MongoDB Atlas: https://atlas.mongodb.com
2. Go to: Database → Collections
3. Select: roomhy database
4. Select: bookingrequests collection
5. Look for latest record

Expected Fields:
{
    _id: ObjectId,
    property_id: "PROP123"
    property_name: "Athena House, Hinjawadi"
    area: "Kota"
    user_id: "USER123"
    name: "Test Tenant"
    email: "test@email.com"
    phone: "9876543210"
    area_manager_id: "AM001"          // ✅ AUTO-ASSIGNED
    status: "pending"                 // ✅ DEFAULT
    visit_status: "not_scheduled"     // ✅ DEFAULT
    request_type: "request"
    created_at: ISODate("2024-01-03T...")
}
```

✅ **PASS if:**
- Record exists in MongoDB
- area_manager_id = "AM001"
- status = "pending"
- All user data is saved

❌ **FAIL if:**
- Record not found
- Wrong area_manager_id
- Missing required fields

---

### STEP 5️⃣ - FETCH BY AREA MANAGER ✅

**Location:** `areamanager/booking_request.html`

**Test Case 5A: Area Manager Login**

```
1. Login as area manager with:
   - area_manager_id: "AM001"
   - area: "Kota"

2. Store in localStorage:
   localStorage.setItem('user', JSON.stringify({
       area_manager_id: 'AM001',
       area: 'Kota'
   }))
```

**Test Case 5B: Fetch Records**

```
1. Open: http://localhost:5000/areamanager/booking_request.html
2. Page should load automatically
3. Expected API call: GET /api/booking/requests?area_manager_id=AM001

Network Tab Check:
- Request: GET /api/booking/requests?area_manager_id=AM001
- Status: 200
- Response: { count: 1, bookings: [...] }
```

✅ **PASS if:**
- Page loads without errors
- API call shows status 200
- Response contains booking records

❌ **FAIL if:**
- 404 error on API
- Empty response
- Wrong area_manager_id filter

---

### STEP 6️⃣ - DISPLAY IN TABLE ✅

**Location:** `booking_request.html` → Table

**Test Case 6: Verify Display**

```
1. Page should show table with columns:
   - Property ID: PROP123
   - Property Name: Athena House, Hinjawadi
   - Area: Kota
   - User Name: Test Tenant
   - Status Badge: Yellow "Pending"
   - Visit Status: Yellow "Not Scheduled"

2. Check table rendering:
   ✅ Correct number of columns (21)
   ✅ All data populated correctly
   ✅ Status badges with correct colors
   ✅ Data formatting correct (dates, currency)
```

**Status Badge Colors:**
```
pending → Yellow background
confirmed → Green background
rejected → Red background
not_scheduled → Yellow background
scheduled → Blue background
```

✅ **PASS if:**
- All fields displayed correctly
- Badge colors match status
- Data formatted properly

❌ **FAIL if:**
- Missing columns
- Wrong data displayed
- Badge colors incorrect

---

### STEP 7️⃣ - COMMUNICATION ACTIONS ✅

**Location:** `booking_request.html` → Action Column

**Test Case 7A: WhatsApp Link**

```
1. Find the record in the table
2. Click the green "WhatsApp" icon
3. Expected: Opens WhatsApp with user phone

Verify:
- Opens in new tab
- URL format: https://wa.me/9876543210
- Message field is empty (user can type)

✅ PASS if WhatsApp opens with phone number
```

**Test Case 7B: Chat Link**

```
1. Find the record in the table
2. Click the blue "Chat" icon
3. Expected: Opens areachat.html with user ID

Verify:
- Opens areachat.html?user=USER123
- Chat interface loads
- Can send messages to user

✅ PASS if chat interface opens
```

---

### STEP 8️⃣ - AREA MANAGER ACTIONS ✅

**Location:** `booking_request.html` → Action Buttons

#### TEST 8A: APPROVE BOOKING ✅

```
1. Find "Pending" booking in table
2. Look for Green "✓" (Approve) button
3. Click Approve button
4. Popup: "Are you sure you want to approve this booking?"
5. Click OK

Expected:
- API Call: PUT /api/booking/requests/BOK123/approve
- Status: 200
- Table refreshes
- Status badge changes: Pending → Confirmed (Green)

Verify in MongoDB:
{
    _id: ObjectId(...),
    status: "confirmed"  // ✅ CHANGED
    updated_at: ISODate(new timestamp)
}

✅ PASS if status changes to "Confirmed"
```

#### TEST 8B: REJECT BOOKING ✅

```
1. Create another booking (STEP 1-4)
2. Open booking_request.html
3. Find the new "Pending" booking
4. Click Red "✕" (Reject) button
5. Prompt appears: "Enter reason for rejection:"
6. Type: "Not available in this area"
7. Click OK

Expected:
- API Call: PUT /api/booking/requests/BOK456/reject
- Status: 200
- Table refreshes
- Status badge changes: Pending → Rejected (Red)
- Approve/Reject buttons disappear

Verify in MongoDB:
{
    _id: ObjectId(...),
    status: "rejected"
    rejection_reason: "Not available in this area"
    updated_at: ISODate(new timestamp)
}

✅ PASS if status changes to "Rejected"
```

#### TEST 8C: SCHEDULE VISIT ✅

```
1. Find "Confirmed" booking (use Test 8A result)
2. Click Purple "📅" (Schedule) button
3. Series of prompts appear:
   - Visit Type: physical
   - Date: 2024-01-10
   - Time Slot: 10:00-11:00
4. Enter values and click OK

Expected:
- API Call: POST /api/booking/requests/BOK123/schedule-visit
- Status: 200
- Table refreshes
- Visit Status badge changes: Not Scheduled → Scheduled (Blue)
- Schedule button disappears

Verify in MongoDB:
{
    _id: ObjectId(...),
    visit_status: "scheduled"
    visit_type: "physical"
    visit_date: ISODate("2024-01-10T00:00:00Z")
    visit_time_slot: "10:00-11:00"
    updated_at: ISODate(new timestamp)
}

✅ PASS if visit_status changes to "Scheduled"
```

---

## 🧪 COMPLETE TEST SCRIPT

Copy & run this in console to automate testing:

```javascript
// TEST SCENARIO
console.log("=== STARTING COMPLETE WORKFLOW TEST ===");

// STEP 1: Login check
console.log("\n✓ STEP 1: LOGIN CHECK");
const user = JSON.parse(localStorage.getItem('user') || '{}');
console.log("Logged in user:", user.loginId ? "YES" : "NO");

// STEP 2: Mock data
console.log("\n✓ STEP 2: MOCK DATA");
const testData = {
    property_id: "PROP123",
    property_name: "Athena House",
    area: "Kota",
    user_id: user.loginId,
    name: "Test Tenant",
    email: "test@email.com",
    phone: "9876543210",
    request_type: "request"
};
console.log("Test data:", testData);

// STEP 3-4: Send to API and save
console.log("\n✓ STEP 3-4: SENDING TO API");
fetch('http://localhost:5000/api/booking/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testData)
})
.then(r => r.json())
.then(data => {
    console.log("✓ Booking created:", data.booking.id);
    console.log("✓ Area Manager ID:", data.area_manager_id);
    
    // STEP 5: Fetch records
    console.log("\n✓ STEP 5: FETCHING FOR AREA MANAGER");
    return fetch(`http://localhost:5000/api/booking/requests?area_manager_id=${data.area_manager_id}`);
})
.then(r => r.json())
.then(data => {
    console.log("✓ Records found:", data.count);
    console.log("✓ Booking details:", data.bookings[0]);
    console.log("\n=== COMPLETE WORKFLOW TEST PASSED ===");
})
.catch(e => console.error("ERROR:", e));
```

---

## 🐛 TROUBLESHOOTING

### Error: "Cannot find user session"
**Solution:**
```javascript
// Check localStorage
console.log(localStorage.getItem('user'));

// Should output non-null value
// If null, login again
```

### Error: "area_manager_id is undefined"
**Solution:**
```javascript
// Ensure user object has area_manager_id
localStorage.setItem('user', JSON.stringify({
    loginId: 'USER123',
    area_manager_id: 'AM001',
    area: 'Kota'
}))
```

### Error: "Cannot connect to API"
**Solution:**
```bash
# Verify server running
npm run dev

# Check if endpoint exists
curl http://localhost:5000/api/booking/create

# Check logs for errors
```

### Error: "MongoDB connection failed"
**Solution:**
```bash
# Verify .env file
cat .env | grep MONGO_URI

# Test connection
mongosh "mongodb+srv://user:pass@cluster..."
```

---

## 📊 EXPECTED RESULTS SUMMARY

| Step | Test | Expected | Status |
|------|------|----------|--------|
| 1 | Login Check | Redirected/Form shown | ✓ |
| 2 | Data Collection | All fields captured | ✓ |
| 3 | API Call | POST 201 response | ✓ |
| 4 | Database | Record in MongoDB | ✓ |
| 5 | Fetch | GET 200 with records | ✓ |
| 6 | Display | Table shows data | ✓ |
| 7A | WhatsApp | Opens new tab | ✓ |
| 7B | Chat | Opens chat interface | ✓ |
| 8A | Approve | Status → Confirmed | ✓ |
| 8B | Reject | Status → Rejected | ✓ |
| 8C | Schedule | Visit_Status → Scheduled | ✓ |

---

## ✅ FINAL VERIFICATION

Run this checklist before declaring workflow complete:

- [ ] Step 1: User login check working ✓
- [ ] Step 2: Form collects all data ✓
- [ ] Step 3: API receives request ✓
- [ ] Step 4: MongoDB saves record ✓
- [ ] Step 5: API filters by area_manager_id ✓
- [ ] Step 6: Table displays correctly ✓
- [ ] Step 7A: WhatsApp link works ✓
- [ ] Step 7B: Chat link works ✓
- [ ] Step 8A: Approve updates status ✓
- [ ] Step 8B: Reject updates status ✓
- [ ] Step 8C: Schedule updates visit ✓

**All Passed? ✅ WORKFLOW COMPLETE**

