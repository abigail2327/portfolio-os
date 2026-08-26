import { useEffect, useRef, useState, useCallback } from 'react';
import { playClick, playError } from '../utils/sound';

// Classic 4-shade Game Boy DMG display palette. These are just color values (not
// copyrightable) — using them is what makes this read as "on a Game Boy screen."
const SHADE = ['#9bbc0f', '#8bac0f', '#306230', '#0f380f'];

const COLS = 9;
const ROWS = 15;
const BLOCK = 15;

// Seven original falling-piece shapes (the classic tetromino set — generic geometric
// shapes, not a specific trademarked game's branding/name/rules).
const SHAPES = {
  I: [[1, 1, 1, 1]],
  O: [[1, 1], [1, 1]],
  T: [[0, 1, 0], [1, 1, 1]],
  S: [[0, 1, 1], [1, 1, 0]],
  Z: [[1, 1, 0], [0, 1, 1]],
  J: [[1, 0, 0], [1, 1, 1]],
  L: [[0, 0, 1], [1, 1, 1]],
};
const SHAPE_KEYS = Object.keys(SHAPES);

function rotate(shape) {
  const rows = shape.length;
  const cols = shape[0].length;
  const out = Array.from({ length: cols }, () => Array(rows).fill(0));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      out[c][rows - 1 - r] = shape[r][c];
    }
  }
  return out;
}

function randomPiece() {
  const key = SHAPE_KEYS[Math.floor(Math.random() * SHAPE_KEYS.length)];
  return { shape: SHAPES[key], shade: 1 + Math.floor(Math.random() * 3) };
}

function emptyGrid() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

// Small side decoration echoing the chain/brick trim classic handhelds put beside the
// playing field — purely cosmetic, drawn as a repeating pattern of little squares.
function BorderStrip() {
  const cells = Array.from({ length: 15 });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, padding: '2px 0' }}>
      {cells.map((_, i) => (
        <div key={i} style={{ width: 8, height: 8, background: SHADE[2], opacity: i % 2 ? 0.5 : 0.85 }} />
      ))}
    </div>
  );
}

