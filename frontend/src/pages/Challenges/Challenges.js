import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlay, FiAward, FiClock, FiTarget, FiStar, FiTrendingUp, FiCheckCircle, FiXCircle, FiPause, FiRotateCcw } from 'react-icons/fi';
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
  const [activeChallenges, setActiveChallenges] = useState(new Set());
  const [challengeTimers, setChallengeTimers] = useState({});
  const [timerDisplay, setTimerDisplay] = useState({}); // New state for UI updates

  useEffect(() => {
    fetchData();
  }, []);

  // Timer effect for active challenges - FIXED VERSION
  useEffect(() => {
    const timer = setInterval(() => {
      setChallengeTimers(prev => {
        const newTimers = { ...prev };
        const newTimerDisplay = { ...timerDisplay };
        let hasChanges = false;
        
        Object.keys(newTimers).forEach(challengeId => {
          if (newTimers[challengeId].isActive) {
            newTimers[challengeId].elapsed += 1;
            newTimers[challengeId].remaining = Math.max(0, newTimers[challengeId].limit - newTimers[challengeId].elapsed);
            
            // Update display timer for UI
            newTimerDisplay[challengeId] = {
              remaining: newTimers[challengeId].remaining,
              elapsed: newTimers[challengeId].elapsed,
              limit: newTimers[challengeId].limit
            };
            
            // Check if time is up
            if (newTimers[challengeId].remaining <= 0) {
              newTimers[challengeId].isActive = false;
              newTimers[challengeId].status = 'time_up';
              hasChanges = true;
              
              // Show time up alert
              alert(`⏰ Time's up for challenge! You didn't complete it in time.`);
            }
          }
        });
        
        // Update timer display for UI updates
        setTimerDisplay(newTimerDisplay);
        
        // Only return new timers if there are actual changes
        return hasChanges ? newTimers : prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timerDisplay]);

  useEffect(() => {
    console.log('Active challenges updated:', activeChallenges);
    console.log('Challenge timers updated:', challengeTimers);
  }, [activeChallenges, challengeTimers]);

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
    setSelectedChallenge(null);
    setShowGamePlayer(true);
  };

  const handleChallengeSelect = async (challenge) => {
    console.log('Challenge selected:', challenge);
    
    try {
      // Start the challenge first
      const response = await axios.post(`/api/challenges/${challenge._id}/start`, {
        userId: user._id
      });
      
      if (response.data.success) {
        // Add to active challenges
        setActiveChallenges(prev => {
          const newSet = new Set(prev);
          newSet.add(challenge._id);
          return newSet;
        });
        
        // Initialize timer
        const timeLimit = challenge.requirements?.timeLimit || 300;
        const newTimer = {
          limit: timeLimit,
          elapsed: 0,
          remaining: timeLimit,
          isActive: true,
          status: 'active',
          startTime: Date.now()
        };
        
        setChallengeTimers(prev => ({
          ...prev,
          [challenge._id]: newTimer
        }));
        
        setTimerDisplay(prev => ({
          ...prev,
          [challenge._id]: {
            remaining: timeLimit,
            elapsed: 0,
            limit: timeLimit
          }
        }));
        
        // Start the game
        setSelectedChallenge(challenge);
        setSelectedGame(challenge.gameId);
        setShowGamePlayer(true);
        
        console.log(`Challenge ${challenge.title} started with ${timeLimit}s timer`);
      } else {
        alert('Failed to start challenge: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error starting challenge:', error);
      alert('Failed to start challenge. Please try again.');
    }
  };

  const handleGameComplete = async (result) => {
    try {
      let response;
      
      if (selectedChallenge) {
        // Get current challenge timer
        const timer = challengeTimers[selectedChallenge._id];
        const isTimeValid = timer && timer.isActive && timer.remaining > 0;
        
        if (!isTimeValid) {
          alert('⏰ Challenge time expired! You cannot complete this challenge.');
          // Remove from active challenges
          setActiveChallenges(prev => {
            const newSet = new Set(prev);
            newSet.delete(selectedChallenge._id);
            return newSet;
          });
          
          setChallengeTimers(prev => {
            const newTimers = { ...prev };
            delete newTimers[selectedChallenge._id];
            return newTimers;
          });
          
          setTimerDisplay(prev => {
            const newDisplay = { ...prev };
            delete newDisplay[selectedChallenge._id];
            return newDisplay;
          });
          
          setShowGamePlayer(false);
          setSelectedGame(null);
          setSelectedChallenge(null);
          return;
        }
        
        // Complete challenge with timer validation
        response = await axios.post(`/api/challenges/${selectedChallenge._id}/complete`, {
          score: result.score,
          time: result.time,
          accuracy: result.accuracy,
          challengeTime: timer.elapsed,
          isTimeValid: true
        });
        
        if (response.data.success) {
          // Show success message with rewards
          const rewards = response.data.rewards;
          alert(`🎉 Challenge Completed Successfully!\n\n🏆 Score: ${result.score}\n⏱️ Time: ${timer.elapsed}s\n💰 Coins Earned: +${rewards.coins}\n⭐ XP Earned: +${rewards.experience}`);
          
          // Remove from active challenges
          setActiveChallenges(prev => {
            const newSet = new Set(prev);
            newSet.delete(selectedChallenge._id);
            return newSet;
          });
          
          // Remove timer
          setChallengeTimers(prev => {
            const newTimers = { ...prev };
            delete newTimers[selectedChallenge._id];
            return newTimers;
          });
          
          setTimerDisplay(prev => {
            const newDisplay = { ...prev };
            delete newDisplay[selectedChallenge._id];
            return newDisplay;
          });
          
          // Refresh user data to show updated coin balance
          await fetchData();
        } else {
          alert('Challenge failed: ' + response.data.message);
        }
      } else {
        // Regular game completion
        response = await axios.post(`/api/games/${selectedGame._id}/score`, {
          score: result.score,
          time: result.time,
          accuracy: result.accuracy
        });
      }

      if (response.data.success) {
        setShowGamePlayer(false);
        setSelectedGame(null);
        setSelectedChallenge(null);
      }
    } catch (error) {
      console.error('Error submitting score:', error);
      alert('Failed to submit score. Please try again.');
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

  const isChallengeActive = (challengeId) => {
    return activeChallenges.has(challengeId);
  };

  const getChallengeTimer = (challengeId) => {
    return timerDisplay[challengeId] || null;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = (timer) => {
    if (!timer) return 'text-gray-600';
    
    const percentage = (timer.remaining / timer.limit) * 100;
    if (percentage > 60) return 'text-green-600';
    if (percentage > 30) return 'text-yellow-600';
    if (percentage > 10) return 'text-orange-600';
    return 'text-red-600';
  };

  const getButtonState = (challenge) => {
    const timer = getChallengeTimer(challenge._id);
    const isActive = isChallengeActive(challenge._id);
    
    console.log(`Button state for challenge ${challenge._id}:`, {
      isActive,
      timer,
      timerStatus: timer?.status,
      timerIsActive: timer?.isActive
    });
    
    if (!isActive) {
      return {
        icon: FiPlay,
        text: 'Start Challenge',
        className: 'btn-primary',
        disabled: false
      };
    }
    
    if (timer?.status === 'time_up') {
      return {
        icon: FiXCircle,
        text: 'Time Up',
        className: 'btn-error',
        disabled: true
      };
    }
    
    if (timer?.isActive) {
      return {
        icon: FiPause,
        text: 'Continue Challenge',
        className: 'btn-success',
        disabled: false
      };
    }
    
    return {
      icon: FiRotateCcw,
      text: 'Restart Challenge',
      className: 'btn-warning',
      disabled: false
    };
  };

  const debugChallengeState = (challenge) => {
    const timer = getChallengeTimer(challenge._id);
    const isActive = isChallengeActive(challenge._id);
    
    console.log(`Debug for challenge ${challenge._id}:`, {
      title: challenge.title,
      isActive,
      timer,
      hasTimer: !!timer,
      timerStatus: timer?.status,
      timerIsActive: timer?.isActive,
      timerRemaining: timer?.remaining,
      timerLimit: timer?.limit
    });
    
    return { timer, isActive };
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
            Take on exciting challenges and play games to earn coins and experience!
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-wrap justify-center gap-2">
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
          </div>
        </motion.div>

        {/* Active Challenges Section */}
        {getFilteredChallenges().length > 0 && (
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
              {getFilteredChallenges().map((challenge, index) => {
                const { timer, isActive } = debugChallengeState(challenge);
                const buttonState = getButtonState(challenge);
                const Icon = buttonState.icon;
                
                return (
                  <motion.div
                    key={challenge._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`card hover:shadow-xl transition-all duration-300 cursor-pointer ${
                      isChallengeActive(challenge._id) ? 'ring-2 ring-primary-500' : ''
                    }`}
                    onClick={() => !buttonState.disabled && handleChallengeSelect(challenge)}
                    style={{ borderLeft: `4px solid ${challenge.color || '#3B82F6'}` }}
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
                          {isChallengeActive(challenge._id) && (
                            <div className="mt-2 text-primary-600 text-sm font-semibold">
                              <FiCheckCircle className="w-4 h-4 inline mr-1" />
                              Active
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Challenge Timer Display - ENHANCED VERSION */}
                      {isChallengeActive(challenge._id) && (
                        <div className="mb-4 p-3 bg-blue-100 border border-blue-300 rounded-lg">
                          <div className="text-center">
                            <div className="text-sm font-medium text-blue-800 mb-2">
                              Challenge Active!
                            </div>
                            <div className={`text-lg font-bold ${getTimerColor(timer)}`}>
                              {timer ? (
                                <>
                                  <FiClock className="w-4 h-4 inline mr-2" />
                                  {formatTime(timer.remaining)} remaining
                                </>
                              ) : (
                                'Initializing...'
                              )}
                            </div>
                            {timer && (
                              <div className="text-xs text-blue-600 mt-1">
                                Progress: {Math.round(((timer.limit - timer.remaining) / timer.limit) * 100)}%
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-sm text-gray-500">Min Score</div>
                          <div className="font-semibold text-gray-800">
                            {challenge.requirements?.minScore || 0}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-500">Time Limit</div>
                          <div className="font-semibold text-gray-800">
                            {challenge.requirements?.timeLimit || 300}s
                          </div>
                        </div>
                      </div>

                      <div className="text-right mb-4">
                        <div className="text-2xl font-bold text-primary-600">
                          +{challenge.rewards?.coins || 0}
                        </div>
                        <div className="text-sm text-gray-500">coins + {challenge.rewards?.experience || 0} XP</div>
                      </div>

                      <button 
                        className={`btn w-full ${buttonState.className}`}
                        disabled={buttonState.disabled}
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {buttonState.text}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Games Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FiPlay className="w-6 h-6 text-primary-600" />
            Available Games
          </h2>
          
          {getFilteredGames().length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎮</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No games found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {getFilteredGames().map((game, index) => (
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
                      src={game.thumbnail || '/default-game-thumbnail.jpg'}
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
                      <span className="text-2xl">{game.icon || '🎮'}</span>
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
                          +{game.rewards?.baseCoins || 0}
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
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Challenges;
