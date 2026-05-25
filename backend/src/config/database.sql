-- ============================================
-- CLMS DATABASE SCHEMA (ALIGNED)
-- Injibara University - Computer Laboratory Management System
-- Columns aligned with server-final.js runtime queries and Sequelize models
-- ============================================

CREATE DATABASE IF NOT EXISTS clms_db;
USE clms_db;

-- ============================================
-- 1. USERS
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'teacher', 'student', 'lab_manager', 'dean', 'ict', 'asset', 'lab_assistant') DEFAULT 'student',
    department VARCHAR(255),
    student_id VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    profile_image VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    is_email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    reset_password_token VARCHAR(255),
    reset_password_expiry DATETIME,
    last_login DATETIME,
    last_login_ip VARCHAR(45),
    failed_login_attempts INT DEFAULT 0,
    locked_until DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_student_id (student_id)
);

-- ============================================
-- 2. LABORATORIES
-- ============================================
CREATE TABLE IF NOT EXISTS laboratories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(200) NOT NULL,
    building VARCHAR(50),
    floor INT,
    capacity INT NOT NULL,
    computer_count INT DEFAULT 0,
    equipment_count INT DEFAULT 0,
    department VARCHAR(100),
    supervisor VARCHAR(100),
    supervisor_id INT,
    opening_time TIME,
    closing_time TIME,
    is_weekend_open BOOLEAN DEFAULT FALSE,
    description TEXT,
    facilities JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (supervisor_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_code (code),
    INDEX idx_is_active (is_active)
);

-- ============================================
-- 3. COMPUTERS
-- ============================================
CREATE TABLE IF NOT EXISTS computers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) UNIQUE NOT NULL,
    workstation_number VARCHAR(100) NOT NULL,
    model VARCHAR(100),
    serial_number VARCHAR(100) UNIQUE,
    laboratory_id INT,
    processor VARCHAR(100),
    ram VARCHAR(50),
    storage VARCHAR(100),
    operating_system VARCHAR(100),
    ip_address VARCHAR(45),
    mac_address VARCHAR(17),
    purchase_date DATE,
    warranty_expiry DATE,
    status ENUM('available', 'in-use', 'maintenance', 'damaged') DEFAULT 'available',
    notes TEXT,
    last_maintenance DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (laboratory_id) REFERENCES laboratories(id) ON DELETE SET NULL,
    INDEX idx_code (code),
    INDEX idx_status (status),
    INDEX idx_laboratory (laboratory_id)
);

-- ============================================
-- 4. SCHEDULES
-- ============================================
CREATE TABLE IF NOT EXISTS schedules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_name VARCHAR(255) NOT NULL,
    laboratory_id INT NOT NULL,
    requester_id INT NOT NULL,
    batch_name VARCHAR(50),
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    expected_students INT DEFAULT 0,
    recurring_type ENUM('none', 'daily', 'weekly', 'monthly') DEFAULT 'none',
    recurring_end_date DATE,
    status ENUM('pending', 'approved', 'rejected', 'completed', 'cancelled') DEFAULT 'pending',
    rejection_reason TEXT,
    approver_id INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (laboratory_id) REFERENCES laboratories(id) ON DELETE CASCADE,
    FOREIGN KEY (requester_id) REFERENCES users(id),
    FOREIGN KEY (approver_id) REFERENCES users(id),
    INDEX idx_date (start_time),
    INDEX idx_laboratory (laboratory_id),
    INDEX idx_requester (requester_id),
    INDEX idx_status (status)
);

-- ============================================
-- 5. ATTENDANCE
-- ============================================
CREATE TABLE IF NOT EXISTS attendance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    schedule_id INT NOT NULL,
    student_id INT NOT NULL,
    student_name VARCHAR(100) NOT NULL,
    student_number VARCHAR(50),
    status ENUM('present', 'absent', 'late') NOT NULL,
    check_in_time TIME,
    late_minutes INT DEFAULT 0,
    notes TEXT,
    marked_by INT NOT NULL,
    marked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_synced BOOLEAN DEFAULT TRUE,
    offline_id VARCHAR(50),
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
-- 5b. ATTENDANCE SESSIONS (lab session tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS attendance_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    session_code VARCHAR(100) UNIQUE NOT NULL,
    schedule_id INT,
    course_code VARCHAR(50),
    instructor_id INT NOT NULL,
    lab_assistant_id INT,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (instructor_id) REFERENCES users(id),
    FOREIGN KEY (lab_assistant_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_session_code (session_code),
    INDEX idx_date (date),
    INDEX idx_status (status)
);

-- ============================================
-- 5c. ATTENDANCE RECORDS (per-session attendance)
-- ============================================
CREATE TABLE IF NOT EXISTS attendance_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    session_id INT NOT NULL,
    student_id INT NOT NULL,
    computer_id INT,
    status ENUM('present', 'absent', 'late') NOT NULL DEFAULT 'absent',
    check_in_time TIME,
    marked_by INT NOT NULL,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (computer_id) REFERENCES computers(id) ON DELETE SET NULL,
    FOREIGN KEY (marked_by) REFERENCES users(id),
    UNIQUE KEY unique_session_student (session_id, student_id),
    INDEX idx_session (session_id),
    INDEX idx_student (student_id),
    INDEX idx_status (status)
);

