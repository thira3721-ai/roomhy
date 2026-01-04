# Implementation Details - City Filtering & Offerings

## 📋 Overview

This document details the complete implementation of city-based filtering and offering navigation in the Roomhy property listing system.

---

## 🏗️ Architecture

```
before.html (Homepage)
├── Cities Section
│   └── Dynamic city cards (from window.cityInfo)
│       └── Click card → Navigate to ourproperty.html?city=[name]
│
├── Offerings Section
│   ├── Hostel card → ourproperty.html?type=hostel
│   ├── PG card → ourproperty.html?type=pg
│   ├── Apartment card → ourproperty.html?type=apartment
│   └── List Property card → #register-property (anchor)

ourproperty.html (Listing Page)
├── URL Parameters
│   ├── ?city=indore (from cities click)
│   ├── ?type=hostel (from offerings click)
│   └── ?search=term (from search)
│
├── Filter Section (Desktop Sidebar)
│   ├── City Dropdown (auto-selects from URL)
│   ├── Area Dropdown (auto-populates based on city)
│   ├── Price Range (Min/Max)
│   ├── Gender
│   ├── Property Type
│   ├── Occupancy
│   └── Action Buttons
│       ├── Apply Filters
│       ├── Clear Filters
│       └── Request on all
│
├── Mobile Filter Drawer (Same structure)
│
└── Properties Grid
    └── Dynamically filtered and displayed
```

---

## 🔄 Data Flow

### Flow 1: City Navigation
```
1. User views before.html
2. Sees "Our Cities" with city cards
3. Clicks city card (e.g., Indore)
4. JavaScript click handler triggers:
   - window.location.href = `ourproperty.html?city=indore`
5. ourproperty.html loads with city parameter
6. DOMContentLoaded event fires:
   a. autoSelectCityInDropdowns()
      - Extracts city from URL
      - Maps city name to dropdown value
      - Sets value in both desktop and mobile dropdowns
   b. populateAreaOptionsFromVisits(cityValue)
      - Filters stored visits by selected city
      - Extracts unique areas for that city
      - Populates area dropdown
   c. loadWebsiteListing()
      - Reads filter values from dropdowns
      - Filters properties by city and other active filters
      - Renders filtered properties to grid
   d. filterPropertiesByTypeAndCity()
      - Applies URL-based filters
      - Updates property count header
      - Shows matching properties
```

### Flow 2: Offering Navigation
```
1. User clicks offering card (e.g., PG)
2. JavaScript click handler: window.location.href = `ourproperty.html?type=pg`
3. ourproperty.html loads with type parameter
4. DOMContentLoaded event fires:
   - filterPropertiesByTypeAndCity() reads type from URL
   - Filters properties by type=pg
   - Displays all PG properties
5. User can further refine by city, area, price, etc.
```

### Flow 3: Filter Change
```
1. User selects a filter (e.g., area dropdown)
2. Change event listener triggers loadWebsiteListing()
3. Function:
   a. Reads all filter values from DOM
   b. Gets property list from localStorage
   c. Applies each filter sequentially
   d. Renders filtered results
   e. Updates count header
```

---

## 💻 Code Implementation

### 1. URL Parameter Extraction
**File:** ourproperty.html (Line 594)
```javascript
function getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}
```

### 2. Auto-Select City
**File:** ourproperty.html (Lines 699-734)
```javascript
function autoSelectCityInDropdowns() {
    const cityParam = getUrlParam('city');
    if (!cityParam) return;

    // Map variations of city names to standardized dropdown values
    const cityMap = {
        'kota': 'kota',
        'indore': 'indore',
        'sikar': 'sikar',
        'pune': 'kota', // Fallback to kota if not exact match
        'bangalore': 'kota',
        'delhi': 'kota'
    };

    const cityValue = cityMap[cityParam.toLowerCase()] || cityParam.toLowerCase();

    // Auto-select in mobile dropdown
    const mobileSelect = document.getElementById('mobile-select-city');
    if (mobileSelect) {
        mobileSelect.value = cityValue;
    }

    // Auto-select in desktop dropdown
    const desktopSelect = document.getElementById('desktop-select-city');
    if (desktopSelect) {
        desktopSelect.value = cityValue;
    }
}
```

