const { MaintenanceRequest, Computer, User } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all maintenance requests
// @route   GET /api/maintenance
// @access  Private
const getMaintenanceRequests = async (req, res) => {
  try {
    const { status, priority, computerId, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let where = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (computerId) where.computerId = computerId;
    
    const { count, rows } = await MaintenanceRequest.findAndCountAll({
      where,
      include: [
        { model: Computer, as: 'Computer', attributes: ['name', 'model', 'lab'] },
        { model: User, as: 'requester', attributes: ['firstName', 'lastName', 'email'] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get maintenance request by ID
// @route   GET /api/maintenance/:id
// @access  Private
const getMaintenanceRequestById = async (req, res) => {
  try {
    const request = await MaintenanceRequest.findByPk(req.params.id, {
      include: [
        { model: Computer, as: 'Computer' },
        { model: User, as: 'requester', attributes: ['firstName', 'lastName', 'email'] },
        { model: User, as: 'assignee', attributes: ['firstName', 'lastName'] }
      ]
    });
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance request not found'
      });
    }
    
    res.json({
      success: true,
      data: request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create maintenance request
// @route   POST /api/maintenance
// @access  Private
const createMaintenanceRequest = async (req, res) => {
  try {
    const requestData = {
      ...req.body,
      reportedBy: `${req.user.firstName} ${req.user.lastName}`,
      reportedEmail: req.user.email,
      status: 'pending'
    };
    
    const request = await MaintenanceRequest.create(requestData);
    
    res.status(201).json({
      success: true,
      data: request,
      message: 'Maintenance request submitted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update maintenance request
// @route   PUT /api/maintenance/:id
// @access  Private
const updateMaintenanceRequest = async (req, res) => {
  try {
    const request = await MaintenanceRequest.findByPk(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance request not found'
      });
    }
    
    await request.update(req.body);
    
    res.json({
      success: true,
      data: request,
      message: 'Maintenance request updated'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Assign technician
// @route   PATCH /api/maintenance/:id/assign
// @access  Private/LabManager
const assignTechnician = async (req, res) => {
  try {
    const { technicianId } = req.body;
    const request = await MaintenanceRequest.findByPk(req.params.id);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance request not found'
      });
    }
    
    await request.update({ assigneeId: technicianId, status: 'assigned' });
    
    res.json({
      success: true,
      data: request,
      message: 'Technician assigned successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Start work on request
// @route   PATCH /api/maintenance/:id/start
// @access  Private/ICT
const startWork = async (req, res) => {
  try {
    const request = await MaintenanceRequest.findByPk(req.params.id);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance request not found'
      });
    }
    
    await request.update({ status: 'in-progress' });
    
    res.json({
      success: true,
      data: request,
      message: 'Work started on this request'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Complete maintenance request
// @route   PATCH /api/maintenance/:id/complete
// @access  Private/ICT
const completeRequest = async (req, res) => {
  try {
    const { resolution } = req.body;
    const request = await MaintenanceRequest.findByPk(req.params.id);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance request not found'
      });
    }
    
    await request.update({
      status: 'completed',
      resolution,
      completedAt: new Date()
    });
    
    // Update computer status
    await Computer.update({ status: 'available' }, { where: { id: request.computerId } });
    
    res.json({
      success: true,
      data: request,
      message: 'Maintenance request completed'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Cancel maintenance request
// @route   PATCH /api/maintenance/:id/cancel
// @access  Private
const cancelRequest = async (req, res) => {
  try {
    const request = await MaintenanceRequest.findByPk(req.params.id);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance request not found'
      });
    }
    
    await request.update({ status: 'cancelled' });
    
    res.json({
      success: true,
      message: 'Maintenance request cancelled'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get maintenance statistics
// @route   GET /api/maintenance/stats
// @access  Private/Admin/LabManager
const getMaintenanceStats = async (req, res) => {
  try {
    const total = await MaintenanceRequest.count();
    const pending = await MaintenanceRequest.count({ where: { status: 'pending' } });
    const inProgress = await MaintenanceRequest.count({ where: { status: 'in-progress' } });
    const completed = await MaintenanceRequest.count({ where: { status: 'completed' } });
    
    res.json({
      success: true,
      data: {
        total,
        pending,
        inProgress,
        completed
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getMaintenanceRequests,
  getMaintenanceRequestById,
  createMaintenanceRequest,
  updateMaintenanceRequest,
  assignTechnician,
  startWork,
  completeRequest,
  cancelRequest,
  getMaintenanceStats
};