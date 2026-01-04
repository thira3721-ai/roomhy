# BOOKING REQUEST API - TESTING GUIDE

## Quick Start Testing

### Base URL
```
Local: http://localhost:5000/api/booking
Live: https://roomhy.com/api/booking
```

---

## 1. Create Booking Request

### Endpoint
```
POST /api/booking/requests
```

### Request Body
```json
{
    "propertyId": "1",
    "propertyName": "Athena House",
    "area": "Indore",
    "name": "Raj Kumar",
    "email": "raj@example.com",
    "phone": "9876543210"
}
```

### Using CURL
```bash
curl -X POST http://localhost:5000/api/booking/requests \
  -H "Content-Type: application/json" \
  -d '{
    "propertyId": "1",
    "propertyName": "Athena House",
    "area": "Indore",
    "name": "Raj Kumar",
    "email": "raj@example.com",
    "phone": "9876543210"
  }'
```

### Expected Response
```json
{
    "success": true,
    "data": {
        "_id": "507f1f77bcf86cd799439011",
        "propertyId": "1",
        "propertyName": "Athena House",
        "area": "Indore",
        "name": "Raj Kumar",
        "email": "raj@example.com",
        "phone": "9876543210",
        "status": "pending",
        "createdAt": "2026-01-03T10:30:00Z",
        "updatedAt": "2026-01-03T10:30:00Z"
    }
}
```

---

## 2. Get All Booking Requests

### Endpoint
```
GET /api/booking/requests
```

### Query Parameters
```
area=Indore  (optional - filters by area)
```

### Using CURL
```bash
# Get all requests
curl http://localhost:5000/api/booking/requests

# Get requests for specific area
curl http://localhost:5000/api/booking/requests?area=Indore
```

### Expected Response
```json
[
    {
        "_id": "507f1f77bcf86cd799439011",
        "propertyId": "1",
        "propertyName": "Athena House",
        "area": "Indore",
        "name": "Raj Kumar",
        "email": "raj@example.com",
        "phone": "9876543210",
        "status": "pending",
        "createdAt": "2026-01-03T10:30:00Z",
        "updatedAt": "2026-01-03T10:30:00Z"
    },
    ...
]
```

---

## 3. Create Booking Bid (₹500)

### Endpoint
```
POST /api/booking/bids
```

### Request Body
```json
{
    "propertyId": "1",
    "propertyName": "Athena House",
    "area": "Indore",
    "name": "Priya Singh",
    "email": "priya@example.com",
    "phone": "8765432109",
    "bidAmount": 500
}
```

### Using CURL
```bash
curl -X POST http://localhost:5000/api/booking/bids \
  -H "Content-Type: application/json" \
  -d '{
    "propertyId": "1",
    "propertyName": "Athena House",
    "area": "Indore",
    "name": "Priya Singh",
    "email": "priya@example.com",
    "phone": "8765432109",
    "bidAmount": 500
  }'
```

### Expected Response
```json
{
    "success": true,
    "data": {
        "_id": "507f1f77bcf86cd799439012",
        "propertyId": "1",
        "propertyName": "Athena House",
        "area": "Indore",
        "name": "Priya Singh",
        "email": "priya@example.com",
        "phone": "8765432109",
        "bidAmount": 500,
        "paymentStatus": "paid",
        "status": "pending",
        "createdAt": "2026-01-03T10:35:00Z",
        "updatedAt": "2026-01-03T10:35:00Z"
    }
}
```

### Check Property Hold Created
```bash
# Query MongoDB directly or check PropertyHold collection
# Document should have:
# {
#     "propertyId": "1",
#     "bidId": "507f1f77bcf86cd799439012",
#     "heldBy": "Priya Singh",
#     "status": "active"
# }
```

---

## 4. Get All Booking Bids

### Endpoint
```
GET /api/booking/bids
```

### Query Parameters
```
area=Indore  (optional - filters by area)
```

### Using CURL
```bash
# Get all bids
curl http://localhost:5000/api/booking/bids

# Get bids for specific area
curl http://localhost:5000/api/booking/bids?area=Indore
```

### Expected Response
```json
[
    {
        "_id": "507f1f77bcf86cd799439012",
        "propertyId": "1",
        "propertyName": "Athena House",
        "area": "Indore",
        "name": "Priya Singh",
        "email": "priya@example.com",
        "phone": "8765432109",
        "bidAmount": 500,
        "paymentStatus": "paid",
        "status": "pending",
        "createdAt": "2026-01-03T10:35:00Z"
    },
    ...
]
```

---

## 5. Schedule Visit

### Endpoint
```
POST /api/booking/visits
```

### Request Body
```json
{
    "bookingId": "507f1f77bcf86cd799439011",
    "visitType": "physical",
    "visitDate": "2026-01-10",
    "visitSlot": "09:00-10:00",
    "areaManager": "Indore"
}
```

### Using CURL
```bash
curl -X POST http://localhost:5000/api/booking/visits \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "507f1f77bcf86cd799439011",
    "visitType": "physical",
    "visitDate": "2026-01-10",
    "visitSlot": "09:00-10:00",
    "areaManager": "Indore"
  }'
```

### Expected Response
```json
{
    "success": true,
    "data": {
        "_id": "507f1f77bcf86cd799439013",
        "bookingRequestId": "507f1f77bcf86cd799439011",
        "bookingBidId": null,
        "propertyId": "1",
        "propertyName": "Athena House",
        "visitorName": "Raj Kumar",
        "visitorPhone": "9876543210",
        "visitType": "physical",
        "visitDate": "2026-01-10T00:00:00Z",
        "visitSlot": "09:00-10:00",
        "areaManager": "Indore",
        "status": "scheduled",
        "createdAt": "2026-01-03T10:40:00Z"
    }
}
```

---

## 6. Confirm Request

### Endpoint
```
PUT /api/booking/requests/:id/confirm
```

### Using CURL
```bash
curl -X PUT http://localhost:5000/api/booking/requests/507f1f77bcf86cd799439011/confirm \
  -H "Content-Type: application/json"
```

### Expected Response
```json
{
    "success": true,
    "data": {
        "_id": "507f1f77bcf86cd799439011",
        "propertyId": "1",
        "propertyName": "Athena House",
        "area": "Indore",
        "name": "Raj Kumar",
        "email": "raj@example.com",
        "phone": "9876543210",
        "status": "confirmed",
        "createdAt": "2026-01-03T10:30:00Z",
        "updatedAt": "2026-01-03T10:45:00Z"
    }
}
```

---

## 7. Confirm Bid

### Endpoint
```
PUT /api/booking/bids/:id/confirm
```

### Using CURL
```bash
curl -X PUT http://localhost:5000/api/booking/bids/507f1f77bcf86cd799439012/confirm \
  -H "Content-Type: application/json"
```

### Expected Response
```json
{
    "success": true,
    "data": {
        "_id": "507f1f77bcf86cd799439012",
        "propertyId": "1",
        "propertyName": "Athena House",
        "area": "Indore",
        "name": "Priya Singh",
        "email": "priya@example.com",
        "phone": "8765432109",
        "bidAmount": 500,
        "paymentStatus": "paid",
        "status": "confirmed",
        "createdAt": "2026-01-03T10:35:00Z",
        "updatedAt": "2026-01-03T10:48:00Z"
    }
}
```

---

## 8. Hold Property

### Endpoint
```
PUT /api/booking/property-hold/:propertyId
```

### Request Body
```json
{
    "bidId": "507f1f77bcf86cd799439012",
    "heldBy": "Priya Singh"
}
```

### Using CURL
```bash
curl -X PUT http://localhost:5000/api/booking/property-hold/1 \
  -H "Content-Type: application/json" \
  -d '{
    "bidId": "507f1f77bcf86cd799439012",
    "heldBy": "Priya Singh"
  }'
```

### Expected Response
```json
{
    "success": true,
    "data": {
        "_id": "507f1f77bcf86cd799439014",
        "propertyId": "1",
        "bidId": "507f1f77bcf86cd799439012",
        "heldBy": "Priya Singh",
        "holdStartDate": "2026-01-03T10:50:00Z",
        "holdExpiryDate": "2026-01-10T10:50:00Z",
        "status": "active",
        "createdAt": "2026-01-03T10:50:00Z"
    }
}
```

---

## 9. Release Property Hold

### Endpoint
```
PUT /api/booking/property-release/:propertyId
```

### Using CURL
```bash
curl -X PUT http://localhost:5000/api/booking/property-release/1 \
  -H "Content-Type: application/json"
```

