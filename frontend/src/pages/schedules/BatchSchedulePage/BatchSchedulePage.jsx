import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useRole, useNotification } from '../../../hooks';
import { scheduleService } from '../../../services';
import './BatchSchedulePage.css';

const BatchSchedulePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDean } = useRole();
  const { addToast, addNotification } = useNotification();
  
  const [batches, setBatches] = useState([]);
  const [laboratories, setLaboratories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [customBatchName, setCustomBatchName] = useState(false);
  const [formData, setFormData] = useState({
    batchName: '',
    batchType: 'predefined',
    semester: '',
    year: '',
    college: '',
    department: '',
    courses: [],
    labPreferences: [],
    startDate: '',
    endDate: '',
    daysOfWeek: [],
    timeSlots: []
  });

  // Pre-defined batch options
  const batchOptions = [
    { id: 1, name: ' 1st Year ', year: 1, semester: '1st Semester'},
    { id: 2, name: ' 1st Year ', year: 1, semester: '2nd Semester'},
    { id: 3, name: ' 2nd Year ', year: 2, semester: '1st Semester'},
    { id: 4, name: ' 2nd Year ', year: 2, semester: '2nd Semester'},
    { id: 5, name: ' 3rd Year ', year: 3, semester: '1st Semester'},
    { id: 6, name: ' 3rd Year ', year: 3, semester: '2nd Semester'},
    { id: 7, name: ' 4th Year ', year: 4, semester: '1st Semester'},
    { id: 8, name: ' 4th Year ', year: 4, semester: '2nd Semester'},
    { id: 9, name: ' 5th Year ', year: 5, semester: '1st Semester'},
    { id: 10, name: ' 5th Year ', year: 5, semester: '2nd Semester'},
    { id: 11, name: ' 6th Year ', year: 6, semester: '2nd Semester'},
    { id: 12, name: ' 6th Year ', year: 6, semester: '2nd Semester'},
    { id: 13, name: ' 7th Year ', year: 7, semester: '2nd Semester'},
    { id: 14, name: ' 7th Year ', year: 7, semester: '2nd Semester'}
  ];

  // Hierarchical Data Structure
  const colleges = [
    {
      id: 1,
      name: 'College of Engineering and Technology',
      departments: [
        {
          id: 11,
          name: 'Computer Science',
          courses: [
            { id: 111, code: 'CS311', name: 'Database Systems', credits: 3, lab_hours: 2 },
            { id: 112, code: 'CS312', name: 'Computer Networks', credits: 3, lab_hours: 2 },
            { id: 113, code: 'CS313', name: 'Software Engineering', credits: 3, lab_hours: 2 },
            { id: 114, code: 'CS314', name: 'Web Development', credits: 3, lab_hours: 2 },
            { id: 115, code: 'CS315', name: 'Data Structures', credits: 3, lab_hours: 2 },
            { id: 116, code: 'CS316', name: 'Operating Systems', credits: 3, lab_hours: 2 },
            { id: 117, code: 'CS317', name: 'Artificial Intelligence', credits: 3, lab_hours: 2 },
            { id: 118, code: 'CS318', name: 'Cyber Security', credits: 3, lab_hours: 2 }
          ]
        },
        {
          id: 12,
          name: 'Software Engineering',
          courses: [
            { id: 121, code: 'SE401', name: 'Advanced Programming', credits: 3, lab_hours: 2 },
            { id: 122, code: 'SE402', name: 'Software Testing', credits: 3, lab_hours: 2 },
            { id: 123, code: 'SE403', name: 'Agile Development', credits: 3, lab_hours: 2 },
            { id: 124, code: 'SE404', name: 'DevOps', credits: 3, lab_hours: 2 }
          ]
        },
        {
          id: 13,
          name: 'Information Technology',
          courses: [
            { id: 131, code: 'IT501', name: 'Network Administration', credits: 3, lab_hours: 2 },
            { id: 132, code: 'IT502', name: 'Database Management', credits: 3, lab_hours: 2 },
            { id: 133, code: 'IT503', name: 'Web Technologies', credits: 3, lab_hours: 2 },
            { id: 134, code: 'IT504', name: 'IT Project Management', credits: 3, lab_hours: 2 }
          ]
        },
        {
          id: 14,
          name: 'Computer Engineering',
          courses: [
            { id: 141, code: 'CE601', name: 'Digital Logic', credits: 3, lab_hours: 2 },
            { id: 142, code: 'CE602', name: 'Microprocessors', credits: 3, lab_hours: 2 },
            { id: 143, code: 'CE603', name: 'Embedded Systems', credits: 3, lab_hours: 2 },
            { id: 144, code: 'CE604', name: 'Computer Architecture', credits: 3, lab_hours: 2 }
          ]
        }
      ]
    },
    {
      id: 2,
      name: 'College of Health Sciences',
      departments: [
        {
          id: 21,
          name: 'Health Informatics',
          courses: [
            { id: 211, code: 'HI701', name: 'Health Information Systems', credits: 3, lab_hours: 2 },
            { id: 212, code: 'HI702', name: 'Medical Database Systems', credits: 3, lab_hours: 2 }
          ]
        },
        {
          id: 22,
          name: 'Public Health',
          courses: [
            { id: 221, code: 'PH801', name: 'Biostatistics', credits: 3, lab_hours: 1 },
            { id: 222, code: 'PH802', name: 'Epidemiology', credits: 3, lab_hours: 1 }
          ]
        }
      ]
    },
    {
      id: 3,
      name: 'College of Social Sciences',
      departments: [
        {
          id: 31,
          name: 'Economics',
          courses: [
            { id: 311, code: 'EC901', name: 'Econometrics', credits: 3, lab_hours: 1 },
            { id: 312, code: 'EC902', name: 'Data Analysis', credits: 3, lab_hours: 1 }
          ]
        }
      ]
    }
  ];

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = ['8:00-10:00', '10:00-12:00', '13:00-15:00', '15:00-17:00'];
  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    
    // Load laboratories
    try {
      const labsResult = await scheduleService.getLaboratories();
      if (labsResult.success) {
        setLaboratories(labsResult.data);
      }
    } catch (error) {
      console.error('Error loading laboratories:', error);
      setLaboratories([
        { id: 1, name: 'Computer Lab 101', code: 'LAB101', capacity: 35 },
        { id: 2, name: 'Computer Lab 102', code: 'LAB102', capacity: 30 },
        { id: 3, name: 'Computer Lab 103', code: 'LAB103', capacity: 35 },
        { id: 4, name: 'Research Lab', code: 'LAB201', capacity: 25 }
      ]);
    }
    
    setLoading(false);
  };

  const handleBatchSelect = (batchId) => {
    const selected = batchOptions.find(b => b.id === parseInt(batchId));
    if (selected) {
      setSelectedBatch(selected);
      setFormData({
        ...formData,
        batchName: selected.name,
        batchType: 'predefined',
        semester: selected.semester,
        year: selected.year,
        college: selected.college === 'Engineering' ? 1 : selected.college === 'Health Sciences' ? 2 : 3,
        department: getDepartmentIdByName(selected.department),
        courses: []
      });
    }
  };

  const getDepartmentIdByName = (deptName) => {
    for (const college of colleges) {
      const dept = college.departments.find(d => d.name === deptName);
      if (dept) return dept.id;
    }
    return '';
  };

  const handleCustomBatchToggle = () => {
    setCustomBatchName(!customBatchName);
    if (!customBatchName) {
      setFormData({
        ...formData,
        batchName: '',
        batchType: 'custom',
        selectedBatch: null
      });
      setSelectedBatch(null);
    } else {
      setFormData({
        ...formData,
        batchType: 'predefined'
      });
    }
  };

  const handleCollegeChange = (collegeId) => {
    setFormData({ 
      ...formData, 
      college: collegeId,
      department: '',
      courses: []
    });
  };

  const handleDepartmentChange = (departmentId) => {
    setFormData({ 
      ...formData, 
      department: departmentId,
      courses: []
    });
  };

  const handleCourseToggle = (course) => {
    const courseExists = formData.courses.find(c => c.id === course.id);
    if (courseExists) {
      setFormData({
        ...formData,
        courses: formData.courses.filter(c => c.id !== course.id)
      });
    } else {
      setFormData({
        ...formData,
        courses: [...formData.courses, course]
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePreferenceToggle = (labId) => {
    const prefExists = formData.labPreferences.includes(labId);
    if (prefExists) {
      setFormData({
        ...formData,
        labPreferences: formData.labPreferences.filter(id => id !== labId)
      });
    } else {
      setFormData({
        ...formData,
        labPreferences: [...formData.labPreferences, labId]
      });
    }
  };

  const handleDayToggle = (day) => {
    const dayExists = formData.daysOfWeek.includes(day);
    if (dayExists) {
      setFormData({
        ...formData,
        daysOfWeek: formData.daysOfWeek.filter(d => d !== day)
      });
    } else {
      setFormData({
        ...formData,
        daysOfWeek: [...formData.daysOfWeek, day]
      });
    }
  };

  const handleTimeSlotToggle = (slot) => {
    const slotExists = formData.timeSlots.includes(slot);
    if (slotExists) {
      setFormData({
        ...formData,
        timeSlots: formData.timeSlots.filter(s => s !== slot)
      });
    } else {
      setFormData({
        ...formData,
        timeSlots: [...formData.timeSlots, slot]
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate
    if (!formData.batchName) {
      addToast('Please enter/select a batch name', 'error');
      return;
    }
    if (!formData.college) {
      addToast('Please select a college', 'error');
      return;
    }
    if (!formData.department) {
      addToast('Please select a department', 'error');
      return;
    }
    if (formData.courses.length === 0) {
      addToast('Please select at least one course', 'error');
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      addToast('Please select start and end dates', 'error');
      return;
    }
    
    setSubmitting(true);
    
    const submitData = {
      batchName: formData.batchName,
      semester: formData.semester,
      year: formData.year,
      college: formData.college,
      department: formData.department,
      courses: formData.courses.map(c => c.name),
      courseDetails: formData.courses,
      labPreferences: formData.labPreferences.length > 0 ? formData.labPreferences : [1],
      startDate: formData.startDate,
      endDate: formData.endDate,
      daysOfWeek: formData.daysOfWeek.length > 0 ? formData.daysOfWeek : ['Monday', 'Wednesday', 'Friday'],
      timeSlots: formData.timeSlots.length > 0 ? formData.timeSlots : ['10:00-12:00']
    };
    
    try {
      const result = await scheduleService.batchCreateSchedules(submitData);
      
      if (result.success) {
        addToast(`Batch schedule created for ${formData.batchName}: ${result.data?.count || 0} sessions scheduled`, 'success');
        if (addNotification) {
          addNotification({
            title: 'Batch Schedule Created',
            message: `Schedule created for ${formData.batchName} for the semester`,
            type: 'success'
          });
        }
        // Reset form
        setFormData({
          batchName: '',
          batchType: 'predefined',
          semester: '',
          year: '',
          college: '',
          department: '',
          courses: [],
          labPreferences: [],
          startDate: '',
          endDate: '',
          daysOfWeek: [],
          timeSlots: []
        });
        setSelectedBatch(null);
        setCustomBatchName(false);
      } else {
        addToast(result.message || 'Failed to create batch schedule', 'error');
      }
    } catch (error) {
      console.error('Error creating batch schedule:', error);
      addToast('Failed to create batch schedule', 'error');
    }
    
    setSubmitting(false);
  };

  const getSelectedCollege = () => {
    return colleges.find(c => c.id === parseInt(formData.college));
  };

  const getSelectedDepartment = () => {
    const college = getSelectedCollege();
    if (college && formData.department) {
      return college.departments.find(d => d.id === parseInt(formData.department));
    }
    return null;
  };

  const selectedCollege = getSelectedCollege();
  const selectedDepartment = getSelectedDepartment();

  if (loading) {
    return (
      <div className="batch-loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="batch-schedule-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <h1>Batch Schedule</h1>
        <p>Create schedules for entire batches for the semester</p>
      </div>

      <div className="batch-container">
        <div className="batch-form-section">
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h3>📋 Batch Information</h3>
              
              {/* Batch Type Selection */}
              <div className="form-group">
                <label>Batch Selection Type</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="batchType"
                      value="predefined"
                      checked={formData.batchType === 'predefined'}
                      onChange={handleCustomBatchToggle}
                    />
                    <span>Select from predefined batches</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="batchType"
                      value="custom"
                      checked={formData.batchType === 'custom'}
                      onChange={handleCustomBatchToggle}
                    />
                    <span>Create custom batch</span>
                  </label>
                </div>
              </div>

              {/* Predefined Batch Selection */}
              {formData.batchType === 'predefined' && !customBatchName && (
                <div className="form-group">
                  <label>Select Batch *</label>
                  <select 
                    value={selectedBatch?.id || ''} 
                    onChange={(e) => handleBatchSelect(e.target.value)}
                    required
                  >
                    <option value="">-- Select a Batch --</option>
                    {batchOptions.map(batch => (
                      <option key={batch.id} value={batch.id}>
                        {batch.name} - {batch.department} ({batch.semester})
                      </option>
                    ))}
                  </select>
                  {selectedBatch && (
                    <div className="batch-info">
                      <small className="info-text">
                        📍 {selectedBatch.department} | 📚 {selectedBatch.year} | 📅 {selectedBatch.semester}
                      </small>
                    </div>
                  )}
                </div>
              )}

              {/* Custom Batch Name Input */}
              {(formData.batchType === 'custom' || customBatchName) && (
                <div className="form-group">
                  <label>Batch Name *</label>
                  <input
                    type="text"
                    name="batchName"
                    value={formData.batchName}
                    onChange={handleChange}
                    placeholder="e.g., CS 3rd Year - Batch A"
                    required
                  />
                </div>
              )}

              {/* Semester and Year for Custom Batch */}
              {(formData.batchType === 'custom' || customBatchName) && (
                <div className="form-row">
                  <div className="form-group">
                    <label>Year</label>
                    <select name="year" value={formData.year} onChange={handleChange}>
                      <option value="">Select Year</option>
                      {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Semester</label>
                    <select name="semester" value={formData.semester} onChange={handleChange}>
                      <option value="">Select Semester</option>
                      <option value="1st Semester">1st Semester</option>
                      <option value="2nd Semester">2nd Semester</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="form-section">
              <h3>🏛️ College & Department</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>College *</label>
                  <select 
                    value={formData.college} 
                    onChange={(e) => handleCollegeChange(e.target.value)}
                    required
                  >
                    <option value="">Select College</option>
                    {colleges.map(college => (
                      <option key={college.id} value={college.id}>
                        {college.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Department *</label>
                  <select 
                    value={formData.department} 
                    onChange={(e) => handleDepartmentChange(e.target.value)}
                    disabled={!formData.college}
                    required
                  >
                    <option value="">Select Department</option>
                    {selectedCollege && selectedCollege.departments.map(dept => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>🎓 Courses</h3>
              <div className="form-group">
                <label>Select Courses *</label>
                <div className="courses-list">
                  {selectedDepartment && selectedDepartment.courses.map(course => (
                    <label key={course.id} className="course-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.courses.some(c => c.id === course.id)}
                        onChange={() => handleCourseToggle(course)}
                      />
                      <span>
                        <strong>{course.code}</strong> - {course.name}
                        <small className="credits-info">({course.credits} credits, {course.lab_hours} lab hours)</small>
                      </span>
                    </label>
                  ))}
                  {!selectedDepartment && (
                    <p className="info-text">Please select a department first</p>
                  )}
                  {selectedDepartment && selectedDepartment.courses.length === 0 && (
                    <p className="info-text">No courses available for this department</p>
                  )}
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>📅 Schedule Settings</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date *</label>
                  <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>End Date *</label>
                  <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-group">
                <label>Days of Week</label>
                <div className="checkbox-group">
                  {daysOfWeek.map(day => (
                    <label key={day} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.daysOfWeek.includes(day)}
                        onChange={() => handleDayToggle(day)}
                      />
                      <span>{day}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Time Slots</label>
                <div className="checkbox-group">
                  {timeSlots.map(slot => (
                    <label key={slot} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.timeSlots.includes(slot)}
                        onChange={() => handleTimeSlotToggle(slot)}
                      />
                      <span>{slot}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>🔬 Laboratory Preferences</h3>
              <div className="form-group">
                <label>Preferred Laboratories</label>
                <div className="checkbox-group">
                  {laboratories.map(lab => (
                    <label key={lab.id} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.labPreferences.includes(lab.id)}
                        onChange={() => handlePreferenceToggle(lab.id)}
                      />
                      <span>{lab.name} ({lab.code}) - Capacity: {lab.capacity}</span>
                    </label>
                  ))}
                </div>
                <small className="helper-text">Leave empty to use default lab</small>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={() => navigate(-1)}>Cancel</button>
              <button type="submit" className="submit-btn" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Batch Schedule'}
              </button>
            </div>
          </form>
        </div>

        <div className="batch-info-section">
          <div className="info-card">
            <h3>ℹ️ About Batch Scheduling</h3>
            <p>Batch scheduling allows you to create multiple lab schedules at once for an entire batch/section for the semester.</p>
          </div>
          
          <div className="info-card">
            <h3>📋 Selected Batch Summary</h3>
            {selectedBatch ? (
              <div>
                <p><strong>Batch Name:</strong> {selectedBatch.name}</p>
                <p><strong>Department:</strong> {selectedBatch.department}</p>
                <p><strong>Year:</strong> {selectedBatch.year}</p>
                <p><strong>Semester:</strong> {selectedBatch.semester}</p>
              </div>
            ) : formData.batchName ? (
              <div>
                <p><strong>Batch Name:</strong> {formData.batchName}</p>
                <p><strong>Year:</strong> {formData.year || 'Not specified'}</p>
                <p><strong>Semester:</strong> {formData.semester || 'Not specified'}</p>
              </div>
            ) : (
              <p>No batch selected yet</p>
            )}
          </div>

          <div className="info-card">
            <h3>📚 Selected Courses Summary</h3>
            {formData.courses.length > 0 ? (
              <ul>
                {formData.courses.map(course => (
                  <li key={course.id}>
                    <strong>{course.code}</strong> - {course.name}
                    <br />
                    <small>{course.credits} credits, {course.lab_hours} lab hours/week</small>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No courses selected yet</p>
            )}
          </div>

          <div className="info-card">
            <h3>⚠️ Notes</h3>
            <ul>
              <li>Each course will be scheduled weekly</li>
              <li>Lab preferences will be considered</li>
              <li>Schedules will avoid conflicts</li>
              <li>Dean approval may be required</li>
              <li>Total sessions = Courses × Weeks × TimeSlots × Labs</li>
            </ul>
          </div>

          <div className="info-card">
            <h3>📊 Schedule Calculation</h3>
            <p>
              <strong>Courses:</strong> {formData.courses.length}<br />
              <strong>Weeks:</strong> {formData.startDate && formData.endDate ? 
                Math.ceil((new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24 * 7)) : 0}<br />
              <strong>Time Slots:</strong> {formData.timeSlots.length || 1}<br />
              <strong>Labs:</strong> {formData.labPreferences.length || 1}<br />
              <strong>Estimated Sessions:</strong> {
                formData.courses.length * 
                (formData.startDate && formData.endDate ? 
                  Math.ceil((new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24 * 7)) : 0) *
                (formData.timeSlots.length || 1) *
                (formData.labPreferences.length || 1)
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchSchedulePage;