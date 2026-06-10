import { useState } from 'react';
import { motion } from 'motion/react';
import { Screen, PlayerProfile } from '../App';

interface Props {
  profile: PlayerProfile;
  navigate: (screen: Screen) => void;
}

type Filter = 'alltime' | 'week' | 'friends';

const ALL_TIME: LeaderEntry[] = [
  { rank: 1, name: 'Королева_Матч3', score: 125430, country: '🇷🇺', badge: 'Гроза комбо', avatar: '👸' },
  { rank: 2, name: 'Василиса_999', score: 98750, country: '🇷🇺', badge: 'Сладкоежка', avatar: '🦊' },
  { rank: 3, name: 'КотофейМур', score: 87420, country: '🇺🇦', badge: 'Мастер перемешивания', avatar: '🐱' },
  { rank: 4, name: 'ИгрокПро_2026', score: 76300, country: '🇷🇺', badge: null, avatar: '🎮' },
  { rank: 5, name: 'Сладкоежка88', score: 65200, country: '🇧🇾', badge: 'Без единой ошибки', avatar: '🍭' },
  { rank: 6, name: 'Звёздочка_RU', score: 54100, country: '🇷🇺', badge: null, avatar: '⭐' },
  { rank: 7, name: 'МатчКинг', score: 43500, country: '🇰🇿', badge: 'Гроза комбо', avatar: '👑' },
  { rank: 8, name: 'Яблочная_11', score: 32800, country: '🇷🇺', badge: 'Сладкоежка', avatar: '🍎' },
  { rank: 9, name: 'ТурбоКомбо', score: 25600, country: '🇷🇺', badge: null, avatar: '💥' },
  { rank: 10, name: 'НовичокPRO', score: 18200, country: '🇷🇺', badge: null, avatar: '🌟' },
];

const WEEK_DATA: LeaderEntry[] = [
  { rank: 1, name: 'КотофейМур', score: 42100, country: '🇺🇦', badge: 'Мастер перемешивания', avatar: '🐱' },
  { rank: 2, name: 'Звёздочка_RU', score: 38500, country: '🇷🇺', badge: null, avatar: '⭐' },
  { rank: 3, name: 'Королева_Матч3', score: 31200, country: '🇷🇺', badge: 'Гроза комбо', avatar: '👸' },
  { rank: 4, name: 'ТурбоКомбо', score: 22400, country: '🇷🇺', badge: null, avatar: '💥' },
  { rank: 5, name: 'Василиса_999', score: 19800, country: '🇷🇺', badge: 'Сладкоежка', avatar: '🦊' },
];

const FRIENDS_DATA: LeaderEntry[] = [
  { rank: 1, name: 'Подружка_Лена', score: 15600, country: '🇷🇺', badge: 'Сладкоежка', avatar: '🌸' },
  { rank: 2, name: 'АнтошкаPLAY', score: 12300, country: '🇷🇺', badge: null, avatar: '🎲' },
  { rank: 3, name: 'МашаИмедведь', score: 8900, country: '🇷🇺', badge: null, avatar: '🐻' },
];

interface LeaderEntry {
  rank: number;
  name: string;
  score: number;
  country: string;
  badge: string | null;
  avatar: string;
}

const RANK_COLORS = ['#F59E0B', '#9CA3AF', '#CD7C2F'];
const RANK_LABELS = ['🥇', '🥈', '🥉'];

