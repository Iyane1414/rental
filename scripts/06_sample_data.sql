-- Insert Sample Data for YOLO Car Rental System
-- This file assumes the tables already exist.

-- Insert Users (password is already hashed).
INSERT INTO user_info (Username, Password, Role, Email) VALUES
('admin123', '$2b$10$YixZaYS6etQQXLc6cZWGCOYj4kxzlHTkJZqVV5.EGT1.WnIAqVHc2', 'Admin', 'admin@yolo.com');

-- Insert Customers
INSERT INTO customer_info (Customer_Name, ContactNo, LicenseNo, Email, Address) VALUES
('Cy Gale', '9566507162', 'S1234567', 'yolo@gmail.com', '48 St. Pup Sta Mesa'),
('John Smith', '9171234567', 'S7654321', 'john.smith@email.com', '123 Main St, Manila'),
('Maria Garcia', '9209876543', 'S5555555', 'maria.garcia@email.com', '456 Oak Ave, Cebu'),
('Robert Chen', '9365432109', 'S9999999', 'robert.chen@email.com', '789 Pine Rd, Davao'),
('Sarah Johnson', '9284567890', 'S1111111', 'sarah.j@email.com', '321 Elm St, Makati');

-- Insert Vehicles
INSERT INTO vehicle_info (Brand, Model, PlateNo, Status, DailyRate, Year) VALUES
('Toyota', 'Vios', 'ABC1234', 'Available', 1500.00, 2022),
('Toyota', 'Innova', 'ABC1235', 'Available', 2500.00, 2023),
('Honda', 'City', 'ABC1236', 'Available', 1200.00, 2021),
('Mitsubishi', 'Mirage', 'ABC1237', 'Rented', 1000.00, 2020),
('Hyundai', 'Elantra', 'ABC1238', 'Available', 1800.00, 2023),
('Kia', 'Picanto', 'ABC1239', 'Available', 950.00, 2021);

-- Insert Rentals (some completed, some ongoing, some pending payment)
INSERT INTO rental_info (Customer_ID, Vehicle_ID, User_ID, StartDate, EndDate, TotalAmount, Status) VALUES
(1, 1, 1, '2025-11-20', '2025-11-22', 4500.00, 'Completed'),
(2, 2, 1, '2025-11-21', '2025-11-25', 10000.00, 'Ongoing'),
(3, 3, 1, '2025-12-01', '2025-12-05', 6000.00, 'Pending Payment'),
(4, 4, 1, '2025-12-10', '2025-12-12', 3000.00, 'Completed'),
(5, 5, 1, '2025-12-15', '2025-12-20', 9000.00, 'Pending Payment');

-- Insert Payments (only for rentals that are completed/paid)
INSERT INTO payment_info (Rental_ID, Amount, PaymentDate, PaymentMethod, Status) VALUES
(1, 4500.00, '2025-11-20', 'GCash', 'Paid'),
(2, 10000.00, '2025-11-21', 'Credit Card', 'Paid'),
(4, 3000.00, '2025-12-10', 'Cash', 'Paid');
