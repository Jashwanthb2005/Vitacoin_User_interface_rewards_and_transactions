import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const WordScramble = ({ onComplete, onPause, isPaused, timeLimit }) => {
  const [currentWord, setCurrentWord] = useState('');
  const [scrambledWord, setScrambledWord] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  const words = ['HELLO', 'WORLD', 'GAME', 'PLAY', 'FUN', 'COOL', 'AWESOME', 'GREAT'];

  const scrambleWord = (word) => {
    return word.split('').sort(() => Math.random() - 0.5).join('');
  };

  const generateNewWord = () => {
    const word = words[Math.floor(Math.random() * words.length)];
    setCurrentWord(word);
    setScrambledWord(scrambleWord(word));
  };

  useEffect(() => {
    generateNewWord();
  }, []);

  useEffect(() => {
    if (wordCount >= 5) {
      const finalScore = Math.round((correctAnswers / 5) * 100);
      onComplete({ score: finalScore, accuracy: finalScore });
    }
  }, [wordCount, correctAnswers, onComplete]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isPaused) return;

    if (userAnswer.toUpperCase() === currentWord) {
      setScore(prev => prev + 20);
      setCorrectAnswers(prev => prev + 1);
    }

    setWordCount(prev => prev + 1);
    setUserAnswer('');
    generateNewWord();
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
            <div className="text-2xl font-bold text-gray-600">{wordCount}/5</div>
            <div className="text-sm text-gray-600">Words</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
            <div className="text-sm text-gray-600">Correct</div>
          </div>
        </div>
      </div>

      <motion.div
        key={wordCount}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto"
      >
        <h3 className="text-2xl font-bold text-gray-800 mb-4">
          Unscramble this word:
        </h3>
        
        <div className="text-4xl font-bold text-primary-600 mb-6">
          {scrambledWord}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            className="input input-lg text-center text-xl font-bold w-full"
            placeholder="Enter the word"
            autoFocus
          />
          
          <button
            type="submit"
            className="btn btn-primary btn-lg w-full"
          >
            Submit Answer
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default WordScramble;
