<<<<<<< HEAD
# rental
=======
# YOLO Car Rental System 🚗

A full-stack car rental management system built with modern web technologies. Features both public-facing booking interface and comprehensive admin dashboard.

## Features

### 🌐 Public Interface
- **Vehicle Browse & Filter**: Search cars by brand, model, year, and price range
- **Easy Booking**: Simple 3-step booking process
- **Payment Processing**: Support for Cash, Credit Card, GCash, and Bank Transfer
- **Booking Confirmation**: Instant payment success confirmation

### 👨‍💼 Admin Dashboard
- **KPI Dashboard**: Real-time metrics (active rentals, revenue, vehicle status)
- **Vehicle Management**: Add, edit, and manage vehicle fleet
- **Rental Management**: Create and track rental transactions
- **Customer Management**: View customer profiles and rental history
- **Payment Tracking**: Process and monitor payments
- **Reports & Analytics**: Business insights and utilization metrics

### 💾 Database Features
- **Advanced SQL Queries**: 2 JOINs for multi-table data retrieval
- **Subqueries**: Complex customer and vehicle analytics
- **Stored Procedures**: Automated rental creation and payment processing
- **Triggers**: Automatic status updates and data integrity checks

## Technology Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **UI Framework**: Tailwind CSS 4, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: MySQL with Prisma ORM
- **Authentication**: Session-based with bcryptjs
- **Design**: Modern, responsive, professional

## Project Structure

```
yolo-car-rental/
├── app/
│   ├── (auth)/login/              # Login page
│   ├── (public)/                  # Public pages
│   │   ├── page.tsx               # Home page
│   │   ├── browse-vehicles/       # Vehicle listing
│   │   ├── book-vehicle/[id]/     # Booking form
│   │   └── payment/[id]/          # Payment processing
│   ├── admin/                     # Admin pages
│   │   ├── dashboard/             # Dashboard
│   │   ├── vehicles/              # Vehicle management
│   │   ├── rentals/               # Rental management
│   │   ├── customers/             # Customer management
│   │   └── payments/              # Payment management
│   ├── api/                       # API routes
│   │   ├── auth/                  # Authentication
│   │   ├── admin/                 # Admin endpoints
│   │   └── public/                # Public endpoints
│   ├── globals.css                # Global styles
│   └── layout.tsx                 # Root layout
├── components/
│   ├── ui/                        # Shadcn UI components
│   └── admin/dashboard-layout.tsx # Admin layout
├── lib/
│   ├── auth.ts                    # Auth utilities
│   └── db.ts                      # Prisma client
├── prisma/
│   └── schema.prisma              # Database schema
├── scripts/
│   ├── 01_create_database.sql     # Table creation
│   ├── 02_queries_with_joins.sql  # JOIN examples
│   ├── 03_queries_with_subqueries.sql
│   ├── 04_stored_procedures.sql
│   ├── 05_triggers.sql
│   └── 06_sample_data.sql
└── docs/
    ├── SETUP_GUIDE.md
    └── QUICK_START.md
```

## Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- npm or yarn

### Installation

1. **Clone & Install**
```bash
npm install
```

2. **Create Database**
```bash
# Create MySQL database
mysql -u root -p
CREATE SCHEMA yolo_car_rental;
exit

# Run SQL scripts
mysql -u root -p yolo_car_rental < scripts/01_create_database.sql
mysql -u root -p yolo_car_rental < scripts/02_queries_with_joins.sql
mysql -u root -p yolo_car_rental < scripts/03_queries_with_subqueries.sql
mysql -u root -p yolo_car_rental < scripts/04_stored_procedures.sql
mysql -u root -p yolo_car_rental < scripts/05_triggers.sql
mysql -u root -p yolo_car_rental < scripts/06_sample_data.sql
```

3. **Configure Environment**
Create `.env.local`:
```
DATABASE_URL="mysql://username:password@localhost:3306/yolo_car_rental"
```

4. **Run Application**
```bash
npm run dev
```

