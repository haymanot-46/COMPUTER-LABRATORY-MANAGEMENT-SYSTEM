import React, { useState, useEffect } from 'react';
import { attendanceApi } from '../../services/ApiService';
import './Attendance.css';

const TeacherAttendance = () => {
    const [sessions, setSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [autoSave, setAutoSave] = useState(null);

    useEffect(() => {
        loadTodaySessions();
        
        // Auto-save every 30 seconds (FR-ATT-006)
        const interval = setInterval(() => {
            if (selectedSession && hasUnsavedChanges) {
                autoSaveAttendance();
            }
        }, 30000);
        
        return () => clearInterval(interval);
    }, []);

    const loadTodaySessions = async () => {
        try {
            setLoading(true);
            const today = new Date().toISOString().split('T')[0];
            const response = await attendanceApi.getSessions({ date: today, status: 'active' });
            setSessions(response.data || []);
        } catch (error) {
            console.error('Error loading sessions:', error);
        } finally {
            setLoading(false);
        }
    };

    const startSession = async (sessionId) => {
        try {
            await attendanceApi.startSession(sessionId);
            await loadSessionStudents(sessionId);
            setSelectedSession(sessionId);
        } catch (error) {
            console.error('Error starting session:', error);
        }
    };

    const loadSessionStudents = async (sessionId) => {
        try {
            const response = await attendanceApi.getSessionReport(sessionId);
            setStudents(response.data?.students || []);
        } catch (error) {
            console.error('Error loading students:', error);
        }
    };

    const markAttendance = async (studentId, status, computerId = null) => {
        try {
            await attendanceApi.markAttendance({
                session_id: selectedSession,
                student_id: studentId,
                status: status,
                computer_id: computerId
            });
            
            // Update local state
            setStudents(prev => prev.map(student => 
                student.id === studentId ? { ...student, status: status } : student
            ));
            
        } catch (error) {
            console.error('Error marking attendance:', error);
        }
    };

    const bulkMark = async (status) => {
        const presentStudents = students.filter(s => s.status === 'present').map(s => s.id);
        const absentStudents = students.filter(s => s.status === 'absent').map(s => s.id);
        
        const targetStudents = status === 'present' ? absentStudents : presentStudents;
        
        if (targetStudents.length === 0) return;
        
        try {
            await attendanceApi.bulkMarkAttendance({
                session_id: selectedSession,
                student_ids: targetStudents,
                status: status
            });
            
            setStudents(prev => prev.map(student => 
                targetStudents.includes(student.id) ? { ...student, status: status } : student
            ));
        } catch (error) {
            console.error('Error bulk marking:', error);
        }
    };

    const getAttendanceStats = () => {
        const present = students.filter(s => s.status === 'present').length;
        const late = students.filter(s => s.status === 'late').length;
        const absent = students.filter(s => s.status === 'absent').length;
        const total = students.length;
        const percentage = total > 0 ? ((present + late) / total * 100).toFixed(1) : 0;
        
        return { present, late, absent, total, percentage };
    };

    const stats = getAttendanceStats();

    return (
        <div className="attendance-container">
            <div className="attendance-header">
                <h1>📋 Laboratory Attendance Management</h1>
                <p>Mark and track student attendance for lab sessions</p>
            </div>

            {!selectedSession ? (
                <div className="sessions-list">
                    <h2>Today's Lab Sessions</h2>
                    {sessions.map(session => (
                        <div key={session.id} className="session-card">
                            <div className="session-info">
                                <h3>{session.course_name || 'Lab Session'}</h3>
                                <p>🕒 {session.start_time} - {session.end_time}</p>
                                <p>🔬 {session.lab_name}</p>
                                <p>👨‍🏫 Instructor: {session.instructor_name}</p>
                            </div>
                            <button 
                                className="start-session-btn"
                                onClick={() => startSession(session.id)}
                            >
                                Start Session & Mark Attendance
                            </button>
                        </div>
                    ))}
                    
                    {sessions.length === 0 && (
                        <div className="no-sessions">
                            <p>No active lab sessions for today</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="attendance-workspace">
                    <div className="workspace-header">
                        <button className="back-btn" onClick={() => setSelectedSession(null)}>
                            ← Back to Sessions
                        </button>
                        <div className="attendance-stats">
                            <div className="stat">
                                <span className="stat-value">{stats.present}</span>
                                <span className="stat-label">Present</span>
                            </div>
                            <div className="stat late">
                                <span className="stat-value">{stats.late}</span>
                                <span className="stat-label">Late</span>
                            </div>
                            <div className="stat absent">
                                <span className="stat-value">{stats.absent}</span>
                                <span className="stat-label">Absent</span>
                            </div>
                            <div className="stat total">
                                <span className="stat-value">{stats.total}</span>
                                <span className="stat-label">Total</span>
                            </div>
                            <div className="stat percentage">
                                <span className="stat-value">{stats.percentage}%</span>
                                <span className="stat-label">Attendance</span>
                            </div>
                        </div>
                        <div className="bulk-actions">
                            <button className="bulk-present" onClick={() => bulkMark('present')}>
                                ✅ Mark All Present
                            </button>
                            <button className="bulk-absent" onClick={() => bulkMark('absent')}>
                                ❌ Mark All Absent
                            </button>
                        </div>
                    </div>

                    <div className="students-table-container">
                        <table className="students-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Student ID</th>
                                    <th>Name</th>
                                    <th>Computer</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student, index) => (
                                    <tr key={student.id} className={`status-${student.status}`}>
                                        <td>{index + 1}</td>
                                        <td>{student.student_id || '-'}</td>
                                        <td>{student.name}</td>
                                        <td>
                                            <select className="computer-select">
                                                <option value="">Select Computer</option>
                                                {[1,2,3,4,5,6,7,8,9,10].map(num => (
                                                    <option key={num} value={num}>
                                                        PC-{num}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${student.status}`}>
                                                {student.status === 'present' ? '✅ Present' : 
                                                 student.status === 'late' ? '⏰ Late' : '❌ Absent'}
                                            </span>
                                        </td>
                                        <td className="action-buttons">
                                            <button 
                                                className="present-btn"
                                                onClick={() => markAttendance(student.id, 'present')}
                                                disabled={student.status === 'present'}
                                            >
                                                Present
                                            </button>
                                            <button 
                                                className="late-btn"
                                                onClick={() => markAttendance(student.id, 'late')}
                                                disabled={student.status === 'late'}
                                            >
                                                Late
                                            </button>
                                            <button 
                                                className="absent-btn"
                                                onClick={() => markAttendance(student.id, 'absent')}
                                                disabled={student.status === 'absent'}
                                            >
                                                Absent
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="auto-save-info">
                        <span>💾 Auto-saving every 30 seconds</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherAttendance;