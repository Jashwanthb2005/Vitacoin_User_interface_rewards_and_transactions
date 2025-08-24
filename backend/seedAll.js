const mongoose = require('mongoose');
const Task = require('./models/Task');
const Game = require('./models/Game');
const Challenge = require('./models/Challenge');
const Badge = require('./models/Badge');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vitacoin', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected for seeding all data'))
.catch(err => console.error('MongoDB connection error:', err));

// Sample badges data
const sampleBadges = [
  {
    name: "First Steps",
    description: "Complete your first task",
    icon: "🌟",
    category: "achievement",
    rarity: "common",
    isActive: true
  },
  {
    name: "Math Wizard",
    description: "Score 100% in Math Quiz",
    icon: "🧮",
    category: "achievement",
    rarity: "rare",
    isActive: true
  },
  {
    name: "Memory Master",
    description: "Complete Memory Game with perfect score",
    icon: "🧠",
    category: "achievement",
    rarity: "epic",
    isActive: true
  },
  {
    name: "Speed Demon",
    description: "Complete any game in record time",
    icon: "⚡",
    category: "achievement",
    rarity: "legendary",
    isActive: true
  },
  {
    name: "Puzzle Master",
    description: "Solve 50 puzzles",
    icon: "🧩",
    category: "achievement",
    rarity: "epic",
    isActive: true
  }
];

// Sample games data
const sampleGames = [
  {
    name: "Math Quiz",
    slug: "math-quiz",
    description: "Test your mathematical skills with various difficulty levels",
    icon: "🧮",
    category: "math",
    type: "embedded",
    difficulty: "easy",
    isActive: true,
    rewards: {
      baseCoins: 10,
      bonusCoins: 5,
      streakBonus: 2,
      perfectScoreBonus: 10
    },
    gameConfig: {
      rules: "Answer math questions correctly to earn points",
      timeLimit: 60,
      maxScore: 100,
      minScore: 0,
      instructions: "Solve the math problems as quickly as possible"
    }
  },
  {
    name: "Memory Game",
    slug: "memory-game",
    description: "Match pairs of cards to test your memory",
    icon: "🧠",
    category: "memory",
    type: "embedded",
    difficulty: "medium",
    isActive: true,
    rewards: {
      baseCoins: 15,
      bonusCoins: 10,
      streakBonus: 3,
      perfectScoreBonus: 15
    },
    gameConfig: {
      rules: "Find matching pairs of cards",
      timeLimit: 120,
      maxScore: 100,
      minScore: 0,
      instructions: "Click on cards to reveal them and find matches"
    }
  },
  {
    name: "Puzzle Solver",
    slug: "puzzle-solver",
    description: "Solve various logic puzzles and brain teasers",
    icon: "🧩",
    category: "puzzle",
    type: "embedded",
    difficulty: "hard",
    isActive: true,
    rewards: {
      baseCoins: 20,
      bonusCoins: 15,
      streakBonus: 5,
      perfectScoreBonus: 20
    },
    gameConfig: {
      rules: "Solve logic puzzles to progress",
      timeLimit: 300,
      maxScore: 100,
      minScore: 0,
      instructions: "Use logic and reasoning to solve each puzzle"
    }
  },
  {
    name: "Reaction Time",
    slug: "reaction-time",
    description: "Test your reflexes and reaction speed",
    icon: "⚡",
    category: "reaction",
    type: "embedded",
    difficulty: "medium",
    isActive: true,
    rewards: {
      baseCoins: 12,
      bonusCoins: 8,
      streakBonus: 2,
      perfectScoreBonus: 12
    },
    gameConfig: {
      rules: "Click as fast as possible when prompted",
      timeLimit: 90,
      maxScore: 100,
      minScore: 0,
      instructions: "Wait for the signal and click immediately"
    }
  },
  {
    name: "Word Scramble",
    slug: "word-scramble",
    description: "Unscramble letters to form words",
    icon: "📝",
    category: "word",
    type: "embedded",
    difficulty: "easy",
    isActive: true,
    rewards: {
      baseCoins: 8,
      bonusCoins: 6,
      streakBonus: 1,
      perfectScoreBonus: 8
    },
    gameConfig: {
      rules: "Unscramble letters to form valid words",
      timeLimit: 45,
      maxScore: 100,
      minScore: 0,
      instructions: "Rearrange the letters to form a word"
    }
  }
];

