import React, { useState, useEffect } from 'react';
import { attendanceApi } from '../../services/ApiService';
import './Attendance.css';

const LabAssistantAttendance = () => {
    const [assignedSessions, setAssignedSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [offlineQueue, setOfflineQueue] = useState([]);

    useEffect(() => {
        loadAssignedSessions();
        
        // Check for offline data to sync
        checkOfflineQueue();
        
        // Attempt to sync offline data when online
        window.addEventListener('online', syncOfflineData);
        
        return () => window.removeEventListener('online', syncOfflineData);
    }, []);

    const loadAssignedSessions = async () => {
        try {
            setLoading(true);
            const today = new Date().toISOString().split('T')[0];
            const response = await attendanceApi.getSessions({ date: today });
            setAssignedSessions(response.data || []);
        } catch (error) {
            console.error('Error loading assigned sessions:', error);
        } finally {
            setLoading(false);
        }
    };

    const takeAttendance = async (sessionId, teacherAbsent = true) => {
        if (teacherAbsent) {
            // Confirm teacher is absent (FR-ATT-007)
            const confirmed = window.confirm(
                'Confirm that the teacher is absent. You will be marking attendance on their behalf.'
            );
            if (!confirmed) return;
        }
        
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

    const markAttendanceOffline = (studentId, status) => {
        // Store offline when no internet (FR-ATT-007)
        const offlineRecord = {
            session_id: selectedSession,
            student_id: studentId,
            status: status,
            timestamp: new Date().toISOString(),
            marked_by: 'lab_assistant'
        };
        
        // Add to offline queue
        const updatedQueue = [...offlineQueue, offlineRecord];
        setOfflineQueue(updatedQueue);
        localStorage.setItem('offline_attendance', JSON.stringify(updatedQueue));
        
        // Update local UI
        setStudents(prev => prev.map(student => 
            student.id === studentId ? { ...student, status: status } : student
        ));
        
        alert('Attendance saved offline. Will sync when internet is available.');
    };

    const syncOfflineData = async () => {
        const storedQueue = localStorage.getItem('offline_attendance');
        if (!storedQueue) return;
        
        const queue = JSON.parse(storedQueue);
        if (queue.length === 0) return;
        
        try {
            await attendanceApi.syncOffline({ offline_data: queue });
            localStorage.removeItem('offline_attendance');
            setOfflineQueue([]);
            alert('Offline attendance data synced successfully!');
        } catch (error) {
            console.error('Error syncing offline data:', error);
        }
    };

    const checkOfflineQueue = () => {
        const storedQueue = localStorage.getItem('offline_attendance');
        if (storedQueue) {
            setOfflineQueue(JSON.parse(storedQueue));
        }
    };

    const markAttendance = async (studentId, status) => {
        if (!navigator.onLine) {
            markAttendanceOffline(studentId, status);
            return;
        }
        
        try {
            await attendanceApi.markAttendance({
                session_id: selectedSession,
                student_id: studentId,
                status: status
            });
            
            setStudents(prev => prev.map(student => 
                student.id === studentId ? { ...student, status: status } : student
            ));
        } catch (error) {
            console.error('Error marking attendance:', error);
            // Fallback to offline
            markAttendanceOffline(studentId, status);
        }
    };

    const getAttendanceStats = () => {
        const present = students.filter(s => s.status === 'present').length;
        const late = students.filter(s => s.status === 'late').length;
        const absent = students.filter(s => s.status === 'absent').length;
        const total = students.length;
        
        return { present, late, absent, total };
    };

    const stats = getAttendanceStats();

    return (
        <div className="attendance-container">
            <div className="attendance-header">
                <h1>🛠️ Lab Assistant - Attendance Management</h1>
                <p>Take attendance when teacher is absent</p>
                {offlineQueue.length > 0 && (
                    <div className="offline-badge">
                        📱 {offlineQueue.length} pending offline records
                        {navigator.onLine && (
                            <button onClick={syncOfflineData}>Sync Now</button>
                        )}
                    </div>
                )}
            </div>

            {!selectedSession ? (
                <div className="sessions-list">
                    <h2>Assigned Lab Sessions</h2>
                    {assignedSessions.map(session => (
                        <div key={session.id} className="session-card">
                            <div className="session-info">
                                <h3>{session.course_name || 'Lab Session'}</h3>
                                <p>🕒 {session.start_time} - {session.end_time}</p>
                                <p>🔬 {session.lab_name}</p>
                                <p>👨‍🏫 Teacher: {session.instructor_name}</p>
                                {session.lab_assistant_id && (
                                    <p className="assigned-badge">✓ Assigned to you</p>
                                )}
                            </div>
                            <button 
                                className="take-attendance-btn"
                                onClick={() => takeAttendance(session.id, true)}
                            >
                                Take Attendance (Teacher Absent)
                            </button>
                        </div>
                    ))}
                    
                    {assignedSessions.length === 0 && (
                        <div className="no-sessions">
                            <p>No lab sessions assigned to you</p>
                            <p className="sub-text">
                                Department Dean or Lab Manager will assign you when teachers are absent
                            </p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="attendance-workspace">
                    <div className="workspace-header">
                        <button className="back-btn" onClick={() => setSelectedSession(null)}>
                            ← Back to Sessions
                        </button>
                        <div className="assistant-notice">
                            ⚠️ You are marking attendance because the teacher is absent
                        </div>
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
                        </div>
                    </div>

                    <div className="students-table-container">
                        <table className="students-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Student ID</th>
                                    <th>Name</th>
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

                    {!navigator.onLine && (
                        <div className="offline-warning">
                            ⚠️ You are offline. Attendance is being saved locally and will sync when online.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default LabAssistantAttendance;