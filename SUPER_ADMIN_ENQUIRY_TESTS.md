# Super Admin Enquiry - Quick Test Commands

Copy each section below into your browser console (F12) and press Enter.

---

## Test 1: Is Data Stored?

```javascript
const visits = JSON.parse(localStorage.getItem('roomhy_visits') || '[]');
console.log('✅ Total visits in storage:', visits.length);
if (visits.length > 0) {
  console.table(visits.map(v => ({
    'Visit ID': v._id.slice(-8),
    'Status': v.status,
    'Property': v.propertyInfo?.name || 'Unknown',
    'Submitted': new Date(v.submittedAt).toLocaleDateString()
  })));
}
```

---

## Test 2: Show Pending Only

```javascript
const pending = JSON.parse(localStorage.getItem('roomhy_visits') || '[]')
  .filter(v => v.status === 'pending');
console.log('📋 Pending visits:', pending.length);
console.table(pending.map(v => ({
  'ID': v._id.slice(-8),
  'Property': v.propertyInfo?.name,
  'Area': v.propertyInfo?.area,
  'Status': v.status
})));
```

---

## Test 3: Trigger Fetch

```javascript
console.clear();
console.log('🔄 Calling fetchEnquiries()...');
fetchEnquiries();
```

---

## Test 4: Check Table Element

```javascript
const tbody = document.getElementById('enquiryBody');
console.log('📍 Table element exists:', !!tbody);
console.log('📊 Table rows currently:', tbody ? tbody.rows.length : 'N/A');
if (tbody) {
  console.log('📍 HTML:', tbody.innerHTML.substring(0, 200));
}
```

---

## Test 5: Detailed Debug

```javascript
(() => {
  console.group('🔍 Super Admin Enquiry Debug');
  
  // Storage check
  const raw = localStorage.getItem('roomhy_visits');
  console.log('Storage exists:', !!raw);
  
  // Parse check
  let visits = [];
  try {
    visits = JSON.parse(raw || '[]');
    console.log('✅ Parse success:', visits.length, 'visits');
  } catch (e) {
    console.error('❌ Parse error:', e.message);
    return;
  }
  
  // Status breakdown
  const statuses = {};
  visits.forEach(v => {
    statuses[v.status] = (statuses[v.status] || 0) + 1;
  });
  console.table(statuses);
  
  // Pending count
  const pending = visits.filter(v => v.status === 'pending').length;
  console.log('🎯 Visits with status "pending":', pending);
  
  // Table check
  const tbody = document.getElementById('enquiryBody');
  console.log('📍 Table found:', !!tbody);
  
  console.groupEnd();
})();
```

---

## Test 6: Force Show All (Debug)

```javascript
(() => {
  const tbody = document.getElementById('enquiryBody');
  const visits = JSON.parse(localStorage.getItem('roomhy_visits') || '[]');
  
  console.log('🔧 Force rendering all', visits.length, 'visits...');
  
  tbody.innerHTML = visits.map((v, i) => `
    <tr style="background: ${i % 2 ? '#f9f9f9' : 'white'}">
      <td style="padding:8px; border:1px solid #ddd;">
        <strong>${v._id.slice(-8)}</strong><br>
        <small style="color:gray">${v.status}</small>
      </td>
      <td style="padding:8px; border:1px solid #ddd;">
        ${v.propertyInfo?.name || 'Unknown'}
      </td>
      <td style="padding:8px; border:1px solid #ddd;">
        ${v.propertyInfo?.area || '-'}
      </td>
      <td style="padding:8px; border:1px solid #ddd;">
        ${new Date(v.submittedAt).toLocaleString()}
      </td>
      <td style="padding:8px; border:1px solid #ddd; color:blue; cursor:pointer;" onclick="console.log(arguments.callee); console.log(${JSON.stringify(v)})">
        View Details
      </td>
    </tr>
  `).join('');
  
  console.log('✅ Rendered', visits.length, 'rows');
})();
```

---

## Test 7: Simulation - Create Fake Visit

Use this ONLY to test if page works when there's data:

```javascript
// Create test visit
const testVisit = {
  _id: 'v_test_' + Date.now(),
  status: 'pending',
  submittedAt: new Date().toISOString(),
  propertyInfo: {
    name: 'Test Property',
    area: 'Test Area',
    staffName: 'Test Staff'
  }
};

// Add to storage
const visits = JSON.parse(localStorage.getItem('roomhy_visits') || '[]');
visits.push(testVisit);
localStorage.setItem('roomhy_visits', JSON.stringify(visits));

console.log('✅ Test visit created. Refreshing page...');
location.reload();
```

---

## Test 8: Clear & Reset

Run this to start fresh (WARNING: Deletes all data):

```javascript
if (confirm('⚠️ This will DELETE all visits. Continue?')) {
  localStorage.removeItem('roomhy_visits');
  sessionStorage.removeItem('roomhy_visits');
  console.log('✅ Cleared all data');
  location.reload();
}
```

---

## Expected Console Output Examples

### ✅ When Everything Works:

```
📄 Super Admin Enquiry Page Loaded
📍 URL: https://...superadmin/enquiry.html
🔄 fetchEnquiries() called - Super Admin Enquiry Page
📦 localStorage roomhy_visits exists: true
📦 Loaded from localStorage: 3 visits
   First visit: {_id: 'v_1734...', status: 'pending', ...}
✅ Loaded from sessionStorage: 0 visits
📊 All visits before filter: 3 total
   1. ID: v_abc123, Status: pending, Property: My Property
   2. ID: v_def456, Status: pending, Property: Another Property
   3. ID: v_ghi789, Status: approved, Property: Third Property
✅ Filtered to pending/submitted: 2 visits
📋 Rendering 2 visits to table
   Rendering 1/2: v_abc123
   Rendering 2/2: v_def456
✅ Table rendered successfully with 2 rows
✅ fetchEnquiries() completed
```

### ❌ When No Data in Storage:

```
📄 Super Admin Enquiry Page Loaded
🔄 fetchEnquiries() called - Super Admin Enquiry Page
📦 localStorage roomhy_visits exists: false
📦 Loaded from localStorage: 0 visits
⚠️ No pending visits found. Showing empty message.
✅ fetchEnquiries() completed
```

### ⚠️ When Data Exists But Filtered Out:

```
📄 Super Admin Enquiry Page Loaded
🔄 fetchEnquiries() called - Super Admin Enquiry Page
📦 Loaded from localStorage: 3 visits
📊 All visits before filter: 3 total
⏭️ Skipping visit (non-pending status): v_abc123 Status: approved
⏭️ Skipping visit (non-pending status): v_def456 Status: rejected
✅ Filtered to pending/submitted: 1 visits
📋 Rendering 1 visits to table
✅ Table rendered successfully with 1 row
```

---

## Troubleshooting Based on Output

| If You See | Means | Action |
|-----------|-------|--------|
| `localStorage: false` | No data in storage | Go to visit.html, submit a visit |
| `Loaded: 0 visits` | Storage empty | Create visit in Areamanager/visit.html |
| `Filtered: X → 0` | All data filtered out | Check visit statuses in Test 5 |
| Red errors | JavaScript error | Read error message carefully |
| No logs at all | JS not running | Check if page loaded fully |
| `rows.length: 0` | Table element not found | Reload page |

---

## Share These Results if Stuck

When asking for help, run **Test 5** and share:
1. The console output
2. How many visits total
3. Their statuses breakdown
4. Any error messages
