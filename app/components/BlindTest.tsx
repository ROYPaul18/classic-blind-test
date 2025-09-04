'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import SpotifyWebApi from 'spotify-web-api-node';
import { TrackObjectSimplified } from 'spotify-web-api-node';
import { Music, Lightbulb, Trophy, X, Sparkles, Clock } from 'lucide-react';

import MusicPlayer from './MusicPlayer';
import ComposerGuess from './ComposerGuess';

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
  const [score, setScore] = useState(0);

  const [hints, setHints] = useState({
    birth: false,
    death: false,
    style: false,
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
      setScore(prev => prev + 1);
    } else {
      setErrors((prevErrors) => prevErrors + 1);
      setShowModalError(true);
      revealHint();

      if (errors + 1 >= 4) {
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
    if (showModalSuccess && isCorrect) {
      handleStart();
    }
  };

  const getHintIcon = (hintType: string) => {
    switch (hintType) {
      case 'birth': return <Clock className="w-4 h-4" />;
      case 'death': return <Clock className="w-4 h-4" />;
      case 'style': return <Sparkles className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getHintText = (hintType: string) => {
    if (!composerInfo) return '';
    switch (hintType) {
      case 'birth': return `Né en ${composerInfo.birth}`;
      case 'death': return `Mort en ${composerInfo.death}`;
      case 'style': return `Époque ${composerInfo.epoch}`;
      default: return '';
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 text-center max-w-md mx-4 border border-white/20">
          <div className="mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Music className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Test Musical Classique</h1>
            <p className="text-white/70 text-lg">Découvrez les grands maîtres de la musique classique</p>
          </div>
          <button 
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-4 rounded-full text-lg font-semibold transform hover:scale-105 transition-all duration-300 shadow-lg"
            onClick={() => signIn('spotify')}
          >
            Se connecter avec Spotify
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 pt-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
              <Music className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">Test Musical Classique</h1>
          </div>
          
          {/* Score */}
          <div className="flex items-center justify-center gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-full px-6 py-3 border border-white/20">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span className="text-white font-semibold">Score: {score}</span>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-full px-6 py-3 border border-white/20">
              <span className="text-white font-semibold">Erreurs: {errors}/3</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          
          {/* Music Player Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Lecteur Audio</h2>
            
            <div className="text-center">
              <MusicPlayer currentTrackId={currentTrack?.id || null} handleStart={handleStart} />
            </div>
          </div>

          {/* Guess Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Votre Réponse</h2>
            
            {isCorrect ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-green-400 mb-4">Bravo !</h3>
                <p className="text-white/70 mb-6">Vous avez trouvé la bonne réponse</p>
                <button
                  onClick={handleStart}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-3 rounded-full font-semibold transform hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  Nouveau Morceau
                </button>
              </div>
            ) : (
              <ComposerGuess
                guess={guess}
                setGuess={setGuess}
                handleGuess={handleGuess}
                isCorrect={isCorrect}
                handleStart={handleStart}
              />
            )}
          </div>

          {/* Hints Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Indices</h2>
            
            <div className="space-y-4">
              {Object.entries(hints).map(([hintType, revealed]) => (
                <div
                  key={hintType}
                  className={`p-4 rounded-xl border transition-all duration-300 ${
                    revealed 
                      ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30 text-white' 
                      : 'bg-white/5 border-white/10 text-white/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {getHintIcon(hintType)}
                    <span className="font-medium">
                      {revealed ? getHintText(hintType) : 'Indice verrouillé'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
              <div className="flex items-center gap-2 text-blue-300">
                <Lightbulb className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Les indices se débloquent après chaque erreur
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showModalError && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full border border-white/20 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Mauvaise réponse !</h3>
              <p className="text-white/70 mb-6">
                Vous avez fait {errors} erreur{errors > 1 ? 's' : ''}. Maximum : 3.
              </p>
              <button
                onClick={closeModal}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-3 rounded-full font-semibold transform hover:scale-105 transition-all duration-300 shadow-lg"
              >
                Continuer
              </button>
            </div>
          </div>
        </div>
      )}

      {showModalSuccess && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full border border-white/20 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Bravo !</h3>
              <p className="text-white/70 mb-6">
                Vous avez trouvé la bonne réponse. Bien joué !
              </p>
              <button
                onClick={closeModal}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-3 rounded-full font-semibant transform hover:scale-105 transition-all duration-300 shadow-lg"
              >
                Continuer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlindTest;