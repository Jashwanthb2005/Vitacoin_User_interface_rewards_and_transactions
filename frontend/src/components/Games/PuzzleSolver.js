import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const PuzzleSolver = ({ onComplete, onPause, isPaused, timeLimit }) => {
  const [puzzle, setPuzzle] = useState([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [puzzleCount, setPuzzleCount] = useState(0);
  const [solved, setSolved] = useState(0);

  const generatePuzzle = () => {
    // Simple sliding puzzle with numbers 1-8
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 0]; // 0 represents empty space
    const shuffled = [...numbers].sort(() => Math.random() - 0.5);
    
    return [
      shuffled.slice(0, 3),
      shuffled.slice(3, 6),
      shuffled.slice(6, 9)
    ];
  };

  useEffect(() => {
    setPuzzle(generatePuzzle());
  }, []);

  useEffect(() => {
    if (puzzleCount >= 3) {
      const finalScore = Math.round((solved / 3) * 100);
      onComplete({ score: finalScore, accuracy: finalScore });
    }
  }, [puzzleCount, solved, onComplete]);

  const isSolved = (puzzle) => {
    const flat = puzzle.flat();
    return flat.join('') === '123456780';
  };

  const moveTile = (row, col) => {
    if (puzzle[row][col] === 0) return;

    // Find empty space
    let emptyRow, emptyCol;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (puzzle[i][j] === 0) {
          emptyRow = i;
          emptyCol = j;
          break;
        }
      }
    }

    // Check if move is valid (adjacent to empty space)
    const isValidMove = 
      (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
      (Math.abs(col - emptyCol) === 1 && row === emptyRow);

    if (isValidMove) {
      const newPuzzle = puzzle.map(row => [...row]);
      newPuzzle[emptyRow][emptyCol] = puzzle[row][col];
      newPuzzle[row][col] = 0;
      
      setPuzzle(newPuzzle);
      setMoves(prev => prev + 1);
      setScore(prev => Math.max(0, prev - 1));

      if (isSolved(newPuzzle)) {
        setSolved(prev => prev + 1);
        setScore(prev => prev + 50);
        setTimeout(() => {
          setPuzzleCount(prev => prev + 1);
          setPuzzle(generatePuzzle());
          setMoves(0);
        }, 1000);
      }
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
            <div className="text-2xl font-bold text-gray-600">{puzzleCount}/3</div>
            <div className="text-sm text-gray-600">Puzzles</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{moves}</div>
            <div className="text-sm text-gray-600">Moves</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
        <h3 className="text-xl font-bold text-gray-800 mb-6">
          Arrange the numbers in order (1-8)
        </h3>

        <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
          {puzzle.map((row, rowIndex) =>
            row.map((tile, colIndex) => (
              <button
                key={`${rowIndex}-${colIndex}`}
                onClick={() => moveTile(rowIndex, colIndex)}
                className={`
                  w-16 h-16 rounded-lg font-bold text-xl transition-all duration-200
                  ${tile === 0 
                    ? 'bg-gray-200' 
                    : 'bg-primary-500 text-white hover:bg-primary-600'
                  }
                `}
              >
                {tile === 0 ? '' : tile}
              </button>
            ))
          )}
        </div>

        <div className="mt-6 text-sm text-gray-600">
          Click tiles to move them to the empty space
        </div>
      </div>
    </div>
  );
};

export default PuzzleSolver;
