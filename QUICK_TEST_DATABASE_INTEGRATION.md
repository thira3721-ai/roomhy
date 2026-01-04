# Quick Test Guide - Database Integration

## 🚀 How to Test the Database Integration

### Prerequisites
- Backend server running (Node.js)
- MongoDB database with visit records
- At least one property marked as `approved` and `isLiveOnWebsite: true`

---

## Step 1: Test API Endpoint Directly

### Using curl (Terminal/PowerShell)

```bash
# Test 1: Get all approved properties
curl http://localhost:5000/api/visits/public/approved

# Test 2: Filter by city
curl "http://localhost:5000/api/visits/public/approved?city=indore"

# Test 3: Filter by gender
curl "http://localhost:5000/api/visits/public/approved?gender=girls"

# Test 4: Filter by multiple criteria
curl "http://localhost:5000/api/visits/public/approved?city=indore&gender=girls&propertyType=pg"

# Test 5: Filter by price range
curl "http://localhost:5000/api/visits/public/approved?minPrice=4000&maxPrice=10000"
```

### Using Browser

```javascript
// Open browser console (F12 → Console) and run:

// Test 1: Get all properties
fetch('http://localhost:5000/api/visits/public/approved')
  .then(r => r.json())
  .then(d => console.log(d))

// Test 2: With filters
fetch('http://localhost:5000/api/visits/public/approved?city=indore&gender=girls')
  .then(r => r.json())
  .then(d => console.log(d))
```

---

## Step 2: Test ourproperty.html

### Test 1: Navigate directly
```
http://localhost:5000/website/ourproperty.html
```

**Expected Result:**
- Properties display if any are approved and live
- Check DevTools → Network tab
- See API call: `GET /api/visits/public/approved`
- Status should be 200 (success)

### Test 2: Navigate with city parameter
```
http://localhost:5000/website/ourproperty.html?city=indore
```

**Expected Result:**
- City auto-selects in dropdown
- Properties filter to show only Indore properties
- API call includes `?city=indore` parameter

### Test 3: Apply filters manually
1. Open ourproperty.html
2. Select city from dropdown
3. Select area from dropdown
4. Select gender, property type, occupancy
5. Adjust price range

**Expected Result:**
- API call updates with all filter parameters
- Properties update in real-time
- Property count changes

### Test 4: Check Network Traffic
1. Open DevTools (F12)
2. Go to Network tab
3. Reload page
4. Look for requests to `/api/visits/public/approved`
5. Click on request → Preview tab
6. See the JSON response with properties

---

## Step 3: Test Error Scenarios

### Test 1: API Down Fallback
1. Disconnect internet or block API in DevTools (Network → Offline)
2. Refresh page
3. **Expected:** Properties load from localStorage cache or show error

### Test 2: No Properties Scenario
1. Open API endpoint with filter that returns 0 results
2. **Expected:** Show "No properties found for selected filters"

### Test 3: Invalid Filter
1. Send invalid query: `?city=unknown&minPrice=99999`
2. **Expected:** Return empty array (success: true, properties: [])

---

## Step 4: Check Console for Issues

### Open Browser Console (F12 → Console)

**Look for:**
✅ No red error messages
✅ Successful API call logs
✅ "Error fetching from API:" means fallback triggered

**Common Errors:**
```
❌ "Failed to fetch" → API not running or network issue
❌ "404 Not Found" → Endpoint doesn't exist
❌ "CORS error" → Backend CORS not configured
```

---

## Step 5: Verify Data Structure

### Check what data the API returns:

```javascript
// Open browser console and run:
fetch('http://localhost:5000/api/visits/public/approved')
  .then(r => r.json())
  .then(d => {
    console.log('Properties returned:', d.count);
    console.log('First property:', d.properties[0]);
    console.log('Has propertyInfo:', !!d.properties[0]?.propertyInfo);
    console.log('Has roomInfo:', !!d.properties[0]?.roomInfo);
    console.log('Has monthlyRent:', !!d.properties[0]?.monthlyRent);
  })
```

