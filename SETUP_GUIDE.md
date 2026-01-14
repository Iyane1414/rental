# YOLO Car Rental System - Complete Setup Guide

## Overview
This is a full-stack car rental management system built with Next.js, TypeScript, Prisma, Tailwind CSS, and MySQL. It includes admin and public interfaces with advanced database features.

## Database Requirements
- **2 JOINs**: Used in queries to fetch rentals with customer and vehicle details, and payments with rental information
- **2 SUBQUERIEs**: Customer spending analysis and vehicle rental history tracking
- **2 Stored Procedures**: Rental creation with automatic calculations and payment processing
- **2 Triggers**: Automatic vehicle status updates and duplicate payment prevention

## Setup Instructions

### Step 1: Create MySQL Database
1. Open MySQL Workbench
2. Connect to your MySQL server
3. Create a new schema called `yolo_car_rental`:
   ```sql
   CREATE SCHEMA yolo_car_rental;
   ```
4. Run the SQL scripts in order:
   - `scripts/01_create_database.sql` - Creates all tables and indexes
   - `scripts/02_queries_with_joins.sql` - Sample JOIN queries
   - `scripts/03_queries_with_subqueries.sql` - Sample SUBQUERY queries
   - `scripts/04_stored_procedures.sql` - Creates 2 stored procedures
   - `scripts/05_triggers.sql` - Creates 2 triggers
   - `scripts/06_sample_data.sql` - Inserts sample data

### Step 2: Environment Configuration
1. Create a `.env.local` file in the root directory
2. Add your database connection string:
   ```
   DATABASE_URL="mysql://username:password@localhost:3306/yolo_car_rental"
   ```
3. Replace `username` and `password` with your MySQL credentials

### Step 3: Install Dependencies
```bash
npm install
```

### Step 4: Setup Prisma
```bash
npx prisma generate
npx prisma db push
```

### Step 5: Run the Application
```bash
npm run dev
```

Visit `http://localhost:3000`

## Database Schema

### Tables
1. **customer_info** - Customer details
2. **vehicle_info** - Vehicle fleet information
3. **user_info** - Admin and staff accounts
4. **rental_info** - Rental transactions
5. **payment_info** - Payment records (exactly one per rental)
6. **rental_audit** - Audit trail for rental changes

### Key Features

#### 2 Stored Procedures
1. **sp_CreateRental** - Automatically calculates rental total and validates vehicle availability
2. **sp_ProcessPayment** - Processes payment and updates rental/vehicle status

#### 2 Triggers
1. **trg_UpdateVehicleStatusOnRentalComplete** - Updates vehicle to "Available" when rental completes
2. **trg_PreventDoublePayment** - Prevents multiple payments for the same rental

## Demo Credentials

### Admin Account
- **Username**: admin123
- **Password**: password

### Staff Account
- **Username**: staff001
- **Password**: password

## Features

### Public User Features
- Browse available vehicles with filters
- Book vehicles and calculate rental costs automatically
- Process payments (Cash, Credit Card, GCash, Bank Transfer)
- Receive payment confirmation

### Admin/Staff Features
- Dashboard with key metrics (active rentals, revenue, etc.)
- Vehicle management (CRUD operations)
- Customer management
- Rental management
- Payment processing
- Reports and analytics

## API Endpoints

### Public
- `GET /api/public/vehicles` - List available vehicles
- `GET /api/public/vehicles/[id]` - Get vehicle details
- `POST /api/public/bookings` - Create a new booking
- `POST /api/public/payments` - Process payment

### Admin
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/vehicles` - All vehicles
- `POST /api/admin/vehicles` - Add new vehicle
- `GET /api/admin/rentals` - All rentals
- `GET /api/admin/customers` - All customers

### Auth
- `POST /api/auth/login` - User login

## Technical Stack
- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: MySQL
- **ORM**: Prisma
- **Authentication**: Session-based (can be enhanced with Auth.js)

## Running SQL Scripts

To execute the SQL scripts:

1. **Option 1: MySQL Workbench**
   - Open each `.sql` file in MySQL Workbench
   - Execute (Ctrl+Shift+Enter or ⌘+Shift+Enter on Mac)

2. **Option 2: Command Line**
   ```bash
   mysql -u username -p yolo_car_rental < scripts/01_create_database.sql
   mysql -u username -p yolo_car_rental < scripts/02_queries_with_joins.sql
   mysql -u username -p yolo_car_rental < scripts/03_queries_with_subqueries.sql
   mysql -u username -p yolo_car_rental < scripts/04_stored_procedures.sql
   mysql -u username -p yolo_car_rental < scripts/05_triggers.sql
   mysql -u username -p yolo_car_rental < scripts/06_sample_data.sql
   ```

## Troubleshooting

### Connection Error
- Verify MySQL is running: `mysql -u username -p`
- Check DATABASE_URL in `.env.local`
- Ensure database name matches `yolo_car_rental`

### Prisma Issues
- Clear Prisma cache: `rm -rf node_modules/.prisma`
- Regenerate: `npx prisma generate`

### Payment Process Issues
- Verify rental exists before payment
- Check rental status is "Pending Payment"
- Ensure vehicle availability

## Next Steps for Enhancement
1. Add email notifications for confirmations
2. Implement advanced reporting and analytics
3. Add real payment gateway integration (Stripe)
4. Implement real authentication (Auth.js/NextAuth)
5. Add file uploads for license verification
6. Implement reservation system
7. Add multi-language support