Visit: http://localhost:3000

## Demo Credentials

### Admin Account
- **Username**: admin123
- **Password**: password
- **Access**: Full admin dashboard

### Staff Account
- **Username**: staff001
- **Password**: password
- **Access**: Staff dashboard

## Database Schema

### Core Tables
- **customer_info**: Customer details and contact information
- **vehicle_info**: Vehicle inventory with rates and availability
- **rental_info**: Rental transactions with dates and amounts
- **payment_info**: Payment records (1 per rental)
- **user_info**: Admin and staff accounts

### SQL Features

**2 JOINs**
- Get rentals with customer and vehicle details
- Fetch payments with complete rental chain

**2 Subqueries**
- Customer spending analysis (total spent, rental count, averages)
- Vehicle rental frequency and utilization tracking

**2 Stored Procedures**
- `sp_CreateRental`: Auto-calculates totals, validates availability
- `sp_ProcessPayment`: Handles payment, updates statuses

**2 Triggers**
- Auto-update vehicle to "Available" on rental completion
- Prevent duplicate payments on same rental

## API Endpoints

### Public
```
GET    /api/public/vehicles           # List available vehicles
GET    /api/public/vehicles/[id]      # Vehicle details
POST   /api/public/bookings           # Create booking
POST   /api/public/payments           # Process payment
GET    /api/rental/[id]               # Get rental details
```

### Admin
```
GET    /api/admin/stats               # Dashboard statistics
GET    /api/admin/vehicles            # All vehicles
POST   /api/admin/vehicles            # Add vehicle
GET    /api/admin/rentals             # All rentals
PATCH  /api/admin/rentals/[id]        # Update rental
GET    /api/admin/customers           # All customers
GET    /api/admin/payments            # All payments
```

### Authentication
```
POST   /api/auth/login                # User login
```

## Configuration

### Environment Variables
```env
# Database
DATABASE_URL=mysql://user:pass@localhost:3306/yolo_car_rental

# Optional: CORS, Session Secret, etc.
# Add as needed for production
```

## Deployment

### Vercel Deployment
```bash
# Push to GitHub, connect to Vercel
# Environment variables auto-configured through dashboard
npm run build
npm start
```

### Manual Deployment
```bash
npm run build
npm start
```

## Troubleshooting

### Database Connection Issues
```bash
# Verify MySQL is running
mysql -u root -p -e "SHOW DATABASES;"

# Check connection string in .env.local
# Ensure database exists: yolo_car_rental
```

### Prisma Issues
```bash
# Regenerate Prisma client
npx prisma generate

# Clear cache and reinstall
rm -rf node_modules/.prisma
npm install
```

### Port Already in Use
```bash
npm run dev -- -p 3001
```

## Performance Tips

1. **Caching**: API responses are cached where appropriate
2. **Indexing**: Database queries optimized with indexes
3. **Pagination**: Implement for large datasets
4. **Image Optimization**: Use Next.js Image component

## Security Considerations

1. **Authentication**: Session-based with secure password hashing
2. **Input Validation**: All user inputs validated
3. **SQL Injection**: Prevented through Prisma parameterized queries
4. **CORS**: Configure for production environment
5. **Rate Limiting**: Implement for production APIs

## Future Enhancements

- [ ] Email notifications for bookings
- [ ] SMS updates for customers
- [ ] Real payment gateway integration (Stripe)
- [ ] Advanced Auth (OAuth2, 2FA)
- [ ] File uploads for ID verification
- [ ] Reservation system
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Real-time notifications
- [ ] Advanced analytics & reporting

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License - see LICENSE file for details.

## Support

For issues, questions, or suggestions:
1. Check existing GitHub issues
2. Create a new issue with detailed description
3. Include screenshots/logs if applicable

## Authors

- YOLO Development Team

## Acknowledgments

- Next.js and React communities
- Tailwind CSS for styling
- shadcn/ui for component library
- Prisma for database ORM
>>>>>>> 920707f (Initial commit)
