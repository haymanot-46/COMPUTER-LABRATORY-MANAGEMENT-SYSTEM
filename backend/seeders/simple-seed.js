// backend/seeders/simple-seed.js
const bcrypt = require('bcryptjs');
const { sequelize } = require('../src/config/database');
const User = require('../src/models/User');

const seedUsers = async () => {
  try {
    await sequelize.sync({ force: true });
    
    const users = [
      { email: 'admin@clms.com', password: 'admin123', firstName: 'System', lastName: 'Admin', role: 'admin' },
      { email: 'teacher@clms.com', password: 'teacher123', firstName: 'John', lastName: 'Teacher', role: 'teacher' },
      { email: 'student@clms.com', password: 'student123', firstName: 'Jane', lastName: 'Student', role: 'student' },
      { email: 'labmanager@clms.com', password: 'labmanager123', firstName: 'Mike', lastName: 'Manager', role: 'lab_manager' },
      { email: 'dean@clms.com', password: 'dean123', firstName: 'Sarah', lastName: 'Dean', role: 'dean' },
      { email: 'ict@clms.com', password: 'ict123', firstName: 'Tom', lastName: 'ICT', role: 'ict' },
      { email: 'asset@clms.com', password: 'asset123', firstName: 'Lisa', lastName: 'Asset', role: 'asset' },
      { email: 'labassistant@clms.com', password: 'labassistant123', firstName: 'Chris', lastName: 'Assistant', role: 'lab_assistant' }
    ];
    
    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await User.create({ ...user, password: hashedPassword });
      console.log(`✅ Created: ${user.email}`);
    }
    
    console.log('✅ All users created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding:', error);
    process.exit(1);
  }
};

seedUsers();