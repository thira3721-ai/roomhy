remove # Property Enquiry Submission Implementation - TODO

## Completed Tasks ✅

### Backend Implementation
- [x] Add '/api/property-enquiry/submit' route to roomhy-backend/routes/propertyRoutes.js
- [x] Implement submitEnquiry method in roomhy-backend/controllers/propertyController.js
  - [x] Create property enquiry with proper data structure
  - [x] Find and assign area manager based on city/locality
  - [x] Send notification to assigned area manager
  - [x] Return success response with assigned manager info
- [x] Fix notification model field mapping (toLoginId, meta instead of 'to', 'data')

### Frontend Implementation
- [x] Update areaenq.html notification bell with ID and hidden dot
- [x] Add checkNotifications() function to poll for unread notifications
- [x] Add notification dot visibility logic (show/hide based on unread count)
- [x] Integrate notification checking on page load and every 30 seconds

## Follow-up Steps 🔄

### Testing & Verification
- [ ] Test form submission from list.html to verify endpoint works
- [ ] Verify notifications appear in areaenq.html bell icon
- [ ] Confirm enquiries are properly assigned to area managers
- [ ] Test notification polling functionality

### Additional Features (Optional)
- [ ] Add notification dropdown/panel to view notification details
- [ ] Implement notification click-to-mark-as-read functionality
- [ ] Add sound alerts for new notifications
- [ ] Add notification count badge to bell icon

## Notes
- The workflow now supports: Property listing form → Enquiry creation → Area manager assignment → Notification delivery
- Area managers will see a red dot on the bell icon when they have unread notifications
- Notifications are checked every 30 seconds automatically
- Fallback assignment to any available area manager if no specific match found
