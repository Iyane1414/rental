-- QUERY 1: JOIN - Get all rentals with customer and vehicle details.
-- INNER JOIN keeps only rows that have matching customer + vehicle records.
SELECT 
    r.Rental_ID,
    c.Customer_Name,
    c.Email,
    v.Brand,
    v.Model,
    v.PlateNo,
    r.StartDate,
    r.EndDate,
    r.TotalAmount,
    r.Status
FROM rental_info r
INNER JOIN customer_info c ON r.Customer_ID = c.Customer_ID -- join rentals to customers
INNER JOIN vehicle_info v ON r.Vehicle_ID = v.Vehicle_ID -- join rentals to vehicles
ORDER BY r.CreatedAt DESC;

-- QUERY 2: JOIN - Get all payments with rental, customer, and vehicle info.
-- Filter to only show payments that are marked Paid.
SELECT 
    p.Payment_ID,
    p.Amount,
    p.PaymentDate,
    p.PaymentMethod,
    p.Status,
    r.Rental_ID,
    c.Customer_Name,
    c.Email,
    v.Brand,
    v.Model
FROM payment_info p
INNER JOIN rental_info r ON p.Rental_ID = r.Rental_ID -- join payments to rentals
INNER JOIN customer_info c ON r.Customer_ID = c.Customer_ID -- join rentals to customers
INNER JOIN vehicle_info v ON r.Vehicle_ID = v.Vehicle_ID -- join rentals to vehicles
WHERE p.Status = 'Paid'
ORDER BY p.PaymentDate DESC;
