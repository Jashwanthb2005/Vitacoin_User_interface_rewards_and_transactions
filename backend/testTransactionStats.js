const mongoose = require('mongoose');
const User = require('./models/User');
const Transaction = require('./models/Transaction');
require('dotenv').config();

// Test transaction statistics
const testTransactionStats = async () => {
  try {
    console.log('📊 Testing Transaction Statistics...\n');

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

    // 3. Get transaction statistics
    console.log('\n📈 Calculating transaction statistics...');
    
    const stats = await Transaction.getUserStats(user._id);
    const transactionCount = await Transaction.countDocuments({ user: user._id });
    
    console.log('📊 Transaction Statistics:');
    console.log(`   Total Transactions: ${transactionCount}`);
    console.log(`   Total Earned: ${stats[0]?.totalEarned || 0} coins`);
    console.log(`   Total Deducted: ${stats[0]?.totalDeducted || 0} coins`);
    console.log(`   Earning Count: ${stats[0]?.earningCount || 0}`);
    console.log(`   Deduction Count: ${stats[0]?.deductionCount || 0}`);

    // 4. Get recent transactions
    console.log('\n📋 Recent Transactions:');
    const recentTransactions = await Transaction.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(5);

    recentTransactions.forEach((tx, index) => {
      console.log(`   ${index + 1}. ${tx.type.toUpperCase()}: ${tx.amount} coins - ${tx.description}`);
      console.log(`      Category: ${tx.category} | Date: ${tx.createdAt.toLocaleDateString()}`);
    });

    console.log('\n🎉 Transaction statistics test completed successfully!');
    
    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error testing transaction stats:', error);
    
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    
    process.exit(1);
  }
};

// Run the test
testTransactionStats();
