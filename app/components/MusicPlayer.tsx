import React from 'react';

interface MusicPlayerProps {
  currentTrackId: string | null;
  handleStart: () => void;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ currentTrackId, handleStart }) => {
  return (
    <div className="w-1/2 p-4">
      {currentTrackId ? (
        <>
          <h2 className="text-2xl mb-4">Écoutez la musique</h2>
          <iframe
            src={`https://open.spotify.com/embed/track/${currentTrackId}`}
            width="100%"
            height="380"
            frameBorder="0"
            allow="encrypted-media"
            className="mb-4"
          ></iframe>
        </>
      ) : (
        <button 
          className="bg-blue-500 text-white px-4 py-2 rounded-lg"
          onClick={handleStart}
        >
          Démarrer le blind test
        </button>
      )}
    </div>
  );
};

export default MusicPlayer;