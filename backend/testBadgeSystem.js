const mongoose = require('mongoose');
require('dotenv').config();

// Test badge system components
const testBadgeSystem = async () => {
  try {
    console.log('🧪 Testing Badge System Components...\n');

    // 1. Test MongoDB connection
    console.log('1. Testing MongoDB connection...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vitacoin', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');

    // 2. Test model loading
    console.log('\n2. Testing model loading...');
    
    const Badge = require('./models/Badge');
    console.log('✅ Badge model loaded');
    
    const User = require('./models/User');
    console.log('✅ User model loaded');
    
    const Transaction = require('./models/Transaction');
    console.log('✅ Transaction model loaded');

    // 3. Test service loading
    console.log('\n3. Testing service loading...');
    
    const BadgeService = require('./services/badgeService');
    console.log('✅ BadgeService loaded');

    // 4. Test route loading
    console.log('\n4. Testing route loading...');
    
    const badgeRoutes = require('./routes/badges');
    console.log('✅ Badge routes loaded');

    // 5. Test basic operations
    console.log('\n5. Testing basic operations...');
    
    // Check if badges exist
    const badgeCount = await Badge.countDocuments();
    console.log(`✅ Badge count: ${badgeCount}`);
    
    // Check if users exist
    const userCount = await User.countDocuments();
    console.log(`✅ User count: ${userCount}`);

    // 6. Test badge service methods
    console.log('\n6. Testing badge service methods...');
    
    if (userCount > 0) {
      const sampleUser = await User.findOne();
      console.log(`✅ Testing with user: ${sampleUser.username}`);
      
      // Test getting user badge progress
      try {
        const progress = await BadgeService.getUserBadgeProgress(sampleUser._id);
        console.log(`✅ User badge progress: ${progress ? progress.length : 0} badges tracked`);
      } catch (error) {
        console.log(`⚠️ Progress check error: ${error.message}`);
      }
      
      // Test getting recommended badges
      try {
        const recommended = await BadgeService.getRecommendedBadges(sampleUser._id);
        console.log(`✅ Recommended badges: ${recommended.length} badges`);
      } catch (error) {
        console.log(`⚠️ Recommended badges error: ${error.message}`);
      }
    } else {
      console.log('⚠️ No users found for testing');
    }

    console.log('\n🎉 All badge system components loaded successfully!');
    console.log('\n📝 Summary:');
    console.log(`  - MongoDB: Connected`);
    console.log(`  - Models: All loaded`);
    console.log(`  - Services: All loaded`);
    console.log(`  - Routes: All loaded`);
    console.log(`  - Database: ${badgeCount} badges, ${userCount} users`);

    await mongoose.disconnect();
    console.log('\n✅ MongoDB disconnected');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error testing badge system:', error);
    
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    
    process.exit(1);
  }
};

// Run the test
testBadgeSystem();
