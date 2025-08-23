import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiPlay, FiPause, FiRotateCcw, FiAward, FiClock } from 'react-icons/fi';
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

  useEffect(() => {
    return () => {
      if (gameTimer) clearInterval(gameTimer);
    };
  }, [gameTimer]);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setTime(0);
    setAccuracy(0);
    setStartTime(Date.now());
    
    const timer = setInterval(() => {
      setTime(prev => prev + 1);
    }, 1000);
    setGameTimer(timer);
  };

  const pauseGame = () => {
    setGameState('paused');
    if (gameTimer) clearInterval(gameTimer);
  };

  const resumeGame = () => {
    setGameState('playing');
    const timer = setInterval(() => {
      setTime(prev => prev + 1);
    }, 1000);
    setGameTimer(timer);
  };

  const endGame = (finalScore, finalAccuracy) => {
    if (gameTimer) clearInterval(gameTimer);
    setGameState('completed');
    setScore(finalScore);
    setAccuracy(finalAccuracy);
    setTime(Math.floor((Date.now() - startTime) / 1000));
  };

  const handleGameComplete = (gameResult) => {
    endGame(gameResult.score, gameResult.accuracy);
  };

  const handleSubmitScore = () => {
    onComplete({
      score,
      time,
      accuracy
    });
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
    return game.gameConfig?.instructions || 'Complete the game to earn coins!';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-3xl">{game.icon}</span>
              <div>
                <h2 className="text-2xl font-bold">{game.name}</h2>
                {challenge && (
                  <p className="text-primary-100">Challenge: {challenge.title}</p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-primary-200 transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Game Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {gameState === 'menu' && (
              <motion.div
                key="menu"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                <div className="mb-8">
                  <img
                    src={game.thumbnail}
                    alt={game.name}
                    className="w-full max-w-md mx-auto rounded-xl shadow-lg"
                  />
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Game Instructions
                </h3>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  {getGameInstructions()}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-primary-600">
                      +{game.rewards.baseCoins}
                    </div>
                    <div className="text-sm text-gray-600">Base Reward</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-primary-600">
                      +{game.rewards.bonusCoins}
                    </div>
                    <div className="text-sm text-gray-600">Bonus</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-primary-600">
                      {game.gameConfig?.timeLimit || '∞'}s
                    </div>
                    <div className="text-sm text-gray-600">Time Limit</div>
                  </div>
                </div>

                <button
                  onClick={startGame}
                  className="btn btn-primary btn-lg"
                >
                  <FiPlay className="w-5 h-5 mr-2" />
                  Start Game
                </button>
              </motion.div>
            )}

            {gameState === 'playing' && (
              <motion.div
                key="playing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="min-h-[400px]"
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <FiClock className="w-4 h-4 text-gray-600" />
                      <span className="font-semibold">{time}s</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiAward className="w-4 h-4 text-gray-600" />
                      <span className="font-semibold">{score}</span>
                    </div>
                  </div>
                  <button
                    onClick={pauseGame}
                    className="btn btn-secondary"
                  >
                    <FiPause className="w-4 h-4 mr-2" />
                    Pause
                  </button>
                </div>
                
                {renderGameComponent()}
              </motion.div>
            )}

            {gameState === 'paused' && (
              <motion.div
                key="paused"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center min-h-[400px] flex items-center justify-center"
              >
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">
                    Game Paused
                  </h3>
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={resumeGame}
                      className="btn btn-primary"
                    >
                      <FiPlay className="w-4 h-4 mr-2" />
                      Resume
                    </button>
                    <button
                      onClick={startGame}
                      className="btn btn-secondary"
                    >
                      <FiRotateCcw className="w-4 h-4 mr-2" />
                      Restart
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {gameState === 'completed' && (
              <motion.div
                key="completed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                <div className="mb-8">
                  <div className="text-6xl mb-4">🎉</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">
                    Game Completed!
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <div className="text-2xl font-bold text-green-600">
                      {score}
                    </div>
                    <div className="text-sm text-green-600">Final Score</div>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600">
                      {time}s
                    </div>
                    <div className="text-sm text-blue-600">Time Taken</div>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                    <div className="text-2xl font-bold text-purple-600">
                      {accuracy}%
                    </div>
                    <div className="text-sm text-purple-600">Accuracy</div>
                  </div>
                </div>

                <button
                  onClick={handleSubmitScore}
                  className="btn btn-success btn-lg"
                >
                  <FiAward className="w-5 h-5 mr-2" />
                  Submit Score & Earn Coins
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default GamePlayer;