function NextPiecePreview({ shape, shade }) {
  const size = 14;
  const cols = shape[0].length;
  const rows = shape.length;
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, ${size}px)`,
        gridTemplateRows: `repeat(${rows}, ${size}px)`,
        gap: 1,
      }}
    >
      {shape.flatMap((row, r) =>
        row.map((cell, c) => (
          <div
            key={`${r}-${c}`}
            style={{ width: size, height: size, background: cell ? SHADE[shade] : 'transparent' }}
          />
        ))
      )}
    </div>
  );
}

export default function Stax() {
  const canvasRef = useRef(null);
  const gridRef = useRef(emptyGrid());
  const pieceRef = useRef({ ...randomPiece(), x: 3, y: 0 });
  const nextRef = useRef(randomPiece());
  const dropTimerRef = useRef(0);
  const rafRef = useRef(null);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(0);
  const [nextPiece, setNextPiece] = useState(nextRef.current);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const scoreRef = useRef(0);
  const linesRef = useRef(0);
  const levelRef = useRef(0);
  const speedRef = useRef(650);

  const collides = useCallback((shape, x, y, grid) => {
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (!shape[r][c]) continue;
        const gx = x + c;
        const gy = y + r;
        if (gx < 0 || gx >= COLS || gy >= ROWS) return true;
        if (gy >= 0 && grid[gy][gx]) return true;
      }
    }
    return false;
  }, []);

  const lockPiece = useCallback(() => {
    const { shape, x, y, shade } = pieceRef.current;
    const grid = gridRef.current;
    shape.forEach((row, r) =>
      row.forEach((cell, c) => {
        if (cell && y + r >= 0) grid[y + r][x + c] = shade;
      })
    );
    // Clear completed lines
    let cleared = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (grid[r].every((cell) => cell)) {
        grid.splice(r, 1);
        grid.unshift(Array(COLS).fill(0));
        cleared++;
        r++;
      }
    }
    if (cleared) {
      scoreRef.current += cleared * 100 * cleared;
      linesRef.current += cleared;
      levelRef.current = Math.floor(linesRef.current / 10);
      setScore(scoreRef.current);
      setLines(linesRef.current);
      setLevel(levelRef.current);
      speedRef.current = Math.max(140, 650 - levelRef.current * 45);
      playClick();
    }
    const next = nextRef.current;
    const upcoming = randomPiece();
    nextRef.current = upcoming;
    setNextPiece(upcoming);
    const spawned = { ...next, x: 3, y: 0 };
    if (collides(spawned.shape, spawned.x, spawned.y, grid)) {
      setGameOver(true);
      playError();
    } else {
      pieceRef.current = spawned;
    }
  }, [collides]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = SHADE[0];
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const grid = gridRef.current;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (grid[r][c]) {
          ctx.fillStyle = SHADE[grid[r][c]];
          ctx.fillRect(c * BLOCK, r * BLOCK, BLOCK - 1, BLOCK - 1);
        }
      }
    }
    const { shape, x, y, shade } = pieceRef.current;
    ctx.fillStyle = SHADE[shade];
    shape.forEach((row, r) =>
      row.forEach((cell, c) => {
        if (cell && y + r >= 0) {
          ctx.fillRect((x + c) * BLOCK, (y + r) * BLOCK, BLOCK - 1, BLOCK - 1);
        }
      })
    );
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = COLS * BLOCK;
    canvas.height = ROWS * BLOCK;

    let last = performance.now();
    const tick = (t) => {
      rafRef.current = requestAnimationFrame(tick);
      if (gameOver || paused) {
        draw();
        return;
      }
      const dt = t - last;
      last = t;
      dropTimerRef.current += dt;
      if (dropTimerRef.current > speedRef.current) {
        dropTimerRef.current = 0;
        const p = pieceRef.current;
        if (!collides(p.shape, p.x, p.y + 1, gridRef.current)) {
          p.y += 1;
        } else {
          lockPiece();
        }
      }
      draw();
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [collides, lockPiece, draw, gameOver, paused]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (gameOver) return;
      const p = pieceRef.current;
      const grid = gridRef.current;
      if (e.key === 'ArrowLeft') {
        if (!collides(p.shape, p.x - 1, p.y, grid)) p.x -= 1;
      } else if (e.key === 'ArrowRight') {
        if (!collides(p.shape, p.x + 1, p.y, grid)) p.x += 1;
      } else if (e.key === 'ArrowDown') {
        if (!collides(p.shape, p.x, p.y + 1, grid)) p.y += 1;
      } else if (e.key === 'ArrowUp') {
        const rotated = rotate(p.shape);
        if (!collides(rotated, p.x, p.y, grid)) p.shape = rotated;
      } else if (e.key === ' ') {
        e.preventDefault();
        while (!collides(p.shape, p.x, p.y + 1, grid)) p.y += 1;
        lockPiece();
      } else if (e.key === 'p' || e.key === 'P') {
        setPaused((v) => !v);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [collides, lockPiece, gameOver]);

  const restart = () => {
    gridRef.current = emptyGrid();
    pieceRef.current = { ...randomPiece(), x: 3, y: 0 };
    nextRef.current = randomPiece();
    setNextPiece(nextRef.current);
    scoreRef.current = 0;
    linesRef.current = 0;
    levelRef.current = 0;
    speedRef.current = 650;
    setScore(0);
    setLines(0);
    setLevel(0);
    setGameOver(false);
    setPaused(false);
  };

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
      <BorderStrip />
      <div style={{ position: 'relative' }}>
        <canvas ref={canvasRef} style={{ imageRendering: 'pixelated', border: `2px solid ${SHADE[3]}`, display: 'block' }} />
        {gameOver && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(15,56,15,0.85)',
              color: SHADE[0],
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              fontSize: 9,
              textAlign: 'center',
            }}
          >
            <div>GAME OVER</div>
            <div onClick={restart} style={{ cursor: 'pointer', textDecoration: 'underline' }}>
              RETRY
            </div>
          </div>
        )}
      </div>
      <BorderStrip />

      {/* HUD panel: Score / Level / Lines / Next */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 92 }}>
        <div className="gb-stat-box">
          <div className="gb-stat-label">SCORE</div>
          <div className="gb-stat-value">{score}</div>
        </div>
        <div className="gb-stat-box">
          <div className="gb-stat-label">LEVEL</div>
          <div className="gb-stat-value">{level}</div>
        </div>
        <div className="gb-stat-box">
          <div className="gb-stat-label">LINES</div>
          <div className="gb-stat-value">{lines}</div>
        </div>
        <div className="gb-stat-box" style={{ minHeight: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <NextPiecePreview shape={nextPiece.shape} shade={nextPiece.shade} />
        </div>
      </div>
    </div>
  );
}