export function Leaderboard({ profile, navigate }: Props) {
  const [filter, setFilter] = useState<Filter>('alltime');

  const data = filter === 'alltime' ? ALL_TIME : filter === 'week' ? WEEK_DATA : FRIENDS_DATA;
  const top1 = data[0];

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
        <h2 className="font-black text-purple-800 text-xl">Таблица лидеров</h2>
      </div>

      {/* Golden #1 plaque */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className="mx-4 mb-3 rounded-3xl overflow-hidden shadow-2xl flex-shrink-0"
        style={{
          background: 'linear-gradient(135deg, #F59E0B, #D97706)',
          boxShadow: '0 8px 30px rgba(245,158,11,0.5)',
        }}
      >
        <div className="flex items-center gap-4 px-5 py-4">
          <div className="text-4xl">{top1?.avatar}</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-yellow-100 font-bold uppercase tracking-wider">👑 Абсолютный лидер</p>
            <p className="font-black text-white truncate" style={{ fontSize: '1.1rem' }}>{top1?.name}</p>
            {top1?.badge && (
              <p className="text-yellow-200 text-xs">🏅 {top1.badge}</p>
            )}
          </div>
          <div className="text-right">
            <p className="font-black text-white" style={{ fontSize: '1.2rem' }}>
              {top1?.score.toLocaleString('ru')}
            </p>
            <p className="text-yellow-200 text-xs">{top1?.country} очков</p>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex gap-2 px-4 mb-3 flex-shrink-0">
        {([
          ['alltime', 'Всё время'],
          ['week', 'Эта неделя'],
          ['friends', 'Среди друзей'],
        ] as [Filter, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className="flex-1 rounded-xl py-1.5 font-bold transition-all"
            style={{
              fontSize: '0.75rem',
              background: filter === key ? 'linear-gradient(135deg, #FF6BAE, #7C3AED)' : 'rgba(255,255,255,0.7)',
              color: filter === key ? 'white' : '#7C3AED',
              boxShadow: filter === key ? '0 3px 10px rgba(124,58,237,0.3)' : 'none',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-2">
        {data.map((entry, i) => (
          <motion.div
            key={`${filter}-${entry.rank}`}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.05, type: 'spring', stiffness: 300 }}
            className="flex items-center gap-3 rounded-2xl px-4 py-3 shadow"
            style={{
              background: entry.rank <= 3 ? `${RANK_COLORS[entry.rank - 1]}18` : 'rgba(255,255,255,0.75)',
              border: entry.rank <= 3 ? `2px solid ${RANK_COLORS[entry.rank - 1]}` : '2px solid transparent',
            }}
          >
            <div
              className="font-black flex items-center justify-center rounded-full"
              style={{
                width: 32, height: 32, flexShrink: 0,
                background: entry.rank <= 3 ? RANK_COLORS[entry.rank - 1] : '#E5E7EB',
                color: entry.rank <= 3 ? 'white' : '#6B7280',
                fontSize: entry.rank <= 3 ? '1rem' : '0.8rem',
              }}
            >
              {entry.rank <= 3 ? RANK_LABELS[entry.rank - 1] : entry.rank}
            </div>

            <div className="text-xl">{entry.avatar}</div>

            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-800 truncate" style={{ fontSize: '0.88rem' }}>
                {entry.name} {entry.country}
              </p>
              {entry.badge && (
                <p className="text-purple-500 truncate" style={{ fontSize: '0.7rem' }}>🏅 {entry.badge}</p>
              )}
            </div>

            <p className="font-black text-purple-700 flex-shrink-0" style={{ fontSize: '0.9rem' }}>
              {entry.score.toLocaleString('ru')}
            </p>
          </motion.div>
        ))}

        {/* Player's own position */}
        {profile.totalScore > 0 && (
          <div
            className="flex items-center gap-3 rounded-2xl px-4 py-3 mt-2"
            style={{ background: 'linear-gradient(135deg, #EDE9FE, #FCE7F3)', border: '2px dashed #A78BFA' }}
          >
            <div
              className="font-black flex items-center justify-center rounded-full text-white"
              style={{ width: 32, height: 32, background: '#7C3AED', fontSize: '0.75rem', flexShrink: 0 }}
            >
              ?
            </div>
            <div className="text-xl">👤</div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-purple-800 truncate" style={{ fontSize: '0.88rem' }}>
                {profile.name} (Вы) 🇷🇺
              </p>
              {profile.equippedBadge && (
                <p className="text-purple-500 truncate" style={{ fontSize: '0.7rem' }}>🏅 {profile.equippedBadge}</p>
              )}
            </div>
            <p className="font-black text-purple-700 flex-shrink-0" style={{ fontSize: '0.9rem' }}>
              {profile.totalScore.toLocaleString('ru')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
