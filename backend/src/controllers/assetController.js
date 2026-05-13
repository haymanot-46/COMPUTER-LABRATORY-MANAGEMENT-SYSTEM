const { Equipment } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all equipment
// @route   GET /api/asset/equipment
// @access  Private
const getEquipment = async (req, res) => {
  try {
    const { category, laboratory, status, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let where = {};
    if (category) where.category = category;
    if (laboratory) where.laboratory = laboratory;
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { code: { [Op.like]: `%${search}%` } },
        { name: { [Op.like]: `%${search}%` } },
        { model: { [Op.like]: `%${search}%` } }
      ];
    }
    
    const { count, rows } = await Equipment.findAndCountAll({
      where,
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

// @desc    Get equipment by ID
// @route   GET /api/asset/equipment/:id
// @access  Private
const getEquipmentById = async (req, res) => {
  try {
    const equipment = await Equipment.findByPk(req.params.id);
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }
    res.json({
      success: true,
      data: equipment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Register new equipment
// @route   POST /api/asset/equipment
// @access  Private/Asset
const registerEquipment = async (req, res) => {
  try {
    const existing = await Equipment.findOne({ where: { code: req.body.code } });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Equipment code already exists'
      });
    }
    
    const equipment = await Equipment.create(req.body);
    
    res.status(201).json({
      success: true,
      data: equipment,
      message: 'Equipment registered successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update equipment
// @route   PUT /api/asset/equipment/:id
// @access  Private/Asset
const updateEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findByPk(req.params.id);
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }
    
    await equipment.update(req.body);
    
    res.json({
      success: true,
      data: equipment,
      message: 'Equipment updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete equipment
// @route   DELETE /api/asset/equipment/:id
// @access  Private/Asset
const deleteEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findByPk(req.params.id);
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }
    
    await equipment.destroy();
    
    res.json({
      success: true,
      message: 'Equipment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Borrow equipment
// @route   POST /api/asset/equipment/:id/borrow
// @access  Private
const borrowEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const { purpose, expectedReturnDate, quantity } = req.body;
    
    const equipment = await Equipment.findByPk(id);
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }
    
    if (equipment.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'Equipment is not available for borrowing'
      });
    }
    
    // Update equipment status
    await equipment.update({ 
      status: 'borrowed',
      borrowerId: req.user.id,
      borrowedAt: new Date(),
      expectedReturnDate
    });
    
    // Create borrowing record (you would have a Borrowing model)
    
    res.json({
      success: true,
      message: 'Equipment borrowed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Return equipment
// @route   POST /api/asset/equipment/:id/return
// @access  Private
const returnEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findByPk(req.params.id);
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }
    
    await equipment.update({ 
      status: 'available',
      borrowerId: null,
      borrowedAt: null,
      expectedReturnDate: null,
      returnedAt: new Date()
    });
    
    res.json({
      success: true,
      message: 'Equipment returned successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get equipment statistics
// @route   GET /api/asset/stats
// @access  Private
const getAssetStats = async (req, res) => {
  try {
    const total = await Equipment.count();
    const available = await Equipment.count({ where: { status: 'available' } });
    const borrowed = await Equipment.count({ where: { status: 'borrowed' } });
    const maintenance = await Equipment.count({ where: { status: 'maintenance' } });
    
    res.json({
      success: true,
      data: {
        total,
        available,
        borrowed,
        maintenance
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
  getEquipment,
  getEquipmentById,
  registerEquipment,
  updateEquipment,
  deleteEquipment,
  borrowEquipment,
  returnEquipment,
  getAssetStats
};