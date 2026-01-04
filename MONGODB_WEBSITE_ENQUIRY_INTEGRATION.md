# MongoDB Atlas Integration for Website Enquiries

## ✅ What's Been Done

Your website enquiry system is now fully integrated with **MongoDB Atlas**. Here's what was implemented:

### 1. **Backend API Created**
- **Model**: `roomhy-backend/models/WebsiteEnquiry.js`
  - Stores all property enquiry data in MongoDB
  - Tracks status, assignments, notes, and timestamps
  - Indexed by: `enquiry_id`, `city`, `status`, `created_at`

- **Routes**: `roomhy-backend/routes/websiteEnquiryRoutes.js`
  - `POST /api/website-enquiry/submit` - Submit new enquiry
  - `GET /api/website-enquiry/all` - Fetch all enquiries
  - `GET /api/website-enquiry/city/:city` - Fetch by city
  - `GET /api/website-enquiry/status/:status` - Fetch by status
  - `PUT /api/website-enquiry/:enquiry_id` - Update/assign enquiry
  - `DELETE /api/website-enquiry/:enquiry_id` - Delete enquiry

### 2. **Frontend Updates**
- **list.html** (website form)
  - Form submission now POSTs to MongoDB API
  - No redirect - stays on page with success message
  - Shows success/error feedback to user

- **websiteenq.html** (superadmin dashboard)
  - Now fetches all enquiries from MongoDB API
  - Assignment saves to MongoDB
  - Real-time statistics from database
  - Search and filters work with MongoDB data

### 3. **Database Connection**
- MongoDB Atlas is connected via `.env`
- Connection string: `mongodb+srv://roomhydb:roomhydbkota41@cluster0.cj1yqn9.mongodb.net/`
- All data stored securely in cloud

## 🚀 How to Use

### Start the Backend Server
```bash
npm start
```
or for development with auto-reload:
```bash
npm run dev
```

The server runs on `http://localhost:5000`

### Submit Property Enquiry
1. Go to `website/list.html`
2. Fill the property form
3. Click Submit
4. Form data is saved to MongoDB automatically
5. Success message displays on page (no redirect)

### View & Assign Enquiries
1. Go to Superadmin > Web Enquiry (sidebar)
2. View all enquiries fetched from MongoDB
3. Click "View Details" to see full property info
4. Click "Assign" to assign to area manager
5. Select manager and confirm
6. Assignment is saved to MongoDB

## 📊 Data Flow
```
website/list.html (Form)
        ↓
POST /api/website-enquiry/submit
        ↓
MongoDB (WebsiteEnquiry collection)
        ↓
GET /api/website-enquiry/all
        ↓
superadmin/websiteenq.html (Dashboard)
        ↓
PUT /api/website-enquiry/:id (Assignment)
        ↓
MongoDB (Update status & assignment)
```

## 🔧 API Endpoints

### Submit Enquiry (POST)
```
POST http://localhost:5000/api/website-enquiry/submit

Body:
{
  "property_type": "1BHK",
  "property_name": "Luxury Apartment",
  "city": "Indore",
  "locality": "South Indore",
  "address": "123 Main St",
  "pincode": "452001",
  "description": "Beautiful apartment...",
  "amenities": ["WiFi", "Parking", "Gym"],
  "gender_suitability": "Any",
  "rent": 15000,
  "deposit": "3 months",
  "owner_name": "John Doe",
  "owner_email": "john@example.com",
  "owner_phone": "9999999999"
}

Response:
{
  "success": true,
  "message": "Enquiry submitted successfully",
  "enquiry_id": "1704xxxx_abc123"
}
```

### Get All Enquiries (GET)
```
GET http://localhost:5000/api/website-enquiry/all

Response:
{
  "success": true,
  "count": 5,
  "enquiries": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k",
      "enquiry_id": "1704xxxx_abc123",
      "property_name": "Luxury Apartment",
      "city": "Indore",
      "status": "pending",
      "owner_name": "John Doe",
      "created_at": "2024-01-04T10:30:00Z",
      ...
    }
  ]
}
```

### Assign Enquiry (PUT)
```
PUT http://localhost:5000/api/website-enquiry/1704xxxx_abc123

Body:
{
  "status": "assigned",
  "assigned_to": "Rajesh Kumar",
  "assigned_area": "Indore"
}

Response:
{
  "success": true,
  "message": "Enquiry updated successfully",
  "enquiry": {...}
}
```

## 📝 Important Notes

1. **Backend must be running** - Start with `npm start` or `npm run dev`
2. **MongoDB Atlas** - Cloud database is already connected, no setup needed
3. **No localStorage dependency** - All data is in MongoDB now
4. **Real-time updates** - Refresh page to see latest data from database
5. **Port 5000** - Backend runs on localhost:5000 (configured in `.env`)

## 🔍 Verify Installation

Test the API endpoints manually:

```javascript
// Test submit
fetch('http://localhost:5000/api/website-enquiry/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    property_name: 'Test Property',
    city: 'Indore',
    owner_name: 'Test Owner',
    owner_phone: '9999999999'
  })
}).then(r => r.json()).then(d => console.log(d));

// Test fetch all
fetch('http://localhost:5000/api/website-enquiry/all')
  .then(r => r.json())
  .then(d => console.log(d));
```

## 📦 Next Steps

- ✅ Form submission → MongoDB
- ✅ Dashboard fetches from MongoDB
- ✅ Assignment saves to MongoDB
- Coming soon: Area manager integration with same MongoDB data
- Coming soon: Email notifications on assignment

All done! Your website enquiry system is now fully integrated with MongoDB Atlas. 🎉