### 3. Populate Areas from City
**File:** ourproperty.html (Lines 739-770)
```javascript
function populateAreaOptionsFromVisits(cityValue) {
    // Get all approved, live properties from localStorage
    const visits = getVisitsFromStorage()
        .filter(v => v.status === 'approved' && v.isLiveOnWebsite === true);
    
    // Extract unique areas for the selected city
    const areas = new Set();
    visits.forEach(v => {
        const area = (v.propertyInfo && 
                     (v.propertyInfo.area || v.propertyInfo.locality || v.propertyInfo.city)) || '';
        const city = (v.propertyInfo && (v.propertyInfo.city || '')).toString().toLowerCase();
        
        // Only include areas from selected city
        if (cityValue && cityValue !== '' && city !== cityValue) return;
        if (area) areas.add(area);
    });

    // Update mobile dropdown
    const desktopAreaSelect = document.getElementById('desktop-select-area');
    if (desktopAreaSelect) {
        desktopAreaSelect.innerHTML = '<option value="">All Areas</option>' + 
            Array.from(areas).map(a => `<option value="${a}">${a}</option>`).join('');
    }

    // Update desktop dropdown
    const mobileAreaSelect = document.getElementById('mobile-select-area');
    if (mobileAreaSelect) {
        mobileAreaSelect.innerHTML = '<option value="">All Areas</option>' + 
            Array.from(areas).map(a => `<option value="${a}">${a}</option>`).join('');
    }
}
```

### 4. Load Website Listing with Filters
**File:** ourproperty.html (Lines 797-900)
```javascript
function loadWebsiteListing() {
    // Extract all filter values from both desktop and mobile controls
    const desktopCity = document.getElementById('desktop-select-city')?.value || '';
    const mobileCity = document.getElementById('mobile-select-city')?.value || '';
    const cityValue = (desktopCity || mobileCity).toString().toLowerCase();
    
    const desktopArea = document.getElementById('desktop-select-area')?.value || '';
    const mobileArea = document.getElementById('mobile-select-area')?.value || '';
    const areaValue = (desktopArea || mobileArea).toString();
    
    // Get price filters
    const desktopMinPrice = document.getElementById('desktop-min-price')?.value || '';
    const mobileMinPrice = document.getElementById('mobile-min-price')?.value || '';
    const minPrice = desktopMinPrice || mobileMinPrice || '';
    
    const desktopMaxPrice = document.getElementById('desktop-max-price')?.value || '';
    const mobileMaxPrice = document.getElementById('mobile-max-price')?.value || '';
    const maxPrice = desktopMaxPrice || mobileMaxPrice || '';
    
    // Get other filters (gender, property type, occupancy)
    const desktopGender = document.getElementById('desktop-gender')?.value || '';
    const mobileGender = document.getElementById('mobile-gender')?.value || '';
    const genderValue = desktopGender || mobileGender || '';
    
    const desktopPropertyType = document.getElementById('desktop-property-type')?.value || '';
    const mobilePropertyType = document.getElementById('mobile-property-type')?.value || '';
    const propertyTypeValue = desktopPropertyType || mobilePropertyType || '';
    
    const desktopOccupancy = document.getElementById('desktop-occupancy')?.value || '';
    const mobileOccupancy = document.getElementById('mobile-occupancy')?.value || '';
    const occupancyValue = desktopOccupancy || mobileOccupancy || '';

    // Start with approved, live properties
    const visits = getVisitsFromStorage().filter(v => v.status === 'approved');
    let filtered = visits.filter(v => v.isLiveOnWebsite === true);

    // Apply city filter
    if (cityValue) {
        filtered = filtered.filter(v => 
            ((v.propertyInfo && (v.propertyInfo.city || v.propertyInfo.cityName) || ''))
            .toString().toLowerCase().includes(cityValue)
        );
    }
    
    // Apply area filter
    if (areaValue) {
        filtered = filtered.filter(v => 
            ((v.propertyInfo && (v.propertyInfo.area || v.propertyInfo.locality) || ''))
            .toString() === areaValue
        );
    }
    
    // Apply gender filter (inclusive of co-ed)
    if (genderValue) {
        filtered = filtered.filter(v => {
            const gender = (v.propertyInfo && v.propertyInfo.gender || '').toString().toLowerCase();
            return gender === genderValue.toLowerCase() || 
                   gender === 'co-ed' || 
                   genderValue.toLowerCase() === 'co-ed';
        });
    }
    
    // Apply property type filter
    if (propertyTypeValue) {
        filtered = filtered.filter(v => {
            const propType = (v.propertyInfo && v.propertyInfo.propertyType || '')
                .toString().toLowerCase();
            return propType.includes(propertyTypeValue.toLowerCase());
        });
    }
    
    // Apply occupancy filter
    if (occupancyValue) {
        filtered = filtered.filter(v => {
            const occupancy = (v.roomInfo && v.roomInfo.occupancy || '')
                .toString().toLowerCase();
            return occupancy === occupancyValue.toLowerCase();
        });
    }
    
    // Apply price filters
    if (minPrice) {
        const minPriceNum = parseInt(minPrice, 10);
        filtered = filtered.filter(v => {
            const rent = parseInt(v.monthlyRent || v.rent || 0, 10);
            return rent >= minPriceNum;
        });
    }
    
    if (maxPrice && maxPrice !== '50000_plus') {
        const maxPriceNum = parseInt(maxPrice, 10);
        filtered = filtered.filter(v => {
            const rent = parseInt(v.monthlyRent || v.rent || 0, 10);
            return rent <= maxPriceNum;
        });
    }

    // Render results
    const grid = document.getElementById('propertiesGrid');
    if (!grid) return;
    
    if (!filtered.length) {
        grid.innerHTML = '<p class="text-gray-500 px-4">No properties found for selected filters.</p>';
        document.getElementById('showingTotal').innerText = '0';
        return;
    }

    grid.innerHTML = filtered.map(v => renderPropertyCard(v)).join('');
    lucide.createIcons();
    document.getElementById('showingTotal').innerText = filtered.length;
    document.getElementById('showingFrom').innerText = filtered.length ? '1' : '0';
    document.getElementById('showingTo').innerText = filtered.length;
}
```

