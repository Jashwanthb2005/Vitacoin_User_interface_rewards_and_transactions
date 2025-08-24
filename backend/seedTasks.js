const mongoose = require('mongoose');
const Task = require('./models/Task');
const Game = require('./models/Game');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vitacoin', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected for seeding'))
.catch(err => console.error('MongoDB connection error:', err));

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
const seedTasks = async () => {
  try {
    // Clear existing tasks
    await Task.deleteMany({});
    console.log('Cleared existing tasks');

    // Insert new tasks
    const insertedTasks = await Task.insertMany(sampleTasks);
    console.log(`Successfully seeded ${insertedTasks.length} tasks`);

    // Display the seeded tasks
    insertedTasks.forEach(task => {
      console.log(`- ${task.title} (${task.type}) - ${task.difficulty}`);
    });

    console.log('Task seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding tasks:', error);
    process.exit(1);
  }
};

// Run the seed function
seedTasks();
