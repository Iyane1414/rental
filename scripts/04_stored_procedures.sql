-- ============================================================
-- STORED PROCEDURES (MySQL-correct DECLARE ordering)
-- ============================================================

-- Drop first so CREATE works on re-run.
DROP PROCEDURE IF EXISTS sp_CreateRental;
DROP PROCEDURE IF EXISTS sp_ProcessPayment;

-- Change delimiter to allow procedure bodies that use semicolons.
DELIMITER $$

-- Create rental procedure (returns RentalID + status message).
CREATE PROCEDURE sp_CreateRental(
    IN p_CustomerID INT,
    IN p_VehicleID INT,
    IN p_UserID INT,
    IN p_StartDate DATE,
    IN p_EndDate DATE,
    OUT p_RentalID INT,
    OUT p_Success BOOLEAN,
    OUT p_Message VARCHAR(255)
)
proc: BEGIN -- label so we can LEAVE early
    -- DECLAREs MUST come first
    DECLARE v_DailyRate DECIMAL(10, 2);
    DECLARE v_DaysRented INT;
    DECLARE v_TotalAmount DECIMAL(10, 2);

    -- Exit handler rolls back and sets error outputs on SQL error.
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_RentalID = 0;
        SET p_Success = FALSE;
        SET p_Message = 'Error creating rental. Transaction rolled back.';
    END;

    -- Default outputs (must be set after DECLAREs).
    SET p_RentalID = 0;
    SET p_Success = FALSE;
    SET p_Message = 'Unknown error.';

    -- Basic validation
    IF p_StartDate IS NULL OR p_EndDate IS NULL THEN
        SET p_Message = 'Start date and end date are required.';
        LEAVE proc;
    END IF;

    IF p_EndDate < p_StartDate THEN
        SET p_Message = 'End date cannot be earlier than start date.';
        LEAVE proc;
    END IF;

    START TRANSACTION; -- begin atomic operation

    -- Confirm vehicle exists + get daily rate.
    SELECT DailyRate
    INTO v_DailyRate
    FROM vehicle_info
    WHERE Vehicle_ID = p_VehicleID;

    IF v_DailyRate IS NULL THEN
        ROLLBACK;
        SET p_Message = 'Vehicle not found.';
        LEAVE proc;
    END IF;

    -- Check overlap with active rentals (date conflict).
    IF EXISTS (
        SELECT 1
        FROM rental_info
        WHERE Vehicle_ID = p_VehicleID
          AND Status IN ('Pending Payment', 'Ongoing', 'Reserved')
          AND NOT (p_EndDate < StartDate OR p_StartDate > EndDate)
    ) THEN
        ROLLBACK;
        SET p_Message = 'Vehicle already booked for selected dates.';
        LEAVE proc;
    END IF;

    -- Calculate total (days * daily rate).
    SET v_DaysRented = DATEDIFF(p_EndDate, p_StartDate) + 1;
    SET v_TotalAmount = v_DaysRented * v_DailyRate;

    -- Create rental with Pending Payment status.
    INSERT INTO rental_info (
        Customer_ID, Vehicle_ID, User_ID,
        StartDate, EndDate, TotalAmount, Status
    )
    VALUES (
        p_CustomerID, p_VehicleID, p_UserID,
        p_StartDate, p_EndDate, v_TotalAmount, 'Pending Payment'
    );

    SET p_RentalID = LAST_INSERT_ID();

    COMMIT; -- persist rental

    SET p_Success = TRUE;
    SET p_Message = CONCAT('Rental created successfully. Total Amount: PHP ', FORMAT(v_TotalAmount, 2));
END$$


-- Process payment procedure (returns PaymentID + status message).
CREATE PROCEDURE sp_ProcessPayment(
    IN p_RentalID INT,
    IN p_Amount DECIMAL(10, 2),
    IN p_PaymentDate DATE,
    IN p_PaymentMethod VARCHAR(30),
    OUT p_PaymentID INT,
    OUT p_Success BOOLEAN,
    OUT p_Message VARCHAR(255)
)
proc: BEGIN -- label so we can LEAVE early
    -- DECLAREs MUST come first
    DECLARE v_RentalStatus VARCHAR(20);
    DECLARE v_TotalAmount DECIMAL(10, 2);
    DECLARE v_VehicleID INT;

    -- Exit handler rolls back and sets error outputs on SQL error.
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_PaymentID = 0;
        SET p_Success = FALSE;
        SET p_Message = 'Error processing payment. Transaction rolled back (duplicate payment / invalid rental).';
    END;

    -- Default outputs (must be set after DECLAREs).
    SET p_PaymentID = 0;
    SET p_Success = FALSE;
    SET p_Message = 'Unknown error.';

    -- Input validation
    IF p_RentalID IS NULL OR p_RentalID <= 0 THEN
        SET p_Message = 'Invalid Rental_ID.';
        LEAVE proc;
    END IF;

    IF p_PaymentDate IS NULL THEN
        SET p_Message = 'Payment date is required.';
        LEAVE proc;
    END IF;

    IF p_Amount IS NULL OR p_Amount <= 0 THEN
        SET p_Message = 'Payment amount must be greater than 0.';
        LEAVE proc;
    END IF;

    START TRANSACTION; -- begin atomic operation

    -- Lock rental row so status is consistent while we process payment.
    SELECT Status, TotalAmount, Vehicle_ID
    INTO v_RentalStatus, v_TotalAmount, v_VehicleID
    FROM rental_info
    WHERE Rental_ID = p_RentalID
    FOR UPDATE;

    IF v_RentalStatus IS NULL THEN
        ROLLBACK;
        SET p_Message = 'Rental not found.';
        LEAVE proc;
    END IF;

    -- Must be Pending Payment to accept payment.
    IF v_RentalStatus <> 'Pending Payment' THEN
        ROLLBACK;
        SET p_Message = CONCAT('Payment not allowed. Rental status is: ', v_RentalStatus);
        LEAVE proc;
    END IF;

    -- Prevent double payment.
    IF EXISTS (SELECT 1 FROM payment_info WHERE Rental_ID = p_RentalID) THEN
        ROLLBACK;
        SET p_Message = 'Payment already exists for this rental.';
        LEAVE proc;
    END IF;

    -- Ensure amount covers total.
    IF p_Amount < v_TotalAmount THEN
        ROLLBACK;
        SET p_Message = CONCAT('Insufficient payment. Total is PHP ', FORMAT(v_TotalAmount, 2));
        LEAVE proc;
    END IF;

    -- Insert payment record.
    INSERT INTO payment_info (Rental_ID, Amount, PaymentDate, PaymentMethod, Status)
    VALUES (p_RentalID, p_Amount, p_PaymentDate, p_PaymentMethod, 'Paid');

    SET p_PaymentID = LAST_INSERT_ID();

    -- Update rental status to Ongoing.
    UPDATE rental_info
    SET Status = 'Ongoing'
    WHERE Rental_ID = p_RentalID;

    COMMIT; -- persist payment + rental status

    SET p_Success = TRUE;
    SET p_Message = 'Payment processed successfully.';
END$$

DELIMITER ;
