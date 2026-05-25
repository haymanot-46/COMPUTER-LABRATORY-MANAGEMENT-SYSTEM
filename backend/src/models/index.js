const User = require('./User');
const Laboratory = require('./Laboratory');
const Computer = require('./Computer');
const Schedule = require('./Schedule');
const Attendance = require('./Attendance');
const MaintenanceRequest = require('./MaintenanceRequest');
const Equipment = require('./Equipment');
const EquipmentAudit = require('./EquipmentAudit');
const Report = require('./Report');
const Notification = require('./Notification');
const Settings = require('./Settings');

// Define associations
User.hasMany(Schedule, { as: 'teacherSchedules', foreignKey: 'requester_id' });
User.hasMany(Attendance, { as: 'studentAttendance', foreignKey: 'student_id' });
User.hasMany(MaintenanceRequest, { as: 'reportedMaintenance', foreignKey: 'requester_id' });
User.hasMany(Notification, { as: 'notifications', foreignKey: 'user_id' });

Laboratory.hasMany(Computer, { foreignKey: 'laboratory_id' });
Laboratory.hasMany(Schedule, { foreignKey: 'laboratory_id' });

Computer.belongsTo(Laboratory, { foreignKey: 'laboratory_id' });
Computer.hasMany(MaintenanceRequest, { foreignKey: 'computer_id' });

Schedule.belongsTo(Laboratory, { foreignKey: 'laboratory_id' });
Schedule.belongsTo(User, { as: 'requester', foreignKey: 'requester_id' });
Schedule.belongsTo(User, { as: 'approver', foreignKey: 'approver_id' });
Schedule.hasMany(Attendance, { foreignKey: 'schedule_id' });

Attendance.belongsTo(Schedule, { foreignKey: 'schedule_id' });
Attendance.belongsTo(User, { as: 'student', foreignKey: 'student_id' });
Attendance.belongsTo(User, { as: 'marker', foreignKey: 'marked_by' });

MaintenanceRequest.belongsTo(Computer, { foreignKey: 'computer_id' });
MaintenanceRequest.belongsTo(Laboratory, { foreignKey: 'laboratory_id' });
MaintenanceRequest.belongsTo(User, { as: 'requester', foreignKey: 'requester_id' });
MaintenanceRequest.belongsTo(User, { as: 'assignee', foreignKey: 'assignee_id' });

module.exports = {
    User,
    Laboratory,
    Computer,
    Schedule,
    Attendance,
    MaintenanceRequest,
    Equipment,
    EquipmentAudit,
    Report,
    Notification,
    Settings
};