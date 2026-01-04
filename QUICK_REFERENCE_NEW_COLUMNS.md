# Quick Reference: Using New Columns

## For Area Managers (visit.html)

### Step 1: Fill Gender Preference
- Open "New Property Visit" form
- Scroll to owner information section
- Select gender preference from dropdown:
  - **Male Only** - Property for males only
  - **Female Only** - Property for females only
  - **Co-Ed** - Mixed gender allowed

### Step 2: Rate Student Reviews
- In "Staff Assessment" section
- Find "Student Reviews Rating (★)"
- Click on stars to set rating (1-5)
- Add feedback in "Student reviews feedback" text area below

### Step 3: Rate Employee Performance
- In same "Staff Assessment" section
- Find "Employee Rating (★)"
- Click on stars to set rating (1-5)
- Submit the form as usual

---

## For Super Admins (enquiry.html)

### Viewing Ratings
1. Go to **Enquiries** page
2. Look at the table columns:
   - **Gender** - Shows preference (Male Only, Female Only, Co-Ed)
   - **Student Reviews** - Shows star rating (★★★★☆)
   - **Employee Rating** - Shows star rating (★★★★☆)

### Interpreting Ratings
- ⭐ Full star = 1 point
- ☆ Empty star = 0 points
- "-" = Not yet rated

**Examples:**
- ★★★★☆ = 4.0 rating (4 out of 5)
- ★★★☆☆ = 3.0 rating (3 out of 5)
- "-" = No rating provided

---

## For Website Visitors (property.html)

### Ratings Section
- New "Ratings & Reviews" section displays at the top of property details
- Two cards side by side:

**Left Card - Student Reviews:**
- Shows large rating number (e.g., "4.5")
- Visual star display
- Student feedback comments

**Right Card - Employee Rating:**
- Shows large rating number (e.g., "4.0")
- Visual star display
- Staff assessment comments

### How to Read
- Higher rating = Better quality property
- Stars indicate visual rating level
- Comments provide specific feedback

---

## Data Mapping

| Field | Form Field | Table Column | Database Field | Display |
|-------|-----------|-------------|----------------|---------|
| Gender | Dropdown | Gender | `gender` | Text |
| Student Reviews | 5-Star + Text | Student Reviews | `studentReviewsRating`, `studentReviews` | Stars (★) |
| Employee Rating | 5-Star | Employee Rating | `employeeRating` | Stars (★) |

---

## Tips

✅ **Consistent Ratings** - Use 5 stars for excellent, 4 for good, 3 for average
✅ **Meaningful Feedback** - Add detailed comments to help tenants make decisions
✅ **Regular Updates** - Update ratings when new information becomes available
✅ **Mobile Friendly** - All sections are fully responsive

---

## Support

If ratings don't appear:
1. Check that data was saved in the form
2. Ensure browser localStorage is not disabled
3. Refresh the page
4. Check browser console for errors (F12 key)
