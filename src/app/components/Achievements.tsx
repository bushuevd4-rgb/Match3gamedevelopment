import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Screen, PlayerProfile } from '../App';

interface Props {
  profile: PlayerProfile;
  navigate: (screen: Screen) => void;
  updateProfile: (u: Partial<PlayerProfile>) => void;
}

interface Achievement {
  id: string;
  name: string;
  desc: string;
  icon: string;
  category: 'mastery' | 'persistence' | 'style';
  hint?: string;
}

const ACHIEVEMENTS: Achievement[] = [
  // Mastery
  { id: 'combo10', name: 'Гроза комбо', desc: 'Сделай каскад 10 раз за игру', icon: '💥', category: 'mastery' },
  { id: 'all_types', name: 'Коллекционер', desc: 'Собери все 7 типов в одном ходу', icon: '🌈', category: 'mastery' },
  { id: 'score_10k', name: '10 000 очков', desc: 'Набери 10 000 очков за одну игру', icon: '⭐', category: 'mastery' },
  { id: 'cascade5', name: 'Цепная реакция', desc: 'Сделай каскад 5+ в одном ходу', icon: '🔗', category: 'mastery' },
  // Persistence
  { id: 'levels50', name: 'Железный игрок', desc: 'Пройди 50 уровней', icon: '🏅', category: 'persistence' },
  { id: 'days7', name: 'Неделя вместе', desc: 'Играй 7 дней подряд', icon: '📅', category: 'persistence' },
  { id: 'games100', name: 'Ветеран', desc: 'Сыграй 100 игр', icon: '🎖', category: 'persistence' },
  { id: 'levels10', name: 'Сладкоежка', desc: 'Пройди первые 10 уровней', icon: '🍬', category: 'persistence' },
  // Style
  { id: 'no_hints', name: 'Без единой ошибки', desc: 'Пройди уровень без неверных ходов', icon: '✨', category: 'style' },
  { id: 'bonus', name: 'Охотник за бонусами', desc: 'Собери 20 специальных плиток', icon: '🎁', category: 'style' },
  { id: 'shuffle', name: 'Мастер перемешивания', desc: 'Перемешай доску 5 раз', icon: '🔀', category: 'style' },
  { id: 'survival30', name: 'Выживший', desc: 'Продержись 30 ходов в режиме выживания', icon: '🏃', category: 'style' },
];

const CAT_LABELS: Record<string, string> = {
  mastery: '🎯 Мастерство',
  persistence: '💪 Упорство',
  style: '✨ Стиль',
};

