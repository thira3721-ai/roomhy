# MongoDB Atlas Setup & Data Sync Guide

## Overview

This guide will help you set up MongoDB Atlas and sync your localStorage data (Booking Requests & KYC Records) to MongoDB.

---

## Step 1: Set Up MongoDB Atlas Account

### 1.1 Create MongoDB Atlas Account
1. Go to: https://www.mongodb.com/cloud/atlas
2. Click **Sign Up** (or Sign In if you have an account)
3. Complete the registration process
4. Verify your email address

### 1.2 Create a Free Cluster
1. After login, click **Create Deployment**
2. Select **M0 Cluster** (free tier)
3. Choose your **Cloud Provider** (AWS, Google Cloud, or Azure)
4. Select **Region** closest to your location
5. Click **Create Cluster** (takes 5-10 minutes)

### 1.3 Create Database User
1. In Atlas Dashboard, go to **Database Access**
2. Click **Add New User**
3. Choose **Username & Password**
4. Set Username: `roomhy_user`
5. Set Password: (strong password, save it!)
6. Grant **Read and write to any database**
7. Click **Add User**

### 1.4 Allow Network Access
1. Go to **Network Access**
2. Click **Add IP Address**
3. Select **Allow Access from Anywhere** (for development)
   - OR add your specific IP address
4. Click **Confirm**

---

## Step 2: Get Connection String

### 2.1 Copy Connection String
1. In Atlas Dashboard, click **Connect**
2. Choose **Connect your application**
3. Copy the connection string (looks like):
   ```
   mongodb+srv://roomhy_user:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `PASSWORD` with your actual password

---

## Step 3: Configure Server Environment

### 3.1 Update .env File
Create or update `.env` file in your project root:

```env
# MongoDB Atlas Connection
MONGO_URI=mongodb+srv://roomhy_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/roomhy?retryWrites=true&w=majority

# Other existing configs
PORT=5000
NODE_ENV=development
```

### 3.2 Verify Connection
Run your server:
```bash
npm run dev
# or
npm start
```

You should see: `MongoDB Connected` in the console.

---

## Step 4: Sync Data from localStorage to MongoDB

### Method 1: Using the Sync Tool (Recommended)

1. **Open Sync Tool:**
   - Navigate to: `Areamanager/sync-to-mongodb.html`
   - Or open in browser: `http://localhost:5000/Areamanager/sync-to-mongodb.html`

2. **Configure Server URL:**
   - Default: `http://localhost:5000`
   - Change if your server is on different host/port

3. **Sync Data:**
   - Click **"Sync Everything"** to sync all data at once
   - OR sync individually:
     - **"Sync Booking Requests"** - Transfer booking data
     - **"Sync KYC/Signup Records"** - Transfer user signup data

4. **Monitor Progress:**
   - Watch the status display
   - Check detailed logs
   - View sample data preview

### Method 2: Using API Directly

#### Sync Booking Requests
```bash
curl -X POST http://localhost:5000/api/data/booking-requests/sync \
  -H "Content-Type: application/json" \
  -d @booking-requests.json
```

#### Sync KYC Records
```bash
curl -X POST http://localhost:5000/api/data/kyc-verifications/sync \
  -H "Content-Type: application/json" \
  -d @kyc-records.json
```

#### Sync Everything
```bash
curl -X POST http://localhost:5000/api/data/sync-all \
  -H "Content-Type: application/json" \
  -d @all-data.json
```

---

## Step 5: Verify Data in MongoDB

### 5.1 Check via MongoDB Atlas Dashboard
1. Go to **Database** section
2. Click **Collections** tab
3. You should see these collections:
   - `bookingrequests` (Booking Request data)
   - `kycverifications` (User/Signup data)

### 5.2 Check via MongoDB Compass (Optional)
1. Download: https://www.mongodb.com/products/compass
2. Connect using your connection string
3. Browse collections and documents

### 5.3 Check via API
```bash
# Get all booking requests
curl http://localhost:5000/api/data/booking-requests

# Get all KYC records
curl http://localhost:5000/api/data/kyc-verifications

# Filter by status
curl "http://localhost:5000/api/data/booking-requests?status=pending"
```

---

## API Endpoints Reference

### Booking Requests

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/data/booking-requests` | Get all requests |
| GET | `/api/data/booking-requests/:id` | Get single request |
| POST | `/api/data/booking-requests` | Create request |
| PUT | `/api/data/booking-requests/:id` | Update request |
| DELETE | `/api/data/booking-requests/:id` | Delete request |
| POST | `/api/data/booking-requests/sync` | Bulk sync from localStorage |

### KYC Verifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/data/kyc-verifications` | Get all KYC records |
| GET | `/api/data/kyc-verifications/:id` | Get single record |
| POST | `/api/data/kyc-verifications` | Create record |
| PUT | `/api/data/kyc-verifications/:id` | Update record |
| DELETE | `/api/data/kyc-verifications/:id` | Delete record |
| POST | `/api/data/kyc-verifications/sync` | Bulk sync from localStorage |
| POST | `/api/data/kyc-verifications/:id/verify` | Verify/Approve KYC |

