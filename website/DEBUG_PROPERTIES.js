// ================================================================
// ROOMHY DEBUGGING SCRIPT - Initialize Sample Properties
// ================================================================
// 
// This script helps debug why properties don't show in ourproperty.html
// Run this in the browser console (F12 → Console tab)
//
// ================================================================

// Step 1: Check current localStorage data
console.log("=== STEP 1: Checking localStorage ===");
const currentData = JSON.parse(localStorage.getItem('roomhy_visits') || '[]');
console.log("Current properties in localStorage:", currentData);
console.log("Count:", currentData.length);

// Step 2: Show approved properties
const approvedProps = currentData.filter(p => p.status === 'approved');
console.log("\n=== STEP 2: Approved properties ===");
console.log("Count:", approvedProps.length);
console.log("Details:", approvedProps);

// Step 3: Show live properties (approved + isLiveOnWebsite)
const liveProps = currentData.filter(p => p.status === 'approved' && p.isLiveOnWebsite === true);
console.log("\n=== STEP 3: Live properties (should show on website) ===");
console.log("Count:", liveProps.length);
console.log("Details:", liveProps);

// Step 4: Create sample properties if none exist
console.log("\n=== STEP 4: Creating sample properties ===");

const sampleProperties = [
  {
    "_id": "prop-001",
    "status": "approved",
    "isLiveOnWebsite": true,
    "propertyInfo": {
      "name": "Modern PG in Vijay Nagar",
      "city": "Indore",
      "area": "Vijay Nagar",
      "gender": "co-ed",
      "propertyType": "pg"
    },
    "roomInfo": {
      "occupancy": "double"
    },
    "monthlyRent": 6500,
    "rent": 6500,
    "rating": 4.5,
    "reviewsCount": 12,
    "isVerified": true,
    "photos": [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1980&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop"
    ]
  },
  {
    "_id": "prop-002",
    "status": "approved",
    "isLiveOnWebsite": true,
    "propertyInfo": {
      "name": "Comfortable Hostel",
      "city": "Indore",
      "area": "Bhawarkua",
      "gender": "co-ed",
      "propertyType": "hostel"
    },
    "roomInfo": {
      "occupancy": "triple"
    },
    "monthlyRent": 4500,
    "rent": 4500,
    "rating": 4.2,
    "reviewsCount": 8,
    "isVerified": true,
    "photos": [
      "https://images.unsplash.com/photo-1494203484021-3c454daf695d?q=80&w=2070&auto=format&fit=crop"
    ]
  },
  {
    "_id": "prop-003",
    "status": "approved",
    "isLiveOnWebsite": true,
    "propertyInfo": {
      "name": "Girls PG with WiFi",
      "city": "Kota",
      "area": "Mahaveer Nagar",
      "gender": "girls",
      "propertyType": "pg"
    },
    "roomInfo": {
      "occupancy": "double"
    },
    "monthlyRent": 5500,
    "rent": 5500,
    "rating": 4.7,
    "reviewsCount": 15,
    "isVerified": true,
    "photos": [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop"
    ]
  },
  {
    "_id": "prop-004",
    "status": "approved",
    "isLiveOnWebsite": true,
    "propertyInfo": {
      "name": "Boys Hostel",
      "city": "Kota",
      "area": "CP Nagar",
      "gender": "boys",
      "propertyType": "hostel"
    },
    "roomInfo": {
      "occupancy": "multi"
    },
    "monthlyRent": 3800,
    "rent": 3800,
    "rating": 4.0,
    "reviewsCount": 20,
    "isVerified": true,
    "photos": [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1980&auto=format&fit=crop"
    ]
  },
  {
    "_id": "prop-005",
    "status": "approved",
    "isLiveOnWebsite": true,
    "propertyInfo": {
      "name": "Affordable Apartment",
      "city": "Sikar",
      "area": "Station Road",
      "gender": "co-ed",
      "propertyType": "apartment"
    },
    "roomInfo": {
      "occupancy": "single"
    },
    "monthlyRent": 8500,
    "rent": 8500,
    "rating": 4.3,
    "reviewsCount": 5,
    "isVerified": false,
    "photos": [
      "https://images.unsplash.com/photo-1494203484021-3c454daf695d?q=80&w=2070&auto=format&fit=crop"
    ]
  }
];

// Function to add properties (with or without overwriting)
function addSampleProperties(overwrite = false) {
  let allProperties = currentData;
  
  if (overwrite) {
    console.log("⚠️ OVERWRITING existing properties with sample data");
    allProperties = sampleProperties;
  } else {
    console.log("➕ ADDING sample properties to existing data");
    allProperties = [...currentData, ...sampleProperties];
  }
  
  localStorage.setItem('roomhy_visits', JSON.stringify(allProperties));
  console.log("✅ Sample properties added!");
  console.log("Total properties now:", allProperties.length);
  console.log("Updated data:", allProperties);
}

// Function to verify properties are correct
function verifyProperties() {
  const data = JSON.parse(localStorage.getItem('roomhy_visits') || '[]');
  console.log("\n=== VERIFICATION ===");
  console.log("Total properties:", data.length);
  
  const approved = data.filter(p => p.status === 'approved');
  console.log("Approved:", approved.length);
  
  const live = data.filter(p => p.status === 'approved' && p.isLiveOnWebsite === true);
  console.log("Live on website:", live.length);
  
  if (live.length === 0) {
    console.log("❌ NO LIVE PROPERTIES FOUND!");
    console.log("This is why nothing shows on ourproperty.html");
  } else {
    console.log("✅ Properties should show on ourproperty.html");
    console.log("Cities:", [...new Set(live.map(p => p.propertyInfo.city))]);
  }
}

// ================================================================
// HOW TO USE THIS SCRIPT
// ================================================================
// 
// 1. Open browser DevTools (F12)
// 2. Go to Console tab
// 3. Copy this entire script
// 4. Paste it in the console
// 5. Press Enter
// 
// Then run one of these commands:
//
// Option A: ADD sample properties to existing data
//   addSampleProperties(false);
//   location.reload(); // Refresh page to see properties
//
// Option B: REPLACE all properties with sample data
//   addSampleProperties(true);
//   location.reload(); // Refresh page to see properties
//
// Option C: VERIFY properties are set up correctly
//   verifyProperties();
//
// ================================================================

console.log("\n=== INSTRUCTIONS ===");
console.log("To fix the missing properties issue:");
console.log("1. Run: addSampleProperties(false);  // or true to overwrite");
console.log("2. Run: location.reload();");
console.log("3. Check ourproperty.html - properties should appear");
console.log("\nTo verify the fix:");
console.log("Run: verifyProperties();");