// Sample challenges data
const sampleChallenges = [
  {
    title: "Daily Login Streak",
    description: "Log in to the platform for 7 consecutive days",
    type: "daily",
    isActive: true,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    rewards: {
      coins: 100,
      experience: 50,
      badgeId: null
    },
    requirements: {
      minScore: 0,
      timeLimit: null,
      attempts: 1,
      completionCriteria: 'custom'
    },
    createdBy: null, // Will be set to a default admin user ID
    stats: {
      totalParticipants: 0,
      totalCompletions: 0,
      averageScore: 0,
      bestScore: 0
    }
  },
  {
    title: "First Game Win",
    description: "Win your first game to earn bonus rewards",
    type: "special",
    isActive: true,
    startDate: new Date(),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
    rewards: {
      coins: 25,
      experience: 15,
      badgeId: null
    },
    requirements: {
      minScore: 0,
      timeLimit: null,
      attempts: 1,
      completionCriteria: 'custom'
    },
    createdBy: null, // Will be set to a default admin user ID
    stats: {
      totalParticipants: 0,
      totalCompletions: 0,
      averageScore: 0,
      bestScore: 0
    }
  },
  {
    title: "Weekly Challenge",
    description: "Complete all daily challenges for a week",
    type: "weekly",
    isActive: true,
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    rewards: {
      coins: 200,
      experience: 100,
      badgeId: null
    },
    requirements: {
      minScore: 0,
      timeLimit: null,
      attempts: 1,
      completionCriteria: 'custom'
    },
    createdBy: null, // Will be set to a default admin user ID
    stats: {
      totalParticipants: 0,
      totalCompletions: 0,
      averageScore: 0,
      bestScore: 0
    }
  },
  {
    title: "Speed Runner",
    description: "Complete any game in record time",
    type: "special",
    isActive: true,
    startDate: new Date(),
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
    rewards: {
      coins: 150,
      experience: 75,
      badgeId: null
    },
    requirements: {
      minScore: 0,
      timeLimit: null,
      attempts: 1,
      completionCriteria: 'time'
    },
    createdBy: null, // Will be set to a default admin user ID
    stats: {
      totalParticipants: 0,
      totalCompletions: 0,
      averageScore: 0,
      bestScore: 0
    }
  },
  {
    title: "Perfect Score",
    description: "Achieve a perfect score in any game",
    type: "special",
    isActive: true,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    rewards: {
      coins: 300,
      experience: 150,
      badgeId: null
    },
    requirements: {
      minScore: 100,
      timeLimit: null,
      attempts: 1,
      completionCriteria: 'score'
    },
    createdBy: null, // Will be set to a default admin user ID
    stats: {
      totalParticipants: 0,
      totalCompletions: 0,
      averageScore: 0,
      bestScore: 0
    }
  }
];

