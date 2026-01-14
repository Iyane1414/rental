# Car Rental System - Complete Flow Architecture

## The Connection Model (Now Working)

Your system now properly connects **Customer → Staff → Admin** in a clean, accountable way that matches your ERD and paper design.

---

## 🔄 Complete Rental Flow

### 1️⃣ **CUSTOMER: Browse & Book** (Public, No Login)

**Pages:**
- `/browse-vehicles` - View all available vehicles
- `/book-vehicle/[id]` - Fill booking form (customer name, dates, license, contact)

**What happens:**
```
Customer clicks "BOOK NOW" 
  ↓
Form submits to POST /api/public/bookings
  ↓
API creates:
  - CustomerInfo record (if new customer)
  - RentalInfo with Status = "Pending Payment"
  - Vehicle stays "Available" (not locked yet)
  ↓
Redirects to /payment/[id]
```

**Key validation:**
- ✅ Checks vehicle exists
- ✅ Checks vehicle status is "Available"
- ✅ Creates customer from guest booking (no account needed)
- ✅ Assigns to default staff for initial processing

---

### 2️⃣ **CUSTOMER: Process Payment** (Public)

**Page:** `/payment/[id]`

**What happens:**
```
Customer enters payment method & date
  ↓
Form submits to POST /api/public/payments
  ↓
API:
  - Validates rental is "Pending Payment"
  - Creates PaymentInfo record with Status = "Paid"
  - Updates RentalInfo: Status → "Ongoing"
  - Updates VehicleInfo: Status → "Rented"
  ↓
Redirects to /payment-success/[id]
```

**Result:** Customer has paid, rental is active, vehicle is marked as rented.

---

### 3️⃣ **STAFF: View & Process Pending Payments** (Login Required)

**Pages:**
- `/staff/dashboard` - Shows "Pending Payments" count (pull from API)
- `/staff/rentals` - Filter by "Pending Payment" status to see all unpaid bookings
- `/staff/rentals/[id]` - View rental details

**What staff sees:**
- All rentals with Status = "Pending Payment"
- Customer info, vehicle details, booking dates, amount due

**Staff actions:**
1. **View booking** - Verify customer & vehicle details
2. **Process payment** - If customer pays at office/desk (offline), staff clicks "Record Payment"
3. **Payment dialog** - Enter payment method, date, amount
4. **Submit** - Creates PaymentInfo, updates rental to "Ongoing", marks vehicle as "Rented"

---

### 4️⃣ **STAFF: Manage Ongoing Rentals**

**Pages:**
- `/staff/dashboard` - Shows "Ongoing Rentals" count
- `/staff/rentals` - Filter by "Ongoing" to see active rentals
- `/staff/payments` - Record payments for rentals

**Staff workflow:**
- Monitor active rentals
- Check which vehicles need to be released (marked as "Rented" in inventory)
- Handle customer requests during rental period

---

### 5️⃣ **STAFF: Complete Rental & Release Vehicle**

**Page:** `/staff/rentals/[id]` (for ongoing rental)

**What happens:**
```
Customer returns vehicle
  ↓
Staff clicks "Mark Completed" on rental detail page
  ↓
PATCH /api/staff/rentals/complete
  ↓
API:
  - Validates rental is "Ongoing"
  - Updates RentalInfo: Status → "Completed"
  - Updates VehicleInfo: Status → "Available"
  - Creates RentalAudit entry (accountability trail)
  ↓
Vehicle now bookable again
```

**Result:** Vehicle returns to "Available" status, rental closes, staff has recorded the completion.

---

### 6️⃣ **ADMIN: Oversight & Reporting**

**Pages:**
- `/admin/dashboard` - Overview of system state (pending payments, active rentals, available vehicles, revenue)
- `/admin/rentals` - Full rental list with staff assignment & status override capability
- `/admin/users` - Create/manage staff accounts
- `/admin/reports` - Business analytics (revenue, fleet utilization, staff performance)

**Admin capabilities:**
- Assign rentals to different staff (override auto-assignment)
- View payment history per rental
- See staff accountability (User_ID tracks which staff handled each rental)
- Analytics on revenue, vehicles, customers, and staff performance

---

## 📊 Database State at Each Step

### After Customer Books:
```
rental_info:
  Rental_ID: 1
  Customer_ID: 5 (guest customer)
  Vehicle_ID: 3
  User_ID: 2 (default staff)
  Status: "Pending Payment"
  TotalAmount: 5000.00

vehicle_info (Vehicle_ID: 3):
  Status: "Available"  ← Still available for other customers
```

### After Payment:
```
rental_info (same):
  Status: "Ongoing"

payment_info:
  Payment_ID: 1
  Rental_ID: 1
  Amount: 5000.00
  Status: "Paid"

vehicle_info (Vehicle_ID: 3):
  Status: "Rented"  ← Now locked, not available
```

