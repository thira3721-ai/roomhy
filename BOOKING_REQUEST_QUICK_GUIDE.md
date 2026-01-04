# Booking Request System - Quick Reference Guide

## For Area Managers

### Accessing Booking Requests
1. Navigate to **Areamanager/booking_request.html**
2. Sidebar shows **"Booking Requests"** option
3. You'll see two tabs: **Requests** and **Bids**

---

## Requests Tab

### What You'll See:
- **Blue badge**: Shows number of pending requests
- **For each request**:
  - ✅ Tenant's Full Name
  - 📧 Email Address
  - 📱 Phone Number
  - 🏠 Property Name
  - 📍 Area/Locality
  - 📅 Date Request Was Made

### What You Can Do:

#### 1. **Schedule Visit**
- Click "Schedule Visit" button
- Choose visit type: 
  - **Physical Visit** - In-person at property
  - **Virtual Visit** - Video call
- Select date (calendar picker)
- Choose time slot:
  - 9:00 AM - 10:00 AM
  - 10:00 AM - 11:00 AM
  - 11:00 AM - 12:00 PM
  - 2:00 PM - 3:00 PM
  - 3:00 PM - 4:00 PM
  - 4:00 PM - 5:00 PM
- Click "Schedule Visit" to confirm

#### 2. **View Details**
- Click "View Details" to see full request information
- Modal shows all tenant details
- Click "Confirm Request" when ready

---

## Bids Tab

### What You'll See:
- **Green badge**: Shows number of paid bids (₹500 confirmed)
- **For each bid**:
  - ✅ Tenant's Full Name
  - 📧 Email Address
  - 📱 Phone Number
  - 🏠 Property Name
  - 📍 Area/Locality
  - 💰 "₹500 Paid" badge (confirmed payment)
  - 📅 Date Bid Was Placed

### Important Note:
**When someone places a bid (pays ₹500)**:
- Property goes "ON HOLD" for 7 days
- "Bid Now" button is disabled on property.html
- No other users can bid on this property
- Automatic release after 7 days if not confirmed

### What You Can Do:

#### 1. **Schedule Visit**
- Same process as requests
- Physical or Virtual visit
- Choose date and time slot

#### 2. **Book Now**
- Click "Book Now" after scheduling visit
- Confirms the booking with the tenant
- Property status changes to "Booked"
- Payment ₹500 already received

---

## Important Features

### Area-Based Filtering
✅ You only see requests/bids for YOUR assigned area
✅ Automatically filters by area stored in your profile
✅ No access to other area managers' data

### Auto-Refresh
✅ Page automatically updates every 30 seconds
✅ You'll see new requests/bids instantly
✅ No need to manually refresh

### Data Storage
✅ All data stored securely in MongoDB Atlas
✅ Backed up automatically
✅ Accessible from any device

---

## Step-by-Step: Managing a Request

### Scenario: Tenant Sends Request

1. **Tenant** clicks "Request" on property.html
2. **Tenant** enters name, phone, email
3. **Request appears** in your Requests tab (within 5 seconds)

4. **You** click "Schedule Visit"
5. **You** select:
   - Visit type (Physical/Virtual)
   - Date
   - Time slot
6. **You** click "Schedule Visit"
7. **Tenant** receives confirmation

8. **You** click "View Details"
9. **You** click "Confirm Request"
10. ✅ **Booking confirmed!**

---

## Step-by-Step: Managing a Bid

### Scenario: Tenant Pays ₹500 and Bids

1. **Tenant** clicks "Bid Now" on property.html
2. **Tenant** enters name, phone, occupancy
3. **Tenant** confirms payment (₹500)
4. ✅ **Property goes ON HOLD**

5. **Bid appears** in your Bids tab (within 5 seconds)
6. **"Bid Now" button** disabled on property.html

7. **You** click "Schedule Visit"
8. **You** select date, time, visit type
9. **Tenant** visits property

10. **You** click "Book Now"
11. ✅ **Booking confirmed with ₹500 payment!**

---

## Phone Number Formatting

### When viewing/entering phone numbers:
- Format: 10-digit Indian mobile number
- Example: 9876543210
- With +91: +91 9876543210
- Both formats accepted

---

## Common Questions

### Q: How long does the property hold last?
**A**: 7 days from the date of bid (₹500 payment)

### Q: Can I manually release a property hold?
**A**: Not yet - automatic release after 7 days or upon booking confirmation

### Q: What if tenant doesn't show up for visit?
**A**: You can update status or cancel the visit from database

### Q: Can I see requests from other areas?
**A**: No - system automatically filters to show only your area

### Q: How often does the page update?
**A**: Every 30 seconds automatically. You can also refresh manually.

### Q: Is phone number and email visible?
**A**: Yes - for direct contact with tenants

---

## Tips for Best Results

✅ **Check regularly** - Open page 2-3 times daily to see new requests
✅ **Respond quickly** - Schedule visits same day for better acceptance
✅ **Use physical visits** - When possible for verification
✅ **Confirm bookings** - Complete booking flow after visit
✅ **Save information** - Note down tenant details for records
✅ **Note visit times** - Avoid scheduling overlapping visits

---

## Troubleshooting

### Issue: Not seeing any requests/bids
- **Check**: Are you logged in with correct area?
- **Check**: Area name matches your profile area
- **Solution**: Logout and login again

### Issue: "Schedule Visit" button not working
- **Check**: Modal opens correctly?
- **Check**: All fields filled?
- **Solution**: Try again or refresh page

### Issue: Email/Phone not saving
- **Check**: Valid format?
- **Check**: No special characters?
- **Solution**: Use correct format (9876543210)

### Issue: Property still showing "Bid Now" after bid
- **Check**: Did payment confirm (₹500)?
- **Check**: Did modal close properly?
- **Solution**: Refresh page after 5 seconds

---

## Support

**For technical issues**, check:
1. Browser console (F12 → Console tab)
2. Network tab for API errors
3. Clear browser cache and retry

**For business issues**:
- Contact your area coordinator
- Reference the request/bid ID
- Include date and tenant name

---

## Data Security

🔒 **Your data is secure**:
- MongoDB Atlas encryption
- Area-based access control
- No cross-area data access
- Regular backups

---

**Happy Managing! 🎉**

**Last Updated**: January 3, 2026
