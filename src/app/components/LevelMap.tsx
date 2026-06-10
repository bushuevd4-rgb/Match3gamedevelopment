import { motion } from 'motion/react';
import { Screen, GameMode, PlayerProfile } from '../App';

interface Props {
  profile: PlayerProfile;
  navigate: (screen: Screen) => void;
  startGame: (mode: GameMode, level?: number) => void;
}

const TOTAL_LEVELS = 30;

const WORLD_THEMES = [
  { name: 'Яблоневый сад', emoji: '🍎', color: '#FFB3C6', from: 1, to: 10 },
  { name: 'Кондитерская', emoji: '🎂', color: '#DDB5FF', from: 11, to: 20 },
  { name: 'Сладкое королевство', emoji: '👑', color: '#FFF3A3', from: 21, to: 30 },
];

function getLevelGoal(level: number) {
  return 1500 + (Math.min(level - 1, 19)) * 500;
}

function getLevelMoves(level: number) {
  return Math.max(15, 35 - Math.min(level - 1, 19));
}

export function LevelMap({ profile, navigate, startGame }: Props) {
  const unlockedLevel = profile.currentLevel;

  return (
    <div
      className="size-full flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #FFE4F3 0%, #EDD5FF 50%, #D5EEFF 100%)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2 flex-shrink-0">
        <button
          onClick={() => navigate('menu')}
          className="rounded-xl bg-white/70 px-3 py-1 font-bold text-purple-600 shadow text-sm"
        >
          ←
        </button>
        <h2 className="font-black text-purple-800 text-xl">Карта уровней</h2>
        <div className="ml-auto flex items-center gap-1 bg-white/70 rounded-xl px-3 py-1 shadow">
          <span className="text-yellow-500 font-bold text-sm">⭐ {profile.totalScore.toLocaleString('ru')}</span>
        </div>
      </div>

      {/* Levels scroll area */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        {WORLD_THEMES.map(world => (
          <div key={world.name} className="mb-6">
            {/* World header */}
            <div
              className="flex items-center gap-2 rounded-2xl px-4 py-2 mb-3 shadow"
              style={{ background: world.color, opacity: world.from > unlockedLevel ? 0.5 : 1 }}
            >
              <span className="text-2xl">{world.emoji}</span>
              <h3 className="font-black text-purple-900" style={{ fontSize: '0.95rem' }}>{world.name}</h3>
              <span className="ml-auto text-purple-700 font-bold text-xs">
                Ур. {world.from}–{world.to}
              </span>
            </div>

            {/* Level grid */}
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: world.to - world.from + 1 }, (_, i) => {
                const lvl = world.from + i;
                const locked = lvl > unlockedLevel;
                const completed = lvl < unlockedLevel;
                const current = lvl === unlockedLevel;

                return (
                  <motion.button
                    key={lvl}
                    whileHover={!locked ? { scale: 1.1, y: -3 } : {}}
                    whileTap={!locked ? { scale: 0.92 } : {}}
                    onClick={() => !locked && startGame('classic', lvl)}
                    disabled={locked}
                    className="flex flex-col items-center justify-center rounded-2xl py-2 font-bold shadow"
                    style={{
                      background: locked
                        ? '#E5E7EB'
                        : completed
                        ? 'linear-gradient(135deg, #34D399, #059669)'
                        : current
                        ? 'linear-gradient(135deg, #FF6BAE, #7C3AED)'
                        : 'linear-gradient(135deg, #F9A8D4, #DDD6FE)',
                      color: locked ? '#9CA3AF' : 'white',
                      boxShadow: current
                        ? '0 4px 0 rgba(124,58,237,0.4), 0 0 20px rgba(255,107,174,0.5)'
                        : locked
                        ? 'none'
                        : '0 4px 0 rgba(0,0,0,0.15)',
                      border: current ? '3px solid white' : 'none',
                    }}
                  >
                    <span style={{ fontSize: '1.1rem' }}>
                      {locked ? '🔒' : completed ? '✓' : current ? '▶' : lvl}
                    </span>
                    <span style={{ fontSize: '0.65rem', marginTop: 1 }}>
                      {locked ? '' : `Ур.${lvl}`}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Level detail tooltip for current level */}
      <div
        className="flex-shrink-0 mx-4 mb-4 rounded-2xl px-4 py-3 flex items-center justify-between shadow-lg"
        style={{ background: 'linear-gradient(135deg, #FF6BAE, #7C3AED)', color: 'white' }}
      >
        <div>
          <p className="font-black" style={{ fontSize: '0.95rem' }}>Уровень {unlockedLevel}</p>
          <p style={{ fontSize: '0.75rem', opacity: 0.85 }}>
            Цель: {getLevelGoal(unlockedLevel).toLocaleString('ru')} очков • {getLevelMoves(unlockedLevel)} ходов
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => startGame('classic', unlockedLevel)}
          className="rounded-xl px-4 py-2 font-black text-purple-700 shadow"
          style={{ background: 'white', fontSize: '0.9rem' }}
        >
          ▶ Играть
        </motion.button>
      </div>
    </div>
  );
}
