import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const AttendancePage = () => {
    const { scheduleId } = useParams();
    const navigate = useNavigate();
    
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, [scheduleId]);

    const loadData = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        try {
            console.log('Loading students for schedule:', scheduleId);
            const studentsRes = await fetch(`http://localhost:5001/api/schedules/${scheduleId}/students`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const studentsData = await studentsRes.json();
            
            console.log('API Response:', studentsData);
            
            if (studentsData.success && studentsData.data) {
                console.log('Students loaded:', studentsData.data.length);
                setStudents(studentsData.data);
                
                const initialAttendance = {};
                studentsData.data.forEach(student => {
                    initialAttendance[student.id] = 'present';
                });
                setAttendance(initialAttendance);
            } else {
                console.log('No students found or API error');
                setStudents([]);
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (studentId, status) => {
        setAttendance(prev => ({ ...prev, [studentId]: status }));
    };

    const handleMarkAll = (status) => {
        const newAttendance = {};
        students.forEach(student => {
            newAttendance[student.id] = status;
        });
        setAttendance(newAttendance);
    };

    const handleSubmit = async () => {
        setSaving(true);
        const token = localStorage.getItem('token');
        
        const attendanceData = students.map(student => ({
            schedule_id: parseInt(scheduleId),
            student_id: student.id,
            status: attendance[student.id],
            notes: ''
        }));
        
        try {
            const response = await fetch('http://localhost:5001/api/attendance/bulk', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ attendance: attendanceData })
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert('Attendance saved successfully!');
                navigate('/teacher/dashboard');
            } else {
                alert('Failed to save attendance: ' + result.message);
            }
        } catch (error) {
            console.error('Error saving attendance:', error);
            alert('Failed to save attendance');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    border: '4px solid #e5e7eb',
                    borderTopColor: '#3b82f6',
                    borderRadius: '50%',
                    margin: '0 auto',
                    animation: 'spin 1s linear infinite'
                }}></div>
                <p style={{ marginTop: '20px' }}>Loading attendance data...</p>
                <style>{`
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    const presentCount = Object.values(attendance).filter(s => s === 'present').length;
    const absentCount = Object.values(attendance).filter(s => s === 'absent').length;
    const lateCount = Object.values(attendance).filter(s => s === 'late').length;

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
                <button 
                    onClick={() => navigate(-1)} 
                    style={{ background: '#6b7280', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}
                >
                    ← Back
                </button>
                <h1 style={{ margin: 0 }}>Take Attendance</h1>
                <div style={{ background: '#f3f4f6', padding: '10px 20px', borderRadius: '8px' }}>
                    <span>📅 Schedule ID: {scheduleId}</span>
                </div>
            </div>

            {/* Stats */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(4, 1fr)', 
                gap: '20px', 
                marginBottom: '30px' 
            }}>
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{students.length}</div>
                    <div style={{ color: '#6b7280' }}>Total Students</div>
                </div>
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center', borderTop: '4px solid #10b981' }}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>{presentCount}</div>
                    <div style={{ color: '#6b7280' }}>Present</div>
                </div>
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center', borderTop: '4px solid #ef4444' }}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ef4444' }}>{absentCount}</div>
                    <div style={{ color: '#6b7280' }}>Absent</div>
                </div>
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center', borderTop: '4px solid #f59e0b' }}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b' }}>{lateCount}</div>
                    <div style={{ color: '#6b7280' }}>Late</div>
                </div>
            </div>

            {/* Bulk Actions */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button onClick={() => handleMarkAll('present')} style={{ padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                    ✓ Mark All Present
                </button>
                <button onClick={() => handleMarkAll('absent')} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                    ✗ Mark All Absent
                </button>
                <button onClick={() => handleMarkAll('late')} style={{ padding: '8px 16px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                    ⏰ Mark All Late
                </button>
            </div>

            {/* Students Table */}
            {students.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', background: '#f9fafb', borderRadius: '12px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '10px' }}>📋</div>
                    <h3>No Students Found</h3>
                    <p>No students are enrolled in this schedule.</p>
                </div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f9fafb' }}>
                            <tr>
                                <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Student Name</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Student ID</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student) => (
                                <tr key={student.id}>
                                    <td style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>{student.name}</td>
                                    <td style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>{student.student_id || student.email || student.id}</td>
                                    <td style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>
                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                            <button 
                                                onClick={() => handleStatusChange(student.id, 'present')}
                                                style={{ 
                                                    padding: '6px 12px', 
                                                    background: attendance[student.id] === 'present' ? '#10b981' : 'white',
                                                    color: attendance[student.id] === 'present' ? 'white' : '#374151',
                                                    border: '1px solid #d1d5db',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                ✓ Present
                                            </button>
                                            <button 
                                                onClick={() => handleStatusChange(student.id, 'absent')}
                                                style={{ 
                                                    padding: '6px 12px', 
                                                    background: attendance[student.id] === 'absent' ? '#ef4444' : 'white',
                                                    color: attendance[student.id] === 'absent' ? 'white' : '#374151',
                                                    border: '1px solid #d1d5db',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                ✗ Absent
                                            </button>
                                            <button 
                                                onClick={() => handleStatusChange(student.id, 'late')}
                                                style={{ 
                                                    padding: '6px 12px', 
                                                    background: attendance[student.id] === 'late' ? '#f59e0b' : 'white',
                                                    color: attendance[student.id] === 'late' ? 'white' : '#374151',
                                                    border: '1px solid #d1d5db',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                ⏰ Late
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
                <button onClick={() => navigate(-1)} style={{ padding: '10px 20px', background: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                    Cancel
                </button>
                <button onClick={handleSubmit} disabled={saving} style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', opacity: saving ? 0.5 : 1 }}>
                    {saving ? 'Saving...' : 'Save Attendance'}
                </button>
            </div>
        </div>
    );
};

export default AttendancePage;