import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlay, FiAward, FiClock, FiTarget, FiStar, FiTrendingUp } from 'react-icons/fi';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import GamePlayer from '../../components/Games/GamePlayer';

const Challenges = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [showGamePlayer, setShowGamePlayer] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [challengesRes, gamesRes] = await Promise.all([
        axios.get('/api/challenges'),
        axios.get('/api/games')
      ]);
      
      setChallenges(challengesRes.data);
      setGames(gamesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGameSelect = (game) => {
    setSelectedGame(game);
    setShowGamePlayer(true);
  };

  const handleChallengeSelect = (challenge) => {
    setSelectedChallenge(challenge);
    setSelectedGame(challenge.gameId);
    setShowGamePlayer(true);
  };

  const handleGameComplete = async (result) => {
    try {
      // Submit score to backend
      const response = await axios.post(`/api/games/${selectedGame._id}/score`, {
        score: result.score,
        time: result.time,
        accuracy: result.accuracy,
        challengeId: selectedChallenge?._id
      });

      if (response.data.success) {
        // Refresh data
        await fetchData();
        setShowGamePlayer(false);
        setSelectedGame(null);
        setSelectedChallenge(null);
      }
    } catch (error) {
      console.error('Error submitting score:', error);
    }
  };

  const getFilteredChallenges = () => {
    if (filter === 'all') return challenges;
    return challenges.filter(challenge => challenge.type === filter);
  };

  const getFilteredGames = () => {
    if (filter === 'all') return games;
    return games.filter(game => game.category === filter);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (showGamePlayer && selectedGame) {
    return (
      <GamePlayer
        game={selectedGame}
        challenge={selectedChallenge}
        onComplete={handleGameComplete}
        onClose={() => {
          setShowGamePlayer(false);
          setSelectedGame(null);
          setSelectedChallenge(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🎮 Challenges & Games
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Complete challenges and play games to earn coins! Test your skills and climb the leaderboard.
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap justify-center gap-2 mb-8"
        >
          {[
            { key: 'all', label: 'All', icon: FiStar },
            { key: 'daily', label: 'Daily', icon: FiClock },
            { key: 'weekly', label: 'Weekly', icon: FiTrendingUp },
            { key: 'special', label: 'Special', icon: FiAward }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                  filter === tab.key
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-50 shadow-md'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </motion.div>

        {/* Challenges Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FiTarget className="w-6 h-6 text-primary-600" />
            Active Challenges
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getFilteredChallenges().map((challenge, index) => (
              <motion.div
                key={challenge._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => handleChallengeSelect(challenge)}
                style={{ borderLeft: `4px solid ${challenge.color}` }}
              >
                <div className="card-body">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {challenge.title}
                      </h3>
                      <p className="text-gray-600 mb-3">
                        {challenge.description}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`badge badge-${challenge.type}`}>
                        {challenge.type}
                      </span>
                      <div className="text-right mt-2">
                        <div className="text-2xl font-bold text-primary-600">
                          +{challenge.rewards.coins}
                        </div>
                        <div className="text-sm text-gray-500">coins</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-500">Min Score</div>
                      <div className="font-semibold text-gray-800">
                        {challenge.requirements.minScore}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-500">Time Limit</div>
                      <div className="font-semibold text-gray-800">
                        {challenge.requirements.timeLimit}s
                      </div>
                    </div>
                  </div>

                  <button className="btn btn-primary w-full">
                    <FiPlay className="w-4 h-4 mr-2" />
                    Start Challenge
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Games Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FiPlay className="w-6 h-6 text-primary-600" />
            Available Games
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {games.map((game, index) => (
              <motion.div
                key={game._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card hover:shadow-xl transition-all duration-300 cursor-pointer group"
                onClick={() => handleGameSelect(game)}
              >
                <div className="relative overflow-hidden rounded-t-2xl">
                  <img
                    src={game.thumbnail}
                    alt={game.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2">
                    <span className={`badge badge-${game.difficulty}`}>
                      {game.difficulty}
                    </span>
                  </div>
                  {game.isFeatured && (
                    <div className="absolute top-2 left-2">
                      <FiStar className="w-5 h-5 text-yellow-500 fill-current" />
                    </div>
                  )}
                </div>
                
                <div className="card-body">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{game.icon}</span>
                    <h3 className="text-lg font-bold text-gray-800">
                      {game.name}
                    </h3>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4">
                    {game.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary-600">
                        +{game.rewards.baseCoins}
                      </div>
                      <div className="text-xs text-gray-500">coins</div>
                    </div>
                    <button className="btn btn-primary btn-sm">
                      <FiPlay className="w-4 h-4 mr-1" />
                      Play
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Challenges;
