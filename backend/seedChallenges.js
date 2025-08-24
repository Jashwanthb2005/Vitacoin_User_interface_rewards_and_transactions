const mongoose = require('mongoose');
const Challenge = require('./models/Challenge');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vitacoin', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected for seeding challenges'))
.catch(err => console.error('MongoDB connection error:', err));

// Sample challenges data
const sampleChallenges = [
  {
    title: "Daily Login Streak",
    description: "Log in to the platform for 7 consecutive days",
    type: "streak",
    isActive: true,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    rewards: {
      coins: 100,
      experience: 50,
      badgeId: null
    },
    requirements: {
      minLevel: 1,
      previousChallenges: []
    },
    maxParticipants: -1, // Unlimited
    currentParticipants: 0
  },
  {
    title: "First Game Win",
    description: "Win your first game to earn bonus rewards",
    type: "achievement",
    isActive: true,
    startDate: new Date(),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
    rewards: {
      coins: 25,
      experience: 15,
      badgeId: null
    },
    requirements: {
      minLevel: 1,
      previousChallenges: []
    },
    maxParticipants: -1,
    currentParticipants: 0
  },
  {
    title: "Social Butterfly",
    description: "Complete 5 challenges to unlock social features",
    type: "milestone",
    isActive: true,
    startDate: new Date(),
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    rewards: {
      coins: 200,
      experience: 100,
      badgeId: null
    },
    requirements: {
      minLevel: 3,
      previousChallenges: []
    },
    maxParticipants: -1,
    currentParticipants: 0
  },
  {
    title: "Speed Runner",
    description: "Complete any game in record time",
    type: "achievement",
    isActive: true,
    startDate: new Date(),
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
    rewards: {
      coins: 150,
      experience: 75,
      badgeId: null
    },
    requirements: {
      minLevel: 5,
      previousChallenges: []
    },
    maxParticipants: -1,
    currentParticipants: 0
  },
  {
    title: "Perfect Week",
    description: "Complete all daily challenges for a week",
    type: "streak",
    isActive: true,
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    rewards: {
      coins: 300,
      experience: 150,
      badgeId: null
    },
    requirements: {
      minLevel: 2,
      previousChallenges: []
    },
    maxParticipants: -1,
    currentParticipants: 0
  }
];

// Seed function
const seedChallenges = async () => {
  try {
    // Clear existing challenges
    await Challenge.deleteMany({});
    console.log('Cleared existing challenges');

    // Insert new challenges
    const insertedChallenges = await Challenge.insertMany(sampleChallenges);
    console.log(`Successfully seeded ${insertedChallenges.length} challenges`);

    // Display the seeded challenges
    insertedChallenges.forEach(challenge => {
      console.log(`- ${challenge.title} (${challenge.type})`);
    });

    console.log('Challenge seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding challenges:', error);
    process.exit(1);
  }
};

// Run the seed function
seedChallenges();
