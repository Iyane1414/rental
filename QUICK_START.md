# YOLO Car Rental - Quick Start Guide

## Installation (5 minutes)

### 1. Install & Setup Database
```bash
# Create MySQL database
mysql -u root -p
CREATE SCHEMA yolo_car_rental;
exit

# Run all SQL scripts in order
mysql -u root -p yolo_car_rental < scripts/01_create_database.sql
mysql -u root -p yolo_car_rental < scripts/02_queries_with_joins.sql
mysql -u root -p yolo_car_rental < scripts/03_queries_with_subqueries.sql
mysql -u root -p yolo_car_rental < scripts/04_stored_procedures.sql
mysql -u root -p yolo_car_rental < scripts/05_triggers.sql
mysql -u root -p yolo_car_rental < scripts/06_sample_data.sql
```

### 2. Configure Environment
Create `.env.local`:
```
DATABASE_URL="mysql://root:your_password@localhost:3306/yolo_car_rental"
```

### 3. Install & Run
```bash
npm install
npm run dev
```

Visit: http://localhost:3000

## Demo Logins
- **Admin**: admin123 / password
- **Staff**: staff001 / password

## SQL Features Included

### 2 JOINs ✅
- Rental details with customer & vehicle information
- Payment records with complete rental chain

### 2 SUBQUERIEs ✅
- Customer spending analysis
- Vehicle rental frequency tracking

### 2 Stored Procedures ✅
- `sp_CreateRental` - Auto-calculates totals
- `sp_ProcessPayment` - Handles payments & status updates

### 2 Triggers ✅
- Auto-update vehicle status on rental completion
- Prevent duplicate payments

## File Structure
```
├── scripts/                    # SQL files
│   ├── 01_create_database.sql
│   ├── 02_queries_with_joins.sql
│   ├── 03_queries_with_subqueries.sql
│   ├── 04_stored_procedures.sql
│   ├── 05_triggers.sql
│   └── 06_sample_data.sql
├── app/
│   ├── (auth)/                # Login pages
│   ├── (public)/              # Public pages
│   ├── admin/                 # Admin dashboard
│   └── api/                   # API routes
├── components/                # React components
├── lib/                       # Utilities
└── prisma/
    └── schema.prisma          # Database schema
```

## Features

### Public Users
- ✅ Browse vehicles
- ✅ Filter by brand, model, price
- ✅ Book vehicles
- ✅ Process payments

### Admin/Staff
- ✅ Dashboard KPIs
- ✅ Vehicle management (CRUD)
- ✅ Customer management
- ✅ Rental management
- ✅ Payment processing
- ✅ Reports

## Key Technologies
- Next.js 16 (App Router)
- TypeScript
- Prisma ORM
- MySQL
- Tailwind CSS 4
- React 19

## Troubleshooting

**Database connection error?**
- Check MySQL is running
- Verify DATABASE_URL in .env.local
- Run: `mysql -u root -p -e "SHOW DATABASES;"`

**Prisma errors?**
```bash
rm -rf node_modules/.prisma
npx prisma generate
```

**Port 3000 already in use?**
```bash
npm run dev -- -p 3001
```

## Next Steps
1. Deploy to Vercel
2. Add email notifications
3. Integrate real payment gateway
4. Add photo uploads
5. Implement advanced analytics
