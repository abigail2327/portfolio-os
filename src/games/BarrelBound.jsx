import { useEffect, useRef, useState, useCallback } from 'react';
import { playClick, playError } from '../utils/sound';

// Original color palette — industrial steel-beam theme, distinct from any existing
// game's specific art (this is a Game Boy *Color* cartridge, so it gets its own colors
// rather than the plain DMG green look).
const PALETTE = {
  bg: '#20222b',
  bgGrid: '#2a2d38',
  beam: '#6f8faa',
  beamHighlight: '#a9c4dc',
  beamShadow: '#3d5468',
  ladder: '#d9a441',
  barrel: '#a85a2e',
  barrelBand: '#5c3010',
  player: '#4fd67a',
  playerDark: '#2a8f52',
  flag: '#e0447e',
};

const W = 150, H = 176;
// Baseline height per row (0 = top, 4 = bottom/ground) and how much each row tilts —
// alternating slope direction is what gives the classic zig-zag girder silhouette.
const PLATFORM_Y = [20, 58, 96, 134, 168];
const SLOPE_DIR = [1, -1, 1, -1, 0]; // ground floor (row 4) stays flat
const AMPLITUDE = 9;
const LADDER_X = [24, 110, 40, 95]; // ladder column between each pair of rows
const PLAYER_SIZE = 10;
const BARREL_SIZE = 9;

function platformY(x, row) {
  return PLATFORM_Y[row] + SLOPE_DIR[row] * ((x - W / 2) / (W / 2)) * AMPLITUDE;
}

function makePlayer() {
  return { x: W / 2 - 5, y: 0, row: 4, climbing: false };
}

