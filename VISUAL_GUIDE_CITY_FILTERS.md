# Visual Guide - City Filtering & Offerings System

## 🗺️ User Interface Overview

### before.html (Homepage)

```
┌─────────────────────────────────────────────────────────────┐
│                        NAVBAR                               │
│  Logo  |  About  |  Contact  |  [Post Property Button]      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      HERO SECTION                           │
│        "Find your perfect stay"                             │
│        [Search Input Box] [Search Button]                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│          OUR OFFERINGS (Sliding Cards)                      │
│  [‹] [Hostel][  PG  ][Apartment][List Property] [›]        │
│      ↓ Click → ourproperty.html?type=hostel               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│          OUR CITIES (Dynamic City Cards)                    │
│  [Indore] [Kota] [Sikar] [Pune] [Bangalore] [Delhi]        │
│     ↓ Click → ourproperty.html?city=indore                │
│                                                              │
│  When clicked:                                              │
│  • Navigate to ourproperty.html?city=[city-name]           │
│  • City auto-selects in dropdown                           │
│  • Areas populate for that city                            │
│  • Properties display for that city                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    TESTIMONIALS                             │
│                  (reviews, ratings)                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    CONTACT SECTION                          │
│                   [Contact Form]                            │
└─────────────────────────────────────────────────────────────┘
```

---

### ourproperty.html (Listing Page) - Desktop View

```
┌─────────────────────────────────────────────────────────────┐
│                        NAVBAR                               │
│  Logo  |  About  |  Contact  |  [Post Property Button]      │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────┬──────────────────────────────────┐
│                          │                                  │
│   FILTER SIDEBAR         │   MAIN CONTENT AREA              │
│   ┌──────────────────┐   │   ┌──────────────────────────┐   │
│   │ 🔽 FILTERS      │   │   │ 4 Properties Found       │   │
│   └──────────────────┘   │   │ [Page 1 of 1]            │   │
│                          │   │ [Filters] [Bid] [Sort v] │   │
│   City: [Indore▼]       │   └──────────────────────────┘   │
│   Area: [Vijay Nagar▼]  │                                  │
│   Price: [₹ - ₹▼]       │   ┌──────────┬──────────────┐   │
│   Gender: [Boys▼]       │   │Property 1│  Property 2  │   │
│   Type: [PG▼]           │   │          │              │   │
│   Occupancy: [Double▼]  │   └──────────┴──────────────┘   │
│                          │   ┌──────────┬──────────────┐   │
│   [Apply Filters]        │   │Property 3│  Property 4  │   │
│   [Clear Filters]        │   │          │              │   │
│   [Request on all]       │   └──────────┴──────────────┘   │
│                          │   [Pagination Controls]         │
│ (Sticky at top:150px)    │                                  │
│ (Width: 288px)           │                                  │
│                          │   (Spans remaining width)        │
└──────────────────────────┴──────────────────────────────────┘
```

---

### ourproperty.html (Listing Page) - Mobile View

```
┌─────────────────────────────────────────────────────────────┐
│ [☰]  [Logo]              [🔍] [+Post Property]              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│             HERO SECTION (Smaller)                          │
│  "Find your perfect stay"                                   │
│  [Search Input]                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 4 Properties Found  [Page 1 of 1]                           │
│ [🔽 Filters] [Bid] [Sort by▼]                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                                                              │
│              PROPERTY 1 (Full Width)                        │
│              [Image with overlay]                           │
│              Title, Price, Location                         │
│                                                              │
│              PROPERTY 2 (Full Width)                        │
│              [Image with overlay]                           │
│              Title, Price, Location                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  When [Filters] button clicked:                             │
│                                                              │
│  ╔═════════════════════════════════════════╗               │
│  ║ FILTER DRAWER (Slides from right)       ║ [X Close]     │
│  ║                                          ║               │
│  ║ City: [Indore▼]                         ║               │
│  ║ Area: [Vijay Nagar▼]                    ║               │
│  ║ Price: [₹ - ₹▼]                         ║               │
│  ║ Gender: [Boys▼]                         ║               │
│  ║ Type: [PG▼]                             ║               │
│  ║ Occupancy: [Double▼]                    ║               │
│  ║                                          ║               │
│  ║ [Apply Filters]                         ║               │
│  ║ [Clear Filters]                         ║               │
│  ║ [Request on all]                        ║               │
│  ║                                          ║               │
│  ╚═════════════════════════════════════════╝               │
│  (Overlay fades rest of page)                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flow Diagrams

### City Click Flow

```
                    before.html
                         │
                         │ User scrolls to
                         │ "Our Cities" section
                         ▼
                   ┌─────────────┐
                   │ [Indore]    │ City Cards
                   │ [Kota]      │ (from cityInfo)
                   │ [Sikar]     │
                   └─────────────┘
                         │
                         │ User clicks
                         │ "Indore" card
                         ▼
        rebuildCityList() function
        JavaScript click handler
        window.location.href = 
        "ourproperty.html?city=indore"
                         │
                         ▼
                  ourproperty.html
                  Page loads with
                  city parameter
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                 ▼
    autoSelectCity  populateAreas    loadWebsiteListing
    InDropdowns()   FromVisits()      ()
        │                │                │
        │                │                │
    Reads URL        Gets areas       Reads filters
    Selects city     for city         Gets properties
    in dropdown      Populates        Applies filters
                     dropdown         Renders grid
                         │                │
                         └────────┬───────┘
                                  ▼
                           Properties display
                           for Indore with
                           areas pre-loaded
