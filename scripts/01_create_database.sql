-- YOLO Car Rental System Database
-- MySQL Script with 2 JOINs, 2 SUBQUERIEs, 2 Stored Procedures, 2 Triggers

CREATE DATABASE IF NOT EXISTS yolo_car_rental;
USE yolo_car_rental;

-- Create Tables
CREATE TABLE customer_info (
    Customer_ID INT PRIMARY KEY AUTO_INCREMENT,
    Customer_Name VARCHAR(60) NOT NULL,
    ContactNo VARCHAR(20) NOT NULL,
    LicenseNo VARCHAR(50) NOT NULL UNIQUE,
    Email VARCHAR(50) NOT NULL,
    Address VARCHAR(50) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE vehicle_info (
    Vehicle_ID INT PRIMARY KEY AUTO_INCREMENT,
    Brand VARCHAR(50) NOT NULL,
    Model VARCHAR(50) NOT NULL,
    PlateNo VARCHAR(20) NOT NULL UNIQUE,
    Status VARCHAR(20) DEFAULT 'Available' CHECK (Status IN ('Available', 'Rented', 'Maintenance', 'Reserved', 'Decommissioned')),
    DailyRate DECIMAL(10, 2) NOT NULL,
    Year INT NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE user_info (
    User_ID INT PRIMARY KEY AUTO_INCREMENT,
    Username VARCHAR(50) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    Role VARCHAR(20) NOT NULL CHECK (Role IN ('Admin', 'Staff')),
    Email VARCHAR(50) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE rental_info (
    Rental_ID INT PRIMARY KEY AUTO_INCREMENT,
    Customer_ID INT NOT NULL,
    Vehicle_ID INT NOT NULL,
    User_ID INT NOT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    TotalAmount DECIMAL(10, 2) NOT NULL,
    Status VARCHAR(20) DEFAULT 'Pending Payment' CHECK (Status IN ('Ongoing', 'Completed', 'Cancelled', 'Pending Payment')),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (Customer_ID) REFERENCES customer_info(Customer_ID),
    FOREIGN KEY (Vehicle_ID) REFERENCES vehicle_info(Vehicle_ID),
    FOREIGN KEY (User_ID) REFERENCES user_info(User_ID)
);

CREATE TABLE payment_info (
    Payment_ID INT PRIMARY KEY AUTO_INCREMENT,
    Rental_ID INT NOT NULL UNIQUE,
    Amount DECIMAL(10, 2) NOT NULL,
    PaymentDate DATE NOT NULL,
    PaymentMethod VARCHAR(30) NOT NULL CHECK (PaymentMethod IN ('Cash', 'Credit Card', 'GCash', 'Bank Transfer')),
    Status VARCHAR(20) DEFAULT 'Pending' CHECK (Status IN ('Paid', 'Pending', 'Failed', 'Refunded')),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (Rental_ID) REFERENCES rental_info(Rental_ID)
);

CREATE TABLE rental_audit (
    Audit_ID INT PRIMARY KEY AUTO_INCREMENT,
    Rental_ID INT NOT NULL,
    OldStatus VARCHAR(20),
    NewStatus VARCHAR(20),
    ChangedBy INT,
    ChangedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Rental_ID) REFERENCES rental_info(Rental_ID),
    FOREIGN KEY (ChangedBy) REFERENCES user_info(User_ID)
);

-- CREATE INDEX for performance
CREATE INDEX idx_rental_customer ON rental_info(Customer_ID);
CREATE INDEX idx_rental_vehicle ON rental_info(Vehicle_ID);
CREATE INDEX idx_rental_dates ON rental_info(StartDate, EndDate);
CREATE INDEX idx_payment_rental ON payment_info(Rental_ID);
