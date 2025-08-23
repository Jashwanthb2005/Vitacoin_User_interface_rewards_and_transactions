import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ReactionTime = ({ onComplete, onPause, isPaused, timeLimit }) => {
  const [gameState, setGameState] = useState('waiting'); // waiting, ready, clicked
  const [startTime, setStartTime] = useState(null);
  const [reactionTime, setReactionTime] = useState(null);
  const [round, setRound] = useState(0);
  const [times, setTimes] = useState([]);
  const [score, setScore] = useState(0);

  const startRound = () => {
    setGameState('waiting');
    const delay = Math.random() * 3000 + 1000; // 1-4 seconds
    
    setTimeout(() => {
      if (!isPaused) {
        setGameState('ready');
        setStartTime(Date.now());
      }
    }, delay);
  };

  useEffect(() => {
    if (round < 5) {
      startRound();
    } else {
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      const finalScore = Math.max(0, 100 - Math.floor(avgTime / 10));
      onComplete({ score: finalScore, accuracy: Math.round((100 - avgTime / 10)) });
    }
  }, [round]);

  const handleClick = () => {
    if (gameState === 'ready') {
      const time = Date.now() - startTime;
      setReactionTime(time);
      setTimes(prev => [...prev, time]);
      setScore(prev => prev + Math.max(0, 20 - Math.floor(time / 10)));
      setGameState('clicked');
      
      setTimeout(() => {
        setRound(prev => prev + 1);
      }, 1000);
    } else if (gameState === 'waiting') {
      // Clicked too early
      setScore(prev => Math.max(0, prev - 5));
      setGameState('clicked');
      
      setTimeout(() => {
        setRound(prev => prev + 1);
      }, 1000);
    }
  };

  if (isPaused) return null;

  return (
    <div className="text-center">
      <div className="mb-8">
        <div className="flex justify-center gap-8 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">{score}</div>
            <div className="text-sm text-gray-600">Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{round}/5</div>
            <div className="text-sm text-gray-600">Rounds</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {reactionTime ? `${reactionTime}ms` : '-'}
            </div>
            <div className="text-sm text-gray-600">Last Time</div>
          </div>
        </div>
      </div>

      <motion.div
        key={round}
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto"
      >
        <div className="text-center">
          {gameState === 'waiting' && (
            <div className="text-gray-600">
              <div className="text-2xl mb-4">⏳</div>
              <div className="text-lg">Wait for the color to change...</div>
            </div>
          )}
          
          {gameState === 'ready' && (
            <div className="text-green-600">
              <div className="text-2xl mb-4">⚡</div>
              <div className="text-lg">Click now!</div>
            </div>
          )}
          
          {gameState === 'clicked' && (
            <div className="text-blue-600">
              <div className="text-2xl mb-4">🎯</div>
              <div className="text-lg">
                {reactionTime ? `Reaction time: ${reactionTime}ms` : 'Too early!'}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleClick}
          className={`
            w-32 h-32 rounded-full mx-auto mt-6 transition-all duration-200
            ${gameState === 'ready' 
              ? 'bg-green-500 hover:bg-green-600' 
              : 'bg-gray-300 hover:bg-gray-400'
            }
          `}
        >
          Click!
        </button>
      </motion.div>
    </div>
  );
};

export default ReactionTime;
