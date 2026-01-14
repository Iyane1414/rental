# MySQL Workbench Setup Guide for YOLO Car Rental System

## Step 1: Install MySQL and MySQL Workbench

### On Windows:
1. Download MySQL Community Server from: https://dev.mysql.com/downloads/mysql/
2. Run the installer and follow the setup wizard
3. Choose "MySQL Server" and recommended settings
4. During configuration, set:
   - MySQL Server Port: `3306` (default)
   - MySQL Server root password: Set a strong password (remember this!)
5. Complete installation
6. Download MySQL Workbench from: https://dev.mysql.com/downloads/workbench/
7. Install Workbench using the installer

### On macOS:
```bash
# Using Homebrew (recommended)
brew install mysql
brew install mysql-workbench

# Start MySQL server
brew services start mysql

# Set root password (if needed)
mysql -u root -e "ALTER USER 'root'@'localhost' IDENTIFIED BY 'your_password';"
```

### On Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install mysql-server mysql-workbench

# Start MySQL service
sudo systemctl start mysql
```

---

## Step 2: Open MySQL Workbench and Create Connection

1. **Open MySQL Workbench**
   - Launch the application

2. **Create a New Connection**
   - Click the **"+"** button next to "MySQL Connections"
   - Or go to **Database** → **Manage Connections**

3. **Configure Connection Settings**
   - **Connection Name**: `YOLO_Car_Rental` (or any name you prefer)
   - **Connection Method**: `Standard (TCP/IP)`
   - **Hostname**: `localhost` or `127.0.0.1`
   - **Port**: `3306` (default)
   - **Username**: `root` (or your MySQL user)
   - **Password**: Leave blank for now, click **"Store in Keychain"** after setting password
   - Click **"Test Connection"**

4. **If Password is Required:**
   - Check **"Store in Keychain"**
   - Enter your MySQL root password
   - Click **"OK"**

5. **Test the Connection**
   - Click **"Test Connection"**
   - You should see "Connection successful" message
   - Click **"OK"** to save the connection

---

## Step 3: Connect to MySQL Server

1. **Double-click your connection** (YOLO_Car_Rental) to open it
2. You'll see the **SQL Editor** with a blank query window
3. The left panel shows "Administration" and "Schemas"

---

## Step 4: Create the Database

1. **Right-click on "Schemas"** in the left panel
2. Select **"Create Schema"**
3. In the dialog box:
   - **Name**: `yolo_car_rental`
   - **Charset**: `utf8mb4`
   - **Collation**: `utf8mb4_unicode_ci`
4. Click **"Apply"** then **"Finish"**
5. You'll see `yolo_car_rental` appear in the Schemas list

---

## Step 5: Run the SQL Scripts (In Order!)

**Important**: Run the scripts in this exact order:

### Script 1: Create Tables

1. Open the SQL file: `scripts/01_create_database.sql`
2. Copy all the content
3. In MySQL Workbench, paste it into the SQL Editor
4. Select all code: `Ctrl+A` (Windows/Linux) or `Cmd+A` (Mac)
5. Execute: Click **Execute** button (lightning icon) or press `Ctrl+Enter`
6. Check the **Output Panel** at the bottom - you should see no errors

**Expected Output**: All CREATE TABLE statements executed successfully

### Script 2: Add Stored Procedures

1. Open: `scripts/04_stored_procedures.sql`
2. Copy all content
3. Paste into a new SQL Editor tab
4. Execute with `Ctrl+Enter`
5. Verify success in the output panel

**Expected Output**: CREATE PROCEDURE statements completed

### Script 3: Add Triggers

1. Open: `scripts/05_triggers.sql`
2. Copy and paste into SQL Editor
3. Execute with `Ctrl+Enter`
4. Verify in output panel

**Expected Output**: CREATE TRIGGER statements completed

### Script 4: Insert Sample Data

1. Open: `scripts/06_sample_data.sql`
2. Copy and paste into SQL Editor
3. Execute with `Ctrl+Enter`
4. Verify data insertion in output

**Expected Output**: INSERT INTO statements completed

---

## Step 6: Verify Database Setup

To make sure everything was created correctly, run these verification queries:

```sql
-- Check all tables exist
SHOW TABLES FROM yolo_car_rental;

-- Check customer_info table structure
DESCRIBE yolo_car_rental.customer_info;

-- Check vehicle_info table structure
DESCRIBE yolo_car_rental.vehicle_info;