export function Achievements({ profile, navigate, updateProfile }: Props) {
  const [selected, setSelected] = useState<Achievement | null>(null);
  const [activeTab, setActiveTab] = useState<'mastery' | 'persistence' | 'style'>('mastery');

  const unlocked = new Set(profile.achievements);
  const visibleAchs = ACHIEVEMENTS.filter(a => a.category === activeTab);
  const totalUnlocked = ACHIEVEMENTS.filter(a => unlocked.has(a.id)).length;

  const equipBadge = (name: string) => {
    updateProfile({ equippedBadge: profile.equippedBadge === name ? null : name });
    setSelected(null);
  };

  return (
    <div
      className="size-full flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #FFE4F3 0%, #EDD5FF 50%, #D5EEFF 100%)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-2 flex-shrink-0">
        <button
          onClick={() => navigate('menu')}
          className="rounded-xl bg-white/70 px-3 py-1 font-bold text-purple-600 shadow text-sm"
        >
          ←
        </button>
        <div>
          <h2 className="font-black text-purple-800 text-xl leading-tight">Достижения</h2>
          <p className="text-purple-400" style={{ fontSize: '0.75rem' }}>
            {totalUnlocked}/{ACHIEVEMENTS.length} получено
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-4 mb-3 flex-shrink-0">
        <div className="h-2.5 rounded-full bg-purple-100 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #FF6BAE, #7C3AED)' }}
            animate={{ width: `${(totalUnlocked / ACHIEVEMENTS.length) * 100}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Equipped badge */}
      {profile.equippedBadge && (
        <div
          className="mx-4 mb-3 rounded-2xl px-4 py-2 flex items-center gap-3 flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)', border: '2px solid #F59E0B' }}
        >
          <span className="text-2xl">🏅</span>
          <div>
            <p className="font-black text-amber-800" style={{ fontSize: '0.85rem' }}>Надетый значок</p>
            <p className="text-amber-600 font-bold" style={{ fontSize: '0.8rem' }}>{profile.equippedBadge}</p>
          </div>
          <button
            className="ml-auto text-amber-700 font-bold rounded-xl px-3 py-1"
            style={{ fontSize: '0.75rem', background: 'rgba(245,158,11,0.2)' }}
            onClick={() => updateProfile({ equippedBadge: null })}
          >
            Снять
          </button>
        </div>
      )}

      {/* Category tabs */}
      <div className="flex gap-2 px-4 mb-3 flex-shrink-0">
        {(['mastery', 'persistence', 'style'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex-1 rounded-xl py-1.5 font-bold transition-all"
            style={{
              fontSize: '0.68rem',
              background: activeTab === tab ? 'linear-gradient(135deg, #FF6BAE, #7C3AED)' : 'rgba(255,255,255,0.7)',
              color: activeTab === tab ? 'white' : '#7C3AED',
              boxShadow: activeTab === tab ? '0 3px 10px rgba(124,58,237,0.3)' : 'none',
            }}
          >
            {CAT_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <div className="grid grid-cols-2 gap-3">
          {visibleAchs.map((ach, i) => {
            const isUnlocked = unlocked.has(ach.id);
            const isEquipped = profile.equippedBadge === ach.name;
            return (
              <motion.button
                key={ach.id}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.05, type: 'spring', stiffness: 300 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setSelected(ach)}
                className="relative flex flex-col items-center rounded-2xl p-4 shadow text-center"
                style={{
                  background: isUnlocked
                    ? 'linear-gradient(135deg, rgba(255,107,174,0.15), rgba(124,58,237,0.15))'
                    : 'rgba(255,255,255,0.5)',
                  border: isEquipped
                    ? '3px solid #F59E0B'
                    : isUnlocked
                    ? '2px solid rgba(124,58,237,0.4)'
                    : '2px solid rgba(0,0,0,0.05)',
                  opacity: isUnlocked ? 1 : 0.5,
                }}
              >
                {isEquipped && (
                  <div
                    className="absolute -top-1.5 -right-1.5 text-xs font-black px-1.5 py-0.5 rounded-full"
                    style={{ background: '#F59E0B', color: 'white' }}
                  >
                    ✓
                  </div>
                )}
                <span style={{ fontSize: '2rem', filter: isUnlocked ? 'none' : 'grayscale(1)' }}>
                  {isUnlocked ? ach.icon : '🔒'}
                </span>
                <p className="font-black mt-1 text-purple-800" style={{ fontSize: '0.78rem', lineHeight: 1.3 }}>
                  {ach.name}
                </p>
                <p className="text-gray-500 mt-0.5" style={{ fontSize: '0.65rem', lineHeight: 1.3 }}>
                  {isUnlocked ? ach.desc : 'Заблокировано'}
                </p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Detail modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center p-6"
            style={{ background: 'rgba(0,0,0,0.45)', zIndex: 50 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 350 }}
              className="bg-white rounded-3xl p-6 shadow-2xl text-center max-w-xs w-full"
              onClick={e => e.stopPropagation()}
            >
              <div style={{ fontSize: '3rem' }}>
                {unlocked.has(selected.id) ? selected.icon : '🔒'}
              </div>
              <h3 className="font-black text-purple-800 mt-2" style={{ fontSize: '1.1rem' }}>{selected.name}</h3>
              <p className="text-gray-600 mt-1" style={{ fontSize: '0.82rem' }}>{selected.desc}</p>
              <p
                className="mt-2 rounded-xl px-3 py-1 font-bold text-xs"
                style={{
                  background: CAT_LABELS[selected.category].includes('Мастерство') ? '#FEE2E2' : CAT_LABELS[selected.category].includes('Упорство') ? '#D1FAE5' : '#EDE9FE',
                  color: '#7C3AED',
                  display: 'inline-block',
                }}
              >
                {CAT_LABELS[selected.category]}
              </p>
              <div className="flex gap-2 mt-4">
                {unlocked.has(selected.id) && (
                  <button
                    onClick={() => equipBadge(selected.name)}
                    className="flex-1 rounded-2xl py-2 font-bold text-sm text-white"
                    style={{
                      background: profile.equippedBadge === selected.name
                        ? '#9CA3AF'
                        : 'linear-gradient(135deg, #F59E0B, #D97706)',
                    }}
                  >
                    {profile.equippedBadge === selected.name ? 'Снять значок' : '🏅 Надеть значок'}
                  </button>
                )}
                <button
                  onClick={() => setSelected(null)}
                  className="flex-1 rounded-2xl py-2 font-bold text-sm text-purple-600"
                  style={{ background: '#F3E8FF' }}
                >
                  Закрыть
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
