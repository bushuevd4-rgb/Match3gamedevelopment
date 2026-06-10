import { motion } from 'motion/react';
import { Screen, GameMode } from '../App';

interface Props {
  navigate: (screen: Screen) => void;
  startGame: (mode: GameMode, level?: number) => void;
}

const MODES = [
  {
    id: 'classic' as GameMode,
    name: 'Классика',
    emoji: '🎯',
    desc: 'Набери нужное количество очков за ограниченное число ходов. Думай на шаг вперёд!',
    gradient: 'linear-gradient(135deg, #FF6BAE, #FF3C83)',
    shadow: 'rgba(255,60,131,0.35)',
    detail: '35 ходов • Постепенная сложность',
  },
  {
    id: 'timeattack' as GameMode,
    name: 'Гонка со временем',
    emoji: '⏱',
    desc: 'У тебя 3 минуты — набери как можно больше очков! Скорость решает всё!',
    gradient: 'linear-gradient(135deg, #FBBF24, #F59E0B)',
    shadow: 'rgba(245,158,11,0.35)',
    detail: '3 минуты • Без ограничения ходов',
  },
  {
    id: 'survival' as GameMode,
    name: 'Выживание',
    emoji: '🏃',
    desc: 'Доска постепенно заполняется новыми рядами снизу. Держись как можно дольше!',
    gradient: 'linear-gradient(135deg, #34D399, #059669)',
    shadow: 'rgba(5,150,105,0.35)',
    detail: 'Бесконечно • Новый ряд каждые 8 ходов',
  },
];

export function ModeSelect({ navigate, startGame }: Props) {
  return (
    <div
      className="size-full flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #FFE4F3 0%, #EDD5FF 50%, #D5EEFF 100%)' }}
    >
      <div className="flex items-center gap-3 px-4 pt-5 pb-3 flex-shrink-0">
        <button
          onClick={() => navigate('menu')}
          className="rounded-xl bg-white/70 px-3 py-1 font-bold text-purple-600 shadow text-sm"
        >
          ←
        </button>
        <h2 className="font-black text-purple-800 text-xl">Режимы игры</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6 flex flex-col gap-4">
        {MODES.map((mode, i) => (
          <motion.div
            key={mode.id}
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.1, type: 'spring', stiffness: 280 }}
            className="rounded-3xl overflow-hidden shadow-xl"
            style={{ boxShadow: `0 8px 30px ${mode.shadow}` }}
          >
            <div style={{ background: mode.gradient, padding: '20px 20px 16px' }}>
              <div className="flex items-center gap-3 mb-2">
                <span style={{ fontSize: '2.2rem' }}>{mode.emoji}</span>
                <div>
                  <h3 className="font-black text-white" style={{ fontSize: '1.15rem' }}>{mode.name}</h3>
                  <p className="text-white/75" style={{ fontSize: '0.72rem' }}>{mode.detail}</p>
                </div>
              </div>
              <p className="text-white/90" style={{ fontSize: '0.82rem', lineHeight: 1.45 }}>{mode.desc}</p>
            </div>

            <div className="bg-white px-4 py-3 flex justify-end">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => startGame(mode.id, mode.id === 'classic' ? 1 : undefined)}
                className="rounded-2xl px-5 py-2 font-black text-white shadow-lg"
                style={{
                  background: mode.gradient,
                  boxShadow: `0 4px 0 ${mode.shadow}, 0 4px 12px ${mode.shadow}`,
                  fontSize: '0.9rem',
                }}
              >
                ▶ Начать
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