-- Check data was inserted
SELECT COUNT(*) as customer_count FROM yolo_car_rental.customer_info;
SELECT COUNT(*) as vehicle_count FROM yolo_car_rental.vehicle_info;
SELECT COUNT(*) as rental_count FROM yolo_car_rental.rental_info;
```

Run each query individually and check the results.

---

## Step 7: Configure Your Next.js Application

1. **Open your project** in your code editor (VS Code, etc.)

2. **Update `.env.local` file**:
   ```env
   DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/yolo_car_rental"
   ```
   Replace `YOUR_PASSWORD` with your MySQL root password

3. **Alternative using different user** (recommended for production):
   
   Create a dedicated MySQL user first:
   
   ```sql
   CREATE USER 'yolo_user'@'localhost' IDENTIFIED BY 'strong_password_here';
   GRANT ALL PRIVILEGES ON yolo_car_rental.* TO 'yolo_user'@'localhost';
   FLUSH PRIVILEGES;
   ```
   
   Then in `.env.local`:
   ```env
   DATABASE_URL="mysql://yolo_user:strong_password_here@localhost:3306/yolo_car_rental"
   ```

---

## Step 8: Test the Connection from Next.js

1. **Open terminal** in your project folder
2. **Run your development server**:
   ```bash
   npm run dev
   ```
3. **Visit** `http://localhost:3000`
4. If you see the app loading without database errors, the connection is working!

---

## Step 9: Test SQL Queries in Workbench

### Test Queries with JOINs:

```sql
-- Query 1: Get rental details with customer and vehicle info (JOIN)
SELECT 
  r.Rental_ID,
  c.Customer_Name,
  v.Brand,
  v.Model,
  r.StartDate,
  r.EndDate,
  r.TotalAmount
FROM yolo_car_rental.rental_info r
JOIN yolo_car_rental.customer_info c ON r.Customer_ID = c.Customer_ID
JOIN yolo_car_rental.vehicle_info v ON r.Vehicle_ID = v.Vehicle_ID
LIMIT 5;

-- Query 2: Get payment records with rental details (JOIN)
SELECT 
  p.Payment_ID,
  p.Amount,
  p.PaymentDate,
  r.Status,
  c.Customer_Name
FROM yolo_car_rental.payment_info p
JOIN yolo_car_rental.rental_info r ON p.Rental_ID = r.Rental_ID
JOIN yolo_car_rental.customer_info c ON r.Customer_ID = c.Customer_ID
LIMIT 5;
```

### Test Subqueries:

```sql
-- Get customers who spent more than average
SELECT 
  Customer_Name,
  (SELECT SUM(Amount) FROM yolo_car_rental.payment_info p 
   WHERE p.Rental_ID IN (SELECT Rental_ID FROM yolo_car_rental.rental_info 
   WHERE Customer_ID = customer_info.Customer_ID)) as total_spent
FROM yolo_car_rental.customer_info
WHERE Customer_ID IN (
  SELECT Customer_ID FROM yolo_car_rental.rental_info 
  GROUP BY Customer_ID 
  HAVING COUNT(*) > 1
);
```

### Test Stored Procedures:

```sql
-- Call the create rental procedure
CALL yolo_car_rental.sp_CreateRental(101, 201, 1, '2026-01-20', '2026-01-25');

-- Call the process payment procedure
CALL yolo_car_rental.sp_ProcessPayment(1, 1, 5000, 'Credit Card', 'Completed');
```

---

## Troubleshooting

### Error: "Connection refused (10061)"
- MySQL server is not running
- **Fix**: Start MySQL service
  - Windows: Search "Services" → Find "MySQL80" → Right-click → Start
  - Mac: `brew services start mysql`
  - Linux: `sudo systemctl start mysql`

### Error: "Access denied for user 'root'@'localhost'"
- Wrong password entered
- **Fix**: 
  - Reset MySQL root password (see MySQL docs)
  - Or use the correct password in connection settings

### Error: "Unknown database 'yolo_car_rental'"
- Database was not created
- **Fix**: Run Step 5 again to create the database

### Error: "Syntax error" when running scripts
- Script syntax is incorrect or using wrong SQL dialect
- **Fix**: 
  - Copy-paste the entire script at once
  - Make sure you're connected to correct database
  - Check for missing semicolons at end of statements

### Can't see tables in Workbench
- Tables created but not visible
- **Fix**: 
  - Click refresh icon (circular arrow) next to Schemas
  - Or close and reopen the connection

---

## Next Steps

1. ✅ Database connected in Workbench
2. ✅ Tables and procedures created
3. ✅ Sample data inserted
4. ✅ Next.js app configured
5. **Login to the app** with demo credentials:
   - Admin: `admin123` / `password`
   - Staff: `staff001` / `password`
6. Browse vehicles and test the booking system
7. View admin dashboard for statistics

---

## Quick Command Reference

| Task | Command |
|------|---------|
| Start MySQL (Linux) | `sudo systemctl start mysql` |
| Start MySQL (Mac) | `brew services start mysql` |
| Connect to MySQL | `mysql -u root -p` |
| Show databases | `SHOW DATABASES;` |
| Use database | `USE yolo_car_rental;` |
| Show tables | `SHOW TABLES;` |
| Show table structure | `DESCRIBE table_name;` |
| Show all data | `SELECT * FROM table_name;` |

---

## Support

If you encounter any issues:
1. Check that MySQL is running
2. Verify database connection in Workbench
3. Ensure all SQL scripts ran without errors
4. Check `.env.local` has correct DATABASE_URL
5. Clear npm cache: `npm cache clean --force`
6. Reinstall dependencies: `npm install`
