import React from 'react';

interface MusicPlayerProps {
  currentTrackId: string | null;
  handleStart: () => void;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ currentTrackId, handleStart }) => {
  return (
    <div className="w-full p-4">
      {currentTrackId ? (
        <div className="flex flex-col items-center">
          <h2 className="text-2xl mb-4 text-center text-white font-semibold">Écoutez la musique</h2>
          <div className="w-full max-w-md">
            <div className="aspect-w-16 aspect-h-9 w-full">
              <iframe
                src={`https://open.spotify.com/embed/track/${currentTrackId}`}
                width="100%"
                height="380"
                frameBorder="0"
                allow="encrypted-media"
                className="rounded-lg shadow-lg w-full h-[380px]"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-center">
          <button 
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-full font-semibold text-lg transform hover:scale-105 transition-all duration-300 shadow-lg"
            onClick={handleStart}
          >
            Démarrer le blind test
          </button>
        </div>
      )}
    </div>
  );
};

export default MusicPlayer;