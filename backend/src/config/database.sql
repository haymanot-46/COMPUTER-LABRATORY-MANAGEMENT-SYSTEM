-- ============================================
-- CLMS DATABASE SCHEMA
-- Computer Laboratory Management System
-- Injibara University
-- ============================================

-- Create database
CREATE DATABASE IF NOT EXISTS clms_db;
USE clms_db;

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'teacher', 'student', 'lab_manager', 'dean', 'ict', 'asset', 'lab_assistant') DEFAULT 'student',
    department VARCHAR(255),
    student_id VARCHAR(100) UNIQUE,
    phone_number VARCHAR(20),
    address TEXT,
    profile_image VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_student_id (student_id)
);

-- ============================================
-- 2. LABORATORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS laboratories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    building VARCHAR(100),
    floor INT,
    capacity INT DEFAULT 30,
    description TEXT,
    status ENUM('active', 'maintenance', 'closed') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_status (status)
);

-- ============================================
-- 3. COMPUTERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS computers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    asset_tag VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    model VARCHAR(100),
    brand VARCHAR(100),
    serial_number VARCHAR(100) UNIQUE,
    laboratory_id INT,
    processor VARCHAR(100),
    ram VARCHAR(50),
    storage VARCHAR(100),
    os VARCHAR(100),
    ip_address VARCHAR(50),
    mac_address VARCHAR(50),
    purchase_date DATE,
    warranty_expiry DATE,
    status ENUM('available', 'in-use', 'maintenance', 'damaged', 'retired') DEFAULT 'available',
    current_user_id INT,
    last_maintenance DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (laboratory_id) REFERENCES laboratories(id) ON DELETE SET NULL,
    FOREIGN KEY (current_user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_asset_tag (asset_tag),
    INDEX idx_status (status),
    INDEX idx_laboratory (laboratory_id)
);

-- ============================================
-- 4. SCHEDULES TABLE
-- ============================================
USE clms_db;

-- Create schedules table
CREATE TABLE IF NOT EXISTS schedules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    course_code VARCHAR(50),
    course_name VARCHAR(255),
    laboratory_id INT NOT NULL,
    teacher_id INT NOT NULL,
    schedule_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration INT,
    section VARCHAR(50),
    year INT,
    semester INT,
    student_count INT DEFAULT 0,
    status ENUM('pending', 'approved', 'rejected', 'cancelled', 'completed') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (laboratory_id) REFERENCES laboratories(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_date (schedule_date),
    INDEX idx_laboratory (laboratory_id),
    INDEX idx_teacher (teacher_id),
    INDEX idx_status (status)
);

-- Verify table was created
SHOW TABLES;

-- Verify table structure
DESCRIBE schedules;

EXIT;

-- ============================================
-- 5. ATTENDANCE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS attendance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    schedule_id INT NOT NULL,
    student_id INT NOT NULL,
    check_in_time DATETIME,
    check_out_time DATETIME,
    status ENUM('present', 'absent', 'late', 'excused') DEFAULT 'absent',
    late_minutes INT DEFAULT 0,
    marked_by INT,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (marked_by) REFERENCES users(id),
    UNIQUE KEY unique_attendance (schedule_id, student_id),
    INDEX idx_schedule (schedule_id),
    INDEX idx_student (student_id),
    INDEX idx_status (status)
);

-- ============================================
-- 6. MAINTENANCE REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS maintenance_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    computer_id INT,
    laboratory_id INT,
    reported_by INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    status ENUM('pending', 'in-progress', 'completed', 'cancelled') DEFAULT 'pending',
    assigned_to INT,
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    completed_at DATETIME,
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (computer_id) REFERENCES computers(id) ON DELETE SET NULL,
    FOREIGN KEY (laboratory_id) REFERENCES laboratories(id) ON DELETE SET NULL,
    FOREIGN KEY (reported_by) REFERENCES users(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_computer (computer_id)
);

-- ============================================
-- 7. EQUIPMENT TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS equipment (
    id INT PRIMARY KEY AUTO_INCREMENT,
    asset_tag VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    model VARCHAR(100),
    brand VARCHAR(100),
    serial_number VARCHAR(100) UNIQUE,
    laboratory_id INT,
    purchase_date DATE,
    purchase_cost DECIMAL(10,2),
    warranty_expiry DATE,
    status ENUM('operational', 'maintenance', 'damaged', 'disposed') DEFAULT 'operational',
    condition_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (laboratory_id) REFERENCES laboratories(id) ON DELETE SET NULL,
    INDEX idx_asset_tag (asset_tag),
    INDEX idx_status (status),
    INDEX idx_category (category)
);

