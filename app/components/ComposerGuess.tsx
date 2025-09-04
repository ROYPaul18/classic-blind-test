import React from 'react';

interface ComposerGuessProps {
  guess: string;
  setGuess: (value: string) => void;
  handleGuess: () => void;
  isCorrect: boolean;
  handleStart: () => void;
}

const ComposerGuess: React.FC<ComposerGuessProps> = ({
  guess,
  setGuess,
  handleGuess,
  isCorrect,
  handleStart
}) => {
  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4 text-white">Devinez le compositeur</h2>
      <input
        className="border px-4 py-2 mb-4 w-full"
        type="text"
        value={guess}
        onChange={(e) => setGuess(e.target.value)}
        placeholder="Votre réponse..."
      />
      <button
        className="bg-green-500 text-white px-4 py-2 rounded-lg mb-4"
        onClick={handleGuess}
      >
        Valider la réponse
      </button>

      {isCorrect && (
        <div>
          <button
            className="bg-black text-white px-4 py-2 rounded-lg"
            onClick={handleStart}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>

          </button>
        </div>
      )}
    </div>
  );
};

export default ComposerGuess;