### Bulk Sync

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/data/sync-all` | Sync both collections at once |

---

## Query Examples

### Get Booking Requests by Status
```bash
curl "http://localhost:5000/api/data/booking-requests?status=pending"
```

### Get Booking Requests by Area
```bash
curl "http://localhost:5000/api/data/booking-requests?area=Kota"
```

### Get Booking Requests by User
```bash
curl "http://localhost:5000/api/data/booking-requests?user_id=USER001"
```

### Get KYC Records by Status
```bash
curl "http://localhost:5000/api/data/kyc-verifications?kycStatus=verified"
```

### Get KYC Records by Area
```bash
curl "http://localhost:5000/api/data/kyc-verifications?area=Kota"
```

---

## Update Frontend to Use API Instead of localStorage

### booking_request.html Example

**Before (localStorage):**
```javascript
function loadBookingRequests() {
    const requests = JSON.parse(localStorage.getItem('roomhy_booking_requests') || '[]');
    displayTable(requests);
}
```

**After (API):**
```javascript
async function loadBookingRequests() {
    try {
        const response = await fetch('/api/data/booking-requests');
        const requests = await response.json();
        displayTable(requests);
    } catch (error) {
        console.error('Error fetching requests:', error);
    }
}
```

### new_signups.html Example

**Before (localStorage):**
```javascript
function loadSignups() {
    const users = JSON.parse(localStorage.getItem('roomhy_kyc_verification') || '[]');
    displayTable(users);
}
```

**After (API):**
```javascript
async function loadSignups() {
    try {
        const response = await fetch('/api/data/kyc-verifications');
        const users = await response.json();
        displayTable(users);
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}
```

---

## Troubleshooting

### Connection Issues

**Problem:** "Cannot connect to server"
- **Solution:** Ensure your Node.js server is running on port 5000
- Check: `http://localhost:5000` in browser

**Problem:** "MongoDB connection failed"
- **Solution:** Check `.env` file has correct `MONGO_URI`
- Verify password doesn't contain special characters (URL encode if needed)
- Check Network Access allows your IP

**Problem:** "Cluster not ready"
- **Solution:** Wait 5-10 minutes for cluster to fully initialize

### Data Sync Issues

**Problem:** "No data to sync"
- **Solution:** Ensure test data is generated first
- Check localStorage has data: `roomhy_booking_requests`, `roomhy_kyc_verification`

**Problem:** "Sync failed - 404 error"
- **Solution:** Ensure routes are added to server.js
- Restart server after adding routes
- Check server console for errors

**Problem:** "Duplicate key error"
- **Solution:** Data already exists - safe to ignore
- Or delete collection and sync again

### Performance Issues

**Problem:** "Sync is slow"
- **Solution:** This is normal for first sync
- Subsequent syncs are faster
- Large datasets may take 1-2 minutes

---

## Data Backup & Migration

### Export Data
```bash
# Using MongoDB Atlas UI:
1. Go to Collections tab
2. Click collection name
3. Click three-dot menu → Export data
4. Choose format (JSON, CSV)
5. Download file
```

### Backup Locally
```bash
# Using MongoDB Compass:
1. Connect to cluster
2. Right-click collection
3. Export → Select format
4. Choose export location
```

---

## Next Steps

1. ✅ Set up MongoDB Atlas account
2. ✅ Configure connection string in `.env`
3. ✅ Verify server connection
4. ✅ Sync data using the sync tool
5. ✅ Verify data in MongoDB
6. ⏭️ Update frontend to fetch from API (optional)
7. ⏭️ Set up automated backups in MongoDB Atlas

---

## Security Best Practices

1. **Passwords:** Never commit `.env` to git
2. **IP Whitelist:** Use specific IPs in production (not "Anywhere")
3. **API Keys:** Consider adding authentication to API endpoints
4. **Backups:** Enable automatic backups in MongoDB Atlas
5. **Monitoring:** Set up alerts for suspicious activity

---

## Support Resources

- **MongoDB Atlas Docs:** https://docs.atlas.mongodb.com/
- **Node.js + MongoDB:** https://docs.mongodb.com/drivers/node/
- **Mongoose Docs:** https://mongoosejs.com/
- **Your Sync Tool:** `Areamanager/sync-to-mongodb.html`

---

## Quick Commands Reference

```bash
# Start server with MongoDB connection
npm run dev

# Check server is running
curl http://localhost:5000/api/data/booking-requests

# Get connection string
# From MongoDB Atlas → Database → Connect → Connection String

# Test API
curl -X GET http://localhost:5000/api/data/booking-requests

# Restart after .env changes
# Stop server (Ctrl+C) and run `npm run dev` again
```

---

**Status:** ✅ MongoDB Atlas Integration Ready

All collections are now stored in MongoDB Atlas instead of localStorage!

Last Updated: Current Session