```

### Offering Click Flow

```
                    before.html
                         │
                         │ User scrolls to
                         │ "Our Offerings"
                         ▼
                   ┌─────────────┐
                   │ [Hostel]    │ Offering Cards
                   │ [PG]        │ (Static HTML)
                   │ [Apartment] │
                   │ [List Prop] │
                   └─────────────┘
                         │
                         │ User clicks
                         │ "PG" card
                         ▼
              Offering card link
              <a href="ourproperty.html?type=pg">
              window.location.href triggers
                         │
                         ▼
                  ourproperty.html
                  Page loads with
                  type parameter
                         │
        ┌────────────────┼─────────────┐
        │                │             │
        ▼                ▼             ▼
    autoSelectCity  loadWebsiteListing filterProperties
    InDropdowns()   ()              ByTypeAndCity()
    (no city param) │               (reads type
        │           │               from URL)
    Returns        Reads filters     │
    (does nothing) Gets properties   │
                   (unfiltered)      │
                         │           │
                         └─────┬─────┘
                               ▼
                        Properties display
                        filtered by type=pg
                        (hostel properties hidden)
```

### Filter Change Flow

```
User changes filter (e.g., selects area)
                │
                ▼
    addEventListener('change', 
    loadWebsiteListing)
                │
                ▼
        loadWebsiteListing()
        │
        ├─ Get city from dropdown
        ├─ Get area from dropdown
        ├─ Get price filters
        ├─ Get gender filter
        ├─ Get property type
        ├─ Get occupancy
        │
        ├─ Get properties from localStorage
        │
        ├─ Apply city filter
        ├─ Apply area filter
        ├─ Apply price filter
        ├─ Apply gender filter
        ├─ Apply property type filter
        ├─ Apply occupancy filter
        │
        ├─ Render filtered results
        └─ Update property count
                │
                ▼
        Properties grid updates
        Count header updates
        User sees results instantly
```

---

## 🧩 Component Architecture

```
ourproperty.html
│
├── HEADER
│   └── Navigation, Logo, Post Property Button
│
├── HERO SECTION
│   └── Search input
│
├── FILTER SIDEBAR (Desktop) / FILTER DRAWER (Mobile)
│   ├── City Dropdown
│   │   └── ID: desktop-select-city / mobile-select-city
│   ├── Area Dropdown
│   │   └── ID: desktop-select-area / mobile-select-area
│   ├── Price Range
│   │   ├── Min: desktop-min-price / mobile-min-price
│   │   └── Max: desktop-max-price / mobile-max-price
│   ├── Gender
│   │   └── ID: desktop-gender / mobile-gender
│   ├── Property Type
│   │   └── ID: desktop-property-type / mobile-property-type
│   ├── Occupancy
│   │   └── ID: desktop-occupancy / mobile-occupancy
│   └── Action Buttons
│       ├── Apply Filters
│       ├── Clear Filters
│       └── Request on all
│
├── MAIN CONTENT AREA
│   ├── Header: "X Properties Found"
│   ├── Toolbar: [Filters] [Bid] [Sort]
│   ├── Properties Grid
│   │   └── ID: propertiesGrid
│   │   └── Dynamically rendered property cards
│   └── Pagination
│
├── FOOTER
│   └── Links, Contact, About
│
└── MOBILE MENU
    └── Navigation links
