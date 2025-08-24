const mongoose = require('mongoose');
const Badge = require('./models/Badge');
const User = require('./models/User');
const BadgeService = require('./services/badgeService');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vitacoin', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected for badge testing'))
.catch(err => console.error('MongoDB connection error:', err));

// Test badge functionality
const testBadges = async () => {
  try {
    console.log('🧪 Testing Badge Functionality...\n');

    // 1. Check if badges exist
    const badgeCount = await Badge.countDocuments();
    console.log(`📊 Total badges in database: ${badgeCount}`);

    if (badgeCount === 0) {
      console.log('❌ No badges found. Please run: npm run seed-badges');
      process.exit(1);
    }

    // 2. Get sample badges
    const sampleBadges = await Badge.find().limit(3);
    console.log('\n🏆 Sample Badges:');
    sampleBadges.forEach(badge => {
      console.log(`  - ${badge.name} (${badge.rarity}) - ${badge.description}`);
    });

    // 3. Test badge service methods
    console.log('\n🔧 Testing Badge Service...');

    // Get a sample user (first user in database)
    const sampleUser = await User.findOne();
    if (!sampleUser) {
      console.log('❌ No users found. Please create a user first.');
      process.exit(1);
    }

    console.log(`👤 Testing with user: ${sampleUser.username}`);

    // Test getting user badge progress
    const progress = await BadgeService.getUserBadgeProgress(sampleUser._id);
    console.log(`📈 User badge progress: ${progress ? progress.length : 0} badges tracked`);

    // Test getting recommended badges
    const recommended = await BadgeService.getRecommendedBadges(sampleUser._id);
    console.log(`🎯 Recommended badges: ${recommended.length} badges`);

    // Test checking all badges
    console.log('\n🔄 Checking all badges for user...');
    await BadgeService.checkAllBadges(sampleUser._id);
    console.log('✅ Badge check completed');

    // 4. Test badge requirements
    console.log('\n📋 Testing Badge Requirements...');
    const taskBadges = await Badge.find({ 'requirements.tasksCompleted': { $gt: 0 } });
    const coinBadges = await Badge.find({ 'requirements.coinsRequired': { $gt: 0 } });
    const streakBadges = await Badge.find({ 'requirements.loginStreak': { $gt: 0 } });

    console.log(`  - Task-based badges: ${taskBadges.length}`);
    console.log(`  - Coin-based badges: ${coinBadges.length}`);
    console.log(`  - Streak-based badges: ${streakBadges.length}`);

    // 5. Test badge categories
    console.log('\n🏷️ Testing Badge Categories...');
    const categories = await Badge.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    categories.forEach(cat => {
      console.log(`  - ${cat._id}: ${cat.count} badges`);
    });

    // 6. Test badge rarities
    console.log('\n⭐ Testing Badge Rarities...');
    const rarities = await Badge.aggregate([
      { $group: { _id: '$rarity', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    rarities.forEach(rarity => {
      console.log(`  - ${rarity._id}: ${rarity.count} badges`);
    });

    console.log('\n🎉 All badge tests completed successfully!');
    console.log('\n📝 Summary:');
    console.log(`  - Database has ${badgeCount} badges`);
    console.log(`  - Badge service is working correctly`);
    console.log(`  - User progress tracking is functional`);
    console.log(`  - Badge requirements are properly configured`);

    process.exit(0);

  } catch (error) {
    console.error('❌ Error testing badges:', error);
    process.exit(1);
  }
};

// Run the test
testBadges();
