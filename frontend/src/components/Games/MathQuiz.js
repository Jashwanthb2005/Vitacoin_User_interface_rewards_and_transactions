import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const MathQuiz = ({ onComplete, onPause, isPaused, timeLimit }) => {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  const generateQuestion = () => {
    const num1 = Math.floor(Math.random() * 20) + 1;
    const num2 = Math.floor(Math.random() * 20) + 1;
    const operators = ['+', '-', '*'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    
    let answer;
    switch (operator) {
      case '+':
        answer = num1 + num2;
        break;
      case '-':
        answer = num1 - num2;
        break;
      case '*':
        answer = num1 * num2;
        break;
      default:
        answer = num1 + num2;
    }

    return {
      question: `${num1} ${operator} ${num2} = ?`,
      answer: answer
    };
  };

  useEffect(() => {
    if (!gameStarted) {
      setCurrentQuestion(generateQuestion());
      setGameStarted(true);
    }
  }, [gameStarted]);

  useEffect(() => {
    if (questionCount >= 10) {
      const finalScore = Math.round((correctAnswers / 10) * 100);
      onComplete({ score: finalScore, accuracy: finalScore });
    }
  }, [questionCount, correctAnswers, onComplete]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isPaused) return;

    const answer = parseInt(userAnswer);
    if (answer === currentQuestion.answer) {
      setScore(prev => prev + 10);
      setCorrectAnswers(prev => prev + 1);
    }

    setQuestionCount(prev => prev + 1);
    setUserAnswer('');
    setCurrentQuestion(generateQuestion());
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
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
            <div className="text-2xl font-bold text-gray-600">{questionCount}/10</div>
            <div className="text-sm text-gray-600">Questions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
            <div className="text-sm text-gray-600">Correct</div>
          </div>
        </div>
      </div>

      <motion.div
        key={questionCount}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto"
      >
        <h3 className="text-3xl font-bold text-gray-800 mb-6">
          {currentQuestion?.question}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="number"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyPress={handleKeyPress}
            className="input input-lg text-center text-2xl font-bold w-full"
            placeholder="Enter your answer"
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

      <div className="mt-6 text-sm text-gray-600">
        Press Enter to submit your answer
      </div>
    </div>
  );
};

export default MathQuiz;
