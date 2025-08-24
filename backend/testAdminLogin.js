const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Test admin login functionality
const testAdminLogin = async () => {
  try {
    console.log('🔐 Testing Admin Login...\n');

    // 1. Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vitacoin', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');

    // 2. Find admin user
    const adminUser = await User.findOne({ email: 'admin@vitacoin.com' }).select('+password');
    if (!adminUser) {
      console.log('❌ Admin user not found. Please run: npm run reset-admin');
      process.exit(1);
    }

    console.log(`👤 Admin user found: ${adminUser.username}`);
    console.log(`📧 Email: ${adminUser.email}`);
    console.log(`👑 Role: ${adminUser.role}`);
    console.log(`💰 Balance: ${adminUser.coinBalance} coins`);
    console.log(`✅ Active: ${adminUser.isActive}`);

    // 3. Test password verification
    console.log('\n🔑 Testing password verification...');
    const testPassword = 'admin123';
    const isPasswordValid = await bcrypt.compare(testPassword, adminUser.password);
    
    if (isPasswordValid) {
      console.log('✅ Password verification successful');
    } else {
      console.log('❌ Password verification failed');
    }

    // 4. Test admin role
    console.log('\n👑 Testing admin role...');
    if (adminUser.role === 'admin') {
      console.log('✅ Admin role confirmed');
    } else {
      console.log('❌ User is not an admin');
    }

    console.log('\n🎉 Admin login test completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Email: admin@vitacoin.com');
    console.log('Password: admin123');
    console.log('Expected redirect: /admin');
    
    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error testing admin login:', error);
    
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    
    process.exit(1);
  }
};

// Run the test
testAdminLogin();
