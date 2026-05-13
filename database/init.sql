-- ============================================
-- CLMS DATABASE - Injibara University
-- Computer Laboratory Management System
-- ============================================

-- Create database
CREATE DATABASE IF NOT EXISTS clms_db;
USE clms_db;

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    role ENUM('admin', 'teacher', 'student', 'lab_manager', 'dean', 'lab_assistant', 'ict', 'asset') DEFAULT 'student',
    phone VARCHAR(15),
    student_id VARCHAR(50),
    department VARCHAR(100),
    profile_picture VARCHAR(255),
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- LABORATORIES TABLE
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
    FOREIGN KEY (supervisor_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- COMPUTERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS computers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    cpu VARCHAR(100),
    ram VARCHAR(50),
    storage VARCHAR(50),
    operating_system VARCHAR(100),
    lab VARCHAR(50) NOT NULL,
    laboratory_id INT,
    ip_address VARCHAR(45),
    mac_address VARCHAR(17),
    serial_number VARCHAR(100),
    status ENUM('available', 'in-use', 'maintenance', 'damaged') DEFAULT 'available',
    purchase_date DATE,
    warranty_expiry DATE,
    last_maintenance DATETIME,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (laboratory_id) REFERENCES laboratories(id) ON DELETE SET NULL
);

-- ============================================
-- SCHEDULES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS schedules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    course VARCHAR(100) NOT NULL,
    lab VARCHAR(50) NOT NULL,
    laboratory_id INT,
    instructor VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    students INT DEFAULT 0,
    status ENUM('pending', 'approved', 'rejected', 'cancelled', 'completed') DEFAULT 'pending',
    rejection_reason TEXT,
    description TEXT,
    recurring_type ENUM('none', 'daily', 'weekly', 'monthly') DEFAULT 'none',
    recurring_end_date DATE,
    created_by INT NOT NULL,
    approved_by INT,
    approved_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (laboratory_id) REFERENCES laboratories(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- ============================================
-- ATTENDANCE TABLE
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
    UNIQUE KEY unique_attendance (schedule_id, student_id)
);

