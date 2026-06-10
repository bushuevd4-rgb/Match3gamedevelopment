import { useState, useCallback } from 'react';
import { MainMenu } from './components/MainMenu';
import { GameBoard } from './components/GameBoard';
import { LevelMap } from './components/LevelMap';
import { Leaderboard } from './components/Leaderboard';
import { Achievements } from './components/Achievements';
import { Settings } from './components/Settings';
import { ModeSelect } from './components/ModeSelect';

export type Screen = 'menu' | 'levelmap' | 'modeselect' | 'game' | 'leaderboard' | 'achievements' | 'settings';
export type GameMode = 'classic' | 'timeattack' | 'survival';

export interface PlayerProfile {
  name: string;
  currentLevel: number;
  totalScore: number;
  achievements: string[];
  equippedBadge: string | null;
  gamesPlayed: number;
  streakDays: number;
  soundEnabled: boolean;
  musicEnabled: boolean;
  language: string;
  bestScores: Record<string, number>;
}

const DEFAULT_PROFILE: PlayerProfile = {
  name: 'Игрок',
  currentLevel: 1,
  totalScore: 0,
  achievements: [],
  equippedBadge: null,
  gamesPlayed: 0,
  streakDays: 1,
  soundEnabled: true,
  musicEnabled: true,
  language: 'ru',
  bestScores: {},
};

function loadProfile(): PlayerProfile {
  try {
    const saved = localStorage.getItem('sladkiy_match3_profile');
    if (saved) return { ...DEFAULT_PROFILE, ...JSON.parse(saved) };
  } catch {}
  return DEFAULT_PROFILE;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [gameMode, setGameMode] = useState<GameMode>('classic');
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [profile, setProfile] = useState<PlayerProfile>(loadProfile);

  const navigate = useCallback((to: Screen) => setScreen(to), []);

  const startGame = useCallback((mode: GameMode, level?: number) => {
    setGameMode(mode);
    if (level !== undefined) setSelectedLevel(level);
    setScreen('game');
  }, []);

  const updateProfile = useCallback((updates: Partial<PlayerProfile>) => {
    setProfile(prev => {
      const next = { ...prev, ...updates };
      try { localStorage.setItem('sladkiy_match3_profile', JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  return (
    <div className="size-full overflow-hidden" style={{ fontFamily: "'Nunito', sans-serif" }}>
      {screen === 'menu' && (
        <MainMenu profile={profile} navigate={navigate} startGame={startGame} />
      )}
      {screen === 'levelmap' && (
        <LevelMap profile={profile} navigate={navigate} startGame={startGame} />
      )}
      {screen === 'modeselect' && (
        <ModeSelect navigate={navigate} startGame={startGame} />
      )}
      {screen === 'game' && (
        <GameBoard
          profile={profile}
          mode={gameMode}
          level={selectedLevel}
          navigate={navigate}
          updateProfile={updateProfile}
        />
      )}
      {screen === 'leaderboard' && (
        <Leaderboard profile={profile} navigate={navigate} />
      )}
      {screen === 'achievements' && (
        <Achievements profile={profile} navigate={navigate} updateProfile={updateProfile} />
      )}
      {screen === 'settings' && (
        <Settings profile={profile} navigate={navigate} updateProfile={updateProfile} />
      )}
    </div>
  );
}