-- ============================================
-- 8. EQUIPMENT AUDITS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS equipment_audits (
    id INT PRIMARY KEY AUTO_INCREMENT,
    equipment_id INT NOT NULL,
    audit_date DATE NOT NULL,
    audited_by INT NOT NULL,
    condition_rating ENUM('excellent', 'good', 'fair', 'poor', 'critical') DEFAULT 'good',
    findings TEXT,
    recommendations TEXT,
    action_taken TEXT,
    next_audit_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE,
    FOREIGN KEY (audited_by) REFERENCES users(id),
    INDEX idx_equipment (equipment_id),
    INDEX idx_audit_date (audit_date)
);

-- ============================================
-- 9. REPORTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    type ENUM('attendance', 'maintenance', 'equipment', 'usage', 'financial', 'custom') NOT NULL,
    generated_by INT NOT NULL,
    parameters JSON,
    file_path VARCHAR(500),
    format ENUM('pdf', 'excel', 'csv', 'json') DEFAULT 'pdf',
    status ENUM('pending', 'generated', 'failed') DEFAULT 'pending',
    generated_at DATETIME,
    download_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (generated_by) REFERENCES users(id),
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_generated_at (generated_at)
);

-- ============================================
-- 10. NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
    related_id INT,
    related_type VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    read_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
);

-- ============================================
-- 11. SYSTEM SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type ENUM('string', 'number', 'boolean', 'json', 'array') DEFAULT 'string',
    category VARCHAR(100),
    description TEXT,
    updated_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_key (setting_key),
    INDEX idx_category (category)
);

-- ============================================
-- 12. SYSTEM LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS system_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100),
    entity_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at),
    INDEX idx_entity (entity_type, entity_id)
);

-- ============================================
-- INSERT INITIAL DATA
-- ============================================

-- Insert default laboratories (Lab 001, 002, 003, etc.)
INSERT INTO laboratories (name, code, building, floor, capacity, description, status) VALUES
('Computer Lab 001', 'LAB001', 'Main Building', 1, 35, 'Main computer laboratory for general computing', 'active'),
('Computer Lab 002', 'LAB002', 'Main Building', 1, 30, 'Secondary computer lab for programming classes', 'active'),
('Computer Lab 003', 'LAB003', 'Main Building', 2, 35, 'Advanced computing lab for research', 'active'),
('Computer Lab 004', 'LAB004', 'Science Block', 1, 40, 'Science and engineering computing lab', 'active'),
('Computer Lab 005', 'LAB005', 'Science Block', 2, 30, 'Multimedia and design lab', 'active'),
('Network Lab', 'LAB006', 'Engineering Block', 1, 25, 'Specialized networking equipment', 'active'),
('Database Lab', 'LAB007', 'Engineering Block', 2, 30, 'Database server and client lab', 'maintenance'),
('Research Lab', 'LAB008', 'Library Building', 3, 20, 'Postgraduate research computing', 'active')
ON DUPLICATE KEY UPDATE name=name;

-- Insert default computers
INSERT INTO computers (asset_tag, name, model, brand, laboratory_id, processor, ram, storage, os, status) VALUES
('PC-001', 'Computer 1', 'OptiPlex 7080', 'Dell', 1, 'Intel i7', '16GB', '512GB SSD', 'Windows 11', 'available'),
('PC-002', 'Computer 2', 'OptiPlex 7080', 'Dell', 1, 'Intel i7', '16GB', '512GB SSD', 'Windows 11', 'available'),
('PC-003', 'Computer 3', 'EliteDesk', 'HP', 1, 'Intel i5', '8GB', '256GB SSD', 'Windows 11', 'available'),
('PC-004', 'Computer 4', 'ThinkCentre', 'Lenovo', 2, 'Intel i7', '32GB', '1TB SSD', 'Windows 11', 'available'),
('PC-005', 'Computer 5', 'EliteDesk', 'HP', 2, 'Intel i5', '16GB', '512GB SSD', 'Ubuntu', 'available');

-- Insert default settings
INSERT INTO settings (setting_key, setting_value, setting_type, category, description) VALUES
('system_name', 'CLMS - Injibara University', 'string', 'general', 'System display name'),
('max_computers_per_lab', '35', 'number', 'laboratory', 'Maximum computers per laboratory'),
('default_session_duration', '120', 'number', 'schedule', 'Default session duration in minutes'),
('attendance_deadline_minutes', '15', 'number', 'attendance', 'Minutes after start time for attendance'),
('enable_email_notifications', 'true', 'boolean', 'notifications', 'Enable email notifications'),
('backup_enabled', 'true', 'boolean', 'backup', 'Enable automatic backup'),
('backup_frequency', 'daily', 'string', 'backup', 'Backup frequency (daily/weekly/monthly)');