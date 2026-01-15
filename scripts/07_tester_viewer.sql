-- ============================================================
-- YOLO Car Rental - Viewer + Tester Script
-- ============================================================
-- Purpose:
-- 1) View table contents quickly.
-- 2) Test stored procedures with sample calls.

-- Use the correct database.
USE yolo_car_rental;

-- ------------------------------------------------------------
-- VIEWER QUERIES (quick inspection)
-- ------------------------------------------------------------
SELECT * FROM customer_info;
SELECT * FROM vehicle_info;
SELECT * FROM user_info;
SELECT * FROM rental_info;
SELECT * FROM payment_info;
SELECT * FROM rental_audit;

-- Optional: quick counts for each table.
SELECT 'customer_info' AS table_name, COUNT(*) AS total_rows FROM customer_info;
SELECT 'vehicle_info' AS table_name, COUNT(*) AS total_rows FROM vehicle_info;
SELECT 'user_info' AS table_name, COUNT(*) AS total_rows FROM user_info;
SELECT 'rental_info' AS table_name, COUNT(*) AS total_rows FROM rental_info;
SELECT 'payment_info' AS table_name, COUNT(*) AS total_rows FROM payment_info;
SELECT 'rental_audit' AS table_name, COUNT(*) AS total_rows FROM rental_audit;

-- ------------------------------------------------------------
-- TESTER: CALL STORED PROCEDURES
-- ------------------------------------------------------------

-- Example: create a rental (adjust IDs and dates as needed).
-- Output variables (session variables start with @).
SET @p_RentalID = 0;
SET @p_Success = FALSE;
SET @p_Message = '';

CALL sp_CreateRental(
  1, -- p_CustomerID (must exist)
  1, -- p_VehicleID (must exist)
  1, -- p_UserID (admin/staff user)
  '2026-02-01', -- p_StartDate
  '2026-02-03', -- p_EndDate
  @p_RentalID,
  @p_Success,
  @p_Message
);

-- Check the outputs from sp_CreateRental.
SELECT @p_RentalID AS RentalID, @p_Success AS Success, @p_Message AS Message;

-- Example: process payment for the created rental.
SET @p_PaymentID = 0;
SET @p_PaySuccess = FALSE;
SET @p_PayMessage = '';

CALL sp_ProcessPayment(
  @p_RentalID, -- p_RentalID (from previous call)
  5000.00, -- p_Amount (must cover total)
  '2026-02-01', -- p_PaymentDate
  'Cash', -- p_PaymentMethod
  @p_PaymentID,
  @p_PaySuccess,
  @p_PayMessage
);

-- Check the outputs from sp_ProcessPayment.
SELECT @p_PaymentID AS PaymentID, @p_PaySuccess AS Success, @p_PayMessage AS Message;

-- ------------------------------------------------------------
-- OPTIONAL: VERIFY RESULTS
-- ------------------------------------------------------------
SELECT * FROM rental_info ORDER BY Rental_ID DESC LIMIT 5;
SELECT * FROM payment_info ORDER BY Payment_ID DESC LIMIT 5;

-- Optional trigger test (uncomment to run):
-- UPDATE rental_info
-- SET Status = 'Completed'
-- WHERE Rental_ID = @p_RentalID;

-- Check audit log after status change.
-- SELECT * FROM rental_audit ORDER BY Audit_ID DESC LIMIT 5;
