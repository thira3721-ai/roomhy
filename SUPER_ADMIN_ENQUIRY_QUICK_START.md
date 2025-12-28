# Super Admin Enquiry - Data Not Displaying - Quick Start

## 🚨 Problem
You open **superadmin/enquiry.html** and see "No pending reports found" but expect to see visit data.

---

## ✅ Step-by-Step Solution

### Step 1: Check if Data Exists
```
1. Press F12 to open Browser DevTools
2. Click "Console" tab
3. Paste and run:
   JSON.parse(localStorage.getItem('roomhy_visits') || '[]').length
4. Press Enter
```

**Result meanings:**
- **0** → No data in storage (see Step 2)
- **> 0** → Data exists (see Step 3)
- **Error** → Storage issue (see Step 4)

---

### Step 2: If No Data (Result = 0)
**Your visit.html submissions aren't saving**

Do this:
1. Go to **Areamanager/visit.html**
2. Fill the form completely
3. Capture 4 photos (Building, Room, Bathroom, Bed)
4. Click "Submit Report"
5. Wait for "✅ Visit report submitted successfully!" alert
6. Check console for logs starting with 📝 "New visit created"
7. Come back to enquiry page and refresh

**If still 0 visits after this:**
- Check visit.html console for ❌ errors
- See [VISIT_SUBMIT_DEBUG_GUIDE.md](VISIT_SUBMIT_DEBUG_GUIDE.md)

---

### Step 3: If Data Exists (Result > 0) but Not Showing
**Data is saved but not displaying**

Check status of visits:
```javascript
// Paste in console:
JSON.parse(localStorage.getItem('roomhy_visits') || '[]').map(v => ({
  status: v.status,
  property: v.propertyInfo?.name
}))
```

**Look at the "status" values:**
- **"pending"** ✅ Should appear
- **"submitted"** ✅ Should appear
- **"approved"** ❌ Won't appear (in different section)
- **"hold"** ❌ Won't appear (in different section)
- **"rejected"** ❌ Won't appear (in different section)

**If all statuses are wrong:**
- Statuses changed by approving/holding visits
- That's normal - they moved to different sections
- Create new visits to see pending ones

**If you have "pending" or "submitted" but still not showing:**
- Reload page: Ctrl+F5 (hard refresh)
- Or click "Refresh" button on page
- Check console for any red errors

---

### Step 4: If You Get an Error
**Storage is blocked or corrupted**

Try:
```javascript
// 1. Check if accessible:
typeof localStorage !== 'undefined'

// 2. If true but data corrupted, reset:
localStorage.removeItem('roomhy_visits');
sessionStorage.removeItem('roomhy_visits');
location.reload();

// 3. Then create fresh visits from visit.html
```

---

## 🔍 Detailed Diagnostics

### See Everything at Once
Paste this in console:
```javascript
(() => {
  const visits = JSON.parse(localStorage.getItem('roomhy_visits') || '[]');
  console.log('📊 Total visits:', visits.length);
  
  const byStatus = {};
  visits.forEach(v => {
    byStatus[v.status] = (byStatus[v.status] || 0) + 1;
  });
  
  console.log('📈 By status:', byStatus);
  console.log('✅ Should display:', (byStatus['pending'] || 0) + (byStatus['submitted'] || 0));
  console.log('🔍 View:', visits.slice(0, 3).map(v => ({
    ID: v._id.slice(-8),
    Status: v.status,
    Property: v.propertyInfo?.name,
    Date: new Date(v.submittedAt).toLocaleDateString()
  })));
})();
```

---

## 🛠️ Manual Fix: Force Refresh Data
```javascript
// In console:
fetchEnquiries();
```

This will:
1. Re-read from storage
2. Re-filter data
3. Re-render table

---

## 📋 Common Scenarios

### Scenario 1: Submitted visit from visit.html, not in enquiry

**Checklist:**
- [ ] Visit shows "✅ submitted successfully" message
- [ ] visit.html console shows "📝 New visit created"
- [ ] localStorage shows data: `JSON.parse(localStorage.getItem('roomhy_visits')).length > 0`
- [ ] Visit status is "pending"
- [ ] superadmin/enquiry.html is refreshed

**If all ✅:** Data should appear

**If not all ✅:** 
1. Complete missing steps
2. Check console for errors (red text)
3. See [VISIT_SUBMIT_DEBUG_GUIDE.md](VISIT_SUBMIT_DEBUG_GUIDE.md)

---

### Scenario 2: Data visible in console but not in table

**Likely cause:** Rendering issue

**Fix:**
1. Hard refresh: **Ctrl+F5** (Windows) or **Cmd+Shift+R** (Mac)
2. Click "Refresh" button on page
3. Reload page completely

**If still doesn't work:**
1. Check for errors: Press F12, look for red text
2. Run: `fetchEnquiries()` in console
3. See console logs to find exact issue

---

### Scenario 3: Some visits appear, some don't

**Likely cause:** Status filter or area mismatch (if you're an employee)

**Check:**
```javascript
// Show all visits and their statuses
JSON.parse(localStorage.getItem('roomhy_visits') || '[]').forEach(v => {
  console.log(v._id.slice(-8), '-', v.status, '-', v.propertyInfo?.name);
});
```

**Solutions:**
- Pending/submitted visits should show ✅
- Approved/hold/rejected won't show (they're in different sections) ❌
- Create new visits to get more pending ones

---

## 🎯 Visual Console Log Guide

After opening enquiry.html, your console should show:

```
✅ SUCCESS (you'll see data):
📄 Super Admin Enquiry Page Loaded
🔄 fetchEnquiries() called
📦 Loaded from localStorage: 3 visits
✅ Filtered to pending/submitted: 2 visits
📋 Rendering 2 visits to table
✅ Table rendered successfully

❌ NO DATA (no visits in storage):
📄 Super Admin Enquiry Page Loaded
🔄 fetchEnquiries() called
📦 Loaded from localStorage: 0 visits
⚠️ No pending visits found

⚠️ DATA FILTERED OUT (visits exist but hidden):
📄 Super Admin Enquiry Page Loaded
🔄 fetchEnquiries() called
📦 Loaded from localStorage: 5 visits
⏭️ Skipping visit... Status: approved
✅ Filtered to pending/submitted: 0 visits
```

---

## 📞 If Still Stuck

Prepare this info:
1. **Screenshot of console** (F12 → Console → Screenshot)
2. **Result of:** `JSON.parse(localStorage.getItem('roomhy_visits') || '[]').length`
3. **Results of:** `JSON.parse(localStorage.getItem('roomhy_visits') || '[]').map(v => v.status)`
4. **URL you're on**
5. **Your user role** (Super Admin / Area Manager / Employee)

Then ask with this info.

---

## 📄 Related Documents

- [VISIT_SUBMIT_DEBUG_GUIDE.md](VISIT_SUBMIT_DEBUG_GUIDE.md) - Fix visit submission issues
- [SUPER_ADMIN_ENQUIRY_TESTS.md](SUPER_ADMIN_ENQUIRY_TESTS.md) - Test commands for console
- [SUPER_ADMIN_ENQUIRY_DEBUG.md](SUPER_ADMIN_ENQUIRY_DEBUG.md) - Detailed debugging steps

---

**Last Updated:** December 20, 2025  
**Issue:** No data displaying on super admin enquiry page  
**Status:** Enhanced with comprehensive logging and debugging tools
