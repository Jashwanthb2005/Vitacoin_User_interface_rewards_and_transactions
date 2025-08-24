const mongoose = require('mongoose');
const User = require('./models/User');
const Transaction = require('./models/Transaction');
require('dotenv').config();

// Test wallet functionality
const testWallet = async () => {
  try {
    console.log('🧪 Testing Wallet Functionality...\n');

    // 1. Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vitacoin', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');

    // 2. Get a test user
    const user = await User.findOne();
    if (!user) {
      console.log('❌ No users found. Please create a user first.');
      process.exit(1);
    }

    console.log(`👤 Testing with user: ${user.username}`);
    console.log(`💰 Current balance: ${user.coinBalance} coins`);

    // 3. Test transaction creation
    console.log('\n📝 Testing transaction creation...');
    
    const testTransaction = new Transaction({
      user: user._id,
      type: 'deduct',
      amount: -100,
      description: 'Test coupon redemption',
      category: 'coupon_redemption',
      balanceBefore: user.coinBalance + 100,
      balanceAfter: user.coinBalance
    });

    await testTransaction.save();
    console.log('✅ Test transaction created successfully');

    // 4. Test user balance update
    console.log('\n💰 Testing balance update...');
    
    const originalBalance = user.coinBalance;
    user.coinBalance -= 100;
    await user.save();
    
    console.log(`✅ Balance updated: ${originalBalance} → ${user.coinBalance}`);

    // 5. Verify transaction count
    const transactionCount = await Transaction.countDocuments({ user: user._id });
    console.log(`📊 Total transactions for user: ${transactionCount}`);

    console.log('\n🎉 Wallet functionality test completed successfully!');
    
    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error testing wallet:', error);
    
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    
    process.exit(1);
  }
};

// Run the test
testWallet();
