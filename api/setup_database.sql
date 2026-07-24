-- ============================================================
-- Smart Stock - Complete Database Setup
-- ============================================================

CREATE DATABASE IF NOT EXISTS smartstock;
USE smartstock;

-- 1. Users
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_code VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('auditor','labhead','student') NOT NULL,
    lab VARCHAR(100) DEFAULT NULL,
    department VARCHAR(100) DEFAULT NULL,
    roll_no VARCHAR(50) DEFAULT NULL,
    year VARCHAR(20) DEFAULT NULL,
    avatar VARCHAR(10) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Labs
DROP TABLE IF EXISTS labs;
CREATE TABLE labs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    code VARCHAR(20) DEFAULT NULL,
    department VARCHAR(100) DEFAULT NULL,
    location VARCHAR(200) DEFAULT NULL,
    head VARCHAR(100) DEFAULT NULL,
    capacity INT DEFAULT 30,
    description TEXT DEFAULT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Equipment
DROP TABLE IF EXISTS equipment;
CREATE TABLE equipment (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) DEFAULT NULL,
    lab VARCHAR(100) NOT NULL,
    status VARCHAR(30) DEFAULT 'operational',
    manufacturer VARCHAR(100) DEFAULT NULL,
    model VARCHAR(100) DEFAULT NULL,
    serial_no VARCHAR(100) DEFAULT NULL,
    quantity INT DEFAULT 1,
    purchase_date DATE DEFAULT NULL,
    last_maintenance DATE DEFAULT NULL,
    next_maintenance DATE DEFAULT NULL,
    location VARCHAR(100) DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Chemicals
DROP TABLE IF EXISTS chemicals;
CREATE TABLE chemicals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) DEFAULT 'Chemical',
    lab VARCHAR(100) NOT NULL,
    quantity DECIMAL(10,2) DEFAULT 0,
    unit VARCHAR(20) DEFAULT 'units',
    min_stock DECIMAL(10,2) DEFAULT 0,
    max_stock DECIMAL(10,2) DEFAULT 100,
    expiry DATE DEFAULT NULL,
    supplier VARCHAR(100) DEFAULT NULL,
    location VARCHAR(100) DEFAULT NULL,
    cas_number VARCHAR(50) DEFAULT NULL,
    hazard_level VARCHAR(30) DEFAULT 'low',
    grade VARCHAR(30) DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Tasks
