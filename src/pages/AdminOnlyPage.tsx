import React, { useState } from "react";


type Player = "X" | "O";

const emptyBoard: (Player | null)[] = Array(9).fill(null);

const calculateWinner = (squares: (Player | null)[]): Player | null => {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let line of lines) {
    const [a, b, c] = line;
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
};

const AdminOnlyPage: React.FC = () => {
  const [board, setBoard] = useState<(Player | null)[]>([...emptyBoard]);
  const [xIsNext, setXIsNext] = useState(true);
  const winner = calculateWinner(board);
  const isDraw = !winner && board.every(Boolean);

  const handleClick = (idx: number) => {
    if (board[idx] || winner) return;
    const newBoard = board.slice();
    newBoard[idx] = xIsNext ? "X" : "O";
    setBoard(newBoard);
    setXIsNext(!xIsNext);
  };

  const handleReset = () => {
    setBoard([...emptyBoard]);
    setXIsNext(true);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Admin Only Page</h1>
      <p className="text-lg mb-6">This page is only accessible to admin users.</p>
      <div className="mb-4">
        <h2 className="text-2xl font-semibold mb-2">Tic Tac Toe</h2>
        <div className="grid grid-cols-3 gap-2 w-48 mx-auto mb-4">
          {board.map((cell, idx) => (
            <button
              key={idx}
              className="w-16 h-16 text-2xl font-bold border-2 border-gray-400 bg-white hover:bg-gray-100 transition-colors rounded"
              onClick={() => handleClick(idx)}
              disabled={!!cell || !!winner}
            >
              {cell}
            </button>
          ))}
        </div>
        <div className="mb-2 text-lg min-h-[1.5em]">
          {winner && <span className="text-green-600 font-bold">Winner: {winner}</span>}
          {!winner && isDraw && <span className="text-yellow-600 font-bold">It's a draw!</span>}
          {!winner && !isDraw && <span>Next: {xIsNext ? "X" : "O"}</span>}
        </div>
        <button
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          onClick={handleReset}
        >
          Reset Game
        </button>
      </div>
    </div>
  );
};

export default AdminOnlyPage;
