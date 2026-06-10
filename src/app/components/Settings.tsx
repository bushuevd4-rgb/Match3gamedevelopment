import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Screen, PlayerProfile } from '../App';

interface Props {
  profile: PlayerProfile;
  navigate: (screen: Screen) => void;
  updateProfile: (u: Partial<PlayerProfile>) => void;
}

export function Settings({ profile, navigate, updateProfile }: Props) {
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile.name);
  const [showReset, setShowReset] = useState(false);

  const saveName = () => {
    const trimmed = nameInput.trim();
    if (trimmed) updateProfile({ name: trimmed });
    setEditingName(false);
  };

  const resetProgress = () => {
    updateProfile({
      currentLevel: 1,
      totalScore: 0,
      achievements: [],
      equippedBadge: null,
      gamesPlayed: 0,
      streakDays: 1,
      bestScores: {},
    });
    setShowReset(false);
    navigate('menu');
  };

  return (
    <div
      className="size-full flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #FFE4F3 0%, #EDD5FF 50%, #D5EEFF 100%)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-3 flex-shrink-0">
        <button
          onClick={() => navigate('menu')}
          className="rounded-xl bg-white/70 px-3 py-1 font-bold text-purple-600 shadow text-sm"
        >
          ←
        </button>
        <h2 className="font-black text-purple-800 text-xl">Настройки</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-8 flex flex-col gap-4">
        {/* Profile */}
        <Section title="👤 Профиль">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #FF6BAE, #7C3AED)' }}
            >
              🍭
            </div>
            <div className="flex-1 min-w-0">
              {editingName ? (
                <div className="flex gap-2">
                  <input
                    autoFocus
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false); }}
                    maxLength={20}
                    className="flex-1 rounded-xl px-3 py-1.5 font-bold text-purple-800 border-2 border-purple-300 outline-none"
                    style={{ background: '#F3E8FF', fontSize: '0.9rem' }}
                  />
                  <button
                    onClick={saveName}
                    className="rounded-xl px-3 py-1.5 font-bold text-white text-sm"
                    style={{ background: 'linear-gradient(135deg, #FF6BAE, #7C3AED)' }}
                  >
                    ✓
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="font-black text-purple-800 truncate" style={{ fontSize: '1rem' }}>{profile.name}</p>
                  <button
                    onClick={() => { setNameInput(profile.name); setEditingName(true); }}
                    className="text-purple-400 hover:text-purple-600 text-sm"
                  >
                    ✏️
                  </button>
                </div>
              )}
              <p className="text-purple-500 text-xs">Уровень {profile.currentLevel} • {profile.totalScore.toLocaleString('ru')} очков</p>
            </div>
          </div>
        </Section>

        {/* Sound */}
        <Section title="🔊 Звук и музыка">
          <ToggleRow
            label="Звуковые эффекты"
            value={profile.soundEnabled}
            onChange={v => updateProfile({ soundEnabled: v })}
            icon="🔊"
          />
          <div className="my-2 border-t border-purple-100" />
          <ToggleRow
            label="Фоновая музыка"
            value={profile.musicEnabled}
            onChange={v => updateProfile({ musicEnabled: v })}
            icon="🎵"
          />
        </Section>

        {/* Language */}
        <Section title="🌍 Язык">
          <div className="flex gap-2">
            {['ru', 'en'].map(lang => (
              <button
                key={lang}
                className="flex-1 rounded-xl py-2 font-bold"
                style={{
                  fontSize: '0.85rem',
                  background: profile.language === lang
                    ? 'linear-gradient(135deg, #FF6BAE, #7C3AED)'
                    : 'rgba(124,58,237,0.1)',
                  color: profile.language === lang ? 'white' : '#7C3AED',
                }}
                onClick={() => updateProfile({ language: lang })}
              >
                {lang === 'ru' ? '🇷🇺 Русский' : '🇬🇧 English'}
              </button>
            ))}
          </div>
        </Section>

        {/* Stats */}
        <Section title="📊 Статистика">
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Игр сыграно', value: profile.gamesPlayed, icon: '🎮' },
              { label: 'Дней подряд', value: profile.streakDays, icon: '🔥' },
              { label: 'Макс. очков', value: Math.max(...Object.values(profile.bestScores), 0).toLocaleString('ru'), icon: '⭐' },
              { label: 'Достижений', value: profile.achievements.length, icon: '🏆' },
            ].map(item => (
              <div
                key={item.label}
                className="rounded-2xl px-3 py-3 text-center"
                style={{ background: 'rgba(124,58,237,0.08)' }}
              >
                <p style={{ fontSize: '1.4rem' }}>{item.icon}</p>
                <p className="font-black text-purple-800" style={{ fontSize: '0.9rem' }}>{item.value}</p>
                <p className="text-purple-500" style={{ fontSize: '0.65rem' }}>{item.label}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Save */}
        <Section title="💾 Сохранение">
          <p className="text-purple-500 text-xs mb-3">
            Игра автоматически сохраняется после каждого уровня. Прогресс хранится на этом устройстве.
          </p>
          <button
            onClick={() => setShowReset(true)}
            className="w-full rounded-2xl py-3 font-bold text-red-600"
            style={{ background: '#FEE2E2', fontSize: '0.9rem' }}
          >
            🗑️ Сбросить прогресс
          </button>
        </Section>

        <div className="text-center text-purple-300" style={{ fontSize: '0.7rem' }}>
          Сладкий Матч v1.0 • Яблочко & Кепа Мита ❤️
        </div>
      </div>

      {/* Reset confirm modal */}
      <AnimatePresence>
        {showReset && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center p-6"
            style={{ background: 'rgba(0,0,0,0.5)', zIndex: 50 }}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 350 }}
              className="bg-white rounded-3xl p-6 shadow-2xl text-center max-w-xs w-full"
            >
              <div className="text-4xl mb-3">⚠️</div>
              <h3 className="font-black text-red-600 mb-2" style={{ fontSize: '1.1rem' }}>Сбросить прогресс?</h3>
              <p className="text-gray-500 mb-5" style={{ fontSize: '0.82rem' }}>
                Все уровни, очки и достижения будут удалены. Это действие нельзя отменить!
              </p>
              <div className="flex gap-3">
                <button
                  onClick={resetProgress}
                  className="flex-1 rounded-2xl py-2 font-bold text-white text-sm"
                  style={{ background: '#DC2626' }}
                >
                  Да, сбросить
                </button>
                <button
                  onClick={() => setShowReset(false)}
                  className="flex-1 rounded-2xl py-2 font-bold text-sm text-purple-600"
                  style={{ background: '#F3E8FF' }}
                >
                  Отмена
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="rounded-3xl overflow-hidden shadow"
      style={{ background: 'rgba(255,255,255,0.75)' }}
    >
      <div className="px-4 pt-4 pb-1">
        <p className="font-black text-purple-700 mb-3" style={{ fontSize: '0.9rem' }}>{title}</p>
        {children}
      </div>
      <div className="h-4" />
    </motion.div>
  );
}

function ToggleRow({
  label, value, onChange, icon,
}: {
  label: string; value: boolean; onChange: (v: boolean) => void; icon: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span>{icon}</span>
        <p className="font-bold text-gray-700" style={{ fontSize: '0.88rem' }}>{label}</p>
      </div>
      <motion.button
        onClick={() => onChange(!value)}
        animate={{ background: value ? 'linear-gradient(135deg, #FF6BAE, #7C3AED)' : '#E5E7EB' }}
        transition={{ duration: 0.2 }}
        className="relative rounded-full flex-shrink-0"
        style={{ width: 44, height: 24 }}
      >
        <motion.div
          animate={{ x: value ? 20 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow"
        />
      </motion.button>
    </div>
  );
}
