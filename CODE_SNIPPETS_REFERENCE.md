# Code Snippets Reference

## 1. Form Fields in visit.html

### Gender Dropdown
```html
<div class="grid grid-cols-1 gap-3">
    <select name="gender" id="gender" class="w-full border border-gray-300 rounded px-3 py-2 text-sm">
        <option value="">Select Gender Preference</option>
        <option value="Male Only">Male Only</option>
        <option value="Female Only">Female Only</option>
        <option value="Co-Ed">Co-Ed</option>
    </select>
</div>
```

### Student Reviews Rating
```html
<div>
    <label class="text-xs font-medium text-gray-600 block mb-2">Student Reviews Rating (★)</label>
    <div id="studentReviewsStars" class="flex gap-1 text-2xl cursor-pointer" onclick="handleStarClick(event, 'studentReviewsRating')">
        <span class="star text-gray-300" data-value="1">★</span>
        <span class="star text-gray-300" data-value="2">★</span>
        <span class="star text-gray-300" data-value="3">★</span>
        <span class="star text-gray-300" data-value="4">★</span>
        <span class="star text-gray-300" data-value="5">★</span>
    </div>
    <input type="hidden" id="studentReviewsRating" name="studentReviewsRating" value="">
    <p class="text-xs text-gray-500 mt-1" id="studentReviewsLabel">Click to rate</p>
</div>
```

### Employee Rating
```html
<div>
    <label class="text-xs font-medium text-gray-600 block mb-2">Employee Rating (★)</label>
    <div id="employeeRatingStars" class="flex gap-1 text-2xl cursor-pointer" onclick="handleStarClick(event, 'employeeRating')">
        <span class="star text-gray-300" data-value="1">★</span>
        <span class="star text-gray-300" data-value="2">★</span>
        <span class="star text-gray-300" data-value="3">★</span>
        <span class="star text-gray-300" data-value="4">★</span>
        <span class="star text-gray-300" data-value="5">★</span>
    </div>
    <input type="hidden" id="employeeRating" name="employeeRating" value="">
    <p class="text-xs text-gray-500 mt-1" id="employeeRatingLabel">Click to rate</p>
</div>
```

### Student Reviews Textarea
```html
<textarea name="studentReviews" id="studentReviews" rows="2" class="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="Student reviews feedback"></textarea>
```

---

## 2. Table Headers in visit.html

```html
<thead>
    <tr>
        <th>Visit ID</th>
        <th>Visit Date & Time</th>
        <th>Staff Name</th>
        <th>Staff ID</th>
        <th>Property Name</th>
        <th>Property Type</th>
        <th>Full Address</th>
        <th>Area / Locality</th>
        <th>Nearby Location</th>
        <th>Landmark</th>
        <th>Owner Name</th>
        <th>Owner Contact</th>
        <th>Gender</th>
        <th>Student Reviews</th>
        <th>Employee Rating</th>
        <!-- ...more headers... -->
    </tr>
</thead>
```

---

## 3. Enquiry Table Headers (superadmin/enquiry.html)

```html
<thead class="bg-gray-50 text-gray-500 text-[10px] uppercase border-b">
    <tr>
        <th class="px-4 py-3">Visit ID</th>
        <!-- ...other headers... -->
        <th class="px-4 py-3">Owner Name</th>
        <th class="px-4 py-3">Owner Contact</th>
        <th class="px-4 py-3">Gender</th>
        <th class="px-4 py-3">Student Reviews</th>
        <th class="px-4 py-3">Employee Rating</th>
        <th class="px-4 py-3 text-center">Monthly Rent</th>
        <!-- ...more headers... -->
    </tr>
</thead>
```

---

## 4. Enquiry Table Data Rendering (superadmin/enquiry.html)

```javascript
// In the tbody map function:

<td class="px-4 py-3">${v.gender || '-'}</td>
<td class="px-4 py-3 text-center">
    <div class="flex items-center justify-center">
        ${v.studentReviewsRating ? `<span class="text-yellow-500 font-bold">${'★'.repeat(Math.floor(v.studentReviewsRating))}${'☆'.repeat(5-Math.floor(v.studentReviewsRating))}</span>` : '-'}
    </div>
</td>
<td class="px-4 py-3 text-center">
    <div class="flex items-center justify-center">
        ${v.employeeRating ? `<span class="text-yellow-500 font-bold">${'★'.repeat(Math.floor(v.employeeRating))}${'☆'.repeat(5-Math.floor(v.employeeRating))}</span>` : '-'}
    </div>
</td>
```

---

## 5. Property Page - New Ratings Section (website/property.html)