-- ============================================
-- MAINTENANCE REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS maintenance_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    computer_id INT NOT NULL,
    lab VARCHAR(50) NOT NULL,
    issue_type ENUM('hardware', 'software', 'network', 'peripheral', 'other') DEFAULT 'hardware',
    description TEXT NOT NULL,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    status ENUM('pending', 'assigned', 'in-progress', 'completed', 'cancelled') DEFAULT 'pending',
    reported_by VARCHAR(100) NOT NULL,
    reported_email VARCHAR(100) NOT NULL,
    assigned_to VARCHAR(100),
    assigned_to_id INT,
    resolution TEXT,
    parts_used TEXT,
    time_spent INT,
    photo_url VARCHAR(255),
    completed_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (computer_id) REFERENCES computers(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- EQUIPMENT TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS equipment (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    category ENUM('computer', 'monitor', 'ups', 'projector', 'printer', 'network', 'keyboard', 'mouse', 'furniture', 'software', 'other') NOT NULL,
    laboratory VARCHAR(50),
    laboratory_id INT,
    serial_number VARCHAR(100),
    model VARCHAR(100),
    manufacturer VARCHAR(100),
    purchase_date DATE,
    purchase_cost DECIMAL(10,2),
    current_value DECIMAL(10,2),
    warranty_expiry DATE,
    condition ENUM('excellent', 'good', 'fair', 'poor', 'damaged') DEFAULT 'good',
    status ENUM('available', 'borrowed', 'maintenance', 'retired', 'lost') DEFAULT 'available',
    borrower_id INT,
    borrower_name VARCHAR(100),
    borrowed_at DATETIME,
    expected_return_date DATE,
    returned_at DATETIME,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (laboratory_id) REFERENCES laboratories(id) ON DELETE SET NULL,
    FOREIGN KEY (borrower_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- EQUIPMENT AUDITS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS equipment_audits (
    id INT PRIMARY KEY AUTO_INCREMENT,
    equipment_id INT NOT NULL,
    audit_date DATE NOT NULL,
    audited_by INT NOT NULL,
    audited_by_name VARCHAR(100) NOT NULL,
    condition ENUM('excellent', 'good', 'fair', 'poor', 'damaged') NOT NULL,
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
    FOREIGN KEY (audited_by) REFERENCES users(id)
);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'success', 'warning', 'error', 'reminder', 'alert') DEFAULT 'info',
    category ENUM('system', 'attendance', 'schedule', 'maintenance', 'equipment', 'academic') DEFAULT 'system',
    read BOOLEAN DEFAULT FALSE,
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
    FOREIGN KEY (sent_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- INSTITUTION TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS institution (
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
-- SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    key_name VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    type ENUM('string', 'number', 'boolean', 'json', 'array') DEFAULT 'string',
    category ENUM('system', 'email', 'sms', 'backup', 'security', 'academic', 'notification') DEFAULT 'system',
    description TEXT,
    is_editable BOOLEAN DEFAULT TRUE,
    is_encrypted BOOLEAN DEFAULT FALSE,
    updated_by INT,
    group_name VARCHAR(50),
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- SESSION BLACKLIST TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS session_blacklist (
    id INT PRIMARY KEY AUTO_INCREMENT,
    token TEXT NOT NULL,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    user_email VARCHAR(100) NOT NULL,
    expires_at DATETIME NOT NULL,
    blacklist_reason ENUM('logout', 'expired', 'revoked', 'security') DEFAULT 'logout',
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_token_hash (token_hash),
    INDEX idx_expires_at (expires_at)
);

-- ============================================
-- REPORTS TABLE
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
    FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE CASCADE
);


-- Check if contact_messages table exists
SHOW TABLES LIKE 'contact_messages';

-- If not exists, create it
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
  FOREIGN KEY (replied_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert a test message
INSERT INTO contact_messages (name, email, subject, message, category, priority, ticket_number) 
VALUES ('Test User', 'test@example.com', 'Test Message', 'This is a test message to verify the system.', 'general', 'normal', 'TKT-TEST-001');
-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_department ON users(department);
CREATE INDEX idx_computers_lab ON computers(lab);
CREATE INDEX idx_computers_status ON computers(status);
CREATE INDEX idx_schedules_date ON schedules(date);
CREATE INDEX idx_schedules_status ON schedules(status);
CREATE INDEX idx_schedules_lab ON schedules(lab);
CREATE INDEX idx_attendance_schedule ON attendance(schedule_id);
CREATE INDEX idx_attendance_student ON attendance(student_id);
CREATE INDEX idx_maintenance_status ON maintenance_requests(status);
CREATE INDEX idx_maintenance_priority ON maintenance_requests(priority);
CREATE INDEX idx_equipment_category ON equipment(category);
CREATE INDEX idx_equipment_status ON equipment(status);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created ON notifications(created_at);

-- ============================================
-- INSERT DEFAULT DATA
-- ============================================

-- Insert default admin user (password: admin123)
INSERT INTO users (email, password, first_name, last_name, role, is_active, is_email_verified) VALUES
('admin@clms.com', '$2a$10$tH8Yq8rYq8rYq8rYq8rYq8u', 'System', 'Administrator', 'admin', TRUE, TRUE);

-- Insert default settings
INSERT INTO settings (key_name, value, type, category, description) VALUES
('system_name', 'CLMS', 'string', 'system', 'System name'),
('system_version', '2.0.0', 'string', 'system', 'System version'),
('maintenance_mode', 'false', 'boolean', 'system', 'Enable maintenance mode'),
('max_login_attempts', '5', 'number', 'security', 'Maximum failed login attempts'),
('session_timeout_minutes', '60', 'number', 'security', 'Session timeout in minutes');

-- Insert default institution
INSERT INTO institution (name, short_name, code, type, country, is_active) VALUES
('Injibara University', 'IU', 'INJU', 'university', 'Ethiopia', TRUE);

-- Insert default laboratories
INSERT INTO laboratories (code, name, location, capacity, computer_count, is_active) VALUES
('LAB101', 'Lab 101', 'Science Building, 1st Floor', 35, 0, TRUE),
('LAB102', 'Lab 102', 'Science Building, 1st Floor', 30, 0, TRUE),
('LAB103', 'Lab 103', 'Science Building, 2nd Floor', 28, 0, TRUE),
('LAB104', 'Lab 104', 'Engineering Building, 1st Floor', 35, 0, TRUE),
('LAB105', 'Lab 105', 'Engineering Building, 2nd Floor', 25, 0, TRUE);

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- View: Active users count by role
CREATE VIEW v_user_stats AS
SELECT 
    role,
    COUNT(*) as count,
    SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_count
FROM users 
GROUP BY role;

-- View: Computer status summary
CREATE VIEW v_computer_stats AS
SELECT 
    lab,
    COUNT(*) as total,
    SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available,
    SUM(CASE WHEN status = 'in-use' THEN 1 ELSE 0 END) as in_use,
    SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) as maintenance,
    SUM(CASE WHEN status = 'damaged' THEN 1 ELSE 0 END) as damaged
FROM computers 
GROUP BY lab;

-- View: Daily attendance summary
CREATE VIEW v_daily_attendance AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total,
    SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
    SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
    SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late
FROM attendance 
GROUP BY DATE(created_at);

-- ============================================
-- STORED PROCEDURES
-- ============================================

DELIMITER //

-- Procedure: Get user dashboard stats
CREATE PROCEDURE GetUserDashboardStats(IN user_id INT, IN user_role VARCHAR(20))
BEGIN
    IF user_role = 'admin' THEN
        SELECT 
            (SELECT COUNT(*) FROM users) as total_users,
            (SELECT COUNT(*) FROM computers) as total_computers,
            (SELECT COUNT(*) FROM schedules WHERE status = 'pending') as pending_schedules,
            (SELECT COUNT(*) FROM maintenance_requests WHERE status = 'pending') as pending_maintenance;
    ELSEIF user_role = 'teacher' THEN
        SELECT 
            (SELECT COUNT(*) FROM schedules WHERE created_by = user_id) as my_classes,
            (SELECT COUNT(*) FROM attendance WHERE schedule_id IN (SELECT id FROM schedules WHERE created_by = user_id)) as total_attendance;
    ELSEIF user_role = 'student' THEN
        SELECT 
            (SELECT COUNT(*) FROM attendance WHERE student_id = user_id) as total_attendance,
            (SELECT ROUND(AVG(CASE WHEN status = 'present' THEN 100 ELSE 0 END), 2) FROM attendance WHERE student_id = user_id) as attendance_rate;
    END IF;
END //

-- Procedure: Get lab utilization
CREATE PROCEDURE GetLabUtilization(IN lab_name VARCHAR(50), IN start_date DATE, IN end_date DATE)
BEGIN
    SELECT 
        date,
        COUNT(*) as total_sessions,
        SUM(students) as total_students
    FROM schedules 
    WHERE lab = lab_name 
        AND date BETWEEN start_date AND end_date
        AND status = 'approved'
    GROUP BY date
    ORDER BY date;
END //

DELIMITER ;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger: Update computer count in laboratory
DELIMITER //
CREATE TRIGGER update_lab_computer_count
AFTER INSERT ON computers
FOR EACH ROW
BEGIN
    UPDATE laboratories 
    SET computer_count = computer_count + 1 
    WHERE code = NEW.lab;
END //

CREATE TRIGGER update_lab_computer_count_delete
AFTER DELETE ON computers
FOR EACH ROW
BEGIN
    UPDATE laboratories 
    SET computer_count = computer_count - 1 
    WHERE code = OLD.lab;
END //

DELIMITER ;

-- ============================================
-- SAMPLE DATA FOR TESTING
-- ============================================

-- Insert sample computers
INSERT INTO computers (name, model, cpu, ram, storage, operating_system, lab, status) VALUES
('PC-001', 'Dell OptiPlex 7080', 'Intel Core i7-10700', '16GB', '512GB SSD', 'Windows 11 Pro', 'Lab 101', 'available'),
('PC-002', 'HP EliteDesk 800', 'Intel Core i5-10500', '8GB', '256GB SSD', 'Windows 11 Pro', 'Lab 101', 'in-use'),
('PC-003', 'Lenovo ThinkCentre', 'Intel Core i7-10700', '16GB', '512GB SSD', 'Ubuntu 22.04', 'Lab 102', 'available'),
('PC-004', 'Dell OptiPlex 7090', 'Intel Core i9-11900', '32GB', '1TB SSD', 'Windows 11 Pro', 'Lab 102', 'maintenance'),
('PC-005', 'HP EliteBook', 'Intel Core i5-1135G7', '8GB', '256GB SSD', 'Windows 11 Pro', 'Lab 103', 'available');

-- Insert sample equipment
INSERT INTO equipment (code, name, category, laboratory, status, condition) VALUES
('MON-001', 'HP 24" Monitor', 'monitor', 'Lab 101', 'available', 'good'),
('PROJ-001', 'Epson Projector', 'projector', 'Lab 102', 'available', 'excellent'),
('UPS-001', 'APC UPS 650VA', 'ups', 'Lab 101', 'available', 'good'),
('KBD-001', 'Wireless Keyboard', 'keyboard', 'Lab 103', 'available', 'good'),
('MOU-001', 'Wireless Mouse', 'mouse', 'Lab 103', 'available', 'good');

