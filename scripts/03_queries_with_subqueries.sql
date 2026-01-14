-- SUBQUERY 1: Find customers with multiple rentals and their total spending
SELECT 
    c.Customer_ID,
    c.Customer_Name,
    c.Email,
    COUNT(r.Rental_ID) as TotalRentals,
    SUM(r.TotalAmount) as TotalSpent,
    AVG(r.TotalAmount) as AvgRentalAmount
FROM customer_info c
INNER JOIN rental_info r ON c.Customer_ID = r.Customer_ID
WHERE c.Customer_ID IN (
    SELECT Customer_ID 
    FROM rental_info 
    GROUP BY Customer_ID 
    HAVING COUNT(Rental_ID) > 1
)
GROUP BY c.Customer_ID, c.Customer_Name, c.Email
ORDER BY TotalSpent DESC;

-- SUBQUERY 2: Get vehicles that were rented during a specific date range
SELECT 
    v.Vehicle_ID,
    v.Brand,
    v.Model,
    v.PlateNo,
    v.DailyRate,
    v.Status,
    (
        SELECT COUNT(*) 
        FROM rental_info 
        WHERE Vehicle_ID = v.Vehicle_ID 
        AND Status IN ('Ongoing', 'Completed')
    ) as TotalTimesRented
FROM vehicle_info v
WHERE v.Vehicle_ID IN (
    SELECT DISTINCT Vehicle_ID 
    FROM rental_info 
    WHERE StartDate >= '2025-01-01' 
    AND EndDate <= '2025-12-31'
)
ORDER BY TotalTimesRented DESC;
