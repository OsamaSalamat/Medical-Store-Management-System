
CREATE DATABASE medical_store;
USE medical_store;

CREATE TABLE users(
id INT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(100),
email VARCHAR(100),
phone VARCHAR(20),
password VARCHAR(255),
role VARCHAR(20),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE medicines(
id INT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(150),
brand VARCHAR(150),
category VARCHAR(100),
price DECIMAL(10,2),
stock INT,
expiry_date DATE,
prescription_required BOOLEAN
);

CREATE TABLE prescriptions(
id INT AUTO_INCREMENT PRIMARY KEY,
user_id INT,
file_path VARCHAR(255),
status VARCHAR(50) DEFAULT 'pending'
);

CREATE TABLE orders(
id INT AUTO_INCREMENT PRIMARY KEY,
user_id INT,
order_id VARCHAR(100),
total DECIMAL(10,2),
status VARCHAR(50),
payment_mode VARCHAR(50),
payment_receipt VARCHAR(255),
priority VARCHAR(50) DEFAULT 'normal',
prescription_id INT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items(
id INT AUTO_INCREMENT PRIMARY KEY,
order_id INT,
medicine_id INT,
quantity INT,
price DECIMAL(10,2)
);

-- Seed admin and users
INSERT INTO users (name, email, phone, password, role) VALUES
('Admin User', 'admin@medicalstore.com', '9999999999', '$2a$10$wqq6a3uWqlGEuO5fpFh1uOE5oGqP5oXXo5z/0PmjYh5ThSQxjO2ua', 'admin'),
('Test Patient', 'patient@medicalstore.com', '9123456780', '$2a$10$wqq6a3uWqlGEuO5fpFh1uOE5oGqP5oXXo5z/0PmjYh5ThSQxjO2ua', 'patient'),
('Test Doctor', 'doctor@medicalstore.com', '9234567890', '$2a$10$wqq6a3uWqlGEuO5fpFh1uOE5oGqP5oXXo5z/0PmjYh5ThSQxjO2ua', 'doctor');

-- Seed medicines
INSERT INTO medicines (name, brand, category, price, stock, expiry_date, prescription_required) VALUES
('Paracetamol', 'Acme Pharma', 'OTC', 2.99, 120, '2027-12-31', false),
('Amoxicillin', 'BetterMed', 'Prescription drugs', 8.50, 50, '2026-10-31', true),
('Vitamin C', 'HealthPlus', 'Wellness', 5.25, 90, '2028-08-15', false),
('Metformin', 'Glucare', 'Prescription drugs', 12.99, 40, '2027-05-20', true),
('Aspirin', 'BioLife', 'OTC', 3.40, 200, '2029-01-01', false);

-- Sample prescriptions
INSERT INTO prescriptions (user_id, file_path, status) VALUES
(2, 'uploads/sample-prescription.pdf', 'approved');

