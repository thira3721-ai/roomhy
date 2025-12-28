# Super Admin Enquiry Page - No Data Display Issue

## Quick Diagnosis Steps

### Step 1: Open Browser Console (F12)
- Press **F12** or **Right-click → Inspect → Console**
- Keep console open and visible

### Step 2: Refresh Enquiry Page
- Go to **superadmin/enquiry.html**
- Press **F5** to refresh
- Watch console for logs

### Step 3: Look for These Logs in Order

You should see:
```
📄 Super Admin Enquiry Page Loaded
📍 URL: ...superadmin/enquiry.html
🔄 fetchEnquiries() called - Super Admin Enquiry Page
📦 localStorage roomhy_visits exists: true/false
📦 Loaded from localStorage: X visits
```

---

## Possible Issues & Solutions

### Issue 1: No Logs Appear at All
**Cause:** JavaScript not running or file not loaded
**Check:**
1. Page console shows errors? (red text)
2. Try typing in console: `fetchEnquiries()` and press Enter
3. If works, page might have JavaScript blocked

### Issue 2: "Loaded from localStorage: 0 visits"
**Cause:** No visit data in storage yet
**Solution:**
1. Go to **Areamanager/visit.html**
2. Create and submit a visit report
3. Come back to enquiry.html
4. Click Refresh button or reload page

### Issue 3: "Loaded from localStorage: X visits" but Table Empty
**Cause:** Data exists but filtered out OR table element missing
**Check in console:**
```javascript
// Check filtered count
document.getElementById('enquiryBody').rows.length

// Check if element exists
document.getElementById('enquiryBody') != null
```

### Issue 4: Data Shows Count but Status Wrong
**Cause:** Visits have wrong status (not 'pending' or 'submitted')
**Check in console:**
```javascript
// Check visit statuses
JSON.parse(localStorage.getItem('roomhy_visits') || '[]').map(v => ({
  id: v._id,
  status: v.status,
  property: v.propertyInfo?.name
}))
```

---

## Manual Data Check

### Copy & Paste in Console:

**Check 1: See all visits**
```javascript
const all = JSON.parse(localStorage.getItem('roomhy_visits') || '[]');
console.table(all.map(v => ({
  ID: v._id.slice(-8),
  Status: v.status,
  Property: v.propertyInfo?.name,
  Date: new Date(v.submittedAt).toLocaleDateString()
})));
```

**Check 2: See only pending visits**
```javascript
const pending = JSON.parse(localStorage.getItem('roomhy_visits') || '[]')
  .filter(v => ['pending', 'submitted'].includes(v.status));
console.log('Pending visits:', pending.length);
console.table(pending);
```

**Check 3: Trigger fetch manually**
```javascript
fetchEnquiries();
```

---

## Diagnostic Commands

Run these in console to diagnose:

```javascript
// 1. Check localStorage exists and size
(() => {
  const data = localStorage.getItem('roomhy_visits');
  console.log('Data exists:', !!data);
  console.log('Data size:', data ? data.length + ' bytes' : 'empty');
  console.log('Data count:', data ? JSON.parse(data).length + ' visits' : 0);
})();

// 2. Show first visit details
(() => {
  const visits = JSON.parse(localStorage.getItem('roomhy_visits') || '[]');
  if (visits.length > 0) {
    console.log('First visit:', visits[0]);
  } else {
    console.log('No visits in storage');
  }
})();

// 3. Check table element
(() => {
  const tbody = document.getElementById('enquiryBody');
  console.log('Table element found:', !!tbody);
  if (tbody) {
    console.log('Table rows:', tbody.rows.length);
  }
})();

// 4. Manual refresh
fetchEnquiries();
```

---

## What Each Log Means

| Log | Meaning |
|-----|---------|
| 📄 Page Loaded | HTML loaded successfully |
| 📍 URL | Current page URL |
| 🔄 fetchEnquiries() called | Function started |
| 📦 localStorage roomhy_visits exists | Storage has the data key |
| 📦 Loaded from localStorage: X | Found X visits in storage |
| 📦 Loaded from sessionStorage: X | Found X visits in session |
| 🔗 Merged | Combined data from both storages |
| 📊 All visits before filter: X | Total visits before filtering |
| ⏭️ Skipping visit | Visit has wrong status, filtered out |
| ✅ Filtered to pending: X | After filtering, X visits remain |
| ⚠️ No pending visits found | After filter, nothing to display |
| 📋 Rendering X visits | About to create table rows |
| ✅ Table rendered successfully | Table HTML created |
| ✅ fetchEnquiries() completed | Function finished |

---

## If Data Exists But Not Displaying

1. **Status Wrong?**
   - Visit must have `status: 'pending'` or `status: 'submitted'`
   - Check actual status in console

2. **Table Element Wrong ID?**
   - Search HTML for `id="enquiryBody"`
   - Verify it exists in the page

3. **JavaScript Error?**
   - Look for red errors in console
   - Check error message and stack trace

---

## Quick Fix: Show ALL Data (Debug Mode)

Paste in console to bypass filtering:
```javascript
function showAllEnquiries() {
  const tbody = document.getElementById('enquiryBody');
  const visits = JSON.parse(localStorage.getItem('roomhy_visits') || '[]');
  console.log('Showing all', visits.length, 'visits (debug mode)');
  
  if (visits.length === 0) {
    tbody.innerHTML = '<tr><td colspan="25" class="text-center">No visits in storage</td></tr>';
    return;
  }
  
  // Show without status filter
  tbody.innerHTML = visits.map(v => `<tr>
    <td>${v._id.slice(-8)}</td>
    <td>${v.status}</td>
    <td>${v.propertyInfo?.name || 'N/A'}</td>
    <td colspan="22" class="text-xs text-gray-500">${new Date(v.submittedAt).toLocaleString()}</td>
  </tr>`).join('');
}

showAllEnquiries();
```

---

## If Still Stuck

1. ✅ Open console (F12)
2. ✅ Run all diagnostic commands above
3. ✅ Screenshot console output
4. ✅ Share:
   - What logs you see
   - What errors appear
   - How many visits in storage
   - Their statuses

---

**Last Updated:** December 20, 2025
**Page:** superadmin/enquiry.html