### Expected Response
```json
{
    "success": true,
    "data": {
        "_id": "507f1f77bcf86cd799439014",
        "propertyId": "1",
        "bidId": "507f1f77bcf86cd799439012",
        "heldBy": "Priya Singh",
        "status": "released",
        "holdExpiryDate": "2026-01-10T10:50:00Z",
        "createdAt": "2026-01-03T10:50:00Z",
        "updatedAt": "2026-01-03T10:55:00Z"
    }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
    "success": false,
    "message": "Missing required fields"
}
```

### 404 Not Found
```json
{
    "success": false,
    "message": "Request not found"
}
```

### 500 Server Error
```json
{
    "success": false,
    "message": "Error message details"
}
```

---

## Testing Sequence

### 1. Create Request
```bash
POST /api/booking/requests
→ Note down the returned _id
```

### 2. Verify Request Created
```bash
GET /api/booking/requests?area=Indore
→ Should see the new request
```

### 3. Create Bid
```bash
POST /api/booking/bids
→ Note down the returned _id
```

### 4. Check Property Hold
```bash
GET /api/booking/property-hold
→ Should show property is on hold
```

### 5. Schedule Visit
```bash
POST /api/booking/visits
→ Reference the request/bid ID
```

### 6. Confirm Request/Bid
```bash
PUT /api/booking/requests/:id/confirm
PUT /api/booking/bids/:id/confirm
```

### 7. Release Hold (Optional)
```bash
PUT /api/booking/property-release/:propertyId
```

---

## Browser Testing

### In Console (F12)
```javascript
// Test creating a request
fetch('http://localhost:5000/api/booking/requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        propertyId: "1",
        propertyName: "Athena House",
        area: "Indore",
        name: "Test User",
        email: "test@example.com",
        phone: "9876543210"
    })
})
.then(r => r.json())
.then(d => console.log(d))

// Test getting all requests
fetch('http://localhost:5000/api/booking/requests?area=Indore')
.then(r => r.json())
.then(d => console.log(d))

// Test creating a bid
fetch('http://localhost:5000/api/booking/bids', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        propertyId: "1",
        propertyName: "Athena House",
        area: "Indore",
        name: "Bidder User",
        email: "bidder@example.com",
        phone: "8765432109",
        bidAmount: 500
    })
})
.then(r => r.json())
.then(d => console.log(d))
```

---

## Postman Collection

### Import this JSON into Postman:

```json
{
    "info": {
        "name": "Booking Request API",
        "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    "item": [
        {
            "name": "Create Request",
            "request": {
                "method": "POST",
                "url": "http://localhost:5000/api/booking/requests",
                "body": {
                    "mode": "raw",
                    "raw": "{\"propertyId\":\"1\",\"propertyName\":\"Athena House\",\"area\":\"Indore\",\"name\":\"Raj Kumar\",\"email\":\"raj@example.com\",\"phone\":\"9876543210\"}"
                }
            }
        },
        {
            "name": "Get Requests",
            "request": {
                "method": "GET",
                "url": "http://localhost:5000/api/booking/requests?area=Indore"
            }
        },
        {
            "name": "Create Bid",
            "request": {
                "method": "POST",
                "url": "http://localhost:5000/api/booking/bids",
                "body": {
                    "mode": "raw",
                    "raw": "{\"propertyId\":\"1\",\"propertyName\":\"Athena House\",\"area\":\"Indore\",\"name\":\"Priya Singh\",\"email\":\"priya@example.com\",\"phone\":\"8765432109\",\"bidAmount\":500}"
                }
            }
        },
        {
            "name": "Get Bids",
            "request": {
                "method": "GET",
                "url": "http://localhost:5000/api/booking/bids?area=Indore"
            }
        }
    ]
}
```

---

## Common Test Cases

### Test 1: Complete Request Flow
```
1. POST /requests → Create
2. GET /requests → Verify
3. PUT /requests/:id/confirm → Confirm
4. POST /visits → Schedule
5. GET /visits/:id → Verify visit
```

### Test 2: Complete Bid Flow
```
1. POST /bids → Create
2. Check PropertyHold created
3. PUT /property-hold/:propertyId → Verify
4. POST /visits → Schedule
5. PUT /bids/:id/confirm → Confirm
```

### Test 3: Area Filtering
```
1. POST /requests (area=Indore)
2. POST /requests (area=Pune)
3. GET /requests?area=Indore → Should show only Indore
4. GET /requests?area=Pune → Should show only Pune
```

---

**Last Updated**: January 3, 2026
**API Version**: 1.0
**Status**: Ready for Testing ✅
