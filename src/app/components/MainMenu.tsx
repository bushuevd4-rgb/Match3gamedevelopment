import { motion } from 'motion/react';
import { PlayerProfile, Screen, GameMode } from '../App';
import { ImageWithFallback } from './figma/ImageWithFallback';
import yablochkoImg from '../../imports/yablo_chkoo.png';
import kepaMitaImg from '../../imports/KEPA_MITA.png';

interface Props {
  profile: PlayerProfile;
  navigate: (screen: Screen) => void;
  startGame: (mode: GameMode, level?: number) => void;
}

const FLOAT_EMOJIS = ['🍎', '🎂', '🍩', '⭐', '🍦', '🍬', '🍭', '🍎', '🎂', '🍩', '⭐', '🍦'];

export function MainMenu({ profile, navigate, startGame: _startGame }: Props) {
  return (
    <div
      className="size-full flex flex-col items-center justify-start overflow-y-auto relative"
      style={{ background: 'linear-gradient(160deg, #FFE4F3 0%, #EDD5FF 45%, #D5EEFF 100%)' }}
    >
      {/* Floating bg icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {FLOAT_EMOJIS.map((e, i) => (
          <span
            key={i}
            className="absolute select-none"
            style={{
              left: `${(i * 8.3) % 100}%`,
              top: `${(i * 13.7) % 100}%`,
              fontSize: `${1.2 + (i % 3) * 0.4}rem`,
              opacity: 0.15,
              animation: `menuFloat ${4 + (i % 4)}s ease-in-out infinite alternate`,
              animationDelay: `${i * 0.4}s`,
            }}
          >
            {e}
          </span>
        ))}
      </div>

      {/* Characters at bottom */}
      <div className="absolute bottom-0 left-0 pointer-events-none hidden md:block">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        >
          <ImageWithFallback
            src={yablochkoImg}
            alt="Яблочко"
            className="w-32 opacity-80"
          />
        </motion.div>
      </div>
      <div className="absolute bottom-0 right-0 pointer-events-none hidden md:block">
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut', delay: 0.5 }}
        >
          <ImageWithFallback
            src={kepaMitaImg}
            alt="Кепа Мита"
            className="w-28 opacity-80"
          />
        </motion.div>
      </div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-sm px-5 py-8">
        {/* Title */}
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', duration: 0.8 }}
          className="text-center mb-2"
        >
          <div className="text-5xl mb-1">🍭</div>
          <h1
            className="text-4xl font-black leading-tight"
            style={{
              color: '#7C3AED',
              textShadow: '0 2px 0 #fff, 0 4px 12px rgba(124,58,237,0.3)',
            }}
          >
            Сладкий Матч
          </h1>
          <p className="text-purple-400 mt-1" style={{ fontSize: '0.9rem' }}>
            с Яблочком и Кепа Митой
          </p>
        </motion.div>

        {/* Player badge */}
        {profile.totalScore > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white/70 backdrop-blur rounded-2xl px-5 py-2 mb-5 text-center shadow"
          >
            <p className="text-purple-700 font-bold">👤 {profile.name}</p>
            <p className="text-pink-500" style={{ fontSize: '0.85rem' }}>
              Уровень {profile.currentLevel} • {profile.totalScore.toLocaleString('ru')} очков
            </p>
            {profile.equippedBadge && (
              <p className="text-amber-500" style={{ fontSize: '0.8rem' }}>🏅 {profile.equippedBadge}</p>
            )}
          </motion.div>
        )}

        {/* Buttons */}
        <div className="flex flex-col gap-3 w-full mt-2">
          <MenuBtn
            onClick={() => navigate('levelmap')}
            gradient="linear-gradient(135deg, #FF6BAE, #FF3C83)"
            delay={0.1}
            big
          >
            ✦ НАЧАТЬ / ПРОДОЛЖИТЬ
          </MenuBtn>

          <MenuBtn
            onClick={() => navigate('modeselect')}
            gradient="linear-gradient(135deg, #A78BFA, #7C3AED)"
            delay={0.15}
          >
            🎮 РЕЖИМЫ ИГРЫ
          </MenuBtn>

          <MenuBtn
            onClick={() => navigate('leaderboard')}
            gradient="linear-gradient(135deg, #FBBF24, #F59E0B)"
            delay={0.2}
          >
            👑 ТАБЛИЦА ЛИДЕРОВ
          </MenuBtn>

          <MenuBtn
            onClick={() => navigate('achievements')}
            gradient="linear-gradient(135deg, #34D399, #059669)"
            delay={0.25}
          >
            🏆 ДОСТИЖЕНИЯ И ЗНАЧКИ
          </MenuBtn>

          <MenuBtn
            onClick={() => navigate('settings')}
            gradient="linear-gradient(135deg, #60A5FA, #3B82F6)"
            delay={0.3}
          >
            ⚙️ НАСТРОЙКИ
          </MenuBtn>
        </div>

        <p className="mt-6 text-purple-300" style={{ fontSize: '0.75rem' }}>
          Автосохранение включено
        </p>
      </div>

      <style>{`
        @keyframes menuFloat {
          from { transform: translateY(0) rotate(-5deg); }
          to   { transform: translateY(-18px) rotate(5deg); }
        }
      `}</style>
    </div>
  );
}

function MenuBtn({
  children, onClick, gradient, delay = 0, big = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  gradient: string;
  delay?: number;
  big?: boolean;
}) {
  return (
    <motion.button
      initial={{ x: -30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay, type: 'spring', stiffness: 300 }}
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="w-full rounded-2xl text-white font-bold shadow-lg border-0"
      style={{
        background: gradient,
        padding: big ? '14px 20px' : '11px 20px',
        fontSize: big ? '1.1rem' : '0.95rem',
        boxShadow: '0 4px 0 rgba(0,0,0,0.15), 0 6px 20px rgba(0,0,0,0.1)',
        textShadow: '0 1px 3px rgba(0,0,0,0.25)',
      }}
    >
      {children}
    </motion.button>
  );
}