### After Completion:
```
rental_info (same):
  Status: "Completed"

vehicle_info (Vehicle_ID: 3):
  Status: "Available"  ← Back to available
```

---

## 🔐 Accountability Trail

Every rental carries:
- **Customer_ID** - Who rented it
- **Vehicle_ID** - Which vehicle
- **User_ID** - Which staff member handled it
- **RentalAudit entries** - Timestamp of each status change + who changed it

This matches your paper requirement: "staff is accountable for what they do"

---

## ✅ What's Now Connected

| Component | Status | Purpose |
|-----------|--------|---------|
| **Customer Booking** | ✅ Working | Creates rental in Pending Payment |
| **Vehicle Availability Check** | ✅ Working | Booking rejects if vehicle not Available |
| **Guest Customer Auto-Creation** | ✅ Working | No account needed to book |
| **Payment Processing** | ✅ Working | Creates payment, marks rental Ongoing, vehicle Rented |
| **Staff Payment Section** | ✅ Working | Dashboard shows pending count, rentals page filters by Pending Payment |
| **Vehicle Release** | ✅ Working | Staff marks complete, vehicle goes back to Available |
| **Admin Oversight** | ✅ Working | Dashboard shows all metrics, rentals page shows staff assignment |
| **Accountability** | ✅ Working | RentalAudit + User_ID tracks who did what when |

---

## 🚀 How to Test the Flow

### Test Case: Customer books → Staff processes → Return vehicle

1. **Browse vehicles**
   - Go to `/browse-vehicles`
   - Should see available vehicles (Status = "Available")

2. **Book a vehicle**
   - Click vehicle card → "Book Now"
   - Fill in customer details (name, email, phone, license)
   - Set dates and calculate total
   - Click "Confirm Booking"
   - Should redirect to payment page

3. **Make payment**
   - On payment page, enter payment method
   - Click "Process Payment"
   - Should see success page
   - Check database: rental Status should be "Ongoing", vehicle Status should be "Rented"

4. **Staff sees pending payment**
   - Login as staff (staff001 / password)
   - Go to `/staff/dashboard` → should show pending payment count
   - Go to `/staff/rentals` → filter "Pending Payment" → should see new booking
   - (If booking was in Pending Payment, staff would record the offline payment here)

5. **Check admin overview**
   - Login as admin (admin123 / password)
   - Go to `/admin/dashboard` → see active rentals, available vehicles, revenue
   - Go to `/admin/rentals` → see full rental list, assign staff if needed
   - Go to `/admin/reports` → see analytics

6. **Staff completes rental**
   - Login as staff
   - Go to `/staff/rentals` → filter "Ongoing"
   - Click rental → click "Mark Completed"
   - Vehicle should return to "Available"

---

## 📋 Key Design Decisions

**1. Default Staff Assignment**
- Public bookings auto-assign to User_ID = 2 (default staff)
- Admin can reassign to different staff member
- Enables accountability without requiring staff to validate upfront

**2. Vehicle Status Semantics**
- **Available** - Can be booked
- **Rented** - Active rental in progress (not bookable)
- **Maintenance** - Staff/admin can mark when needed
- (No "Reserved" state - simplifies logic)

**3. Rental Status Flow**
- **Pending Payment** - Customer booked but hasn't paid yet
- **Ongoing** - Payment received, rental active
- **Completed** - Rental finished, vehicle returned
- **Cancelled** - Admin/staff can cancel if needed

**4. One Payment Per Rental**
- PaymentInfo has `@unique` on Rental_ID
- Enforces business rule: exactly 1 payment per rental
- Staff can only create payment once

---

## 🔧 API Summary

**Public APIs** (No login):
- `POST /api/public/bookings` - Create rental from booking form
- `POST /api/public/payments` - Process payment for rental
- `GET /api/public/vehicles` - List available vehicles
- `GET /api/public/vehicles/[id]` - Get vehicle details

**Staff APIs** (Staff login):
- `GET /api/staff/rentals` - List rentals (filterable by status)
- `GET /api/staff/rentals/[id]` - Get rental detail
- `PATCH /api/staff/rentals/[id]` - Update rental status
- `PATCH /api/staff/rentals/complete` - Mark rental completed & release vehicle
- `GET /api/staff/dashboard/stats` - Get dashboard metrics
- `GET /api/staff/payments` - List payments
- `POST /api/staff/payments` - Record payment (offline processing)
- `GET /api/staff/vehicles` - List vehicles

**Admin APIs** (Admin login):
- `GET /api/admin/rentals` - List all rentals
- `PATCH /api/admin/rentals/[id]` - Update rental (status, staff assignment)
- `GET /api/admin/stats` - Dashboard metrics
- `GET /api/admin/reports` - Business analytics
- `GET /api/admin/users` - List staff users
- `POST /api/admin/users` - Create staff user

---

This is a **complete, connected system** ready for real-world use! 🎉
