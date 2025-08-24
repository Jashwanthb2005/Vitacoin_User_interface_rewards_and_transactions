# 🏆 Badge System Documentation

## Overview
The Vitacoin application includes a comprehensive badge system that rewards users for various achievements, milestones, and activities. Badges are automatically awarded based on user progress and can provide coin rewards.

## 🎯 Badge Categories

### 1. Achievement Badges
- **First Steps**: Complete your first task
- **Task Master**: Complete 10 tasks
- **Task Champion**: Complete 50 tasks
- **Task Legend**: Complete 100 tasks

### 2. Game Badges
- **Math Wizard**: Score 100% in Math Quiz
- **Memory Master**: Complete Memory Game with perfect score
- **Puzzle Master**: Solve 50 puzzles
- **Speed Demon**: Complete any game in record time

### 3. Milestone Badges
- **Coin Collector**: Accumulate 1,000 Vitacoins
- **Coin Millionaire**: Accumulate 10,000 Vitacoins
- **Coin Billionaire**: Accumulate 100,000 Vitacoins

### 4. Streak Badges
- **Week Warrior**: Maintain 7-day login streak
- **Month Master**: Maintain 30-day login streak
- **Year Champion**: Maintain 365-day login streak

### 5. Special Badges
- **Early Bird**: Be one of the first 100 users
- **Beta Tester**: Help test new features
- **Community Hero**: Make significant contributions

### 6. Event Badges
- **Holiday Spirit**: Participate in holiday events
- **Summer Champion**: Complete summer challenges
- **Winter Warrior**: Complete winter challenges

## ⭐ Badge Rarities

- **Common** (Gray): Easy to earn, basic achievements
- **Uncommon** (Green): Moderate difficulty, regular milestones
- **Rare** (Blue): Challenging achievements, significant milestones
- **Epic** (Purple): Difficult achievements, major accomplishments
- **Legendary** (Orange): Extremely rare, exceptional achievements

## 🚀 Getting Started

### 1. Seed the Database
```bash
# Seed all badges
npm run seed-badges

# Or seed everything including badges
npm run seed
```

### 2. Test the System
```bash
# Test badge functionality
npm run test-badges
```

### 3. Start the Server
```bash
npm start
# or
npm run dev
```

## 🔧 API Endpoints

### Get All Badges
```
GET /api/badges
```

### Get User Badges
```
GET /api/badges/user
```

### Get Badge Progress
```
GET /api/badges/progress
```

### Get Recommended Badges
```
GET /api/badges/recommended
```

### Check for New Badges
```
POST /api/badges/check
```

### Award Badge (Admin/Moderator)
```
POST /api/badges/:id/award
```

### Create Badge (Admin/Moderator)
```
POST /api/badges
```

### Update Badge (Admin/Moderator)
```
PUT /api/badges/:id
```

### Delete Badge (Admin/Moderator)
```
DELETE /api/badges/:id
```

## 📊 Badge Requirements

### Task Completion
```javascript
requirements: {
  tasksCompleted: 10,  // User must complete 10 tasks
  coinsRequired: 0     // No coin requirement
}
```

### Coin Milestones
```javascript
requirements: {
  coinsRequired: 1000,  // User must have 1000 coins
  tasksCompleted: 0     // No task requirement
}
```

### Login Streaks
```javascript
requirements: {
  loginStreak: 7,       // User must have 7-day streak
  tasksCompleted: 0     // No task requirement
}
```

## 🎁 Badge Rewards

### Coin Rewards
```javascript
rewards: {
  coins: 100,           // Award 100 coins
  experience: 500       // Award 500 experience points
}
```

## 🔄 Automatic Badge Checking

The system automatically checks for new badges in these scenarios:

1. **Task Completion**: When a user completes a task
2. **Game Completion**: When a user finishes a game
3. **Coin Changes**: When user's coin balance changes
4. **Login Streaks**: When user's login streak updates
5. **Manual Check**: When user clicks "Check for New Badges"

## 🛠️ Badge Service

The `BadgeService` class provides methods for:

- `checkTaskCompletionBadges()`: Check task-based badges
- `checkCoinMilestoneBadges()`: Check coin milestone badges
- `checkLoginStreakBadges()`: Check login streak badges
- `checkGameAchievementBadges()`: Check game achievement badges
- `awardBadgeToUser()`: Award a specific badge to a user
- `getUserBadgeProgress()`: Get user's progress towards all badges
- `getRecommendedBadges()`: Get badges user is close to earning
- `checkAllBadges()`: Comprehensive badge check

## 📱 Frontend Integration

### Badges Page
- Displays all available badges
- Shows user's earned badges
- Progress bars for unearned badges
- Recommended badges section
- Filter by category and rarity

### Dashboard Integration
- Badge count display
- Recent badge achievements
- Progress towards next badges

### Real-time Updates
- Badges update automatically
- Progress bars update in real-time
- New badge notifications

## 🎨 Customization

### Adding New Badges
1. Create badge data in `seedBadges.js`
2. Define requirements and rewards
3. Set category and rarity
4. Run `npm run seed-badges`

### Modifying Badge Logic
1. Update `BadgeService` methods
2. Modify badge requirements
3. Adjust reward amounts
4. Test with `npm run test-badges`

### Badge Icons
- Use emoji icons for visual appeal
- Support for custom SVG icons
- Consistent icon sizing and styling

## 🧪 Testing

### Test Badge Functionality
```bash
npm run test-badges
```

### Test Individual Components
```bash
# Test badge service
node -e "const BadgeService = require('./services/badgeService'); console.log('BadgeService loaded successfully');"

# Test badge model
node -e "const Badge = require('./models/Badge'); console.log('Badge model loaded successfully');"
```

## 📈 Performance Considerations

- Badge checking is optimized for performance
- Progress calculations are cached
- Database queries are indexed
- Badge updates are batched when possible

## 🔒 Security

- Badge awarding is restricted to admin/moderator users
- User can only view their own badge progress
- Badge creation/modification requires proper permissions
- Input validation on all badge operations

## 🐛 Troubleshooting

### Common Issues

1. **No Badges Displaying**
   - Run `npm run seed-badges`
   - Check database connection
   - Verify badge documents exist

2. **Badges Not Awarding**
   - Check user requirements
   - Verify badge service is working
   - Check console for errors

3. **Progress Bars Not Updating**
   - Refresh badge data
   - Check API endpoints
   - Verify frontend state management

### Debug Commands
```bash
# Check badge count
node -e "require('./models/Badge').countDocuments().then(c => console.log('Badges:', c))"

# Check user badges
node -e "require('./models/User').findOne().then(u => console.log('User badges:', u.badges.length))"
```

## 📚 Additional Resources

- [Badge Model Schema](./models/Badge.js)
- [Badge Service](./services/badgeService.js)
- [Badge Routes](./routes/badges.js)
- [Frontend Badges Page](../frontend/src/pages/Badges/Badges.js)

## 🤝 Contributing

When adding new badges:

1. Follow the existing naming convention
2. Use appropriate rarity levels
3. Set reasonable requirements
4. Provide meaningful rewards
5. Add comprehensive descriptions
6. Test thoroughly before deployment

---

**Note**: This badge system is designed to be extensible and maintainable. All badge logic is centralized in the `BadgeService` class, making it easy to add new badge types and modify existing ones.