---

## Step 6: Full Integration Test

### Complete User Flow Test

1. **Start point:** `http://localhost:5000/website/before.html`
2. Scroll to "Our Cities" section
3. Click city (e.g., Indore)
4. Auto-navigate to `ourproperty.html?city=indore`
5. **Check:** City auto-selects
6. **Check:** Properties display from API
7. Select additional filters
8. **Check:** Property count updates
9. Click property card
10. **Check:** Property details load

---

## Test Data Preparation

If no properties exist in database:

### Option 1: Add via visit.html admin form
1. Go to `Areamanager/visit.html`
2. Fill in property details
3. Submit form
4. Go to super admin to approve

### Option 2: Add directly to database

Use MongoDB command or tool:

```javascript
db.visitreports.insertOne({
  status: "approved",
  isLiveOnWebsite: true,
  propertyInfo: {
    name: "Test PG",
    city: "Indore",
    area: "Vijay Nagar",
    gender: "co-ed",
    propertyType: "pg"
  },
  roomInfo: {
    occupancy: "double"
  },
  monthlyRent: 6500,
  rating: 4.5,
  reviewsCount: 12,
  isVerified: true,
  photos: ["https://example.com/photo.jpg"]
})
```

---

## Performance Testing

### Check API Response Time

1. Open DevTools → Network tab
2. Make API request
3. Check "Time" column
4. **Good:** < 100ms
5. **Acceptable:** < 500ms
6. **Slow:** > 1000ms (consider optimization)

### Test with Large Result Set
- If 100+ properties: Check pagination needs
- Response time should still be < 500ms

---

## Checklist

- [ ] API endpoint exists and returns 200
- [ ] API returns properties with correct structure
- [ ] ourproperty.html loads properties from API
- [ ] City filter works
- [ ] Area dropdown populates
- [ ] Gender filter works
- [ ] Property type filter works
- [ ] Price range filter works
- [ ] Occupancy filter works
- [ ] Multiple filters work together
- [ ] Network tab shows API call
- [ ] No console errors
- [ ] Fallback to localStorage works
- [ ] Properties display correctly
- [ ] Mobile view works
- [ ] Desktop view works

---

## Troubleshooting

### Problem: Properties don't show

**Solution:**
1. Check MongoDB has approved properties
2. Verify `isLiveOnWebsite: true` in database
3. Open console (F12)
4. Run: `fetch('http://localhost:5000/api/visits/public/approved').then(r => r.json()).then(d => console.log(d))`
5. Check response

### Problem: "Error loading properties"

**Solution:**
1. Check if backend server is running
2. Check if API endpoint is accessible
3. Check CORS configuration in server.js
4. Check server logs for errors
5. Check network connection

### Problem: API returns empty array

**Solution:**
1. Check MongoDB has properties
2. Verify status is "approved"
3. Verify isLiveOnWebsite is true
4. Check if filter parameters are too strict
5. Try without filters: `GET /api/visits/public/approved`

### Problem: Fallback to localStorage, not API

**Solution:**
1. Check API endpoint exists
2. Check server is running on correct port (5000)
3. Check backend is accessible
4. Check for CORS errors in console
5. Verify endpoint returns valid JSON

---

## Success Indicators

✅ When working correctly, you'll see:

1. **Network Tab:**
   - GET request to `/api/visits/public/approved`
   - Status: 200
   - Response type: json

2. **Console:**
   - No errors
   - No CORS warnings
   - Properties count logged

3. **Page Display:**
   - Properties grid populated
   - Property count showing
   - Filters responsive

4. **Data Flow:**
   - API called on page load
   - API called when filter changes
   - Results update in real-time

---

## Next Steps After Testing

✅ If all tests pass:
1. Deploy to production
2. Monitor API performance
3. Add caching if needed
4. Set up analytics

❌ If tests fail:
1. Check error messages
2. Review logs
3. Verify database connection
4. Test endpoint directly with curl

---

**Ready to test? Start with Step 1 above!** 🚀
