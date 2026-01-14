# MySQL Setup Guide for YOLO Car Rental

Complete step-by-step guide to set up the MySQL database for the YOLO Car Rental system.

## Prerequisites

- MySQL Server 8.0 or higher installed
- MySQL Workbench (recommended) or command-line MySQL client
- Administrator access to MySQL

## Option 1: Using MySQL Workbench (Recommended)

### Step 1: Open MySQL Workbench
1. Launch MySQL Workbench
2. Double-click your MySQL connection (default: localhost)
3. Enter password if prompted

### Step 2: Create Database
1. In the Query Editor, paste and run:
```sql
CREATE SCHEMA yolo_car_rental;
USE yolo_car_rental;
```
2. Press `Ctrl+Enter` or `Cmd+Enter` to execute

### Step 3: Run SQL Scripts in Order
Execute each script file in sequence:

#### Script 1: Create Tables (01_create_database.sql)
- File → Open SQL Script
- Select: `scripts/01_create_database.sql`
- Press `Ctrl+Shift+Enter` to execute
- ✅ Wait for completion message

#### Script 2: Add JOIN Queries (02_queries_with_joins.sql)
- File → Open SQL Script
- Select: `scripts/02_queries_with_joins.sql`
- Execute (these are just sample queries, no error if they fail)

#### Script 3: Add SUBQUERIEs (03_queries_with_subqueries.sql)
- File → Open SQL Script
- Select: `scripts/03_queries_with_subqueries.sql`
- Execute (sample queries only)

#### Script 4: Create Stored Procedures (04_stored_procedures.sql)
- File → Open SQL Script
- Select: `scripts/04_stored_procedures.sql`
- Press `Ctrl+Shift+Enter` to execute
- ⚠️ Important: Make sure no syntax errors

#### Script 5: Create Triggers (05_triggers.sql)
- File → Open SQL Script
- Select: `scripts/05_triggers.sql`
- Press `Ctrl+Shift+Enter` to execute
- ✅ Triggers are critical for data integrity

#### Script 6: Insert Sample Data (06_sample_data.sql)
- File → Open SQL Script
- Select: `scripts/06_sample_data.sql`
- Press `Ctrl+Shift+Enter` to execute
- ✅ Now you have test data to work with

### Step 4: Verify Installation

Run verification queries:
```sql
-- Check all tables created
SHOW TABLES IN yolo_car_rental;

-- Should show: customer_info, vehicle_info, user_info, rental_info, payment_info, rental_audit

-- Check sample data
SELECT COUNT(*) FROM customer_info;      -- Should be 5
SELECT COUNT(*) FROM vehicle_info;       -- Should be 6
SELECT COUNT(*) FROM user_info;          -- Should be 3
SELECT COUNT(*) FROM rental_info;        -- Should be 5
SELECT COUNT(*) FROM payment_info;       -- Should be 3

-- Test a JOIN query
SELECT 
    r.Rental_ID,
    c.Customer_Name,
    v.Brand,
    v.Model,
    r.Status
FROM rental_info r
INNER JOIN customer_info c ON r.Customer_ID = c.Customer_ID
INNER JOIN vehicle_info v ON r.Vehicle_ID = v.Vehicle_ID
LIMIT 5;

-- Test a stored procedure
CALL sp_CreateRental(
    1,                    -- p_CustomerID
    1,                    -- p_VehicleID
    1,                    -- p_UserID
    '2025-12-20',        -- p_StartDate
    '2025-12-25',        -- p_EndDate
    @rentalId,           -- OUT p_RentalID
    @success,            -- OUT p_Success
    @message             -- OUT p_Message
);
SELECT @rentalId, @success, @message;
```

## Option 2: Using Command Line

### Step 1: Connect to MySQL
```bash
mysql -u root -p
```
Enter your MySQL root password when prompted.

### Step 2: Create Database
```sql
CREATE SCHEMA yolo_car_rental;
USE yolo_car_rental;
EXIT;
```

### Step 3: Run SQL Scripts
Execute all scripts from your project directory:

```bash
# Script 1: Create tables
mysql -u root -p yolo_car_rental < scripts/01_create_database.sql

# Script 2: JOIN queries (informational only)
mysql -u root -p yolo_car_rental < scripts/02_queries_with_joins.sql

# Script 3: SUBQUERY queries (informational only)
mysql -u root -p yolo_car_rental < scripts/03_queries_with_subqueries.sql

# Script 4: Stored procedures
mysql -u root -p yolo_car_rental < scripts/04_stored_procedures.sql

# Script 5: Triggers
mysql -u root -p yolo_car_rental < scripts/05_triggers.sql

# Script 6: Sample data
mysql -u root -p yolo_car_rental < scripts/06_sample_data.sql
```