DROP TABLE IF EXISTS tasks;
CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT DEFAULT NULL,
    assigned_to VARCHAR(100) NOT NULL,
    assigned_by VARCHAR(100) NOT NULL,
    lab VARCHAR(100) NOT NULL,
    due_date DATE NOT NULL,
    priority ENUM('urgent','high','medium','low') DEFAULT 'medium',
    status ENUM('pending','in-progress','completed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Attendance
DROP TABLE IF EXISTS attendance;
CREATE TABLE attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_name VARCHAR(100) NOT NULL,
    roll_no VARCHAR(50) NOT NULL,
    lab VARCHAR(100) DEFAULT NULL,
    date DATE NOT NULL,
    status ENUM('present','absent','late') DEFAULT 'present',
    time_in TIME DEFAULT NULL,
    time_out TIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Activities
DROP TABLE IF EXISTS activities;
CREATE TABLE activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    lab VARCHAR(100) NOT NULL,
    experiment VARCHAR(200) NOT NULL,
    duration VARCHAR(50) DEFAULT NULL,
    chemicals TEXT DEFAULT NULL,
    equipment TEXT DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    status VARCHAR(30) DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Notifications
DROP TABLE IF EXISTS notifications;
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(30) DEFAULT 'info',
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    icon VARCHAR(50) DEFAULT 'info',
    lab VARCHAR(100) DEFAULT NULL,
    lab_name VARCHAR(100) DEFAULT NULL,
    is_read TINYINT(1) DEFAULT 0,
    time VARCHAR(50) DEFAULT NULL,
    severity VARCHAR(20) DEFAULT 'info',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Approval Requests
DROP TABLE IF EXISTS approval_requests;
CREATE TABLE approval_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    requested_by VARCHAR(100) NOT NULL,
    handled_by VARCHAR(100) DEFAULT NULL,
    lab VARCHAR(100) NOT NULL,
    quantity VARCHAR(50) DEFAULT NULL,
    urgency VARCHAR(20) DEFAULT 'medium',
    date DATE DEFAULT NULL,
    status ENUM('pending','approved','rejected') DEFAULT 'pending',
    notes TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. Stock History
DROP TABLE IF EXISTS stock_history;
CREATE TABLE stock_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    action_type VARCHAR(50) DEFAULT NULL,
    quantity DECIMAL(10,2) DEFAULT 0,
    unit VARCHAR(20) DEFAULT 'units',
    by_user VARCHAR(100) DEFAULT NULL,
    lab VARCHAR(100) DEFAULT NULL,
    date DATE DEFAULT NULL,
    reason TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. Messages
DROP TABLE IF EXISTS messages;
CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender VARCHAR(100) NOT NULL,
    recipient VARCHAR(100) NOT NULL,
    subject VARCHAR(200) DEFAULT NULL,
    message TEXT NOT NULL,
    lab VARCHAR(100) DEFAULT NULL,
    is_read TINYINT(1) DEFAULT 0,
    date DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. Enrollment Requests
DROP TABLE IF EXISTS enrollment_requests;
CREATE TABLE enrollment_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_name VARCHAR(100) NOT NULL,
    student_roll VARCHAR(50) NOT NULL,
    student_id VARCHAR(50) DEFAULT NULL,
    lab_name VARCHAR(100) NOT NULL,
    department VARCHAR(100) DEFAULT NULL,
    year VARCHAR(20) DEFAULT NULL,
    email VARCHAR(100) DEFAULT NULL,
    status ENUM('pending','approved','rejected') DEFAULT 'pending',
    request_date DATE DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 13. Password Resets
DROP TABLE IF EXISTS password_resets;
CREATE TABLE password_resets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    otp VARCHAR(10) NOT NULL,
    expires_at DATETIME NOT NULL,
    used TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- SAMPLE DATA
-- ============================================================

-- Sample Labs
INSERT INTO labs (name, code, department, location, head, capacity, status) VALUES
('Microbiology Lab', 'MB', 'Microbiology', 'Building A, Room 101', 'Dr. Priya Sharma', 30, 'active'),
('Chemistry Lab', 'CH', 'Chemistry', 'Building B, Room 205', 'Dr. Anil Kumar', 25, 'active'),
('Physics Lab', 'PH', 'Physics', 'Building C, Room 302', 'Dr. Meena Iyer', 20, 'active');

-- Sample Users (password: password123)
INSERT INTO users (user_code, full_name, email, password, role, lab, department, roll_no, year, avatar) VALUES
('AUDIT001', 'Audit Admin', 'auditor@smartstock.in', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'auditor', NULL, 'Quality Control', NULL, NULL, 'AA'),
('LAB001', 'Dr. Priya Sharma', 'priya@smartstock.in', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'labhead', 'Microbiology Lab', 'Microbiology', NULL, NULL, 'PS'),
('STU001', 'Rahul Verma', 'rahul@smartstock.in', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'Microbiology Lab', 'Microbiology', 'MB2024001', '3rd Year', 'RV'),
('STU002', 'Sneha Patel', 'sneha@smartstock.in', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'Microbiology Lab', 'Microbiology', 'MB2024002', '3rd Year', 'SP'),
('STU003', 'Arjun Nair', 'arjun@smartstock.in', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'Chemistry Lab', 'Chemistry', 'CH2024001', '2nd Year', 'AN');

-- Sample Equipment
INSERT INTO equipment (name, category, lab, status, manufacturer, model, serial_no, quantity, purchase_date, last_maintenance, next_maintenance, location) VALUES
('Microscope', 'Optical', 'Microbiology Lab', 'operational', 'Olympus', 'CX23', 'OLY-2024-001', 5, '2024-01-15', '2026-06-01', '2026-09-01', 'Shelf A1'),
('Autoclave', 'Sterilization', 'Microbiology Lab', 'operational', 'Tuttnauer', '2540M', 'TUT-2024-001', 2, '2024-02-10', '2026-05-15', '2026-08-15', 'Room 101B'),
('Spectrophotometer', 'Analytical', 'Chemistry Lab', 'operational', 'Shimadzu', 'UV-1900i', 'SHM-2024-001', 1, '2024-03-20', '2026-07-01', '2026-10-01', 'Bench B3'),
('Centrifuge', 'Separation', 'Microbiology Lab', 'maintenance', 'Eppendorf', '5424R', 'EPP-2024-001', 3, '2024-01-25', '2026-04-20', '2026-07-20', 'Shelf A2'),
('pH Meter', 'Measurement', 'Chemistry Lab', 'operational', 'Mettler Toledo', 'FE20', 'MT-2024-001', 4, '2024-04-05', '2026-06-10', '2026-09-10', 'Bench B1');

-- Sample Chemicals
INSERT INTO chemicals (name, category, lab, quantity, unit, min_stock, max_stock, expiry, supplier, location, cas_number, hazard_level, grade) VALUES
('Ethanol', 'Chemical', 'Microbiology Lab', 45.00, 'L', 10.00, 100.00, '2027-12-31', 'Merck', 'Cabinet C1', '64-17-5', 'medium', 'AR'),
('Agar Powder', 'Chemical', 'Microbiology Lab', 8.00, 'kg', 5.00, 50.00, '2027-06-30', 'HiMedia', 'Cabinet C2', '9002-18-0', 'low', 'Bacteriological'),
('Hydrochloric Acid', 'Chemical', 'Chemistry Lab', 3.00, 'L', 5.00, 30.00, '2027-09-30', 'Fisher Scientific', 'Acid Cabinet', '7647-01-0', 'high', 'AR'),
('Sodium Hydroxide', 'Chemical', 'Chemistry Lab', 12.00, 'kg', 3.00, 25.00, '2028-03-31', 'Sigma Aldrich', 'Base Cabinet', '1310-73-2', 'high', 'AR'),
('Petri Dishes', 'Plasticware', 'Microbiology Lab', 200.00, 'units', 50.00, 500.00, '2028-12-31', 'Tarsons', 'Shelf D1', NULL, 'low', NULL),
('Micropipette Tips', 'Plasticware', 'Microbiology Lab', 500.00, 'units', 100.00, 1000.00, NULL, 'Axygen', 'Drawer E1', NULL, 'low', NULL),
('Beakers 250ml', 'Glassware', 'Chemistry Lab', 15.00, 'units', 5.00, 30.00, NULL, 'Borosil', 'Shelf F1', NULL, 'low', NULL),
('Test Tubes', 'Glassware', 'Chemistry Lab', 50.00, 'units', 20.00, 100.00, NULL, 'Borosil', 'Shelf F2', NULL, 'low', NULL);

-- Sample Tasks
INSERT INTO tasks (title, description, assigned_to, assigned_by, lab, due_date, priority, status) VALUES
('Clean lab equipment', 'Thoroughly clean all microscopes and centrifuges', 'Rahul Verma', 'Dr. Priya Sharma', 'Microbiology Lab', DATE_ADD(CURDATE(), INTERVAL 2 DAY), 'medium', 'pending'),
('Stock inventory check', 'Verify chemical stock levels against records', 'Sneha Patel', 'Dr. Priya Sharma', 'Microbiology Lab', DATE_ADD(CURDATE(), INTERVAL 5 DAY), 'high', 'in-progress'),
('Prepare culture media', 'Prepare nutrient agar plates for next weeks experiments', 'Rahul Verma', 'Dr. Priya Sharma', 'Microbiology Lab', DATE_ADD(CURDATE(), INTERVAL 1 DAY), 'urgent', 'pending');

-- Sample Notifications
INSERT INTO notifications (type, title, message, icon, lab, lab_name, is_read, time, severity) VALUES
('alert', 'Low Stock Alert', 'Hydrochloric Acid is below minimum stock level', 'warning', 'Chemistry Lab', 'Chemistry Lab', 0, '2 hours ago', 'warning'),
('info', 'New Student Enrolled', 'Arjun Nair has been enrolled in Chemistry Lab', 'person_add', 'Chemistry Lab', 'Chemistry Lab', 0, '5 hours ago', 'info'),
('alert', 'Maintenance Due', 'Centrifuge maintenance is overdue', 'build', 'Microbiology Lab', 'Microbiology Lab', 0, '1 day ago', 'critical'),
('info', 'Task Completed', 'Sneha Patel completed stock inventory check', 'check_circle', 'Microbiology Lab', 'Microbiology Lab', 1, '2 days ago', 'info'),
('alert', 'Expiry Warning', 'Agar Powder expires in 30 days', 'schedule', 'Microbiology Lab', 'Microbiology Lab', 0, '3 hours ago', 'warning');

-- Sample Attendance
INSERT INTO attendance (student_name, roll_no, lab, date, status, time_in, time_out) VALUES
('Rahul Verma', 'MB2024001', 'Microbiology Lab', CURDATE(), 'present', '09:00:00', '17:00:00'),
('Sneha Patel', 'MB2024002', 'Microbiology Lab', CURDATE(), 'present', '09:15:00', '17:00:00'),
('Arjun Nair', 'CH2024001', 'Chemistry Lab', CURDATE(), 'late', '09:45:00', NULL),
('Rahul Verma', 'MB2024001', 'Microbiology Lab', DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'present', '09:00:00', '17:00:00'),
('Sneha Patel', 'MB2024002', 'Microbiology Lab', DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'absent', NULL, NULL);

-- Sample Activities
INSERT INTO activities (student, date, lab, experiment, duration, chemicals, equipment, notes, status) VALUES
('Rahul Verma', CURDATE(), 'Microbiology Lab', 'Gram Staining', '2 hours', 'Crystal Violet, Iodine, Safranin', 'Microscope', 'Successfully identified gram-positive bacteria', 'completed'),
('Sneha Patel', DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'Microbiology Lab', 'Bacterial Culture', '3 hours', 'Agar Powder, Nutrient Broth', 'Autoclave, Petri Dishes', 'Prepared 20 agar plates', 'completed');

-- Sample Stock History
INSERT INTO stock_history (item, action, quantity, unit, by_user, lab, date, reason) VALUES
('Ethanol', 'used', 5.00, 'L', 'Rahul Verma', 'Microbiology Lab', CURDATE(), 'Lab experiment'),
('Agar Powder', 'used', 2.00, 'kg', 'Sneha Patel', 'Microbiology Lab', DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'Culture media preparation'),
('Petri Dishes', 'used', 20.00, 'units', 'Sneha Patel', 'Microbiology Lab', DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'Bacterial culture'),
('Hydrochloric Acid', 'used', 2.00, 'L', 'Arjun Nair', 'Chemistry Lab', DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'Titration experiment');
