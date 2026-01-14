-- Fixed LEAVE statements - replaced with proper error handling
DELIMITER $$

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
BEGIN
    DECLARE v_DailyRate DECIMAL(10, 2);
    DECLARE v_DaysRented INT;
    DECLARE v_TotalAmount DECIMAL(10, 2);
    DECLARE v_VehicleStatus VARCHAR(20);
    DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
    BEGIN
        SET p_Success = FALSE;
        SET p_Message = 'Error creating rental. Please check vehicle availability.';
    END;

    -- Validate vehicle status
    SELECT Status INTO v_VehicleStatus FROM vehicle_info WHERE Vehicle_ID = p_VehicleID;
    
    IF v_VehicleStatus NOT IN ('Available', 'Reserved') THEN
        SET p_Success = FALSE;
        SET p_Message = CONCAT('Vehicle is ', v_VehicleStatus, '. Not available for rental.');
        SET p_RentalID = 0;
    ELSE
        -- Get daily rate and calculate total
        SELECT DailyRate INTO v_DailyRate FROM vehicle_info WHERE Vehicle_ID = p_VehicleID;
        SET v_DaysRented = DATEDIFF(p_EndDate, p_StartDate) + 1;
        SET v_TotalAmount = v_DaysRented * v_DailyRate;

        -- Create rental
        INSERT INTO rental_info (Customer_ID, Vehicle_ID, User_ID, StartDate, EndDate, TotalAmount, Status)
        VALUES (p_CustomerID, p_VehicleID, p_UserID, p_StartDate, p_EndDate, v_TotalAmount, 'Pending Payment');

        SET p_RentalID = LAST_INSERT_ID();
        SET p_Success = TRUE;
        SET p_Message = CONCAT('Rental created successfully. Total Amount: PHP ', v_TotalAmount);
    END IF;
END$$

DELIMITER ;

-- STORED PROCEDURE 2: Process payment and update rental status
DELIMITER $$

CREATE PROCEDURE sp_ProcessPayment(
    IN p_RentalID INT,
    IN p_Amount DECIMAL(10, 2),
    IN p_PaymentDate DATE,
    IN p_PaymentMethod VARCHAR(30),
    OUT p_PaymentID INT,
    OUT p_Success BOOLEAN,
    OUT p_Message VARCHAR(255)
)
BEGIN
    DECLARE v_RentalStatus VARCHAR(20);
    DECLARE v_TotalAmount DECIMAL(10, 2);
    DECLARE v_VehicleID INT;
    DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
    BEGIN
        SET p_Success = FALSE;
        SET p_Message = 'Error processing payment.';
    END;

    START TRANSACTION;

    -- Check rental exists and get details
    SELECT Status, TotalAmount, Vehicle_ID INTO v_RentalStatus, v_TotalAmount, v_VehicleID
    FROM rental_info WHERE Rental_ID = p_RentalID;

    IF v_RentalStatus IS NULL THEN
        SET p_Success = FALSE;
        SET p_Message = 'Rental not found.';
        ROLLBACK;
    ELSE
        -- Create payment record
        INSERT INTO payment_info (Rental_ID, Amount, PaymentDate, PaymentMethod, Status)
        VALUES (p_RentalID, p_Amount, p_PaymentDate, p_PaymentMethod, 'Paid');

        SET p_PaymentID = LAST_INSERT_ID();

        -- Update rental status to Ongoing
        UPDATE rental_info 
        SET Status = 'Ongoing'
        WHERE Rental_ID = p_RentalID;

        -- Update vehicle status to Rented
        UPDATE vehicle_info 
        SET Status = 'Rented'
        WHERE Vehicle_ID = v_VehicleID;

        COMMIT;
        SET p_Success = TRUE;
        SET p_Message = 'Payment processed successfully.';
    END IF;
END$$

DELIMITER ;
