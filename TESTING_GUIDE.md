# Quick Test Guide - Customer to Staff to Admin Flow

## 🔗 Test the Complete Connection

### Prerequisites
- Server running: http://localhost:3000
- Demo Users:
  - **Staff:** staff001 / password
  - **Admin:** admin123 / password

---

## 📋 Test Case: Full Booking → Payment → Return Flow

### Step 1: Customer Books a Vehicle
1. Open http://localhost:3000/browse-vehicles (NO LOGIN NEEDED)
2. Click on any vehicle card → "BOOK NOW"
3. Fill in booking form:
   - Customer Name: "John Test"
   - Email: "john@test.com"
   - Phone: "09123456789"
   - License No: "LN123456" (unique)
   - From Date: (any future date)
   - To Date: (5 days later)
4. Click "Confirm Booking"
5. **Expected:** Redirects to `/payment/[id]` with total amount calculated

### Step 2: Customer Pays
1. On payment page, enter:
   - Payment Method: "Online / Credit Card / Cash" (any option)
   - Payment Date: Today's date
2. Click "Process Payment"
3. **Expected:** Success page appears

### Step 3: Check Database
At this point, verify in MySQL:
```sql
-- Booking should exist with Status = "Pending Payment" → "Ongoing"
SELECT * FROM rental_info WHERE Rental_ID = (latest);
-- Payment should exist with Status = "Paid"
SELECT * FROM payment_info WHERE Rental_ID = (same);
-- Vehicle should be marked "Rented"
SELECT Vehicle_ID, Status FROM vehicle_info WHERE Vehicle_ID = (booked vehicle);
```

### Step 4: Staff Sees Pending Payments
1. Go to http://localhost:3000/login
2. Login as staff: `staff001` / `password`
3. Go to `/staff/dashboard`
4. **Check:** "Pending Payments" card shows count (if any unpaid bookings exist)
5. Go to `/staff/rentals`
6. Filter by "Pending Payment" - should see new booking
7. **Note:** Our booking auto-assigns to staff_001, so it appears in their dashboard

### Step 5: Staff Processes Offline Payment (Optional)
If booking was in "Pending Payment" status:
1. On `/staff/rentals` page with "Pending Payment" filter
2. Click the rental
3. On rental detail page, click "Record Payment"
4. Fill payment details
5. **Result:** Rental moves to "Ongoing", vehicle marked "Rented"

### Step 6: Staff Completes Return
1. Go to `/staff/rentals`
2. Filter by "Ongoing"
3. Click the rental
4. Click "Mark Completed"
5. **Expected:** 
   - Rental status changes to "Completed"
   - Vehicle status changes back to "Available"
   - Can now be booked by another customer

### Step 7: Admin Views Everything
1. Logout of staff account
2. Go to `/login`
3. Login as admin: `admin123` / `password`
4. Go to `/admin/dashboard`
5. **See:** 
   - Active Rentals, Available Vehicles, Pending Payments
   - Total Revenue
   - Staff count
   - Fleet utilization %
6. Go to `/admin/rentals`
7. **See:** 
   - Full list of all rentals
   - Customer names, vehicle, dates, amounts
   - Staff assignment (shows which staff_user_id handled it)
   - Can reassign to different staff or update status
8. Go to `/admin/reports` (with date range filter)
9. **See:**
   - Revenue summary
   - Rental counts by status
   - Top vehicles (most rented)
   - Top customers (most active)
   - Staff performance (rentals handled, revenue collected)

---

## ✅ Validation Points

### Booking Created? ✅
- [ ] Rental record appears in database
- [ ] Status = "Pending Payment" initially
- [ ] Customer info saved (auto-created if new)
- [ ] Vehicle ID linked correctly

### Payment Processed? ✅
- [ ] Payment record created with Status = "Paid"
- [ ] Rental status updated to "Ongoing"
- [ ] Vehicle status updated to "Rented"
- [ ] Redirect to success page works

### Staff Can See It? ✅
- [ ] Dashboard shows pending payment count
- [ ] Rentals page filters work (Pending Payment, Ongoing, Completed)
- [ ] Staff can view rental details
- [ ] Staff assignment shows (User_ID = staff001)

### Vehicle Released? ✅
- [ ] Staff clicks "Mark Completed"
- [ ] Rental status → "Completed"
- [ ] Vehicle status → "Available"
- [ ] Can be booked again

### Admin Can Track It? ✅
- [ ] Rental shows in admin rentals list
- [ ] Can reassign to different staff
- [ ] Reports show the rental in analytics
- [ ] Staff performance includes this rental

---

## 🔍 Browser DevTools - Network Check

### Booking API Call
When you click "Confirm Booking":
1. Open DevTools → Network tab
2. Look for POST to `/api/public/bookings`
3. **Expected response:** `{ "rentalId": N, "success": true }`

### Payment API Call
When you click "Process Payment":
1. Look for POST to `/api/public/payments`
2. **Expected response:** `{ "paymentId": N, "success": true, "message": "..." }`

### Staff Completion Call
When staff clicks "Mark Completed":
1. Look for PATCH to `/api/staff/rentals/complete`
2. **Expected response:** `{ "success": true, "message": "...", "rental": {...} }`

---

## 🐛 Troubleshooting

### "Booking doesn't create rental record"
- Check browser console for errors
- Check Network tab for API response
- Check server logs for error messages

### "Vehicle still shows as Available after payment"
- Payment API should update vehicle status
- Check `/api/public/payments` is being called
- Verify vehicle_info.Status field is being updated

### "Staff doesn't see pending payments"
- Go to `/staff/rentals`
- Use filter dropdown to select "Pending Payment"
- If nothing shows, check rental_info.Status value in database

### "Vehicle doesn't release after completion"
- Check `/api/staff/rentals/complete` response
- Verify vehicle_info.Status is updated to "Available"
- Refresh page after marking complete

---

## 📊 Expected State After Full Flow

After completing all steps:

| Database Table | Fields | Value |
|---|---|---|
| rental_info | Rental_ID | (your id) |
| | Status | "Completed" |
| | Customer_ID | (guest customer) |
| | Vehicle_ID | (booked vehicle) |
| | User_ID | 2 (staff001) |
| payment_info | Rental_ID | (same) |
| | Status | "Paid" |
| | Amount | (calculated) |
| vehicle_info | Vehicle_ID | (booked) |
| | Status | "Available" ← back to available |
| rental_audit | Rental_ID | (your id) |
| | (multiple entries) | Shows: Pending → Ongoing → Completed |

---

## 🎯 Key Success Indicators

✅ **System is working correctly when:**

1. **Customer can book without logging in** - Public flow works
2. **Payment creates real records** - Database gets updated
3. **Vehicle status changes** - Available → Rented → Available
4. **Staff sees pending payments** - Dashboard shows real data
5. **Staff can complete rentals** - Vehicles released back
6. **Admin can see all rentals** - Reports show real data
7. **User_ID tracks accountability** - Shows which staff handled each rental

If all 7 are working → **System is fully connected!** 🚀
