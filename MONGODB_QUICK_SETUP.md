# MongoDB Atlas Quick Setup Checklist

## ✅ What We've Set Up For You

- ✅ **KYCVerification Model** - For storing user signup data
- ✅ **BookingRequest Model** - Already exists, ready to use
- ✅ **Data Sync Routes** - Complete CRUD operations for both collections
- ✅ **Bulk Sync Endpoints** - Transfer all data from localStorage to MongoDB
- ✅ **Sync Tool** - Interactive UI tool for syncing data
- ✅ **API Integration** - Query, filter, and manage data via REST API

---

## 🚀 Quick Start (5 minutes)

### 1. Create MongoDB Atlas Account
```
Go to: https://www.mongodb.com/cloud/atlas
Sign up → Create M0 Free Cluster → Create Database User
```

### 2. Get Connection String
```
From MongoDB Atlas:
Database → Connect → Copy Connection String

Example:
mongodb+srv://roomhy_user:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### 3. Add to .env File
```bash
# Create/Update .env in project root
MONGO_URI=mongodb+srv://roomhy_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/roomhy?retryWrites=true&w=majority
PORT=5000
NODE_ENV=development
```

### 4. Start Server
```bash
npm run dev
# Should show: "MongoDB Connected" in console
```

### 5. Sync Data
```
Open in browser: http://localhost:5000/Areamanager/sync-to-mongodb.html
Click: "Sync Everything"
Done! Data is now in MongoDB ✅
```

---

## 📊 API Endpoints Created

### Booking Requests
- `GET /api/data/booking-requests` - Get all
- `POST /api/data/booking-requests/sync` - Sync from localStorage

### KYC Verifications (User Signups)
- `GET /api/data/kyc-verifications` - Get all
- `POST /api/data/kyc-verifications/sync` - Sync from localStorage

### Bulk Sync
- `POST /api/data/sync-all` - Sync everything at once

---

## 🔗 Files Created/Modified

| File | Purpose |
|------|---------|
| `roomhy-backend/models/KYCVerification.js` | User signup data model |
| `roomhy-backend/routes/dataSync.js` | All API endpoints |
| `server.js` | Added data sync routes |
| `Areamanager/sync-to-mongodb.html` | Interactive sync tool |
| `MONGODB_ATLAS_SETUP.md` | Complete setup guide |

---

## 📍 Next Steps

1. **Set up MongoDB Atlas** (follow Quick Start above)
2. **Run sync tool** - Visit `sync-to-mongodb.html`
3. **Verify in MongoDB Atlas** - Check Collections tab
4. **Update Frontend** (optional) - Use API instead of localStorage
5. **Celebrate!** 🎉 - Data is now securely in MongoDB!

---

## ⚡ Useful Commands

```bash
# Test server connection
curl http://localhost:5000/api/data/booking-requests

# Check MongoDB connection (in server console)
npm run dev
# Look for: "MongoDB Connected"

# Sync all data
# Open: http://localhost:5000/Areamanager/sync-to-mongodb.html
# Click: Sync Everything button
```

---

## 🆘 Common Issues

| Issue | Solution |
|-------|----------|
| "Cannot connect to server" | Ensure `npm run dev` is running on port 5000 |
| "MongoDB connection failed" | Check `.env` file has correct `MONGO_URI` and password |
| "No data to sync" | Generate test data first (test-booking-data.html) |
| "502 Bad Gateway" | Restart server: Ctrl+C then `npm run dev` |

---

## 📱 Access Your Data

### Option 1: MongoDB Atlas Web UI
1. Login to https://atlas.mongodb.com
2. Click your cluster
3. Go to Collections tab
4. Browse `bookingrequests` and `kycverifications`

### Option 2: MongoDB Compass (Desktop App)
1. Download from https://www.mongodb.com/products/compass
2. Connect with your connection string
3. Browse collections visually

### Option 3: API Endpoints
```bash
# Get booking requests
curl http://localhost:5000/api/data/booking-requests

# Get KYC records
curl http://localhost:5000/api/data/kyc-verifications

# Filter by area
curl "http://localhost:5000/api/data/booking-requests?area=Kota"

# Filter by status
curl "http://localhost:5000/api/data/booking-requests?status=pending"
```

---

## 🔐 Security Notes

- ✅ `.env` file is in `.gitignore` (won't be committed)
- ✅ Passwords hashed in database
- ✅ MongoDB Atlas has built-in authentication
- ✅ Network access controlled via whitelist

**For Production:**
- Use specific IP addresses (not "Anywhere")
- Enable 2FA on MongoDB Atlas
- Set up automated backups
- Use environment variables for sensitive data

---

## 📚 Full Documentation

For detailed setup and advanced features, see: `MONGODB_ATLAS_SETUP.md`

---

**Status: Ready to Use! 🎉**

Your data storage infrastructure is now set up and ready to handle:
- Booking requests
- User signups (KYC verification)
- Scalable to handle 1000+ records
- Secure cloud storage
- Real-time data access

Start syncing your data now!
