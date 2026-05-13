const { Computer, MaintenanceRequest } = require('../models');
const { Op } = require('sequelize');
const { Computer, Laboratory } = require('../models');
// @desc    Get all computers
// @route   GET /api/computers
// @access  Private
const getComputers = async (req, res) => {
  try {
    const { search, status, lab, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { model: { [Op.like]: `%${search}%` } },
        { lab: { [Op.like]: `%${search}%` } }
      ];
    }
    if (status) where.status = status;
    if (lab) where.lab = lab;
    
    const { count, rows } = await Computer.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['lab', 'ASC'], ['name', 'ASC']]
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

// @desc    Get computer by ID
// @route   GET /api/computers/:id
// @access  Private
const getComputerById = async (req, res) => {
  try {
    const computer = await Computer.findByPk(req.params.id, {
      include: [{
        model: MaintenanceRequest,
        as: 'MaintenanceRequests',
        limit: 5,
        order: [['createdAt', 'DESC']]
      }]
    });
    
    if (!computer) {
      return res.status(404).json({
        success: false,
        message: 'Computer not found'
      });
    }
    
    res.json({
      success: true,
      data: computer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create computer
// @route   POST /api/computers
// @access  Private/Admin/LabManager
// ✅ Fixed column name mapping for consistency
const { Computer, Laboratory } = require('../models');

// @desc    Create computer
// @route   POST /api/computers
const createComputer = async (req, res) => {
    try {
        // ✅ Map frontend field names to database column names
        const computerData = {
            code: req.body.asset_tag,           // asset_tag → code
            workstation_number: req.body.name,  // name → workstation_number
            model: req.body.model,
            brand: req.body.brand,
            serial_number: req.body.serial_number,
            laboratory_id: req.body.laboratory_id,
            processor: req.body.processor,
            ram: req.body.ram,
            storage: req.body.storage,
            operating_system: req.body.os || req.body.operating_system,
            ip_address: req.body.ip_address,
            mac_address: req.body.mac_address,
            status: req.body.status || 'available',
            purchase_date: req.body.purchase_date,
            warranty_expiry: req.body.warranty_expiry,
            notes: req.body.notes
        };
        
        // Validate required fields
        if (!computerData.code) {
            return res.status(400).json({ 
                success: false, 
                message: 'Asset tag is required' 
            });
        }
        if (!computerData.workstation_number) {
            return res.status(400).json({ 
                success: false, 
                message: 'Workstation number is required' 
            });
        }
        if (!computerData.laboratory_id) {
            return res.status(400).json({ 
                success: false, 
                message: 'Laboratory ID is required' 
            });
        }
        
        // Check for duplicate code
        const existing = await Computer.findOne({ 
            where: { code: computerData.code } 
        });
        if (existing) {
            return res.status(409).json({ 
                success: false, 
                message: 'Asset tag already exists' 
            });
        }
        
        const computer = await Computer.create(computerData);
        
        // Update computer count in laboratory
        await Laboratory.increment('computer_count', { 
            by: 1, 
            where: { id: computerData.laboratory_id } 
        });
        
        // ✅ Traceability: FR-ADMIN-COMPUTER-CREATE-001
        res.status(201).json({
            success: true,
            data: computer,
            message: 'Computer added successfully',
            traceId: 'FR-ADMIN-COMPUTER-CREATE-001'
        });
    } catch (error) {
        console.error('Create computer error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create computer'
        });
    }
};

module.exports = {
    getComputers,
    getComputerById,
    createComputer,      // ✅ Fixed
    updateComputer,
    updateComputerStatus,
    deleteComputer,
    getComputerStats
};
// @desc    Update computer
// @route   PUT /api/computers/:id
// @access  Private/Admin/LabManager
const updateComputer = async (req, res) => {
  try {
    const computer = await Computer.findByPk(req.params.id);
    if (!computer) {
      return res.status(404).json({
        success: false,
        message: 'Computer not found'
      });
    }
    
    await computer.update(req.body);
    
    res.json({
      success: true,
      data: computer,
      message: 'Computer updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update computer status
// @route   PATCH /api/computers/:id/status
// @access  Private/ICT/LabManager
const updateComputerStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const computer = await Computer.findByPk(req.params.id);
    
    if (!computer) {
      return res.status(404).json({
        success: false,
        message: 'Computer not found'
      });
    }
    
    await computer.update({ status });
    
    res.json({
      success: true,
      data: computer,
      message: `Status updated to ${status}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete computer
// @route   DELETE /api/computers/:id
// @access  Private/Admin
const deleteComputer = async (req, res) => {
  try {
    const computer = await Computer.findByPk(req.params.id);
    if (!computer) {
      return res.status(404).json({
        success: false,
        message: 'Computer not found'
      });
    }
    
    await computer.destroy();
    
    res.json({
      success: true,
      message: 'Computer deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get computer statistics
// @route   GET /api/computers/stats/summary
// @access  Private/Admin/LabManager
const getComputerStats = async (req, res) => {
  try {
    const total = await Computer.count();
    const available = await Computer.count({ where: { status: 'available' } });
    const inUse = await Computer.count({ where: { status: 'in-use' } });
    const maintenance = await Computer.count({ where: { status: 'maintenance' } });
    const damaged = await Computer.count({ where: { status: 'damaged' } });
    
    res.json({
      success: true,
      data: {
        total,
        available,
        inUse,
        maintenance,
        damaged
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
  getComputers,
  getComputerById,
  createComputer,
  updateComputer,
  updateComputerStatus,
  deleteComputer,
  getComputerStats
};