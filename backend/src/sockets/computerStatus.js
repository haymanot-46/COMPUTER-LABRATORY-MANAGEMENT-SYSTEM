// backend/sockets/computerStatus.js
const logger = require('../config/logger');
const { Computer } = require('../models');

module.exports = (io, socket) => {
  const { user } = socket;

  // Handle computer status update
  socket.on('computer:statusUpdate', async (data) => {
    try {
      const { computerId, status, notes } = data;
      
      logger.info(`Computer status update from ${user.email}: Computer ${computerId} -> ${status}`);
      
      // Update database
      if (computerId && status) {
        await Computer.update(
          { status, notes: notes || null, lastMaintenance: new Date() },
          { where: { id: computerId } }
        );
      }
      
      // Broadcast to all connected clients
      io.emit('computer:statusChanged', {
        computerId,
        status,
        updatedBy: {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role
        },
        timestamp: new Date().toISOString(),
        notes
      });
      
      // Notify ICT staff specifically
      io.to('role:ict').emit('computer:maintenanceAlert', {
        computerId,
        status,
        reportedBy: user.email,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      logger.error('Computer status update error:', error);
      socket.emit('error', { message: 'Failed to update computer status', error: error.message });
    }
  });

  // Handle computer maintenance request
  socket.on('computer:maintenanceRequest', async (data) => {
    try {
      const { computerId, issue, priority } = data;
      
      logger.info(`Maintenance request from ${user.email}: Computer ${computerId} - ${issue}`);
      
      // Notify ICT staff
      io.to('role:ict').emit('computer:maintenanceRequired', {
        computerId,
        issue,
        priority: priority || 'medium',
        requestedBy: {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email
        },
        timestamp: new Date().toISOString()
      });
      
      // Confirm to requester
      socket.emit('computer:requestAcknowledged', {
        computerId,
        message: 'Maintenance request submitted successfully',
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      logger.error('Maintenance request error:', error);
      socket.emit('error', { message: 'Failed to submit maintenance request' });
    }
  });

  // Handle computer status subscription
  socket.on('computer:subscribe', (data) => {
    const { computerIds } = data;
    
    if (computerIds && Array.isArray(computerIds)) {
      computerIds.forEach(id => {
        socket.join(`computer:${id}`);
        logger.info(`${user.email} subscribed to computer ${id}`);
      });
      
      socket.emit('computer:subscribed', {
        computerIds,
        message: `Subscribed to ${computerIds.length} computers`,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Handle computer status unsubscribe
  socket.on('computer:unsubscribe', (data) => {
    const { computerIds } = data;
    
    if (computerIds && Array.isArray(computerIds)) {
      computerIds.forEach(id => {
        socket.leave(`computer:${id}`);
        logger.info(`${user.email} unsubscribed from computer ${id}`);
      });
      
      socket.emit('computer:unsubscribed', {
        computerIds,
        message: `Unsubscribed from ${computerIds.length} computers`,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Handle get computer status
  socket.on('computer:getStatus', async (data) => {
    try {
      const { computerId } = data;
      
      const computer = await Computer.findByPk(computerId);
      
      if (computer) {
        socket.emit('computer:status', {
          computerId: computer.id,
          name: computer.name,
          status: computer.status,
          lab: computer.lab,
          lastMaintenance: computer.lastMaintenance,
          timestamp: new Date().toISOString()
        });
      } else {
        socket.emit('error', { message: `Computer ${computerId} not found` });
      }
      
    } catch (error) {
      logger.error('Get computer status error:', error);
      socket.emit('error', { message: 'Failed to get computer status' });
    }
  });

  // Handle get all computers status in lab
  socket.on('computer:getLabStatus', async (data) => {
    try {
      const { lab } = data;
      
      const computers = await Computer.findAll({
        where: { lab },
        attributes: ['id', 'name', 'status', 'lab', 'lastMaintenance']
      });
      
      socket.emit('computer:labStatus', {
        lab,
        computers,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      logger.error('Get lab computer status error:', error);
      socket.emit('error', { message: 'Failed to get lab computer status' });
    }
  });
};