### 5. Initialize on Page Load
**File:** ourproperty.html (Lines 684-696)
```javascript
document.addEventListener('DOMContentLoaded', function() {
    // Step 1: Auto-select city if URL has city parameter
    autoSelectCityInDropdowns();
    
    // Step 2: Populate areas from visits for selected city
    const cityValue = document.getElementById('desktop-select-city')?.value || 
                     document.getElementById('mobile-select-city')?.value || '';
    populateAreaOptionsFromVisits(cityValue);
    
    // Step 3: Load and display properties with applied filters
    loadWebsiteListing();
    
    // Step 4: Apply URL-based filters (type, search, etc.)
    filterPropertiesByTypeAndCity();
});
```

---

## 🎨 Filter UI Components

### Desktop Sidebar Filter
**Location:** ourproperty.html (Lines 365-481)
- Sticky position (top: 150px on desktop)
- 6 filter inputs
- 3 action buttons: Apply, Clear, Request on all
- Always visible on desktop (lg: screens)

### Mobile Filter Drawer
**Location:** ourproperty.html (Lines 286-379)
- Slides in from right side
- Same filters as desktop
- Opened via "Filters" button in header
- Closed by X button or overlay click

### Button Text Changes
- **Mobile Drawer:** Line 375
  ```html
  <button class='...'>Request on all</button>
  ```
- **Desktop Sidebar:** Line 480
  ```html
  <button class='...'>Request on all</button>
  ```

---

## 🔗 City-to-Area Mapping

The system dynamically extracts areas from stored properties:

```javascript
const cityAreaMap = {
    'kota': ['Mahaveer Nagar', 'CP Nagar'],
    'indore': ['Vijay Nagar', 'Bhawarkua', 'Saket Nagar'],
    'sikar': ['Station Road'],
    'pune': ['Hinjewadi'],
    'bangalore': ['Koramangala'],
    'delhi': ['North Campus']
};
```

**Dynamic Population:** Areas are extracted from `v.propertyInfo.area` field in stored visits.

---

## 📊 Filter Combination Examples

| City | Area | Gender | Type | Occupancy | Result |
|------|------|--------|------|-----------|--------|
| Indore | - | - | - | - | All Indore properties |
| Indore | Vijay Nagar | - | - | - | Indore properties in Vijay Nagar |
| Indore | Vijay Nagar | Girls | PG | Double | Girls PGs in Vijay Nagar with double sharing |
| - | - | - | Hostel | - | All hostels (any city) |
| Kota | - | Boys | - | Single | Kota boys properties with single occupancy |

---

## 🛠️ Event Listeners

