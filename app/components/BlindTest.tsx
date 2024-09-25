'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import SpotifyWebApi from 'spotify-web-api-node';
import { TrackObjectSimplified } from 'spotify-web-api-node';

import MusicPlayer from './MusicPlayer';
import ComposerGuess from './ComposerGuess';
import HintSection from './HintSection';
import Modal from './Modal';

const spotifyApi = new SpotifyWebApi();

interface ComposerInfo {
  id: number;
  name: string;
  birth: string;
  death: string;
  epoch: string;
}

const BlindTest = () => {
  const { data: session } = useSession();
  const [tracks, setTracks] = useState<TrackObjectSimplified[]>([]);
  const [currentTrack, setCurrentTrack] = useState<TrackObjectSimplified | null>(null);
  const [composerInfo, setComposerInfo] = useState<ComposerInfo | null>(null);
  const [composers, setComposers] = useState<ComposerInfo[]>([]);
  const [guess, setGuess] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);

  const [hints, setHints] = useState({
    birth: false,
    death: false,
    style: false,
    portrait: false,
  });

  const [errors, setErrors] = useState(0);
  const [showModalError, setShowModalError] = useState(false);
  const [showModalSuccess, setShowModalSuccess] = useState(false);

  useEffect(() => {
    const fetchComposersFromOpenOpus = async () => {
      try {
        const response = await fetch('https://api.openopus.org/composer/list/pop.json');
        const data = await response.json();
        setComposers(data.composers);
      } catch (error) {
        console.error("Erreur lors de la récupération des compositeurs : ", error);
      }
    };

    fetchComposersFromOpenOpus();
  }, []);

  useEffect(() => {
    if (session?.accessToken) {
      spotifyApi.setAccessToken(session.accessToken as string);

      const fetchClassicalMusic = async () => {
        try {
          const response = await spotifyApi.searchTracks('genre:classical', { limit: 50 });
          
          const filteredTracks = response.body.tracks.items.filter((track) =>
            composers.some((composer) =>
              track.artists.some((artist) => artist.name.toLowerCase().includes(composer.name.toLowerCase()))
            )
          );
          setTracks(filteredTracks);
        } catch (error) {
          const err = error as { statusCode?: number; message?: string };
          console.error("Erreur lors de la récupération des morceaux Spotify :", err.message || error);

          if (err.statusCode === 401) {
            signIn('spotify');
          }
        }
      };

      fetchClassicalMusic();
    } else if (session?.error === 'RefreshAccessTokenError') {
      signIn();
    }
  }, [session, composers]);

  const handleStart = async () => {
    if (tracks.length > 0) {
      const randomTrack = tracks[Math.floor(Math.random() * tracks.length)];
      setCurrentTrack(randomTrack);

      const composer = composers.find((composer) =>
        randomTrack.artists.some((artist) => artist.name.toLowerCase().includes(composer.name.toLowerCase()))
      );

      if (composer) {
        setComposerInfo(composer);
        setCorrectAnswer(composer.name);
        setIsCorrect(false);
        setHints({
          birth: false,
          death: false,
          style: false,
          portrait: false,
        });
        setErrors(0); 
      }
    } else {
      console.warn('No tracks available to start the blind test.');
    }
  };

  const handleGuess = () => {
    if (guess.trim().toLowerCase() === correctAnswer.toLowerCase()) {
      setIsCorrect(true);
      setShowModalSuccess(true);
    } else {
      setErrors((prevErrors) => prevErrors + 1);
      setShowModalError(true);
      revealHint();

      if (errors + 1 >= 3) {
        setTimeout(() => {
          alert(`Désolé, vous avez atteint 3 erreurs. La bonne réponse était ${correctAnswer}.`);
          setIsCorrect(false);
          handleStart();
        }, 2000);
      }
    }
    setGuess('');
  };

  const revealHint = () => {
    const availableHints = Object.keys(hints).filter((key) => !hints[key as keyof typeof hints]);
    if (availableHints.length > 0) {
      const randomHint = availableHints[Math.floor(Math.random() * availableHints.length)];
      setHints((prevHints) => ({
        ...prevHints,
        [randomHint]: true,
      }));
    }
  };

  const closeModal = () => {
    setShowModalError(false);
    setShowModalSuccess(false);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center text-center">
      {!session && (
        <button 
          className="bg-blue-500 text-white px-4 py-2 rounded-lg"
          onClick={() => signIn('spotify')}
        >
          Se connecter avec Spotify
        </button>
      )}
      {session && (
        <>
          <div className="flex justify-center items-start w-full">
            <MusicPlayer currentTrackId={currentTrack?.id || null} handleStart={handleStart} />
            <ComposerGuess
              guess={guess}
              setGuess={setGuess}
              handleGuess={handleGuess}
              isCorrect={isCorrect}
              handleStart={handleStart}
            />
            <HintSection
              hints={hints}
              composerInfo={composerInfo || {}}
            />
          </div>
        </>
      )}

      {showModalError && (
        <Modal
          title="Mauvaise réponse !"
          message={`Vous avez fait ${errors} erreur${errors > 1 ? 's' : ''}. Maximum : 3.`}
          buttonLabel="Continuer"
          onClose={closeModal}
        />
      )}

      {showModalSuccess && (
        <Modal
          title="Bravo !"
          message="Vous avez trouvé la bonne réponse."
          buttonLabel="Continuer"
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default BlindTest;