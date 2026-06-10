import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Screen, GameMode, PlayerProfile } from '../App';
import yablochkoImg from '../../imports/yablo_chkoo.png';
import kepaMitaImg from '../../imports/KEPA_MITA.png';
import { soundManager } from '../../utils/soundManager';

// ─── Tile config ──────────────────────────────────────────────────────────────
const TILES = [
  { emoji: '🍎', bg: '#FFB3C6', glow: '#FF4D7D', name: 'Яблоко' },
  { emoji: '🎂', bg: '#DDB5FF', glow: '#9D4EDD', name: 'Торт' },
  { emoji: '🍩', bg: '#FFCB9A', glow: '#FF7C1F', name: 'Пончик' },
  { emoji: '⭐', bg: '#FFF3A3', glow: '#F4C000', name: 'Звезда' },
  { emoji: '🍦', bg: '#B0F0DF', glow: '#2EC4B6', name: 'Мороженое' },
  { emoji: '🍬', bg: '#FFB3E6', glow: '#FF4DA6', name: 'Конфета' },
  { emoji: '🍭', bg: '#C4B5FD', glow: '#7C3AED', name: 'Леденец' },
];

// ─── Level configs ─────────────────────────────────────────────────────────────
interface LevelConfig { moves: number; goal: number; types: number }
function getLevelConfig(level: number): LevelConfig {
  const base = Math.min(level - 1, 19);
  return {
    moves: Math.max(15, 35 - base),
    goal: 1500 + base * 500,
    types: Math.min(7, 3 + Math.floor(base / 4)),
  };
}

// ─── Board utils ───────────────────────────────────────────────────────────────
const ROWS = 8, COLS = 8;

function createBoard(numTypes: number): number[][] {
  const b: number[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      let t: number;
      do { t = Math.floor(Math.random() * numTypes); } while (
        (c >= 2 && b[r][c - 1] === t && b[r][c - 2] === t) ||
        (r >= 2 && b[r - 1][c] === t && b[r - 2][c] === t)
      );
      b[r][c] = t;
    }
  }
  return b;
}

function findMatches(board: number[][]): Set<string> {
  const s = new Set<string>();
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS - 2; c++) {
      const t = board[r][c];
      if (t < 0) continue;
      if (t === board[r][c + 1] && t === board[r][c + 2]) {
        let len = 3;
        while (c + len < COLS && board[r][c + len] === t) len++;
        for (let i = 0; i < len; i++) s.add(`${r},${c + i}`);
      }
    }
  }
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS - 2; r++) {
      const t = board[r][c];
      if (t < 0) continue;
      if (t === board[r + 1][c] && t === board[r + 2][c]) {
        let len = 3;
        while (r + len < ROWS && board[r + len][c] === t) len++;
        for (let i = 0; i < len; i++) s.add(`${r + i},${c}`);
      }
    }
  }
  return s;
}

function applyGravity(board: number[][], numTypes: number): number[][] {
  const b = board.map(r => [...r]);
  for (let c = 0; c < COLS; c++) {
    const col: number[] = [];
    for (let r = ROWS - 1; r >= 0; r--) if (b[r][c] >= 0) col.push(b[r][c]);
    for (let r = ROWS - 1; r >= 0; r--) {
      b[r][c] = col.length > 0 ? col.shift()! : Math.floor(Math.random() * numTypes);
    }
  }
  return b;
}

function hasValidMoves(board: number[][]): boolean {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (c + 1 < COLS) {
        const nb = board.map(row => [...row]);
        [nb[r][c], nb[r][c + 1]] = [nb[r][c + 1], nb[r][c]];
        if (findMatches(nb).size > 0) return true;
      }
      if (r + 1 < ROWS) {
        const nb = board.map(row => [...row]);
        [nb[r][c], nb[r + 1][c]] = [nb[r + 1][c], nb[r][c]];
        if (findMatches(nb).size > 0) return true;
      }
    }
  }
  return false;
}

function shuffleBoard(board: number[][], numTypes: number): number[][] {
  let b = board.map(r => [...r]);
  for (let attempt = 0; attempt < 10; attempt++) {
    const flat = b.flat();
    for (let i = flat.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [flat[i], flat[j]] = [flat[j], flat[i]];
    }
    for (let r = 0; r < ROWS; r++) b[r] = flat.slice(r * COLS, (r + 1) * COLS);
    if (hasValidMoves(b)) return b;
  }
  return createBoard(numTypes);
}

// ─── Dialogue ──────────────────────────────────────────────────────────────────
const KEPA_LINES = [
  'Опять промахнулся? Ну давай, соберись!',
  'Комбо? Неожиданно...',
  'Жучка-Жучка!',
  'Ах как нежно!',
  'Это было случайностью, не расслабляйся',
  'Хм, и это называется игрок?',
  'Не плохо... для начинающего',
  'Пффф, мог бы и лучше',
  'Тихо, я считаю твои ошибки',
];
const YABLO_LINES = [
  'Ты справишься! 💖',
  'Вау! Это было восхитительно! 🌟',
  'Молодец какой!',
  'Заряжай! Маленький',
  'Ты лучший игрок! ✨',
  'Верю в тебя! 🌈',
  'Ещё немного, и победа!',
  'Отличное комбо! 🌟',
  'Ура-ура! Так держать!',
];

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

// ─── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  profile: PlayerProfile;
  mode: GameMode;
  level: number;
  navigate: (screen: Screen) => void;
  updateProfile: (u: Partial<PlayerProfile>) => void;
  startGame?: (mode: GameMode, level?: number) => void;
}

export function GameBoard({ profile, mode, level, navigate, updateProfile, startGame }: Props) {
  const cfg = getLevelConfig(level);
  const numTypes = mode === 'survival' ? 6 : cfg.types;

  const boardRef = useRef<number[][]>(createBoard(numTypes));
  const [board, setBoardDisplay] = useState<number[][]>(boardRef.current);
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [highlighted, setHighlighted] = useState<Set<string>>(new Set());
  const [nukeRow, setNukeRow] = useState<number | null>(null);
  const [shake, setShake] = useState(false);

  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(cfg.moves);
  const [timeLeft, setTimeLeft] = useState(180);
  const [combo, setCombo] = useState(0);
  const [totalTurns, setTotalTurns] = useState(0);
  const [survivalRows, setSurvivalRows] = useState(0);

  const [speaking, setSpeaking] = useState<'kepa' | 'yablo' | null>(null);
  const [dialogue, setDialogue] = useState('');
  const [gamePhase, setGamePhase] = useState<'playing' | 'won' | 'lost'>('playing');

  const isProcessingRef = useRef(false);
  const totalTurnsRef = useRef(0);
  const scoreRef = useRef(0);
  const dialogueTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Update board display
  const setBoard = useCallback((b: number[][]) => {
    boardRef.current = b;
    setBoardDisplay(b.map(r => [...r]));
  }, []);

  // Show character dialogue
  const showDialogue = useCallback((who: 'kepa' | 'yablo', text: string) => {
    if (dialogueTimerRef.current) clearTimeout(dialogueTimerRef.current);
    setSpeaking(who);
    setDialogue(text);
    soundManager.playDialogue();
    soundManager.speakDialogue(text, who);
    dialogueTimerRef.current = setTimeout(() => setSpeaking(null), 3000);
  }, []);

  // Initialize sound manager
  useEffect(() => {
    soundManager.setSoundEnabled(profile.soundEnabled);
  }, [profile.soundEnabled]);

  // ─── Reset game when level changes ──────────────────────────────────────
  useEffect(() => {
    const newCfg = getLevelConfig(level);
    const newNumTypes = mode === 'survival' ? 6 : newCfg.types;
    boardRef.current = createBoard(newNumTypes);
    setBoardDisplay(boardRef.current);
    setScore(0);
    scoreRef.current = 0;
    setMoves(newCfg.moves);
    setTimeLeft(180);
    setTotalTurns(0);
    totalTurnsRef.current = 0;
    setCombo(0);
    setSurvivalRows(0);
    setHighlighted(new Set());
    setSelected(null);
    isProcessingRef.current = false;
    setGamePhase('playing');
  }, [level, mode]);

  // ─── Time attack timer ────────────────────────────────────────────────────
  useEffect(() => {
    if (mode !== 'timeattack' || gamePhase !== 'playing') return;
    const id = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { setGamePhase('lost'); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [mode, gamePhase]);

  // ─── Survival: add rows every 8 turns ─────────────────────────────────────
  const addSurvivalRow = useCallback(() => {
    const b = boardRef.current.map(r => [...r]);
    // Shift everything up by 1 (top row is lost)
    for (let r = 0; r < ROWS - 1; r++) b[r] = [...b[r + 1]];
    // New bottom row
    for (let c = 0; c < COLS; c++) b[ROWS - 1][c] = Math.floor(Math.random() * numTypes);
    setBoard(b);
    setSurvivalRows(n => n + 1);
  }, [numTypes, setBoard]);

  // ─── Cascade processor ────────────────────────────────────────────────────
  const processCascade = useCallback(async (startBoard: number[][], cascadeDepth = 0): Promise<number> => {
    let b = startBoard;
    let depth = cascadeDepth;

    while (true) {
      const matches = findMatches(b);
      if (matches.size === 0) break;

      depth++;
      setHighlighted(new Set(matches));
      soundManager.playMatch();

      const pts = Math.floor(matches.size * 15 * (1 + (depth - 1) * 0.6));
      scoreRef.current += pts;
      setScore(scoreRef.current);

      await sleep(380);

      b = b.map((row, r) => row.map((cell, c) => (matches.has(`${r},${c}`) ? -1 : cell)));
      setHighlighted(new Set());
      setBoard(b);

      await sleep(160);

      b = applyGravity(b, numTypes);
      setBoard(b);

      await sleep(340);
    }

    return depth;
  }, [numTypes, setBoard]);

  // ─── Kepa nuke row ────────────────────────────────────────────────────────
  const kepaNuke = useCallback(async () => {
    const row = Math.floor(Math.random() * ROWS);
    showDialogue('kepa', 'Устала смотреть на это! 💥 Взрываю ряд!');
    setNukeRow(row);
    await sleep(600);

    const b = boardRef.current.map((r, ri) =>
      ri === row ? r.map(() => -1) : [...r]
    );
    setNukeRow(null);
    setBoard(b);
    await sleep(200);

    const fallen = applyGravity(b, numTypes);
    setBoard(fallen);
    await sleep(340);

    await processCascade(fallen, 0);
  }, [showDialogue, numTypes, setBoard, processCascade]);

  // ─── Handle tile click ────────────────────────────────────────────────────
  const handleClick = useCallback(async (r: number, c: number) => {
    if (isProcessingRef.current || gamePhase !== 'playing') return;

    if (!selected) {
      setSelected([r, c]);
      return;
    }

    const [sr, sc] = selected;
    if (sr === r && sc === c) { setSelected(null); return; }

    const isAdj = (Math.abs(sr - r) === 1 && sc === c) || (Math.abs(sc - c) === 1 && sr === r);
    if (!isAdj) { setSelected([r, c]); return; }

    // Try the swap
    const nb = boardRef.current.map(row => [...row]);
    [nb[sr][sc], nb[r][c]] = [nb[r][c], nb[sr][sc]];
    if (findMatches(nb).size === 0) {
      // Invalid – shake
      soundManager.playInvalid();
      setShake(true);
      setTimeout(() => setShake(false), 400);
      setSelected(null);
      return;
    }

    soundManager.playSwap();
    setSelected(null);
    isProcessingRef.current = true;

    setBoard(nb);
    const newTurns = totalTurnsRef.current + 1;
    totalTurnsRef.current = newTurns;
    setTotalTurns(newTurns);

    if (mode === 'classic') setMoves(m => m - 1);

    // Character dialogue
    if (newTurns % 6 === 0) {
      const who = newTurns % 12 === 0 ? 'kepa' : 'yablo';
      const lines = who === 'kepa' ? KEPA_LINES : YABLO_LINES;
      showDialogue(who, lines[Math.floor(Math.random() * lines.length)]);
    }

    const cascadeDepth = await processCascade(nb, 0);
    setCombo(cascadeDepth);

    // Combo dialogue and sound
    if (cascadeDepth >= 2) {
      soundManager.playCombo();
      const who = newTurns % 3 === 0 ? 'kepa' : 'yablo';
      if (who === 'kepa') showDialogue('kepa', KEPA_LINES[Math.floor(Math.random() * KEPA_LINES.length)]);
      else showDialogue('yablo', `Комбо x${cascadeDepth}! 🌟 ${YABLO_LINES[Math.floor(Math.random() * YABLO_LINES.length)]}`);
    }

    // Kepa nuke every 20 turns
    if (newTurns % 20 === 0) {
      await sleep(400);
      await kepaNuke();
    }

    // Survival: add row every 8 turns
    if (mode === 'survival' && newTurns % 8 === 0) {
      addSurvivalRow();
    }

    // Check valid moves
    if (!hasValidMoves(boardRef.current)) {
      showDialogue('yablo', 'Нет ходов! Сейчас перемешаю! ✨');
      await sleep(1200);
      const shuffled = shuffleBoard(boardRef.current, numTypes);
      setBoard(shuffled);
      await sleep(400);
      await processCascade(shuffled, 0);
    }

    isProcessingRef.current = false;

    // Check end conditions
    const currentScore = scoreRef.current;
    const currentMoves = mode === 'classic' ? moves - 1 : moves;

    if (mode === 'classic') {
      if (currentScore >= cfg.goal) { 
        soundManager.playWin();
        setGamePhase('won'); 
        return; 
      }
      if (currentMoves <= 0) { 
        if (currentScore >= cfg.goal) {
          soundManager.playWin();
          setGamePhase('won');
        } else {
          soundManager.playLose();
          setGamePhase('lost');
        }
      }
    }
    if (mode === 'survival' && !hasValidMoves(boardRef.current)) {
      soundManager.playLose();
      setGamePhase('lost');
    }
  }, [
    selected, gamePhase, mode, moves, cfg.goal,
    numTypes, processCascade, kepaNuke, addSurvivalRow, showDialogue, setBoard,
  ]);

  // ─── Win/lose check after moves update ───────────────────────────────────
  useEffect(() => {
    if (gamePhase !== 'playing') return;
    if (mode === 'classic' && moves <= 0) {
      if (score >= cfg.goal) {
        soundManager.playWin();
        setGamePhase('won');
      } else {
        soundManager.playLose();
        setGamePhase('lost');
      }
    }
  }, [moves, score, mode, cfg.goal, gamePhase]);

  // Tile size responsive
  const tileSize = 'clamp(34px, 10vw, 60px)';

  return (
    <div
      className="size-full flex flex-col items-center justify-start overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #FFE4F3 0%, #EDD5FF 50%, #D5EEFF 100%)' }}
    >
      {/* HUD */}
      <div className="w-full flex items-center justify-between px-4 py-2" style={{ maxWidth: 700 }}>
        <button
          onClick={() => navigate('menu')}
          className="text-purple-600 font-bold rounded-xl bg-white/70 px-3 py-1 shadow text-sm"
        >
          ← Меню
        </button>

        <div className="flex gap-3">
          <HudPill icon="⭐" label={score.toLocaleString('ru')} color="#7C3AED" />
          {mode === 'classic' && <HudPill icon="🔄" label={`${moves}`} color="#059669" />}
          {mode === 'timeattack' && (
            <HudPill
              icon="⏱"
              label={`${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}`}
              color={timeLeft < 30 ? '#DC2626' : '#059669'}
            />
          )}
          {mode === 'survival' && <HudPill icon="🏃" label={`Ряд ${survivalRows}`} color="#DC2626" />}
        </div>

        {mode === 'classic' && (
          <div className="text-xs text-purple-500 font-bold text-right">
            Цель<br />{cfg.goal.toLocaleString('ru')}
          </div>
        )}
        {mode !== 'classic' && <div className="w-12" />}
      </div>

      {/* Progress bar for classic */}
      {mode === 'classic' && (
        <div className="w-full px-4 mb-1" style={{ maxWidth: 700 }}>
          <div className="h-2 rounded-full bg-purple-200 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #FF6BAE, #7C3AED)' }}
              animate={{ width: `${Math.min(100, (score / cfg.goal) * 100)}%` }}
              transition={{ type: 'spring', stiffness: 100 }}
            />
          </div>
        </div>
      )}

      {/* Game area: characters + board */}
      <div
        className="flex items-center justify-center gap-2 flex-1 w-full"
        style={{ maxWidth: '95vw', minHeight: 0, padding: '0 8px' }}
      >
        {/* Яблочко (left) */}
        <div className="flex flex-col items-center flex-shrink-0" style={{ width: 'clamp(100px, 15vw, 160px)' }}>
          <AnimatePresence>
            {speaking === 'yablo' && (
              <motion.div
                key="yablo-bubble"
                initial={{ opacity: 0, scale: 0.7, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.7 }}
                className="relative bg-white rounded-2xl px-2 py-1 shadow-lg mb-1"
                style={{ fontSize: '0.65rem', color: '#BE185D', fontWeight: 700, maxWidth: 80, textAlign: 'center', lineHeight: 1.3 }}
              >
                {dialogue}
                <div style={{ position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '6px solid white' }} />
              </motion.div>
            )}
          </AnimatePresence>
          <motion.div
            animate={{
              y: speaking === 'yablo' ? [0, -4, 0] : [0, -3, 0],
              rotate: speaking === 'yablo' ? [0, -1.5, 1.5, -1.5, 1.5, 0] : 0,
              x: speaking === 'yablo' ? [0, -2, 2, -1, 1, 0] : 0,
            }}
            transition={{
              repeat: Infinity,
              duration: speaking === 'yablo' ? 0.5 : 2.5,
              ease: 'easeInOut',
            }}
          >
            <ImageWithFallback src={yablochkoImg} alt="Яблочко" style={{ width: 'clamp(90px, 14vw, 150px)', height: 'auto' }} />
          </motion.div>
          <p style={{ fontSize: '0.6rem', color: '#BE185D', fontWeight: 800, marginTop: 2, textAlign: 'center' }}>Яблочко</p>
        </div>

        {/* Board */}
        <div
          className={`relative rounded-3xl shadow-2xl overflow-hidden ${shake ? 'animate-shake' : ''}`}
          style={{
            background: 'rgba(255,255,255,0.55)',
            backdropFilter: 'blur(8px)',
            border: '3px solid rgba(255,255,255,0.8)',
            padding: 8,
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${COLS}, ${tileSize})`,
              gridTemplateRows: `repeat(${ROWS}, ${tileSize})`,
              gap: 4,
            }}
          >
            {board.map((row, r) =>
              row.map((tile, c) => {
                const key = `${r},${c}`;
                const isSel = selected?.[0] === r && selected?.[1] === c;
                const isHigh = highlighted.has(key);
                const isNuked = nukeRow === r;

                return (
                  <motion.button
                    key={key}
                    onClick={() => handleClick(r, c)}
                    whileTap={{ scale: 0.85 }}
                    animate={
                      isHigh
                        ? { scale: [1, 1.2, 1.15], rotate: [0, -5, 5, 0] }
                        : isNuked
                        ? { scale: 0, opacity: 0 }
                        : isSel
                        ? { scale: 1.12 }
                        : { scale: 1 }
                    }
                    transition={{ duration: 0.3 }}
                    className="relative flex items-center justify-center rounded-xl cursor-pointer select-none border-0"
                    style={{
                      width: tileSize,
                      height: tileSize,
                      background: tile >= 0 ? TILES[tile].bg : 'transparent',
                      boxShadow: isSel
                        ? `0 0 0 3px white, 0 0 0 5px ${tile >= 0 ? TILES[tile].glow : '#aaa'}`
                        : isHigh
                        ? `0 0 16px 4px ${tile >= 0 ? TILES[tile].glow : '#aaa'}, 0 0 0 2px white`
                        : '0 2px 6px rgba(0,0,0,0.12)',
                      fontSize: 'clamp(16px, 4.5vw, 30px)',
                      transition: 'background 0.15s',
                      opacity: isNuked ? 0 : 1,
                    }}
                  >
                    {tile >= 0 ? TILES[tile].emoji : ''}
                    {isSel && (
                      <motion.div
                        className="absolute inset-0 rounded-xl"
                        animate={{ opacity: [0.3, 0.7, 0.3] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                        style={{ background: 'rgba(255,255,255,0.4)' }}
                      />
                    )}
                  </motion.button>
                );
              })
            )}
          </div>

          {/* Combo burst */}
          <AnimatePresence>
            {combo >= 2 && (
              <motion.div
                key={`combo-${combo}`}
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 2.5, opacity: 0 }}
                exit={{}}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <span
                  className="font-black text-white rounded-full px-4 py-2"
                  style={{
                    background: 'linear-gradient(135deg, #FF6BAE, #7C3AED)',
                    fontSize: '1.5rem',
                    boxShadow: '0 0 30px rgba(255,107,174,0.7)',
                  }}
                >
                  КОМБО x{combo}!
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Кепа Мита (right) */}
        <div className="flex flex-col items-center flex-shrink-0" style={{ width: 'clamp(100px, 15vw, 160px)' }}>
          <AnimatePresence>
            {speaking === 'kepa' && (
              <motion.div
                key="kepa-bubble"
                initial={{ opacity: 0, scale: 0.7, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.7 }}
                className="relative bg-white rounded-2xl px-2 py-1 shadow-lg mb-1"
                style={{ fontSize: '0.65rem', color: '#1D4ED8', fontWeight: 700, maxWidth: 80, textAlign: 'center', lineHeight: 1.3 }}
              >
                {dialogue}
                <div style={{ position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '6px solid white' }} />
              </motion.div>
            )}
          </AnimatePresence>
          <motion.div
            animate={{
              y: speaking === 'kepa' ? [0, -4, 0] : [0, -2, 0],
              rotate: speaking === 'kepa' ? [0, -1.5, 1.5, -1.5, 1.5, 0] : 0,
              x: speaking === 'kepa' ? [0, -2, 2, -1, 1, 0] : 0,
            }}
            transition={{
              repeat: Infinity,
              duration: speaking === 'kepa' ? 0.5 : 3,
              ease: 'easeInOut',
              delay: speaking === 'kepa' ? 0 : 0.8,
            }}
          >
            <ImageWithFallback src={kepaMitaImg} alt="Кепа Мита" style={{ width: 'clamp(90px, 14vw, 150px)', height: 'auto' }} />
          </motion.div>
          <p style={{ fontSize: '0.6rem', color: '#1D4ED8', fontWeight: 800, marginTop: 2, textAlign: 'center' }}>Кепа Мита</p>
        </div>
      </div>

      {/* Level info strip */}
      <div className="py-2 text-center" style={{ fontSize: '0.75rem', color: '#7C3AED', fontWeight: 700 }}>
        {mode === 'classic' && `Уровень ${level} • Собери ${cfg.goal.toLocaleString('ru')} очков`}
        {mode === 'timeattack' && `Режим: Гонка со временем ⏱`}
        {mode === 'survival' && `Режим: Выживание 🏃 — удержись как можно дольше!`}
      </div>

      {/* Game over / win overlay */}
      <AnimatePresence>
        {gamePhase !== 'playing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.55)', zIndex: 50 }}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="bg-white rounded-3xl p-8 shadow-2xl text-center mx-4"
              style={{ maxWidth: 320 }}
            >
              <div className="text-5xl mb-3">
                {gamePhase === 'won' ? '🏆' : '💔'}
              </div>
              <h2 className="font-black mb-1" style={{ color: gamePhase === 'won' ? '#7C3AED' : '#DC2626', fontSize: '1.6rem' }}>
                {gamePhase === 'won' ? 'Победа!' : 'Игра окончена'}
              </h2>
              <p className="text-gray-500 mb-2" style={{ fontSize: '0.9rem' }}>
                {gamePhase === 'won' ? '🌟 Отличная работа!' : 'Не сдавайся, попробуй снова!'}
              </p>
              <p className="font-bold mb-5" style={{ color: '#7C3AED', fontSize: '1.1rem' }}>
                Очки: {score.toLocaleString('ru')}
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    boardRef.current = createBoard(numTypes);
                    setBoardDisplay(boardRef.current);
                    setScore(0);
                    scoreRef.current = 0;
                    setMoves(cfg.moves);
                    setTimeLeft(180);
                    setTotalTurns(0);
                    totalTurnsRef.current = 0;
                    setCombo(0);
                    setSurvivalRows(0);
                    setHighlighted(new Set());
                    setSelected(null);
                    isProcessingRef.current = false;
                    setGamePhase('playing');
                  }}
                  className="rounded-2xl text-white font-bold py-3"
                  style={{ background: 'linear-gradient(135deg, #FF6BAE, #7C3AED)', boxShadow: '0 4px 0 rgba(0,0,0,0.15)' }}
                >
                  🔄 Снова
                </button>
                {gamePhase === 'won' && startGame && (
                  <button
                    onClick={() => {
                      updateProfile({ 
                        currentLevel: Math.max(profile.currentLevel, level + 1),
                        totalScore: profile.totalScore + score 
                      });
                      startGame('classic', level + 1);
                    }}
                    className="rounded-2xl text-white font-bold py-3"
                    style={{ background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 4px 0 rgba(0,0,0,0.15)' }}
                  >
                    ➡️ Следующий уровень
                  </button>
                )}
                <button
                  onClick={() => {
                    if (gamePhase === 'won') {
                      updateProfile({ 
                        currentLevel: Math.max(profile.currentLevel, level + 1),
                        totalScore: profile.totalScore + score 
                      });
                    }
                    navigate('menu');
                  }}
                  className="rounded-2xl font-bold py-2 text-purple-600"
                  style={{ background: '#F3E8FF' }}
                >
                  ← Главное меню
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-6px)}
          40%{transform:translateX(6px)}
          60%{transform:translateX(-4px)}
          80%{transform:translateX(4px)}
        }
        .animate-shake { animation: shake 0.4s ease; }
      `}</style>
    </div>
  );
}

function HudPill({ icon, label, color }: { icon: string; label: string; color: string }) {
  return (
    <div
      className="flex items-center gap-1 rounded-xl px-3 py-1 font-bold"
      style={{ background: 'rgba(255,255,255,0.75)', color, fontSize: '0.85rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </div>
  );
}