-- ============================================
-- 6. MAINTENANCE REQUESTS
-- ============================================
CREATE TABLE IF NOT EXISTS maintenance_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    issue_type ENUM('hardware', 'software', 'network', 'peripheral', 'other') DEFAULT 'hardware',
    description TEXT NOT NULL,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    computer_id INT,
    laboratory_id INT,
    requester_id INT NOT NULL,
    reported_by VARCHAR(100),
    reported_email VARCHAR(100),
    assignee_id INT,
    assigned_to VARCHAR(100),
    assigned_to_id INT,
    status ENUM('submitted', 'pending', 'assigned', 'in-progress', 'completed', 'cancelled') DEFAULT 'submitted',
    resolution TEXT,
    parts_used TEXT,
    time_spent INT,
    photo_url VARCHAR(255),
    completed_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (computer_id) REFERENCES computers(id) ON DELETE SET NULL,
    FOREIGN KEY (laboratory_id) REFERENCES laboratories(id) ON DELETE SET NULL,
    FOREIGN KEY (requester_id) REFERENCES users(id),
    FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_computer (computer_id)
);

-- ============================================
-- 7. EQUIPMENT
-- ============================================
CREATE TABLE IF NOT EXISTS equipment (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    laboratory VARCHAR(50),
    serial_number VARCHAR(100),
    model VARCHAR(100),
    manufacturer VARCHAR(100),
    purchase_date DATE,
    purchase_cost DECIMAL(10,2),
    current_value DECIMAL(10,2),
    warranty_expiry DATE,
    `condition` ENUM('excellent', 'good', 'fair', 'poor', 'damaged') DEFAULT 'good',
    status ENUM('available', 'borrowed', 'maintenance', 'retired', 'lost') DEFAULT 'available',
    borrower_id INT,
    borrower_name VARCHAR(100),
    borrowed_at DATETIME,
    expected_return_date DATE,
    returned_at DATETIME,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (borrower_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_code (code),
    INDEX idx_category (category),
    INDEX idx_status (status)
);

-- ============================================
-- 8. EQUIPMENT AUDITS
-- ============================================
CREATE TABLE IF NOT EXISTS equipment_audits (
    id INT PRIMARY KEY AUTO_INCREMENT,
    equipment_id INT NOT NULL,
    audit_date DATE NOT NULL,
    audited_by INT NOT NULL,
    audited_by_name VARCHAR(100) NOT NULL,
    `condition` ENUM('excellent', 'good', 'fair', 'poor', 'damaged') NOT NULL,
    status ENUM('available', 'borrowed', 'maintenance', 'retired', 'lost') NOT NULL,
    location VARCHAR(200),
    findings TEXT,
    issues_found TEXT,
    recommendations TEXT,
    action_taken TEXT,
    next_audit_date DATE,
    attachments JSON,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE,
    FOREIGN KEY (audited_by) REFERENCES users(id),
    INDEX idx_equipment (equipment_id),
    INDEX idx_audit_date (audit_date),
    INDEX idx_audited_by (audited_by)
);

-- ============================================
-- 9. LAB AUDITS
-- ============================================
CREATE TABLE IF NOT EXISTS audits (
    id INT PRIMARY KEY AUTO_INCREMENT,
    laboratory_id INT,
    auditor VARCHAR(100),
    audit_date DATE,
    total_items INT DEFAULT 0,
    present_items INT DEFAULT 0,
    missing_items INT DEFAULT 0,
    damaged_items INT DEFAULT 0,
    compliance_rate DECIMAL(5,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'completed',
    notes TEXT,
    checklist_items JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (laboratory_id) REFERENCES laboratories(id) ON DELETE SET NULL
);

-- ============================================
-- 10. REPORTS
-- ============================================
CREATE TABLE IF NOT EXISTS reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    type ENUM('attendance', 'equipment', 'maintenance', 'computer', 'schedule', 'user') NOT NULL,
    format ENUM('json', 'pdf', 'excel', 'csv') DEFAULT 'json',
    filters JSON,
    data JSON,
    file_path VARCHAR(255),
    file_size INT,
    generated_by INT NOT NULL,
    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_scheduled BOOLEAN DEFAULT FALSE,
    schedule_config JSON,
    recipients JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_type (type),
    INDEX idx_generated_by (generated_by)
);

-- ============================================
-- 11. NOTIFICATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'success', 'warning', 'error', 'reminder', 'alert') DEFAULT 'info',
    category ENUM('system', 'attendance', 'schedule', 'maintenance', 'equipment', 'academic') DEFAULT 'system',
    `read` BOOLEAN DEFAULT FALSE,
    read_at DATETIME,
    link VARCHAR(255),
    priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
    expires_at DATETIME,
    sent_by INT,
    sent_by_email VARCHAR(100),
    is_broadcast BOOLEAN DEFAULT FALSE,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (sent_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_read (`read`),
    INDEX idx_created (created_at)
);

