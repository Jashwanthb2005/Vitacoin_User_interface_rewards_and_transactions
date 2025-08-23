# Vitacoin User Dashboard

A modern, real-time user dashboard for tracking rewards, transactions, and achievements in the Vitacoin ecosystem. Built with the MERN stack (MongoDB, Express, React, Node.js) and featuring real-time updates via Socket.IO.

## 🚀 Features

### Core Features
- **Real-Time Coin Balance Updates** - Live balance tracking with instant updates
- **Transaction HiFlow** - Detailed transaction history with filtering and search
- **Badge Progression System** - Track and earn achievement badges
- **Leaderboards** - Competitive rankings based on coins and badges
- **Real-Time Notifications** - Instant alerts for rewards and penalties
- **Responsive Design** - Works seamlessly on desktop and mobile devices

### Technical Features
- **JWT Authentication** - Secure user authentication and authorization
- **WebSocket Integration** - Real-time bidirectional communication
- **MongoDB Database** - Scalable NoSQL database with optimized queries
- **RESTful API** - Clean, well-documented API endpoints
- **Modern UI/UX** - Beautiful interface with smooth animations
- **Rate Limiting** - API protection against abuse
- **Error Handling** - Comprehensive error management

## 🛠️ Technology Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Socket.IO** - Real-time bidirectional communication
- **JWT** - JSON Web Token authentication
- **bcryptjs** - Password hashing
- **Helmet** - Security middleware
- **Morgan** - HTTP request logger

### Frontend
- **React 18** - JavaScript library for building user interfaces
- **React Router** - Client-side routing
- **Socket.IO Client** - Real-time communication
- **Framer Motion** - Animation library
- **Tailwind CSS** - Utility-first CSS framework
- **React Icons** - Icon library
- **Axios** - HTTP client
- **React Hot Toast** - Toast notifications

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd vitacoin
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Setup

#### Backend Environment
Create a `.env` file in the `backend` directory:

```bash
cd backend
cp env.example .env
```

Edit the `.env` file with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/vitacoin

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# WebSocket Configuration
CORS_ORIGIN=http://localhost:3000
```

#### Frontend Environment
Create a `.env` file in the `frontend` directory:

```bash
cd frontend
echo "REACT_APP_API_URL=http://localhost:5000" > .env
echo "REACT_APP_SOCKET_URL=http://localhost:5000" >> .env
```

### 4. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# Start MongoDB (macOS with Homebrew)
brew services start mongodb-community

# Start MongoDB (Ubuntu/Debian)
sudo systemctl start mongod

# Or use MongoDB Atlas (cloud service)
```

### 5. Run the Application

#### Development Mode (Recommended)
From the root directory:

```bash
# Start both backend and frontend concurrently
npm run dev
```

#### Separate Development Servers
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

### 6. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **API Documentation**: http://localhost:5000/api/health

## 📁 Project Structure

```
vitacoin/
├── backend/                 # Backend server
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── socket/             # Socket.IO handlers
│   ├── server.js           # Main server file
│   └── package.json
├── frontend/               # React application
│   ├── public/             # Static files
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   ├── App.js          # Main app component
│   │   └── index.js        # Entry point
│   └── package.json
├── package.json            # Root package.json
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Transactions
- `GET /api/transactions` - Get transaction history
- `GET /api/transactions/stats` - Get transaction statistics
- `POST /api/transactions` - Create transaction (Admin)

### Badges
- `GET /api/badges` - Get available badges
- `GET /api/badges/user` - Get user badges
- `POST /api/badges/:id/award` - Award badge (Admin)

### Leaderboard
- `GET /api/leaderboard` - Get leaderboard
- `GET /api/leaderboard/stats` - Get leaderboard statistics

### Users
- `GET /api/users/me` - Get current user
- `PUT /api/users/me` - Update current user

## 🔌 WebSocket Events

### Client to Server
- `join_leaderboard` - Join leaderboard room
- `leave_leaderboard` - Leave leaderboard room
- `update_balance` - Update coin balance
- `award_badge` - Award badge to user
- `get_transactions` - Request transaction data
- `get_leaderboard` - Request leaderboard data

### Server to Client
- `user_data` - User data and connection info
- `balance_updated` - Balance update confirmation
- `badge_awarded` - Badge award notification
- `leaderboard_update` - Leaderboard updates
- `transactions_data` - Transaction data response
- `leaderboard_data` - Leaderboard data response
- `notification` - System notifications

## 🎨 UI Components

### Core Components
- **Layout** - Main application layout with sidebar
- **CoinDisplay** - Animated coin balance display
- **LoadingSpinner** - Reusable loading component
- **NotificationDropdown** - Real-time notifications

### Pages
- **Dashboard** - Main overview with stats and quick actions
- **Transactions** - Transaction history with filtering
- **Badges** - Badge collection and progression
- **Leaderboard** - User rankings and statistics
- **Profile** - User profile management

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcryptjs for password security
- **Rate Limiting** - API protection against abuse
- **CORS Configuration** - Cross-origin resource sharing
- **Helmet Security** - Security headers middleware
- **Input Validation** - Comprehensive form validation

## 🚀 Deployment

### Backend Deployment (Heroku)
```bash
cd backend
heroku create your-app-name
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your-mongodb-atlas-uri
heroku config:set JWT_SECRET=your-production-jwt-secret
git push heroku main
```

### Frontend Deployment (Vercel)
```bash
cd frontend
vercel --prod
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🎯 Roadmap

- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Social features (friends, groups)
- [ ] Marketplace integration
- [ ] Advanced badge system
- [ ] Achievement challenges
- [ ] Multi-language support
- [ ] Dark mode theme

---

**Built with ❤️ by the Vitacoin Team**
