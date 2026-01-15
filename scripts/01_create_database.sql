-- YOLO Car Rental System Database
-- MySQL Script with 2 JOINs, 2 SUBQUERIES, 2 Stored Procedures, 2 Triggers
-- Run this file first to create the database schema.

-- Create the database if it does not exist yet.
CREATE DATABASE IF NOT EXISTS yolo_car_rental;
-- Switch the current connection to the new database.
USE yolo_car_rental;

-- Create Tables

-- customer_info: one row per customer.
CREATE TABLE customer_info (
    Customer_ID INT PRIMARY KEY AUTO_INCREMENT, -- auto-incremented primary key
    Customer_Name VARCHAR(60) NOT NULL, -- full name
    ContactNo VARCHAR(20) NOT NULL, -- phone number
    LicenseNo VARCHAR(50) NOT NULL UNIQUE, -- unique driver license
    Email VARCHAR(50) NOT NULL, -- customer email
    Address VARCHAR(50) NOT NULL, -- home address
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- created timestamp
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP -- auto-updated timestamp
);

-- vehicle_info: one row per vehicle.
CREATE TABLE vehicle_info (
    Vehicle_ID INT PRIMARY KEY AUTO_INCREMENT, -- auto-incremented primary key
    Brand VARCHAR(50) NOT NULL, -- make/brand (Toyota, Honda, etc.)
    Model VARCHAR(50) NOT NULL, -- model name
    PlateNo VARCHAR(20) NOT NULL UNIQUE, -- unique plate number
    ImageUrl VARCHAR(255) NULL, -- optional image URL/path
    Status VARCHAR(20) DEFAULT 'Available' CHECK (Status IN ('Available', 'Rented', 'Maintenance', 'Reserved', 'Decommissioned')), -- availability status
    DailyRate DECIMAL(10, 2) NOT NULL, -- price per day
    Year INT NOT NULL, -- model year
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- created timestamp
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP -- auto-updated timestamp
);

-- user_info: admin users who manage the system.
CREATE TABLE user_info (
    User_ID INT PRIMARY KEY AUTO_INCREMENT, -- auto-incremented primary key
    Username VARCHAR(50) NOT NULL UNIQUE, -- unique login name
    Password VARCHAR(255) NOT NULL, -- hashed password
    Role VARCHAR(20) NOT NULL CHECK (Role IN ('Admin')), -- role constraint
    Email VARCHAR(50) NOT NULL, -- admin email
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- created timestamp
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP -- auto-updated timestamp
);

-- rental_info: bookings made by customers.
CREATE TABLE rental_info (
    Rental_ID INT PRIMARY KEY AUTO_INCREMENT, -- auto-incremented primary key
    Customer_ID INT NOT NULL, -- FK to customer_info
    Vehicle_ID INT NOT NULL, -- FK to vehicle_info
    User_ID INT NOT NULL, -- FK to user_info (staff/admin)
    StartDate DATE NOT NULL, -- rental start date
    EndDate DATE NOT NULL, -- rental end date
    TotalAmount DECIMAL(10, 2) NOT NULL, -- computed total for rental period
    Status VARCHAR(20) DEFAULT 'Pending Payment' CHECK (Status IN ('Ongoing', 'Completed', 'Cancelled', 'Pending Payment')), -- rental state
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- created timestamp
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- auto-updated timestamp
    FOREIGN KEY (Customer_ID) REFERENCES customer_info(Customer_ID), -- enforce customer link
    FOREIGN KEY (Vehicle_ID) REFERENCES vehicle_info(Vehicle_ID), -- enforce vehicle link
    FOREIGN KEY (User_ID) REFERENCES user_info(User_ID) -- enforce staff/admin link
);

-- payment_info: payment records for rentals (one per rental).
CREATE TABLE payment_info (
    Payment_ID INT PRIMARY KEY AUTO_INCREMENT, -- auto-incremented primary key
    Rental_ID INT NOT NULL UNIQUE, -- FK to rental_info (unique = one payment per rental)
    Amount DECIMAL(10, 2) NOT NULL, -- payment amount
    PaymentDate DATE NOT NULL, -- date of payment
    PaymentMethod VARCHAR(30) NOT NULL CHECK (PaymentMethod IN ('Cash', 'Credit Card', 'GCash', 'Bank Transfer')), -- method constraint
    Status VARCHAR(20) DEFAULT 'Pending' CHECK (Status IN ('Paid', 'Pending', 'Failed', 'Refunded')), -- payment state
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- created timestamp
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- auto-updated timestamp
    FOREIGN KEY (Rental_ID) REFERENCES rental_info(Rental_ID) -- enforce rental link
);

-- rental_audit: history of rental status changes.
CREATE TABLE rental_audit (
    Audit_ID INT PRIMARY KEY AUTO_INCREMENT, -- auto-incremented primary key
    Rental_ID INT NOT NULL, -- FK to rental_info
    OldStatus VARCHAR(20), -- status before change
    NewStatus VARCHAR(20), -- status after change
    ChangedBy INT, -- FK to user_info (who made the change)
    ChangedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- audit timestamp
    FOREIGN KEY (Rental_ID) REFERENCES rental_info(Rental_ID), -- enforce rental link
    FOREIGN KEY (ChangedBy) REFERENCES user_info(User_ID) -- enforce user link
);

-- CREATE INDEX for performance on common query paths.
CREATE INDEX idx_rental_customer ON rental_info(Customer_ID);
CREATE INDEX idx_rental_vehicle ON rental_info(Vehicle_ID);
CREATE INDEX idx_rental_dates ON rental_info(StartDate, EndDate);
CREATE INDEX idx_payment_rental ON payment_info(Rental_ID);