```html
<section>
    <h2 class="text-3xl font-bold mb-8 flex items-center gap-3"><i data-lucide="star" class="w-7 h-7 text-amber-600"></i>Ratings & Reviews</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <!-- Student Reviews Card -->
        <div class="light-card rounded-2xl p-8 border-l-4 border-amber-500">
            <div class="flex items-center justify-between mb-6">
                <div>
                    <h3 class="text-xl font-bold text-gray-900 mb-2">Student Reviews</h3>
                    <p class="text-sm text-gray-600">Based on student feedback</p>
                </div>
                <div class="text-right">
                    <p id="student-reviews-rating" class="text-4xl font-bold text-amber-600">-</p>
                    <p class="text-xs text-gray-500">out of 5</p>
                </div>
            </div>
            <div id="student-reviews-stars" class="flex gap-1 text-3xl text-amber-400 mb-4">
                <span>★</span><span>★</span><span>★</span><span>★</span><span>☆</span>
            </div>
            <p id="student-reviews-comment" class="text-gray-700 text-sm italic border-t border-gray-200 pt-4">No student reviews available yet</p>
        </div>

        <!-- Employee Rating Card -->
        <div class="light-card rounded-2xl p-8 border-l-4 border-emerald-500">
            <div class="flex items-center justify-between mb-6">
                <div>
                    <h3 class="text-xl font-bold text-gray-900 mb-2">Employee Rating</h3>
                    <p class="text-sm text-gray-600">Staff assessment rating</p>
                </div>
                <div class="text-right">
                    <p id="employee-rating-rating" class="text-4xl font-bold text-emerald-600">-</p>
                    <p class="text-xs text-gray-500">out of 5</p>
                </div>
            </div>
            <div id="employee-rating-stars" class="flex gap-1 text-3xl text-emerald-500 mb-4">
                <span>★</span><span>★</span><span>★</span><span>★</span><span>☆</span>
            </div>
            <p id="employee-rating-comment" class="text-gray-700 text-sm italic border-t border-gray-200 pt-4">No employee rating available yet</p>
        </div>
    </div>
</section>
```

---

## 6. Property Page - JavaScript Rating Display (website/property.html)

```javascript
// Student Reviews and Employee Rating Display
const updateRatingDisplay = (rating, starsId, ratingId, commentId, isStudent = true) => {
    const starsEl = document.getElementById(starsId);
    const ratingEl = document.getElementById(ratingId);
    const commentEl = document.getElementById(commentId);
    
    if (!rating || rating === '-' || rating === 0) {
        if (starsEl) starsEl.innerHTML = '<span>★</span><span>★</span><span>★</span><span>★</span><span>☆</span>';
        if (ratingEl) ratingEl.textContent = '-';
        if (commentEl) commentEl.textContent = isStudent ? 'No student reviews available yet' : 'No employee rating available yet';
        return;
    }
    
    const ratingValue = parseFloat(rating);
    const fullStars = Math.floor(ratingValue);
    const emptyStars = 5 - fullStars;
    let starsHtml = '';
    for (let i = 0; i < fullStars; i++) starsHtml += '<span>★</span>';
    for (let i = 0; i < emptyStars; i++) starsHtml += '<span>☆</span>';
    
    if (starsEl) starsEl.innerHTML = starsHtml;
    if (ratingEl) ratingEl.textContent = ratingValue.toFixed(1);
    if (commentEl) {
        const comment = isStudent ? (v.studentReviews || 'Based on student feedback and reviews') : (v.employeeRatingComment || 'Professional staff assessment rating');
        commentEl.textContent = comment;
    }
};

// Display Student Reviews Rating
updateRatingDisplay(v.studentReviewsRating, 'student-reviews-stars', 'student-reviews-rating', 'student-reviews-comment', true);

// Display Employee Rating
updateRatingDisplay(v.employeeRating, 'employee-rating-stars', 'employee-rating-rating', 'employee-rating-comment', false);
```

---

## 7. Field Names Summary

| Purpose | Form Field ID | Input Name | Type | Storage |
|---------|---|---|---|---|
| Gender | `gender` | `gender` | Select | `v.gender` |
| Student Rating | `studentReviewsRating` | `studentReviewsRating` | Hidden (number) | `v.studentReviewsRating` |
| Student Text | `studentReviews` | `studentReviews` | Textarea | `v.studentReviews` |
| Employee Rating | `employeeRating` | `employeeRating` | Hidden (number) | `v.employeeRating` |

---

## CSS Classes Used

- `light-card` - Card styling for property page
- `border-l-4` - Left border on cards (4px)
- `border-amber-500` - Amber for student reviews
- `border-emerald-500` - Emerald for employee rating
- `text-yellow-500` - Yellow stars in table
- `text-amber-600` - Amber text for rating numbers
- `text-emerald-600` - Green text for rating numbers

---

## Browser Compatibility

- ✅ Chrome/Edge
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

## Notes

1. **Star Rating Click Handler**: Uses existing `handleStarClick(event, 'fieldId')` function
2. **Math.floor()**: Converts decimals to whole stars (4.7 → 4 stars)
3. **Default Display**: Shows all 5 stars empty (☆) when no rating
4. **Responsive**: Uses `grid-cols-1 md:grid-cols-2` for mobile/desktop
5. **No Backend**: All changes are frontend only
