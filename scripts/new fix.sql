-- pang check ng datatype at data
DESCRIBE vehicle_info;
DESCRIBE rental_info;
DESCRIBE payment_info;
DESCRIBE user_info;
DESCRIBE customer_info;

-- para macheck kung updated base sa current date.
ALTER TABLE vehicle_info
MODIFY UpdatedAt DATETIME(3) NOT NULL
DEFAULT CURRENT_TIMESTAMP(3)
ON UPDATE CURRENT_TIMESTAMP(3);
