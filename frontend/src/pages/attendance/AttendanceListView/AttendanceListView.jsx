// frontend/src/pages/attendance/AttendanceListView/AttendanceListView.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks';

const AttendanceListView = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        loadSchedules();
    }, [selectedDate]);

    const loadSchedules = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        try {
            // Try different API endpoints based on role
            let url = `http://localhost:5001/api/schedules/teacher?date=${selectedDate}`;
            
            if (user?.role === 'lab_assistant') {
                url = `http://localhost:5001/api/schedules/lab-assistant?date=${selectedDate}`;
            } else if (user?.role === 'lab_manager') {
                url = `http://localhost:5001/api/schedules/lab-manager?date=${selectedDate}`;
            }
            
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            
            if (data.success) {
                setSchedules(data.data || []);
            } else {
                console.error('API error:', data.message);
                setSchedules([]);
            }
        } catch (error) {
            console.error('Error loading schedules:', error);
            setSchedules([]);
        } finally {
            setLoading(false);
        }
    };

    const takeAttendance = (scheduleId) => {
        navigate(`/attendance/${scheduleId}`);
    };

    const isLabAssistant = user?.role === 'lab_assistant';

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ margin: '0 0 10px 0' }}>📋 Attendance Management</h1>
                <p style={{ color: '#666', margin: 0 }}>Select a lab session to mark attendance</p>
            </div>

            {isLabAssistant && (
                <div style={{ 
                    background: '#e3f2fd', 
                    padding: '15px 20px', 
                    borderRadius: '10px', 
                    marginBottom: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap'
                }}>
                    <span>🛠️ You are taking attendance as a Lab Assistant</span>
                    <button 
                        onClick={() => navigate('/lab-assistant/assigned-sessions')}
                        style={{ 
                            padding: '8px 16px', 
                            background: '#2196f3', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '5px', 
                            cursor: 'pointer' 
                        }}
                    >
                        View Assigned Sessions
                    </button>
                </div>
            )}

            <div style={{ 
                background: 'white', 
                padding: '20px', 
                borderRadius: '10px', 
                marginBottom: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Select Date:</label>
                <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    style={{ 
                        padding: '10px', 
                        border: '1px solid #ddd', 
                        borderRadius: '5px', 
                        width: '200px' 
                    }}
                />
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        border: '4px solid #e5e7eb',
                        borderTopColor: '#3b82f6',
                        borderRadius: '50%',
                        margin: '0 auto',
                        animation: 'spin 1s linear infinite'
                    }}></div>
                    <p style={{ marginTop: '20px' }}>Loading schedules...</p>
                    <style>{`
                        @keyframes spin {
                            to { transform: rotate(360deg); }
                        }
                    `}</style>
                </div>
            ) : schedules.length === 0 ? (
                <div style={{ 
                    textAlign: 'center', 
                    padding: '50px', 
                    background: '#f9fafb', 
                    borderRadius: '10px' 
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '10px' }}>📅</div>
                    <h3>No Lab Sessions</h3>
                    <p>No lab sessions scheduled for {selectedDate}</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '15px' }}>
                    {schedules.map(schedule => (
                        <div key={schedule.id} style={{ 
                            background: 'white', 
                            padding: '20px', 
                            borderRadius: '10px', 
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap'
                        }}>
                            <div>
                                <h3 style={{ margin: '0 0 10px 0' }}>{schedule.course_name || 'Lab Session'}</h3>
                                <div style={{ display: 'flex', gap: '20px', fontSize: '14px', color: '#666', flexWrap: 'wrap' }}>
                                    <span>🕒 {schedule.start_time} - {schedule.end_time}</span>
                                    <span>🔬 {schedule.lab_name}</span>
                                    <span>👨‍🏫 {schedule.instructor_name || schedule.teacher_name}</span>
                                </div>
                                {schedule.batch_name && (
                                    <div style={{ fontSize: '12px', color: '#888', marginTop: '5px' }}>
                                        Batch: {schedule.batch_name}
                                    </div>
                                )}
                            </div>
                            <button 
                                onClick={() => takeAttendance(schedule.id)}
                                style={{ 
                                    padding: '10px 20px', 
                                    background: '#4caf50', 
                                    color: 'white', 
                                    border: 'none', 
                                    borderRadius: '5px', 
                                    cursor: 'pointer',
                                    marginTop: '10px'
                                }}
                            >
                                Take Attendance →
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AttendanceListView;