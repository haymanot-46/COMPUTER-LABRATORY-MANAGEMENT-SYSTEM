// frontend/src/pages/attendance/TakeAttendancePage/TakeAttendancePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { attendanceApi } from '../../../services/ApiService';
import { useAuth, useNotification } from '../../../hooks';
import './TakeAttendancePage.css';

const TakeAttendancePage = () => {
    const { scheduleId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addToast } = useNotification();
    
    const [session, setSession] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [autoSaveTimer, setAutoSaveTimer] = useState(null);
    const [unsavedChanges, setUnsavedChanges] = useState(false);

    useEffect(() => {
        loadSessionData();
        
        // Auto-save every 30 seconds (FR-ATT-006)
        const timer = setInterval(() => {
            if (unsavedChanges && students.some(s => s.status !== 'absent')) {
                autoSaveAttendance();
            }
        }, 30000);
        
        setAutoSaveTimer(timer);
        
        return () => {
            if (autoSaveTimer) clearInterval(autoSaveTimer);
        };
    }, [scheduleId, unsavedChanges, students]);

    const loadSessionData = async () => {
        try {
            setLoading(true);
            const response = await attendanceApi.getSessionForAttendance(scheduleId);
            setSession(response.data.session);
            setStudents(response.data.students.map(s => ({ ...s, status: s.status || 'absent', modified: false })));
        } catch (error) {
            console.error('Error loading session:', error);
            addToast('Failed to load session data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const markAttendance = (studentId, status) => {
        setStudents(prev => prev.map(student => 
            student.id === studentId ? { ...student, status, modified: true } : student
        ));
        setUnsavedChanges(true);
    };

    const bulkMark = (status) => {
        setStudents(prev => prev.map(student => ({ 
            ...student, 
            status, 
            modified: true 
        })));
        setUnsavedChanges(true);
        addToast(`Marked all students as ${status}`, 'info');
    };

    const autoSaveAttendance = useCallback(async () => {
        const modifiedStudents = students.filter(s => s.modified);
        if (modifiedStudents.length === 0) return;
        
        try {
            await attendanceApi.bulkMarkAttendance({
                schedule_id: scheduleId,
                students: modifiedStudents.map(s => ({
                    student_id: s.id,
                    status: s.status,
                    computer_id: s.computer_id
                }))
            });
            
            setStudents(prev => prev.map(s => ({ ...s, modified: false })));
            setUnsavedChanges(false);
            console.log('Auto-saved successfully');
        } catch (error) {
            console.error('Auto-save failed:', error);
        }
    }, [students, scheduleId, attendanceApi]);

    const saveAttendance = async () => {
        setSaving(true);
        try {
            await autoSaveAttendance();
            addToast('Attendance saved successfully!', 'success');
            navigate('/attendance');
        } catch (error) {
            addToast('Failed to save attendance', 'error');
        } finally {
            setSaving(false);
        }
    };

    const getStats = () => {
        const present = students.filter(s => s.status === 'present').length;
        const late = students.filter(s => s.status === 'late').length;
        const absent = students.filter(s => s.status === 'absent').length;
        const total = students.length;
        const percentage = total > 0 ? ((present + late) / total * 100).toFixed(1) : 0;
        return { present, late, absent, total, percentage };
    };

    const stats = getStats();
    const isLabAssistant = user?.role === 'lab_assistant';

    if (loading) {
        return <div className="loading-container">Loading attendance session...</div>;
    }

    if (!session) {
        return <div className="error-container">Session not found</div>;
    }

    return (
        <div className="attendance-page">
            <div className="attendance-header">
                <button className="back-btn" onClick={() => navigate('/attendance')}>
                    ← Back
                </button>
                <h1>📋 Mark Attendance</h1>
                {isLabAssistant && (
                    <div className="assistant-badge">
                        ⚠️ Taking attendance as Lab Assistant (Teacher Absent)
                    </div>
                )}
            </div>

            <div className="session-info-card">
                <h3>{session?.course_name || 'Lab Session'}</h3>
                <div className="session-details">
                    <span>📅 {session?.date}</span>
                    <span>🕒 {session?.start_time} - {session?.end_time}</span>
                    <span>🔬 {session?.lab_name}</span>
                    <span>👨‍🏫 {session?.instructor_name}</span>
                </div>
            </div>

            <div className="attendance-stats">
                <div className="stat-card present">
                    <div className="stat-value">{stats.present}</div>
                    <div className="stat-label">Present</div>
                </div>
                <div className="stat-card late">
                    <div className="stat-value">{stats.late}</div>
                    <div className="stat-label">Late</div>
                </div>
                <div className="stat-card absent">
                    <div className="stat-value">{stats.absent}</div>
                    <div className="stat-label">Absent</div>
                </div>
                <div className="stat-card total">
                    <div className="stat-value">{stats.total}</div>
                    <div className="stat-label">Total</div>
                </div>
                <div className="stat-card percentage">
                    <div className="stat-value">{stats.percentage}%</div>
                    <div className="stat-label">Attendance</div>
                </div>
            </div>

            <div className="bulk-actions">
                <button className="btn-present" onClick={() => bulkMark('present')}>
                    ✅ Mark All Present
                </button>
                <button className="btn-late" onClick={() => bulkMark('late')}>
                    ⏰ Mark All Late
                </button>
                <button className="btn-absent" onClick={() => bulkMark('absent')}>
                    ❌ Mark All Absent
                </button>
            </div>

            <div className="students-table-container">
                <table className="students-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Student ID</th>
                            <th>Name</th>
                            <th>Department</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student, index) => (
                            <tr key={student.id} className={`student-row status-${student.status}`}>
                                <td>{index + 1}</td>
                                <td>{student.student_id || '-'}</td>
                                <td>{student.name}</td>
                                <td>{student.department || '-'}</td>
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

            <div className="attendance-footer">
                <div className="auto-save-info">
                    💾 Auto-saving every 30 seconds
                    {unsavedChanges && <span className="unsaved"> • Unsaved changes</span>}
                </div>
                <button 
                    className="save-btn"
                    onClick={saveAttendance}
                    disabled={saving}
                >
                    {saving ? 'Saving...' : 'Save Attendance'}
                </button>
            </div>
        </div>
    );
};

export default TakeAttendancePage;