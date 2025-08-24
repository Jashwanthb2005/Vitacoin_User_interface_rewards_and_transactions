const mongoose = require('mongoose');
const Badge = require('./models/Badge');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vitacoin', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected for badge seeding'))
.catch(err => console.error('MongoDB connection error:', err));

// Comprehensive badges data
const sampleBadges = [
  // Achievement Badges
  {
    name: "First Steps",
    description: "Complete your first task and begin your journey",
    icon: "🌟",
    category: "achievement",
    rarity: "common",
    requirements: {
      tasksCompleted: 1,
      coinsRequired: 0
    },
    rewards: {
      coins: 10,
      experience: 50
    },
    isActive: true,
    isHidden: false
  },
  {
    name: "Task Master",
    description: "Complete 10 tasks to prove your dedication",
    icon: "📋",
    category: "achievement",
    rarity: "uncommon",
    requirements: {
      tasksCompleted: 10,
      coinsRequired: 0
    },
    rewards: {
      coins: 25,
      experience: 100
    },
    isActive: true,
    isHidden: false
  },
  {
    name: "Task Champion",
    description: "Complete 50 tasks and become a true champion",
    icon: "🏆",
    category: "achievement",
    rarity: "rare",
    requirements: {
      tasksCompleted: 50,
      coinsRequired: 0
    },
    rewards: {
      coins: 100,
      experience: 500
    },
    isActive: true,
    isHidden: false
  },
  {
    name: "Task Legend",
    description: "Complete 100 tasks and achieve legendary status",
    icon: "👑",
    category: "achievement",
    rarity: "legendary",
    requirements: {
      tasksCompleted: 100,
      coinsRequired: 0
    },
    rewards: {
      coins: 500,
      experience: 1000
    },
    isActive: true,
    isHidden: false
  },

  // Game Badges
  {
    name: "Math Wizard",
    description: "Score 100% in Math Quiz game",
    icon: "🧮",
    category: "achievement",
    rarity: "rare",
    requirements: {
      tasksCompleted: 0,
      coinsRequired: 0
    },
    rewards: {
      coins: 50,
      experience: 200
    },
    isActive: true,
    isHidden: false
  },
  {
    name: "Memory Master",
    description: "Complete Memory Game with perfect score",
    icon: "🧠",
    category: "achievement",
    rarity: "epic",
    requirements: {
      tasksCompleted: 0,
      coinsRequired: 0
    },
    rewards: {
      coins: 75,
      experience: 300
    },
    isActive: true,
    isHidden: false
  },
  {
    name: "Puzzle Master",
    description: "Solve 50 puzzles successfully",
    icon: "🧩",
    category: "achievement",
    rarity: "epic",
    requirements: {
      tasksCompleted: 0,
      coinsRequired: 0
    },
    rewards: {
      coins: 100,
      experience: 400
    },
    isActive: true,
    isHidden: false
  },
  {
    name: "Speed Demon",
    description: "Complete any game in record time",
    icon: "⚡",
    category: "achievement",
    rarity: "legendary",
    requirements: {
      tasksCompleted: 0,
      coinsRequired: 0
    },
    rewards: {
      coins: 200,
      experience: 800
    },
    isActive: true,
    isHidden: false
  },

  // Milestone Badges
  {
    name: "Coin Collector",
    description: "Accumulate 1000 Vitacoins",
    icon: "💰",
    category: "milestone",
    rarity: "uncommon",
    requirements: {
      coinsRequired: 1000,
      tasksCompleted: 0
    },
    rewards: {
      coins: 50,
      experience: 150
    },
    isActive: true,
    isHidden: false
  },
  {
    name: "Coin Millionaire",
    description: "Accumulate 10,000 Vitacoins",
    icon: "💎",
    category: "milestone",
    rarity: "epic",
    requirements: {
      coinsRequired: 10000,
      tasksCompleted: 0
    },
    rewards: {
      coins: 200,
      experience: 600
    },
    isActive: true,
    isHidden: false
  },
  {
    name: "Coin Billionaire",
    description: "Accumulate 100,000 Vitacoins",
    icon: "🏦",
    category: "milestone",
    rarity: "legendary",
    requirements: {
      coinsRequired: 100000,
      tasksCompleted: 0
    },
    rewards: {
      coins: 1000,
      experience: 2000
    },
    isActive: true,
    isHidden: false
  },

  // Streak Badges
  {
    name: "Week Warrior",
    description: "Maintain a 7-day login streak",
    icon: "📅",
    category: "streak",
    rarity: "common",
    requirements: {
      loginStreak: 7,
      tasksCompleted: 0
    },
    rewards: {
      coins: 25,
      experience: 100
    },
    isActive: true,
    isHidden: false
  },
  {
    name: "Month Master",
    description: "Maintain a 30-day login streak",
    icon: "🗓️",
    category: "streak",
    rarity: "rare",
    requirements: {
      loginStreak: 30,
      tasksCompleted: 0
    },
    rewards: {
      coins: 100,
      experience: 400
    },
    isActive: true,
    isHidden: false
  },
  {
    name: "Year Champion",
    description: "Maintain a 365-day login streak",
    icon: "🎯",
    category: "streak",
    rarity: "legendary",
    requirements: {
      loginStreak: 365,
      tasksCompleted: 0
    },
    rewards: {
      coins: 1000,
      experience: 5000
    },
    isActive: true,
    isHidden: false
  },

  // Special Badges
  {
    name: "Early Bird",
    description: "Be one of the first 100 users to join",
    icon: "🐦",
    category: "special",
    rarity: "rare",
    requirements: {
      tasksCompleted: 0,
      coinsRequired: 0
    },
    rewards: {
      coins: 100,
      experience: 300
    },
    isActive: true,
    isHidden: false,
    maxEarners: 100
  },
  {
    name: "Beta Tester",
    description: "Help test new features and provide feedback",
    icon: "🔬",
    category: "special",
    rarity: "epic",
    requirements: {
      tasksCompleted: 0,
      coinsRequired: 0
    },
    rewards: {
      coins: 150,
      experience: 500
    },
    isActive: true,
    isHidden: false
  },
  {
    name: "Community Hero",
    description: "Make significant contributions to the community",
    icon: "🦸",
    category: "special",
    rarity: "legendary",
    requirements: {
      tasksCompleted: 0,
      coinsRequired: 0
    },
    rewards: {
      coins: 500,
      experience: 1500
    },
    isActive: true,
    isHidden: false
  },

  // Event Badges
  {
    name: "Holiday Spirit",
    description: "Participate in special holiday events",
    icon: "🎄",
    category: "event",
    rarity: "uncommon",
    requirements: {
      tasksCompleted: 0,
      coinsRequired: 0
    },
    rewards: {
      coins: 50,
      experience: 200
    },
    isActive: true,
    isHidden: false
  },
  {
    name: "Summer Champion",
    description: "Complete summer-themed challenges",
    icon: "☀️",
    category: "event",
    rarity: "rare",
    requirements: {
      tasksCompleted: 0,
      coinsRequired: 0
    },
    rewards: {
      coins: 75,
      experience: 300
    },
    isActive: true,
    isHidden: false
  },
  {
    name: "Winter Warrior",
    description: "Brave the cold and complete winter challenges",
    icon: "❄️",
    category: "event",
    rarity: "epic",
    requirements: {
      tasksCompleted: 0,
      coinsRequired: 0
    },
    rewards: {
      coins: 100,
      experience: 400
    },
    isActive: true,
    isHidden: false
  }
];

// Function to seed badges
const seedBadges = async () => {
  try {
    // Clear existing badges
    console.log('Clearing existing badges...');
    await Badge.deleteMany({});
    console.log('✓ Existing badges cleared');

    // Insert new badges
    console.log('Seeding badges...');
    const insertedBadges = await Badge.insertMany(sampleBadges);
    console.log(`✓ Successfully seeded ${insertedBadges.length} badges`);

    // Display summary
    console.log('\n📊 Badge Seeding Summary:');
    console.log('========================');
    
    const categories = {};
    const rarities = {};
    
    insertedBadges.forEach(badge => {
      categories[badge.category] = (categories[badge.category] || 0) + 1;
      rarities[badge.rarity] = (rarities[badge.rarity] || 0) + 1;
    });

    console.log('\nCategories:');
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} badges`);
    });

    console.log('\nRarities:');
    Object.entries(rarities).forEach(([rarity, count]) => {
      console.log(`  ${rarity}: ${count} badges`);
    });

    console.log('\n🎉 Badge seeding completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding badges:', error);
    process.exit(1);
  }
};

// Run the seeding
seedBadges();
