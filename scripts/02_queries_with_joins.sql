-- QUERY 1: JOIN - Get all rentals with customer and vehicle details
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
INNER JOIN customer_info c ON r.Customer_ID = c.Customer_ID
INNER JOIN vehicle_info v ON r.Vehicle_ID = v.Vehicle_ID
ORDER BY r.CreatedAt DESC;

-- QUERY 2: JOIN - Get all payments with rental and customer information
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
INNER JOIN rental_info r ON p.Rental_ID = r.Rental_ID
INNER JOIN customer_info c ON r.Customer_ID = c.Customer_ID
INNER JOIN vehicle_info v ON r.Vehicle_ID = v.Vehicle_ID
WHERE p.Status = 'Paid'
ORDER BY p.PaymentDate DESC;
