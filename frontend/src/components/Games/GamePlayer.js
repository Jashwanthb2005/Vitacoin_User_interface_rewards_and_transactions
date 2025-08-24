import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiPlay, FiPause, FiRotateCcw, FiAward, FiClock, FiTarget, FiAlertCircle } from 'react-icons/fi';
import MemoryGame from './MemoryGame';
import MathQuiz from './MathQuiz';
import WordScramble from './WordScramble';
import ReactionTime from './ReactionTime';
import PuzzleSolver from './PuzzleSolver';

const GamePlayer = ({ game, challenge, onComplete, onClose }) => {
  const [gameState, setGameState] = useState('menu'); // menu, playing, paused, completed
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [gameTimer, setGameTimer] = useState(null);
  const [startTime, setStartTime] = useState(null);
  
  // Challenge timer state
  const [challengeStartTime, setChallengeStartTime] = useState(null);
  const [challengeTimeElapsed, setChallengeTimeElapsed] = useState(0);
  const [challengeTimer, setChallengeTimer] = useState(null);
  const [showChallengeTimer, setShowChallengeTimer] = useState(false);
  const [showTimeUpPopup, setShowTimeUpPopup] = useState(false);
  const [challengeTimeLimit, setChallengeTimeLimit] = useState(0);

  useEffect(() => {
    return () => {
      if (gameTimer) clearInterval(gameTimer);
      if (challengeTimer) clearInterval(challengeTimer);
    };
  }, [gameTimer, challengeTimer]);

  // Start challenge timer when challenge is active
  useEffect(() => {
    if (challenge && gameState === 'playing') {
      startChallengeTimer();
    }
  }, [challenge, gameState]);

  // Check for time up
  useEffect(() => {
    if (challenge && challengeTimeElapsed >= challengeTimeLimit && challengeTimeLimit > 0) {
      handleTimeUp();
    }
  }, [challengeTimeElapsed, challengeTimeLimit]);

  const startChallengeTimer = () => {
    if (!challenge) return;
    
    const timeLimit = challenge.requirements?.timeLimit || 300;
    setChallengeTimeLimit(timeLimit);
    setChallengeStartTime(Date.now());
    setShowChallengeTimer(true);
    
    const timer = setInterval(() => {
      setChallengeTimeElapsed(prev => prev + 1);
    }, 1000);
    setChallengeTimer(timer);
  };

  const handleTimeUp = () => {
    // Stop all timers
    if (gameTimer) clearInterval(gameTimer);
    if (challengeTimer) clearInterval(challengeTimer);
    
    setGameState('completed');
    setShowTimeUpPopup(true);
    
    // Auto-submit with current score (will fail due to time)
    setTimeout(() => {
      handleSubmitScore();
    }, 2000);
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setTime(0);
    setAccuracy(0);
    setStartTime(Date.now());
    
    // Reset challenge timer
    setChallengeTimeElapsed(0);
    setShowTimeUpPopup(false);
    
    const timer = setInterval(() => {
      setTime(prev => prev + 1);
    }, 1000);
    setGameTimer(timer);
  };

  const pauseGame = () => {
    setGameState('paused');
    if (gameTimer) clearInterval(gameTimer);
    if (challengeTimer) clearInterval(challengeTimer);
  };

  const resumeGame = () => {
    setGameState('playing');
    const timer = setInterval(() => {
      setTime(prev => prev + 1);
    }, 1000);
    setGameTimer(timer);
    
    // Resume challenge timer
    if (challenge) {
      const challengeTimer = setInterval(() => {
        setChallengeTimeElapsed(prev => prev + 1);
      }, 1000);
      setChallengeTimer(challengeTimer);
    }
  };

  const endGame = (finalScore, finalAccuracy) => {
    if (gameTimer) clearInterval(gameTimer);
    if (challengeTimer) clearInterval(challengeTimer);
    
    setGameState('completed');
    setScore(finalScore);
    setAccuracy(finalAccuracy);
    setTime(Math.floor((Date.now() - startTime) / 1000));
  };

  const handleGameComplete = (gameResult) => {
    endGame(gameResult.score, gameResult.accuracy);
  };

  const handleSubmitScore = () => {
    // Include challenge time in the result
    const result = {
      score,
      time,
      accuracy,
      challengeTimeElapsed: challenge ? challengeTimeElapsed : null
    };
    
    onComplete(result);
  };

  const renderGameComponent = () => {
    const gameProps = {
      onComplete: handleGameComplete,
      onPause: pauseGame,
      isPaused: gameState === 'paused',
      timeLimit: game.gameConfig?.timeLimit
    };

    switch (game.slug) {
      case 'memory-match':
        return <MemoryGame {...gameProps} />;
      case 'math-quiz':
        return <MathQuiz {...gameProps} />;
      case 'word-scramble':
        return <WordScramble {...gameProps} />;
      case 'reaction-time':
        return <ReactionTime {...gameProps} />;
      case 'puzzle-solver':
        return <PuzzleSolver {...gameProps} />;
      default:
        return <div className="text-center">Game not implemented yet</div>;
    }
  };

  const getGameInstructions = () => {
    let instructions = game.gameConfig?.instructions || 'Complete the game to earn coins!';
    
    if (challenge) {
      const timeLimit = challenge.requirements?.timeLimit || 300;
      const minScore = challenge.requirements?.minScore || 0;
      instructions = `Challenge: Score ${minScore}+ points within ${timeLimit} seconds!`;
    }
    
    return instructions;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeRemaining = () => {
    if (!challenge || !challengeTimeLimit) return 0;
    return Math.max(0, challengeTimeLimit - challengeTimeElapsed);
  };

  const getTimerColor = () => {
    const timeRemaining = getTimeRemaining();
    const percentage = (timeRemaining / challengeTimeLimit) * 100;
    
    if (percentage > 60) return 'text-green-600';
    if (percentage > 30) return 'text-yellow-600';
    if (percentage > 10) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-gray-900">{game.name}</h2>
            {challenge && (
              <div className="flex items-center space-x-2 text-sm text-primary-600">
                <FiTarget className="w-4 h-4" />
                <span>Challenge Mode</span>
              </div>
            )}
          </div>
          
          {/* Challenge Timer */}
          {showChallengeTimer && challenge && (
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              getTimeRemaining() <= 30 ? 'bg-red-100' : 'bg-blue-50'
            }`}>
              <FiClock className={`w-4 h-4 ${getTimerColor()}`} />
              <span className={`font-semibold ${getTimerColor()}`}>
                {formatTime(getTimeRemaining())}
              </span>
              <span className="text-gray-500 text-sm">
                / {formatTime(challengeTimeLimit)}
              </span>
            </div>
          )}
          
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Game Content */}
        <div className="p-6">
          {gameState === 'menu' && (
            <div className="text-center space-y-6">
              <div className="text-6xl mb-4">{game.icon || '🎮'}</div>
              <h3 className="text-2xl font-bold text-gray-800">{game.name}</h3>
              <p className="text-gray-600 max-w-md mx-auto">{getGameInstructions()}</p>
              
              {challenge && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                  <h4 className="font-semibold text-blue-800 mb-2">Challenge Requirements:</h4>
                  <div className="space-y-1 text-sm text-blue-700">
                    <div>• Minimum Score: {challenge.requirements?.minScore || 0}</div>
                    <div>• Time Limit: {challenge.requirements?.timeLimit || 300} seconds</div>
                    <div>• Reward: {challenge.rewards?.coins || 0} coins + {challenge.rewards?.experience || 0} XP</div>
                  </div>
                </div>
              )}
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="btn-primary text-lg px-8 py-3"
              >
                <FiPlay className="w-5 h-5 mr-2" />
                Start {challenge ? 'Challenge' : 'Game'}
              </motion.button>
            </div>
          )}

          {gameState === 'playing' && (
            <div className="space-y-4">
              {/* Game Stats */}
              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600">{score}</div>
                    <div className="text-sm text-gray-500">Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{formatTime(time)}</div>
                    <div className="text-sm text-gray-500">Game Time</div>
                  </div>
                  {challenge && (
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getTimerColor()}`}>
                        {formatTime(getTimeRemaining())}
                      </div>
                      <div className="text-sm text-gray-500">Time Left</div>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={pauseGame}
                    className="btn-outline"
                  >
                    <FiPause className="w-4 h-4 mr-2" />
                    Pause
                  </button>
                </div>
              </div>

              {/* Game Component */}
              <div className="min-h-[400px] flex items-center justify-center">
                {renderGameComponent()}
              </div>
            </div>
          )}

          {gameState === 'paused' && (
            <div className="text-center space-y-6">
              <div className="text-6xl mb-4">⏸️</div>
              <h3 className="text-2xl font-bold text-gray-800">Game Paused</h3>
              <p className="text-gray-600">Take a break or resume when ready</p>
              
              {challenge && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
                  <h4 className="font-semibold text-yellow-800 mb-2">Challenge Status:</h4>
                  <div className="space-y-1 text-sm text-yellow-700">
                    <div>• Time Elapsed: {formatTime(challengeTimeElapsed)}</div>
                    <div>• Time Remaining: {formatTime(getTimeRemaining())}</div>
                    <div>• Current Score: {score}</div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resumeGame}
                  className="btn-primary"
                >
                  <FiPlay className="w-4 h-4 mr-2" />
                  Resume
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startGame}
                  className="btn-outline"
                >
                  <FiRotateCcw className="w-4 h-4 mr-2" />
                  Restart
                </motion.button>
              </div>
            </div>
          )}

          {gameState === 'completed' && (
            <div className="text-center space-y-6">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-gray-800">Game Complete!</h3>
              
              <div className="grid grid-cols-3 gap-6 max-w-md mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600">{score}</div>
                  <div className="text-sm text-gray-500">Final Score</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{formatTime(time)}</div>
                  <div className="text-sm text-gray-500">Game Time</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{accuracy}%</div>
                  <div className="text-sm text-gray-500">Accuracy</div>
                </div>
              </div>
              
              {challenge && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                  <h4 className="font-semibold text-blue-800 mb-2">Challenge Results:</h4>
                  <div className="space-y-1 text-sm text-blue-700">
                    <div>• Challenge Time: {formatTime(challengeTimeElapsed)}</div>
                    <div>• Time Limit: {formatTime(challengeTimeLimit)}</div>
                    <div>• Score Required: {challenge.requirements?.minScore || 0}</div>
                    <div>• Your Score: {score}</div>
                  </div>
                </div>
              )}
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmitScore}
                className="btn-primary text-lg px-8 py-3"
              >
                <FiAward className="w-5 h-5 mr-2" />
                Submit Score
              </motion.button>
            </div>
          )}
        </div>

        {/* Time Up Popup */}
        <AnimatePresence>
          {showTimeUpPopup && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white rounded-xl p-8 max-w-md mx-4 text-center"
              >
                <div className="text-6xl mb-4">⏰</div>
                <h3 className="text-2xl font-bold text-red-600 mb-4">Time's Up!</h3>
                <p className="text-gray-600 mb-6">
                  Challenge time limit exceeded. Your score will be submitted but may not qualify for rewards.
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="text-sm text-red-700">
                    <div>• Time Elapsed: {formatTime(challengeTimeElapsed)}</div>
                    <div>• Time Limit: {formatTime(challengeTimeLimit)}</div>
                    <div>• Final Score: {score}</div>
                  </div>
                </div>
                <button
                  onClick={() => setShowTimeUpPopup(false)}
                  className="btn-primary w-full"
                >
                  Continue
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default GamePlayer;
