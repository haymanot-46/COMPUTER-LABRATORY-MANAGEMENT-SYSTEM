const { Laboratory, Computer, Schedule } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all laboratories
// @route   GET /api/laboratories
// @access  Private
const getLaboratories = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { code: { [Op.like]: `%${search}%` } },
        { location: { [Op.like]: `%${search}%` } }
      ];
    }
    
    const { count, rows } = await Laboratory.findAndCountAll({
      where,
      include: [
        { model: Computer, as: 'Computers', attributes: ['id', 'name', 'status'] },
        { model: Schedule, as: 'Schedules', attributes: ['id', 'date', 'startTime', 'endTime', 'status'], limit: 5 }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['name', 'ASC']]
    });
    
    // Add computer count to each lab
    const labsWithCount = rows.map(lab => ({
      ...lab.toJSON(),
      computerCount: lab.Computers?.length || 0,
      activeComputers: lab.Computers?.filter(c => c.status === 'available').length || 0
    }));
    
    res.json({
      success: true,
      data: labsWithCount,
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

// @desc    Get laboratory by ID
// @route   GET /api/laboratories/:id
// @access  Private
const getLaboratoryById = async (req, res) => {
  try {
    const laboratory = await Laboratory.findByPk(req.params.id, {
      include: [
        { model: Computer, as: 'Computers' },
        { 
          model: Schedule, 
          as: 'Schedules',
          where: { status: 'approved', date: { [Op.gte]: new Date() } },
          required: false,
          limit: 10,
          order: [['date', 'ASC']]
        }
      ]
    });
    
    if (!laboratory) {
      return res.status(404).json({
        success: false,
        message: 'Laboratory not found'
      });
    }
    
    // Get utilization stats
    const totalComputers = laboratory.Computers?.length || 0;
    const activeComputers = laboratory.Computers?.filter(c => c.status === 'available').length || 0;
    const utilizationRate = totalComputers > 0 ? ((totalComputers - activeComputers) / totalComputers) * 100 : 0;
    
    res.json({
      success: true,
      data: {
        ...laboratory.toJSON(),
        stats: {
          totalComputers,
          activeComputers,
          utilizationRate: Math.round(utilizationRate)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create laboratory
// @route   POST /api/laboratories
// @access  Private/Admin/LabManager
const createLaboratory = async (req, res) => {
  try {
    const { code, name, location, building, floor, capacity, department, description } = req.body;
    
    const existingLab = await Laboratory.findOne({ where: { code } });
    if (existingLab) {
      return res.status(400).json({
        success: false,
        message: 'Laboratory code already exists'
      });
    }
    
    const laboratory = await Laboratory.create({
      code,
      name,
      location,
      building,
      floor,
      capacity,
      department,
      description,
      isActive: true
    });
    
    res.status(201).json({
      success: true,
      data: laboratory,
      message: 'Laboratory created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update laboratory
// @route   PUT /api/laboratories/:id
// @access  Private/Admin/LabManager
const updateLaboratory = async (req, res) => {
  try {
    const laboratory = await Laboratory.findByPk(req.params.id);
    if (!laboratory) {
      return res.status(404).json({
        success: false,
        message: 'Laboratory not found'
      });
    }
    
    await laboratory.update(req.body);
    
    res.json({
      success: true,
      data: laboratory,
      message: 'Laboratory updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete laboratory
// @route   DELETE /api/laboratories/:id
// @access  Private/Admin
const deleteLaboratory = async (req, res) => {
  try {
    const laboratory = await Laboratory.findByPk(req.params.id);
    if (!laboratory) {
      return res.status(404).json({
        success: false,
        message: 'Laboratory not found'
      });
    }
    
    // Check if lab has computers
    const computerCount = await Computer.count({ where: { laboratoryId: req.params.id } });
    if (computerCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete laboratory with ${computerCount} computers assigned`
      });
    }
    
    await laboratory.destroy();
    
    res.json({
      success: true,
      message: 'Laboratory deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get laboratory utilization
// @route   GET /api/laboratories/:id/utilization
// @access  Private
const getLaboratoryUtilization = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;
    
    const laboratory = await Laboratory.findByPk(id);
    if (!laboratory) {
      return res.status(404).json({
        success: false,
        message: 'Laboratory not found'
      });
    }
    
    let where = { laboratoryId: id };
    if (startDate && endDate) {
      where.date = { [Op.between]: [startDate, endDate] };
    }
    
    const schedules = await Schedule.findAll({
      where,
      attributes: ['date', 'startTime', 'endTime', 'status']
    });
    
    const totalComputers = await Computer.count({ where: { laboratoryId: id } });
    
    // Calculate utilization by day
    const utilizationByDay = {};
    schedules.forEach(schedule => {
      const date = schedule.date;
      if (!utilizationByDay[date]) {
        utilizationByDay[date] = { total: 0, approved: 0 };
      }
      utilizationByDay[date].total++;
      if (schedule.status === 'approved') {
        utilizationByDay[date].approved++;
      }
    });
    
    res.json({
      success: true,
      data: {
        laboratory,
        totalComputers,
        totalSchedules: schedules.length,
        utilizationByDay,
        utilizationRate: totalComputers > 0 ? (schedules.length / (totalComputers * 30)) * 100 : 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get laboratory statistics
// @route   GET /api/laboratories/stats
// @access  Private
const getLaboratoryStats = async (req, res) => {
  try {
    const totalLabs = await Laboratory.count();
    const activeLabs = await Laboratory.count({ where: { isActive: true } });
    const totalComputers = await Computer.count();
    
    const labs = await Laboratory.findAll({
      include: [
        { model: Computer, as: 'Computers', attributes: ['id', 'status'] }
      ]
    });
    
    const labDetails = labs.map(lab => ({
      id: lab.id,
      name: lab.name,
      code: lab.code,
      capacity: lab.capacity,
      computerCount: lab.Computers?.length || 0,
      activeComputers: lab.Computers?.filter(c => c.status === 'available').length || 0
    }));
    
    res.json({
      success: true,
      data: {
        totalLabs,
        activeLabs,
        totalComputers,
        labDetails
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
  getLaboratories,
  getLaboratoryById,
  createLaboratory,
  updateLaboratory,
  deleteLaboratory,
  getLaboratoryUtilization,
  getLaboratoryStats
};