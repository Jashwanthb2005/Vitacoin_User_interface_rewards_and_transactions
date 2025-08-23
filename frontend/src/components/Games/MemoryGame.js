import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const MemoryGame = ({ onComplete, onPause, isPaused, timeLimit }) => {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  const emojis = ['🐶', '🐱', '🐭', '🐹', '��', '🦊', '🐻', '🐼'];

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    if (matched.length === emojis.length) {
      const finalScore = Math.max(0, 100 - moves * 5);
      onComplete({ score: finalScore, accuracy: Math.round((matched.length / emojis.length) * 100) });
    }
  }, [matched, moves, onComplete]);

  const initializeGame = () => {
    const gameCards = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false
      }));
    setCards(gameCards);
    setFlipped([]);
    setMatched([]);
    setScore(0);
    setMoves(0);
    setGameStarted(false);
  };

  const handleCardClick = (cardId) => {
    if (isPaused) return;
    
    const card = cards.find(c => c.id === cardId);
    if (card.isFlipped || card.isMatched || flipped.length >= 2) return;

    if (!gameStarted) setGameStarted(true);

    const newFlipped = [...flipped, cardId];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1);
      
      const [firstId, secondId] = newFlipped;
      const firstCard = cards.find(c => c.id === firstId);
      const secondCard = cards.find(c => c.id === secondId);

      if (firstCard.emoji === secondCard.emoji) {
        // Match found
        setMatched(prev => [...prev, firstId, secondId]);
        setScore(prev => prev + 20);
        setFlipped([]);
      } else {
        // No match
        setTimeout(() => {
          setFlipped([]);
        }, 1000);
      }
    }
  };

  const getCardDisplay = (card) => {
    if (card.isMatched || flipped.includes(card.id)) {
      return card.emoji;
    }
    return '❓';
  };

  if (isPaused) return null;

  return (
    <div className="text-center">
      <div className="mb-6">
        <div className="flex justify-center gap-8 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">{score}</div>
            <div className="text-sm text-gray-600">Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{moves}</div>
            <div className="text-sm text-gray-600">Moves</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{matched.length / 2}</div>
            <div className="text-sm text-gray-600">Matches</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
        {cards.map((card) => (
          <motion.div
            key={card.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
              w-16 h-16 rounded-xl border-2 cursor-pointer flex items-center justify-center text-2xl font-bold transition-all duration-300
              ${card.isMatched || flipped.includes(card.id)
                ? 'bg-white border-primary-300 shadow-md'
                : 'bg-primary-100 border-primary-200 hover:bg-primary-200'
              }
              ${card.isMatched ? 'opacity-50' : ''}
            `}
            onClick={() => handleCardClick(card.id)}
          >
            {getCardDisplay(card)}
          </motion.div>
        ))}
      </div>

      <div className="mt-6">
        <button
          onClick={initializeGame}
          className="btn btn-secondary"
        >
          Restart Game
        </button>
      </div>
    </div>
  );
};

export default MemoryGame;