### Step 4: Verify
```bash
mysql -u root -p yolo_car_rental -e "SHOW TABLES;"
mysql -u root -p yolo_car_rental -e "SELECT COUNT(*) as UserCount FROM user_info;"
```

## Option 3: Using GUI Tools

### phpMyAdmin
1. Open phpMyAdmin in browser (usually: http://localhost/phpmyadmin)
2. Create database: `yolo_car_rental`
3. Select database
4. Import each SQL file via "Import" tab

### DBeaver
1. Create new MySQL connection
2. Right-click database → "Create New Database"
3. Name it `yolo_car_rental`
4. Right-click database → "Execute SQL Script"
5. Select and execute each SQL file in order

## Connection String Format

For `.env.local`:
```
DATABASE_URL="mysql://[username]:[password]@[host]:[port]/[database]"
```

### Examples:
```
# Local development
DATABASE_URL="mysql://root:password@localhost:3306/yolo_car_rental"

# Remote server
DATABASE_URL="mysql://user:pass@192.168.1.100:3306/yolo_car_rental"

# Docker container
DATABASE_URL="mysql://root:password@mysql-container:3306/yolo_car_rental"
```

## Troubleshooting

### "Access Denied" Error
```bash
# Verify MySQL is running
mysql -u root -p

# If connection fails, restart MySQL:
# On Windows:
net stop MySQL80
net start MySQL80

# On Mac (with Homebrew):
brew services restart mysql

# On Linux:
sudo service mysql restart
```

### "Database Already Exists" Error
```sql
-- Drop and recreate
DROP SCHEMA IF EXISTS yolo_car_rental;
CREATE SCHEMA yolo_car_rental;
USE yolo_car_rental;
```

### "Syntax Error" in Scripts
- Check file encoding is UTF-8
- Ensure no BOM (Byte Order Mark)
- Try running line-by-line in MySQL Workbench

### "Stored Procedure" Not Working
```sql
-- Check if procedure was created
SHOW PROCEDURE STATUS WHERE db='yolo_car_rental';

-- If not listed, re-run script 4
mysql -u root -p yolo_car_rental < scripts/04_stored_procedures.sql
```

### "Trigger" Not Working
```sql
-- Check if trigger exists
SHOW TRIGGERS FROM yolo_car_rental;

-- View trigger details
SELECT * FROM INFORMATION_SCHEMA.TRIGGERS 
WHERE TRIGGER_SCHEMA = 'yolo_car_rental';
```

## Testing the Database

### Test Data Integrity
```sql
-- Test 1: Verify foreign keys work
INSERT INTO rental_info (Customer_ID, Vehicle_ID, User_ID, StartDate, EndDate, TotalAmount, Status)
VALUES (999, 1, 1, '2025-12-20', '2025-12-25', 7500, 'Pending Payment');
-- Should fail: Customer_ID 999 doesn't exist

-- Test 2: Verify unique payment per rental
INSERT INTO payment_info (Rental_ID, Amount, PaymentDate, PaymentMethod, Status)
VALUES (1, 1000, '2025-01-14', 'Cash', 'Paid');
-- Should fail: Payment already exists for Rental_ID 1

-- Test 3: Test stored procedure
CALL sp_CreateRental(
    2,
    2,
    1,
    '2025-12-28',
    '2025-12-31',
    @id,
    @success,
    @msg
);
SELECT @id, @success, @msg;
```

## Backing Up Your Database

### Using MySQL Workbench
1. Server → Data Export
2. Select `yolo_car_rental` database
3. Choose export format (SQL recommended)
4. Click "Start Export"

### Using Command Line
```bash
mysqldump -u root -p yolo_car_rental > backup_yolo.sql

# To restore:
mysql -u root -p yolo_car_rental < backup_yolo.sql
```

### Using cron (Linux/Mac)
```bash
# Add to crontab
0 2 * * * mysqldump -u root -p'password' yolo_car_rental > /backups/yolo_$(date +\%Y\%m\%d).sql
```

## Next Steps

1. ✅ Verify all tables exist
2. ✅ Test sample queries
3. ✅ Update `.env.local` with connection string
4. ✅ Run: `npm run dev`
5. ✅ Test application at http://localhost:3000

## Getting Help

If you encounter issues:

1. **Check MySQL is running**:
   ```bash
   mysql -u root -p -e "SELECT 1;"
   ```

2. **Verify database exists**:
   ```bash
   mysql -u root -p -e "SHOW DATABASES LIKE 'yolo_car_rental';"
   ```

3. **Check tables**:
   ```bash
   mysql -u root -p yolo_car_rental -e "SHOW TABLES;"
   ```

4. **Review application logs**:
   ```bash
   npm run dev  # Look for database connection errors