// Sample tasks data
const sampleTasks = [
  {
    title: "Daily Math Challenge",
    description: "Complete 5 math problems with a score of 80% or higher",
    type: "game_score",
    targetScore: 80,
    reward: {
      coins: 50,
      experience: 25,
      badgeId: null
    },
    isActive: true,
    startDate: new Date(),
    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    maxCompletions: -1, // Unlimited
    difficulty: "easy",
    category: "math",
    requirements: {
      minLevel: 1,
      previousTasks: []
    }
  },
  {
    title: "Memory Master",
    description: "Complete the memory game with 3 or fewer mistakes",
    type: "game_win",
    reward: {
      coins: 75,
      experience: 40,
      badgeId: null
    },
    isActive: true,
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    maxCompletions: -1,
    difficulty: "medium",
    category: "memory",
    requirements: {
      minLevel: 2,
      previousTasks: []
    }
  },
  {
    title: "Weekly Puzzle Solver",
    description: "Solve 10 puzzle games this week",
    type: "achievement",
    reward: {
      coins: 100,
      experience: 60,
      badgeId: null
    },
    isActive: true,
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    maxCompletions: -1,
    difficulty: "medium",
    category: "puzzle",
    requirements: {
      minLevel: 3,
      previousTasks: []
    }
  },
  {
    title: "Speed Demon",
    description: "Complete any game in under 2 minutes",
    type: "achievement",
    reward: {
      coins: 60,
      experience: 30,
      badgeId: null
    },
    isActive: true,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    maxCompletions: -1,
    difficulty: "hard",
    category: "speed",
    requirements: {
      minLevel: 5,
      previousTasks: []
    }
  },
  {
    title: "Perfect Score",
    description: "Achieve a perfect score (100%) in any game",
    type: "game_score",
    targetScore: 100,
    reward: {
      coins: 150,
      experience: 80,
      badgeId: null
    },
    isActive: true,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    maxCompletions: -1,
    difficulty: "expert",
    category: "achievement",
    requirements: {
      minLevel: 8,
      previousTasks: []
    }
  }
];

// Seed function
const seedAll = async () => {
  try {
    console.log('Starting to seed all data...\n');

    // Clear existing data
    console.log('Clearing existing data...');
    await Promise.all([
      Task.deleteMany({}),
      Game.deleteMany({}),
      Challenge.deleteMany({}),
      Badge.deleteMany({})
    ]);
    console.log('✓ Cleared existing data\n');

    // Insert badges first
    console.log('Seeding badges...');
    const insertedBadges = await Badge.insertMany(sampleBadges);
    console.log(`✓ Successfully seeded ${insertedBadges.length} badges`);

    // Insert games
    console.log('Seeding games...');
    const insertedGames = await Game.insertMany(sampleGames);
    console.log(`✓ Successfully seeded ${insertedGames.length} games`);

    // Insert challenges (with a default createdBy value)
    console.log('Seeding challenges...');
    const challengesWithCreatedBy = sampleChallenges.map(challenge => ({
      ...challenge,
      createdBy: new mongoose.Types.ObjectId() // Create a dummy ObjectId for seeding
    }));
    const insertedChallenges = await Challenge.insertMany(challengesWithCreatedBy);
    console.log(`✓ Successfully seeded ${insertedChallenges.length} challenges`);

    // Insert tasks (with gameId references)
    console.log('Seeding tasks...');
    
    const tasksWithGameIds = sampleTasks.map((task, index) => {
      if (task.type === 'game_score' || task.type === 'game_win') {
        // Link to a game based on category
        const game = insertedGames.find(g => g.category === task.category);
        if (game) {
          return { ...task, gameId: game._id };
        } else {
          // For now, assign to first game if no match found
          return { ...task, gameId: insertedGames[0]._id };
        }
      }
      // For achievement tasks, assign to a default game
      return { ...task, gameId: insertedGames[0]._id };
    });
    
    const insertedTasks = await Task.insertMany(tasksWithGameIds);
    console.log(`✓ Successfully seeded ${insertedTasks.length} tasks`);

    console.log('\n=== SEEDING SUMMARY ===');
    console.log(`Badges: ${insertedBadges.length}`);
    console.log(`Games: ${insertedGames.length}`);
    console.log(`Challenges: ${insertedChallenges.length}`);
    console.log(`Tasks: ${insertedTasks.length}`);
    console.log('========================');
    console.log('\n✓ All data seeded successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

// Run the seed function
seedAll();