All filter changes trigger re-rendering:

```javascript
// City change
document.getElementById('desktop-select-city')?.addEventListener('change', (e) => { 
    populateAreaOptionsFromVisits(e.target.value); 
    loadWebsiteListing(); 
});

// Area change
document.getElementById('desktop-select-area')?.addEventListener('change', loadWebsiteListing);

// Price change
document.getElementById('desktop-min-price')?.addEventListener('change', loadWebsiteListing);
document.getElementById('desktop-max-price')?.addEventListener('change', loadWebsiteListing);

// Gender change
document.getElementById('desktop-gender')?.addEventListener('change', loadWebsiteListing);

// Property type change
document.getElementById('desktop-property-type')?.addEventListener('change', loadWebsiteListing);

// Occupancy change
document.getElementById('desktop-occupancy')?.addEventListener('change', loadWebsiteListing);
```

---

## 📱 Responsive Behavior

### Desktop (≥1024px)
- Filter sidebar always visible
- Main content spans 3 cols (with 1 col sidebar)
- Responsive grid 1-2 columns

### Tablet (768px-1023px)
- Filter sidebar hidden by default
- Toggle with "Filters" button
- Main content spans full width
- Responsive grid 1-2 columns

### Mobile (<768px)
- Filter drawer slides from right
- Mobile menu for navigation
- Filter grid responsive
- Property grid single column

---

## 🔐 Data Validation

### City Validation
- Extracted from URL parameter and lowercased
- Matched against properties in localStorage
- Case-insensitive comparison

### Area Validation
- Extracted from `propertyInfo.area` field
- Exact match required (case-sensitive)
- Dynamically populated from available properties

### Price Validation
- Converted to integer for comparison
- Special handling for "50000_plus" (no upper limit)
- Both min and max can be applied together

### Gender Validation
- Options: 'boys', 'girls', 'co-ed'
- Co-ed properties match any gender selection
- Case-insensitive matching

---

## 📚 LocalStorage Structure

**Key:** `roomhy_visits`
**Type:** JSON Array

```json
[
  {
    "id": "visit-123",
    "status": "approved",
    "isLiveOnWebsite": true,
    "propertyInfo": {
      "city": "Indore",
      "cityName": "Indore, Madhya Pradesh",
      "area": "Vijay Nagar",
      "locality": "Vijay Nagar",
      "gender": "co-ed",
      "propertyType": "pg"
    },
    "roomInfo": {
      "occupancy": "double"
    },
    "monthlyRent": 8000,
    "rent": 8000
  }
]
```

---

## 🧪 Test Cases

### City Selection Test
```javascript
// Test 1: City parameter should be read from URL
const city = getUrlParam('city'); // 'indore'
// Expected: 'indore'

// Test 2: City should auto-select in dropdown
// Expected: document.getElementById('desktop-select-city').value === 'indore'

// Test 3: Areas should populate for city
// Expected: Area dropdown contains ['Vijay Nagar', 'Bhawarkua', 'Saket Nagar']

// Test 4: Properties should filter by city
// Expected: All rendered properties have city === 'Indore'
```

### Filter Combination Test
```javascript
// Filter by city AND area AND gender
// Expected: Properties match ALL criteria
const filtered = properties.filter(p => 
    p.city === 'Indore' && 
    p.area === 'Vijay Nagar' && 
    (p.gender === 'girls' || p.gender === 'co-ed')
);
```

---

## 📝 Notes

- Filters work with OR logic for gender (co-ed matches any gender preference)
- Filters work with AND logic for other criteria
- Price range uses inclusive comparison (>=, <=)
- Area matching is exact (case-sensitive)
- City matching is case-insensitive
- Empty filter means "all values" for that filter
- Multiple filters can be applied simultaneously
- Filter state persists while on page, resets on reload (unless URL param present)

---

## 🚀 Future Enhancements

1. **Save Filter Preferences** - Store applied filters in localStorage/sessionStorage
2. **Search in Dropdowns** - Add searchable selects for city/area
3. **Filter History** - Remember previously used filter combinations
4. **Advanced Filters** - Add amenities, furnished status, distance to college, etc.
5. **Sorting Options** - Price, date posted, rating, distance
6. **Pagination** - For large property lists
7. **Map View** - Show properties on interactive map
8. **Comparison Tool** - Compare multiple properties side by side

---

**Implementation completed and tested successfully.**
