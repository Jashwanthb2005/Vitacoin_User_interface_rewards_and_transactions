const mongoose = require('mongoose');
const Game = require('./models/Game');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vitacoin', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected for seeding games'))
.catch(err => console.error('MongoDB connection error:', err));

// Sample games data
const sampleGames = [
  {
    name: "Math Quiz",
    description: "Test your mathematical skills with various difficulty levels",
    icon: "🧮",
    category: "educational",
    difficulty: "easy",
    isActive: true,
    rewards: {
      baseCoins: 10,
      bonusCoins: 5,
      experience: 15
    },
    settings: {
      timeLimit: 60,
      questionCount: 10,
      difficultyMultiplier: 1.0
    }
  },
  {
    name: "Memory Game",
    description: "Match pairs of cards to test your memory",
    icon: "🧠",
    category: "memory",
    difficulty: "medium",
    isActive: true,
    rewards: {
      baseCoins: 15,
      bonusCoins: 10,
      experience: 20
    },
    settings: {
      timeLimit: 120,
      cardCount: 16,
      difficultyMultiplier: 1.2
    }
  },
  {
    name: "Puzzle Solver",
    description: "Solve various logic puzzles and brain teasers",
    icon: "🧩",
    category: "puzzle",
    difficulty: "hard",
    isActive: true,
    rewards: {
      baseCoins: 20,
      bonusCoins: 15,
      experience: 25
    },
    settings: {
      timeLimit: 300,
      puzzleCount: 5,
      difficultyMultiplier: 1.5
    }
  },
  {
    name: "Reaction Time",
    description: "Test your reflexes and reaction speed",
    icon: "⚡",
    category: "speed",
    difficulty: "medium",
    isActive: true,
    rewards: {
      baseCoins: 12,
      bonusCoins: 8,
      experience: 18
    },
    settings: {
      timeLimit: 90,
      roundCount: 8,
      difficultyMultiplier: 1.3
    }
  },
  {
    name: "Word Scramble",
    description: "Unscramble letters to form words",
    icon: "📝",
    category: "language",
    difficulty: "easy",
    isActive: true,
    rewards: {
      baseCoins: 8,
      bonusCoins: 6,
      experience: 12
    },
    settings: {
      timeLimit: 45,
      wordCount: 12,
      difficultyMultiplier: 1.0
    }
  }
];

// Seed function
const seedGames = async () => {
  try {
    // Clear existing games
    await Game.deleteMany({});
    console.log('Cleared existing games');

    // Insert new games
    const insertedGames = await Game.insertMany(sampleGames);
    console.log(`Successfully seeded ${insertedGames.length} games`);

    // Display the seeded games
    insertedGames.forEach(game => {
      console.log(`- ${game.name} (${game.category}) - ${game.difficulty}`);
    });

    console.log('Game seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding games:', error);
    process.exit(1);
  }
};

// Run the seed function
seedGames();