```

---

## 📊 Data Structure

### URL Parameters

```
ourproperty.html?city=indore
             ?type=hostel
             ?search=kolhapur
             ?city=indore&type=pg
```

### localStorage Structure

```
Key: roomhy_visits
Value: [
  {
    id: "visit-123",
    status: "approved",
    isLiveOnWebsite: true,
    propertyInfo: {
      city: "Indore",
      area: "Vijay Nagar",
      gender: "co-ed",
      propertyType: "pg"
    },
    roomInfo: {
      occupancy: "double"
    },
    monthlyRent: 8000
  },
  { ... more properties ... }
]
```

### Filter State

```
{
  city: "indore",
  area: "Vijay Nagar",
  minPrice: "4000",
  maxPrice: "15000",
  gender: "girls",
  propertyType: "pg",
  occupancy: "double"
}
```

---

## 🎯 Interaction Patterns

### Pattern 1: Auto-Selection (City from URL)

```
User arrives at ourproperty.html?city=indore
                    ↓
        City parameter extracted from URL
                    ↓
        Dropdown receives value "indore"
                    ↓
        dropdown.value = "indore"
                    ↓
        Visible: Dropdown shows "Indore" selected
```

### Pattern 2: Dependent Dropdown (Area based on City)

```
User selects city dropdown → triggers change event
                    ↓
        populateAreaOptionsFromVisits(cityValue) called
                    ↓
        Filter properties by selected city
                    ↓
        Extract unique area values
                    ↓
        Regenerate area dropdown options
                    ↓
        Visible: Area dropdown shows city-specific areas
```

### Pattern 3: Multi-Filter (All filters work together)

```
City = "Indore"
Area = "Vijay Nagar"
Price = ₹4000-₹8000
Gender = "Girls"
Type = "PG"
Occupancy = "Double"
            ↓
    Properties match ALL criteria (AND logic)
            ↓
    Result: Girls PG in Vijay Nagar
            Indore, Double sharing
            Price ₹4000-₹8000
```

---

## 🎨 Visual States

### City Dropdown States

```
DEFAULT:        [Select a city ▼]
SELECTED:       [Indore ▼]
FOCUSED:        [Indore ▼] (blue border, glow)
POPULATED:      [Indore ▼] (value set by code)
```

### Area Dropdown States

```
NO CITY:        [First select a city ▼]
NO RESULTS:     [All Areas ▼] (empty list)
WITH RESULTS:   [Vijay Nagar ▼]
POPULATED:      [Bhawarkua ▼] (auto-populated)
```

### Property Grid States

```
LOADING:        "Finding properties..." (or nothing, it's fast)
EMPTY:          "No properties found for selected filters."
RESULTS:        [Card1] [Card2]
                [Card3] [Card4]
PAGINATION:     Previous | 1 | 2 | 3 | ... | 8 | Next
```

### Button States

```
REQUEST ON ALL
├─ Default:   [Request on all] (clickable)
├─ Hover:     [Request on all] (darker background)
├─ Active:    [Request on all] (pressed effect)
└─ Disabled:  [Request on all] (grayed out if no results)

APPLY FILTERS
├─ Default:   [Apply Filters] (blue background)
├─ Hover:     [Apply Filters] (darker blue)
└─ Mobile:    Closes drawer after clicking

CLEAR FILTERS
├─ Default:   [Clear Filters] (outline style)
├─ Hover:     [Clear Filters] (light background)
└─ Click:     Resets all to defaults
```

---

## 📱 Responsive Breakpoints

```
Mobile:     0px - 767px
├─ Single column layout
├─ Filter drawer (full height slide)
└─ Touch-optimized buttons

Tablet:    768px - 1023px
├─ Two column grid
├─ Filter toggle button
└─ Responsive padding

Desktop:   1024px+
├─ Sidebar layout
├─ Always visible filters
├─ Two column property grid
└─ Optimal spacing
```

---

## ✨ Key Interaction Points

1. **City Card Click** → URL parameter set → Page loads → Auto-select → Properties render
2. **Offering Card Click** → URL parameter set → Properties filter by type
3. **Filter Change** → Event listener triggers → Properties re-render → Count updates
4. **Clear Filters** → All inputs reset → Properties show unfiltered list
5. **Request on All** → Bulk action on displayed properties

---

**Visual Guide Complete! The system is intuitive, responsive, and user-friendly.**
