-- TRIGGER 1: Automatically update vehicle status when a rental is completed.
-- Also write to rental_audit so we have a history trail.
DELIMITER $$

CREATE TRIGGER trg_UpdateVehicleStatusOnRentalComplete
AFTER UPDATE ON rental_info
FOR EACH ROW
BEGIN
    -- Only run when status changes to Completed.
    IF NEW.Status = 'Completed' AND OLD.Status != 'Completed' THEN
        UPDATE vehicle_info 
        SET Status = 'Available'
        WHERE Vehicle_ID = NEW.Vehicle_ID;
        
        -- Insert audit record for status change.
        INSERT INTO rental_audit (Rental_ID, OldStatus, NewStatus, ChangedBy)
        VALUES (NEW.Rental_ID, OLD.Status, NEW.Status, NEW.User_ID);
    END IF;
END$$

DELIMITER ;

-- TRIGGER 2: Prevent double payment on a rental.
-- Enforces that each Rental_ID only has one payment.
DELIMITER $$

CREATE TRIGGER trg_PreventDoublePayment
BEFORE INSERT ON payment_info
FOR EACH ROW
BEGIN
    DECLARE v_ExistingPayment INT;
    
    -- Count existing payments for the same rental.
    SELECT COUNT(*) INTO v_ExistingPayment 
    FROM payment_info 
    WHERE Rental_ID = NEW.Rental_ID;
    
    IF v_ExistingPayment >= 1 THEN
        -- Raise an error and block the insert.
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'A payment for this rental already exists.';
    END IF;
END$$

DELIMITER ;
