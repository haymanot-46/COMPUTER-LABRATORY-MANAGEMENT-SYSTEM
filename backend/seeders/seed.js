// backend/seeders/seed.js
const bcrypt = require('bcryptjs');
const { sequelize } = require('../src/config/database');
const User = require('../src/models/User');
const Computer = require('../src/models/Computer');
const Equipment = require('../src/models/Equipment');

const seedDatabase = async () => {
  try {
    // Sync database
    await sequelize.sync({ force: true });
    console.log('✅ Database synced');
    
    // Create users
    const users = [
      { email: 'admin@clms.com', password: 'admin123', firstName: 'Admin', lastName: 'User', role: 'admin', department: 'ICT' },
      { email: 'teacher@clms.com', password: 'teacher123', firstName: 'John', lastName: 'Doe', role: 'teacher', department: 'Computer Science' },
      { email: 'student@clms.com', password: 'student123', firstName: 'Jane', lastName: 'Smith', role: 'student', studentId: 'STU001', department: 'Computer Science' },
      { email: 'labmanager@clms.com', password: 'labmanager123', firstName: 'Mike', lastName: 'Johnson', role: 'lab_manager', department: 'ICT' },
      { email: 'dean@clms.com', password: 'dean123', firstName: 'Sarah', lastName: 'Williams', role: 'dean', department: 'Engineering' },
      { email: 'ict@clms.com', password: 'ict123', firstName: 'Tom', lastName: 'Brown', role: 'ict', department: 'ICT' },
      { email: 'asset@clms.com', password: 'asset123', firstName: 'Lisa', lastName: 'Davis', role: 'asset', department: 'Asset Management' },
      { email: 'labassistant@clms.com', password: 'labassistant123', firstName: 'Chris', lastName: 'Wilson', role: 'lab_assistant', department: 'ICT' }
    ];
    
    for (const user of users) {
      await User.create(user);
    }
    console.log('✅ Users created');
    
    // Create computers
    const labs = ['Lab 101', 'Lab 102', 'Lab 103', 'Lab 104', 'Lab 105'];
    const statuses = ['available', 'in-use', 'maintenance', 'available', 'available'];
    
    for (let i = 1; i <= 50; i++) {
      await Computer.create({
        name: `PC-${String(i).padStart(3, '0')}`,
        model: `Dell OptiPlex ${7000 + Math.floor(Math.random() * 10)}`,
        cpu: `Intel Core i${5 + Math.floor(Math.random() * 3)}`,
        ram: `${[8, 16, 32][Math.floor(Math.random() * 3)]}GB`,
        storage: `${[256, 512, 1024][Math.floor(Math.random() * 3)]}GB SSD`,
        os: Math.random() > 0.5 ? 'Windows 11 Pro' : 'Ubuntu 22.04',
        lab: labs[Math.floor(Math.random() * labs.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        ipAddress: `192.168.${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 250) + 1}`,
        purchaseDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
      });
    }
    console.log('✅ Computers created');
    
    // Create equipment
    const equipmentCategories = ['Computer', 'Monitor', 'UPS', 'Projector', 'Printer'];
    for (let i = 1; i <= 30; i++) {
      await Equipment.create({
        code: `EQ-${String(i).padStart(3, '0')}`,
        name: `${equipmentCategories[Math.floor(Math.random() * equipmentCategories.length)]} ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
        category: equipmentCategories[Math.floor(Math.random() * equipmentCategories.length)],
        laboratory: labs[Math.floor(Math.random() * labs.length)],
        model: `Model-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 100)}`,
        manufacturer: ['Dell', 'HP', 'Lenovo'][Math.floor(Math.random() * 3)],
        purchaseDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        purchaseCost: Math.floor(Math.random() * 50000) + 1000,
        condition: ['excellent', 'good', 'fair'][Math.floor(Math.random() * 3)]
      });
    }
    console.log('✅ Equipment created');
    
    console.log('\n✅ DATABASE SEEDED SUCCESSFULLY!\n');
    console.log('Demo Credentials:');
    console.log('  admin@clms.com / admin123');
    console.log('  teacher@clms.com / teacher123');
    console.log('  student@clms.com / student123');
    console.log('  labmanager@clms.com / labmanager123');
    console.log('  dean@clms.com / dean123');
    console.log('  ict@clms.com / ict123');
    console.log('  asset@clms.com / asset123');
    console.log('  labassistant@clms.com / labassistant123\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();