-- ============================================
-- 12. SETTINGS
-- ============================================
CREATE TABLE IF NOT EXISTS settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    key_name VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    type VARCHAR(20) DEFAULT 'string',
    category VARCHAR(50) DEFAULT 'system',
    description TEXT,
    updated_by INT,
    is_editable BOOLEAN DEFAULT TRUE,
    is_encrypted BOOLEAN DEFAULT FALSE,
    `order` INT DEFAULT 0,
    group_name VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_key (key_name),
    INDEX idx_category (category)
);

-- ============================================
-- 13. CONTACT MESSAGES
-- ============================================
CREATE TABLE IF NOT EXISTS contact_messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'general',
    priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
    status ENUM('pending', 'replied', 'resolved') DEFAULT 'pending',
    reply TEXT,
    replied_by INT NULL,
    replied_at TIMESTAMP NULL,
    ticket_number VARCHAR(50) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (replied_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_ticket (ticket_number)
);

-- ============================================
-- 14. SESSION BLACKLIST
-- ============================================
CREATE TABLE IF NOT EXISTS session_blacklist (
    id INT PRIMARY KEY AUTO_INCREMENT,
    token TEXT NOT NULL,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    user_email VARCHAR(100) NOT NULL,
    expires_at DATETIME NOT NULL,
    blacklist_reason ENUM('logout', 'expired', 'revoked', 'security') DEFAULT 'logout',
    blacklisted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_token_hash (token_hash),
    INDEX idx_user (user_id),
    INDEX idx_expires_at (expires_at)
);

-- ============================================
-- 15. INSTITUTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS institutions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    short_name VARCHAR(50),
    code VARCHAR(20) UNIQUE NOT NULL,
    type ENUM('university', 'college', 'institute', 'school') DEFAULT 'university',
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Ethiopia',
    postal_code VARCHAR(20),
    phone VARCHAR(20),
    email VARCHAR(100),
    website VARCHAR(200),
    logo VARCHAR(255),
    motto VARCHAR(255),
    established_year INT,
    accreditation VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    settings JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- 16. EMAIL VERIFICATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS email_verifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    email VARCHAR(100) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    verified_at DATETIME,
    is_verified BOOLEAN DEFAULT FALSE,
    attempts INT DEFAULT 0,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_user (user_id),
    INDEX idx_expires (expires_at)
);

-- ============================================
-- 17. AUDIT LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    user_email VARCHAR(100),
    user_role VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    method VARCHAR(10) NOT NULL,
    url VARCHAR(255) NOT NULL,
    ip VARCHAR(45),
    user_agent TEXT,
    request_body TEXT,
    response_status INT,
    response_time INT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_action (action),
    INDEX idx_timestamp (timestamp),
    INDEX idx_entity (entity_type, entity_id)
);

-- ============================================
-- DEFAULT DATA
-- ============================================

-- Insert default admin user (password: admin123)
INSERT INTO users (email, name, password, role, is_active, is_email_verified) VALUES
('admin@clms.com', 'System Administrator', '$2a$10$tH8Yq8rYq8rYq8rYq8rYq8u', 'admin', TRUE, TRUE)
ON DUPLICATE KEY UPDATE name = name;

-- Insert default settings
INSERT INTO settings (key_name, value, type, category, description) VALUES
('system_name', 'CLMS', 'string', 'system', 'System name'),
('system_version', '2.0.0', 'string', 'system', 'System version'),
('maintenance_mode', 'false', 'boolean', 'system', 'Enable maintenance mode'),
('max_login_attempts', '5', 'number', 'security', 'Maximum failed login attempts'),
('session_timeout_minutes', '60', 'number', 'security', 'Session timeout in minutes')
ON DUPLICATE KEY UPDATE key_name = key_name;

-- Insert default laboratories
INSERT INTO laboratories (code, name, location, building, floor, capacity, department, description, is_active) VALUES
('LAB101', 'Computer Lab 101', 'Science Building, 1st Floor', 'Science Building', 1, 35, 'Computer Science', 'Main computer laboratory for general computing', TRUE),
('LAB102', 'Computer Lab 102', 'Science Building, 1st Floor', 'Science Building', 1, 30, 'Computer Science', 'Secondary computer lab for programming classes', TRUE),
('LAB103', 'Computer Lab 103', 'Science Building, 2nd Floor', 'Science Building', 2, 30, 'Engineering', 'Advanced computing lab for research', TRUE),
('LAB104', 'Engineering Lab 104', 'Engineering Building, 1st Floor', 'Engineering Building', 1, 35, 'Engineering', 'Science and engineering computing lab', TRUE),
('LAB105', 'Multimedia Lab 105', 'Engineering Building, 2nd Floor', 'Engineering Building', 2, 25, 'Engineering', 'Multimedia and design lab', TRUE)
ON DUPLICATE KEY UPDATE code = code;

-- Insert default institution
INSERT INTO institutions (name, short_name, code, type, country, is_active) VALUES
('Injibara University', 'IU', 'INJU', 'university', 'Ethiopia', TRUE)
ON DUPLICATE KEY UPDATE code = code;