export default function BarrelBound() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const player = useRef(makePlayer());
  const barrels = useRef([]);
  const spawnTimer = useRef(0);
  const keys = useRef({});
  const [status, setStatus] = useState('playing'); // playing | dead | won
  const [lives, setLives] = useState(3);
  const livesRef = useRef(3);
  const [row, setRow] = useState(4);

  const spawnBarrel = useCallback(() => {
    barrels.current.push({ x: W / 2 - 4, row: 0, dir: Math.random() < 0.5 ? -1 : 1 });
  }, []);

  const resetPlayer = useCallback(() => {
    player.current = makePlayer();
  }, []);

  const update = useCallback(() => {
    const p = player.current;

    // Horizontal movement
    if (!p.climbing) {
      if (keys.current.ArrowLeft) p.x -= 1.4;
      if (keys.current.ArrowRight) p.x += 1.4;
      p.x = Math.max(2, Math.min(W - PLAYER_SIZE - 2, p.x));
    }

    const nearLadderUp = p.row > 0 && Math.abs(p.x + PLAYER_SIZE / 2 - LADDER_X[p.row - 1]) < 8;
    const nearLadderDown = p.row < 4 && Math.abs(p.x + PLAYER_SIZE / 2 - LADDER_X[p.row]) < 8;

    if (keys.current.ArrowUp && nearLadderUp) {
      const targetY = platformY(LADDER_X[p.row - 1], p.row - 1) - PLAYER_SIZE;
      p.y -= 1.3;
      p.climbing = true;
      if (p.y <= targetY) {
        p.y = targetY;
        p.row -= 1;
        p.climbing = false;
        setRow(p.row);
      }
    } else if (keys.current.ArrowDown && p.row < 4 && nearLadderDown) {
      const targetY = platformY(LADDER_X[p.row], p.row + 1) - PLAYER_SIZE;
      p.y += 1.3;
      p.climbing = true;
      if (p.y >= targetY) {
        p.y = targetY;
        p.row += 1;
        p.climbing = false;
        setRow(p.row);
      }
    } else {
      p.climbing = false;
      p.y = platformY(p.x + PLAYER_SIZE / 2, p.row) - PLAYER_SIZE;
    }

    // Barrels
    spawnTimer.current += 1;
    if (spawnTimer.current > 130) {
      spawnTimer.current = 0;
      spawnBarrel();
    }
    barrels.current.forEach((b) => {
      const speed = 0.9 + (SLOPE_DIR[b.row] === Math.sign(b.dir) ? 0.25 : -0.1);
      b.x += b.dir * speed;
      if (b.x < 2 || b.x > W - BARREL_SIZE - 2) {
        if (b.row < 4 && Math.abs(b.x + BARREL_SIZE / 2 - LADDER_X[b.row]) < 14) {
          b.row += 1;
        } else {
          b.dir *= -1;
          b.x = Math.max(2, Math.min(W - BARREL_SIZE - 2, b.x));
        }
      }
    });
    barrels.current = barrels.current.filter((b) => b.row <= 4);

    // Collisions
    barrels.current.forEach((b) => {
      const by = platformY(b.x + BARREL_SIZE / 2, b.row) - BARREL_SIZE;
      if (b.row === p.row && Math.abs(b.x - p.x) < 9 && Math.abs(by - p.y) < 9) {
        livesRef.current -= 1;
        setLives(livesRef.current);
        playError();
        if (livesRef.current <= 0) {
          setStatus('dead');
        } else {
          resetPlayer();
          setRow(4);
        }
      }
    });

    if (p.row === 0 && p.x > W / 2 - 20 && p.x < W / 2 + 20) {
      setStatus('won');
      playClick();
    }
  }, [spawnBarrel, resetPlayer]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = PALETTE.bg;
    ctx.fillRect(0, 0, W, H);
    for (let y = 0; y < H; y += 16) {
      ctx.fillStyle = PALETTE.bgGrid;
      ctx.fillRect(0, y, W, 1);
    }

    // Sloped steel-beam platforms
    PLATFORM_Y.forEach((_, row) => {
      const y1 = platformY(0, row);
      const y2 = platformY(W, row);
      ctx.beginPath();
      ctx.moveTo(0, y1);
      ctx.lineTo(W, y2);
      ctx.lineTo(W, y2 + 4);
      ctx.lineTo(0, y1 + 4);
      ctx.closePath();
      ctx.fillStyle = PALETTE.beam;
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0, y1);
      ctx.lineTo(W, y2);
      ctx.strokeStyle = PALETTE.beamHighlight;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, y1 + 4);
      ctx.lineTo(W, y2 + 4);
      ctx.strokeStyle = PALETTE.beamShadow;
      ctx.stroke();
    });

    // Ladders — vertical rungs between adjacent sloped platforms
    LADDER_X.forEach((x, i) => {
      const topY = platformY(x, i);
      const botY = platformY(x, i + 1);
      ctx.strokeStyle = PALETTE.ladder;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(x - 3, topY);
      ctx.lineTo(x - 3, botY);
      ctx.moveTo(x + 3, topY);
      ctx.lineTo(x + 3, botY);
      ctx.stroke();
      for (let ry = topY + 3; ry < botY; ry += 6) {
        ctx.beginPath();
        ctx.moveTo(x - 3, ry);
        ctx.lineTo(x + 3, ry);
        ctx.stroke();
      }
    });

    // Goal: an original princess character (not based on any existing game's character
    // design) — small figure with a triangular dress and a simple crown.
    const gx = W / 2;
    const gy = platformY(W / 2, 0) - 16;
    // Dress (triangle)
    ctx.fillStyle = '#a154c4';
    ctx.beginPath();
    ctx.moveTo(gx, gy + 6);
    ctx.lineTo(gx - 6, gy + 16);
    ctx.lineTo(gx + 6, gy + 16);
    ctx.closePath();
    ctx.fill();
    // Head
    ctx.fillStyle = '#e8b08a';
    ctx.beginPath();
    ctx.arc(gx, gy + 2, 4, 0, Math.PI * 2);
    ctx.fill();
    // Hair
    ctx.fillStyle = '#4a2d1c';
    ctx.beginPath();
    ctx.arc(gx, gy + 1, 4.3, Math.PI * 0.85, Math.PI * 2.15);
    ctx.fill();
    // Crown
    ctx.fillStyle = '#f5c542';
    ctx.beginPath();
    ctx.moveTo(gx - 4, gy - 3);
    ctx.lineTo(gx - 2, gy - 7);
    ctx.lineTo(gx, gy - 3);
    ctx.lineTo(gx + 2, gy - 7);
    ctx.lineTo(gx + 4, gy - 3);
    ctx.closePath();
    ctx.fill();
    // Simple face
    ctx.fillStyle = '#3a2010';
    ctx.fillRect(gx - 2, gy + 1.5, 1, 1);
    ctx.fillRect(gx + 1, gy + 1.5, 1, 1);

    // Barrels — original round barrel with bands (a barrel shape is generic, not
    // specific to any one game)
    barrels.current.forEach((b) => {
      const by = platformY(b.x + BARREL_SIZE / 2, b.row) - BARREL_SIZE;
      ctx.fillStyle = PALETTE.barrel;
      ctx.beginPath();
      ctx.roundRect(b.x, by, BARREL_SIZE, BARREL_SIZE, 3);
      ctx.fill();
      ctx.strokeStyle = PALETTE.barrelBand;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(b.x + 1, by + 2);
      ctx.lineTo(b.x + BARREL_SIZE - 1, by + 2);
      ctx.moveTo(b.x + 1, by + BARREL_SIZE - 2);
      ctx.lineTo(b.x + BARREL_SIZE - 1, by + BARREL_SIZE - 2);
      ctx.stroke();
    });

    // Player — original rounded character with simple eyes
    const p = player.current;
    ctx.fillStyle = PALETTE.player;
    ctx.beginPath();
    ctx.roundRect(p.x, p.y, PLAYER_SIZE, PLAYER_SIZE, 3);
    ctx.fill();
    ctx.fillStyle = PALETTE.playerDark;
    ctx.fillRect(p.x + 2, p.y + 3, 1.6, 1.6);
    ctx.fillRect(p.x + 6, p.y + 3, 1.6, 1.6);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = W;
    canvas.height = H;
    player.current.y = platformY(player.current.x + PLAYER_SIZE / 2, 4) - PLAYER_SIZE;
    const tick = () => {
      rafRef.current = requestAnimationFrame(tick);
      if (status === 'playing') update();
      draw();
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [update, draw, status]);

  useEffect(() => {
    const onKeyDown = (e) => {
      keys.current[e.key] = true;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();
    };
    const onKeyUp = (e) => { keys.current[e.key] = false; };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  const restart = () => {
    resetPlayer();
    barrels.current = [];
    livesRef.current = 3;
    setLives(3);
    setRow(4);
    setStatus('playing');
  };

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
      <div style={{ position: 'relative' }}>
        <canvas ref={canvasRef} style={{ imageRendering: 'pixelated', border: '2px solid #14151a' }} />
        {status !== 'playing' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(10,12,16,0.85)',
              color: '#e8ecef',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              fontSize: 9,
              textAlign: 'center',
            }}
          >
            <div>{status === 'won' ? 'RESCUE COMPLETE!' : 'GAME OVER'}</div>
            <div onClick={restart} style={{ cursor: 'pointer', textDecoration: 'underline' }}>
              RETRY
            </div>
          </div>
        )}
      </div>

      {/* HUD panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 84 }}>
        <div className="gb-stat-box" style={{ background: PALETTE.player, borderColor: PALETTE.playerDark }}>
          <div className="gb-stat-label" style={{ color: '#0e3a1e' }}>LIVES</div>
          <div className="gb-stat-value" style={{ color: '#0e3a1e' }}>{lives}</div>
        </div>
        <div className="gb-stat-box" style={{ background: PALETTE.beam, borderColor: PALETTE.beamShadow }}>
          <div className="gb-stat-label" style={{ color: '#1c2733' }}>ROW</div>
          <div className="gb-stat-value" style={{ color: '#1c2733' }}>{5 - row}/5</div>
        </div>
        <div className="gb-stat-box" style={{ fontSize: 6, lineHeight: 1.6, padding: '8px 4px', background: PALETTE.ladder, borderColor: '#8a611f', color: '#3a2405' }}>
          ← → MOVE<br />↑ ↓ CLIMB<br />RESCUE HER
        </div>
      </div>
    </div>
  );
}
