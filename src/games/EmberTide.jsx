import { useEffect, useRef, useState, useCallback } from 'react';
import { playClick, playError } from '../utils/sound';

const SHADE = ['#9bbc0f', '#8bac0f', '#306230', '#0f380f'];
// Original color palette for this game specifically — a Game Boy *Color* plays colorful
// games, so this one breaks from the monochrome DMG look on purpose. Stone-dungeon mood,
// original character designs (not a reproduction of any existing game's character art).
const PALETTE = {
  bgDark: '#3a3d33',
  bgMid: '#54574a',
  brick: '#8b8d78',
  brickLine: '#6d6f5c',
  lavaTop: '#ff5a2b',
  lavaCore: '#c72e0e',
  waterTop: '#7fd6ff',
  waterCore: '#2a8fd6',
  ember: '#ff6a2b',
  emberFlame: '#ffcf4d',
  tide: '#3aa0ff',
  tideCap: '#bfe6ff',
  doorEmber: '#c94a1e',
  doorTide: '#1e6fb0',
};
const W = 126, H = 154;
const TILE = 14;

// Tile legend: 0 empty, 1 platform, 2 lava (kills Tide/water char), 3 water (kills Ember/fire char)
// E = Ember door, T = Tide door
const LEVEL = [
  '..........',
  '..........',
  '.E......T.',
  '11.....111',
  '..........',
  '...2222...',
  '111....111',
  '..........',
  '.3333.....',
  '111....111',
  '..........',
  '11111111..',
];

function parseLevel() {
  const tiles = [];
  let emberStart = { x: 1, y: 0 };
  let tideStart = { x: 8, y: 0 };
  let emberDoor = { x: 1, y: 0 };
  let tideDoor = { x: 8, y: 0 };
  LEVEL.forEach((row, r) => {
    for (let c = 0; c < row.length; c++) {
      const ch = row[c];
      if (ch === '1') tiles.push({ x: c, y: r, type: 1 });
      else if (ch === '2') tiles.push({ x: c, y: r, type: 2 });
      else if (ch === '3') tiles.push({ x: c, y: r, type: 3 });
      else if (ch === 'E') emberDoor = { x: c, y: r };
      else if (ch === 'T') tideDoor = { x: c, y: r };
    }
  });
  return { tiles, emberDoor, tideDoor, emberStart: { x: 1, y: 10 }, tideStart: { x: 8, y: 10 } };
}

function makeChar(start) {
  return { x: start.x * TILE, y: start.y * TILE, vx: 0, vy: 0, onGround: false, dead: false, won: false };
}

export default function EmberTide() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const level = useRef(parseLevel());
  const ember = useRef(makeChar(level.current.emberStart));
  const tide = useRef(makeChar(level.current.tideStart));
  const keys = useRef({});
  const [status, setStatus] = useState('playing'); // playing | dead | won

  const solidAt = useCallback((px, py) => {
    const tx = Math.floor(px / TILE);
    const ty = Math.floor(py / TILE);
    return level.current.tiles.find((t) => t.x === tx && t.y === ty && t.type === 1);
  }, []);

  const hazardAt = useCallback((px, py, type) => {
    const tx = Math.floor(px / TILE);
    const ty = Math.floor(py / TILE);
    return level.current.tiles.some((t) => t.x === tx && t.y === ty && t.type === type);
  }, []);

  const physicsStep = useCallback(
    (char, hazardType, controls) => {
      if (char.dead || char.won) return;
      const left = keys.current[controls[0]];
      const right = keys.current[controls[1]];
      const jump = keys.current[controls[2]];

      char.vx = left ? -1.6 : right ? 1.6 : 0;
      if (jump && char.onGround) {
        char.vy = -4.6;
        char.onGround = false;
      }
      char.vy += 0.28; // gravity
      if (char.vy > 5) char.vy = 5;

      let nx = char.x + char.vx;
      let ny = char.y + char.vy;

      // Horizontal collision (feet + head corners)
      if (solidAt(nx + (char.vx > 0 ? 9 : 0), char.y) || solidAt(nx + (char.vx > 0 ? 9 : 0), char.y + 9)) {
        nx = char.x;
      }
      // Vertical collision
      char.onGround = false;
      if (char.vy > 0 && (solidAt(nx, ny + 10) || solidAt(nx + 9, ny + 10))) {
        ny = Math.floor((ny + 10) / TILE) * TILE - 10;
        char.vy = 0;
        char.onGround = true;
      } else if (char.vy < 0 && (solidAt(nx, ny) || solidAt(nx + 9, ny))) {
        ny = Math.ceil(ny / TILE) * TILE;
        char.vy = 0;
      }
      nx = Math.max(0, Math.min(W - 10, nx));
      ny = Math.max(0, Math.min(H - 10, ny));
      char.x = nx;
      char.y = ny;

      if (hazardAt(char.x + 5, char.y + 5, hazardType)) {
        char.dead = true;
      }
    },
    [solidAt, hazardAt]
  );

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Background: dark stone dungeon backdrop
    ctx.fillStyle = PALETTE.bgDark;
    ctx.fillRect(0, 0, W, H);
    for (let y = 0; y < H; y += TILE) {
      for (let x = 0; x < W; x += TILE) {
        if ((x / TILE + y / TILE) % 2 === 0) {
          ctx.fillStyle = PALETTE.bgMid;
          ctx.fillRect(x, y, TILE, TILE);
        }
      }
    }

    level.current.tiles.forEach((t) => {
      const px = t.x * TILE;
      const py = t.y * TILE;
      if (t.type === 1) {
        // Brick platform with a mortar-line detail
        ctx.fillStyle = PALETTE.brick;
        ctx.fillRect(px, py, TILE - 1, TILE - 1);
        ctx.fillStyle = PALETTE.brickLine;
        ctx.fillRect(px, py + TILE - 4, TILE - 1, 1.5);
        ctx.fillRect(px + TILE / 2, py, 1.5, TILE - 4);
      } else if (t.type === 2) {
        // Lava: bright glowing top edge over a darker core
        ctx.fillStyle = PALETTE.lavaCore;
        ctx.fillRect(px, py, TILE - 1, TILE - 1);
        ctx.fillStyle = PALETTE.lavaTop;
        ctx.fillRect(px, py, TILE - 1, 4);
      } else if (t.type === 3) {
        // Water: pale ripple top over a deeper blue core
        ctx.fillStyle = PALETTE.waterCore;
        ctx.fillRect(px, py, TILE - 1, TILE - 1);
        ctx.fillStyle = PALETTE.waterTop;
        ctx.fillRect(px, py, TILE - 1, 4);
      }
    });

    // Doors — colored frames matching each character
    const drawDoor = (door, color) => {
      const px = door.x * TILE;
      const py = door.y * TILE;
      ctx.fillStyle = color;
      ctx.fillRect(px + 1, py, TILE - 3, TILE - 2);
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fillRect(px + 2, py + 1, 2, TILE - 5);
    };
    drawDoor(level.current.emberDoor, PALETTE.doorEmber);
    drawDoor(level.current.tideDoor, PALETTE.doorTide);

    // Ember — warm rounded body with a small flame topper
    if (!ember.current.dead) {
      const ex = ember.current.x;
      const ey = ember.current.y;
      ctx.fillStyle = PALETTE.ember;
      ctx.beginPath();
      ctx.roundRect(ex, ey + 2, 10, 8, 2);
      ctx.fill();
      ctx.fillStyle = PALETTE.emberFlame;
      ctx.beginPath();
      ctx.moveTo(ex + 5, ey - 3);
      ctx.lineTo(ex + 8, ey + 3);
      ctx.lineTo(ex + 2, ey + 3);
      ctx.closePath();
      ctx.fill();
    }

    // Tide — cool rounded body with a small droplet cap
    if (!tide.current.dead) {
      const tx = tide.current.x;
      const ty = tide.current.y;
      ctx.fillStyle = PALETTE.tide;
      ctx.beginPath();
      ctx.roundRect(tx, ty + 2, 10, 8, 2);
      ctx.fill();
      ctx.fillStyle = PALETTE.tideCap;
      ctx.beginPath();
      ctx.ellipse(tx + 5, ty + 1, 4, 3, 0, Math.PI, 0);
      ctx.fill();
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = W;
    canvas.height = H;

    const tick = () => {
      rafRef.current = requestAnimationFrame(tick);
      if (status === 'playing') {
        physicsStep(ember.current, 3, ['a', 'd', 'w']); // Ember: WASD, dies in water(3)
        physicsStep(tide.current, 2, ['ArrowLeft', 'ArrowRight', 'ArrowUp']); // Tide: arrows, dies in lava(2)

        if (ember.current.dead || tide.current.dead) {
          setStatus('dead');
          playError();
        } else {
          const eAtDoor =
            Math.abs(ember.current.x - level.current.emberDoor.x * TILE) < 8 &&
            Math.abs(ember.current.y - level.current.emberDoor.y * TILE) < 8;
          const tAtDoor =
            Math.abs(tide.current.x - level.current.tideDoor.x * TILE) < 8 &&
            Math.abs(tide.current.y - level.current.tideDoor.y * TILE) < 8;
          if (eAtDoor && tAtDoor) {
            setStatus('won');
            playClick();
          }
        }
      }
      draw();
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [physicsStep, draw, status]);

  useEffect(() => {
    const onKeyDown = (e) => { keys.current[e.key] = true; };
    const onKeyUp = (e) => { keys.current[e.key] = false; };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  const restart = () => {
    level.current = parseLevel();
    ember.current = makeChar(level.current.emberStart);
    tide.current = makeChar(level.current.tideStart);
    setStatus('playing');
  };

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <div style={{ fontSize: 9, color: '#2a2c22', fontWeight: 700 }}>EMBER &amp; TIDE</div>
        <div style={{ position: 'relative' }}>
          <canvas ref={canvasRef} style={{ imageRendering: 'pixelated', border: '2px solid #2a2c22' }} />
          {status !== 'playing' && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(20,16,10,0.85)',
                color: '#fff2d6',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                fontSize: 9,
                textAlign: 'center',
              }}
            >
              <div>{status === 'won' ? 'BOTH MADE IT!' : 'ONE FELL...'}</div>
              <div onClick={restart} style={{ cursor: 'pointer', textDecoration: 'underline' }}>
                RETRY
              </div>
            </div>
          )}
        </div>
        <div style={{ fontSize: 7, color: '#2a2c22', textAlign: 'center', lineHeight: 1.5 }}>
          EMBER: A D MOVE · W JUMP<br />TIDE: ARROWS TO MOVE/JUMP
        </div>
      </div>

      {/* HUD panel: per-character status */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 84 }}>
        <div className="gb-stat-box" style={{ background: PALETTE.ember, borderColor: '#8a2f0e' }}>
          <div className="gb-stat-label" style={{ color: '#3a1204' }}>EMBER</div>
          <div className="gb-stat-value" style={{ fontSize: 9, color: '#3a1204' }}>
            {ember.current.dead ? 'OUT' : status === 'won' ? 'SAFE' : 'OK'}
          </div>
        </div>
        <div className="gb-stat-box" style={{ background: PALETTE.tide, borderColor: '#124a7a' }}>
          <div className="gb-stat-label" style={{ color: '#062038' }}>TIDE</div>
          <div className="gb-stat-value" style={{ fontSize: 9, color: '#062038' }}>
            {tide.current.dead ? 'OUT' : status === 'won' ? 'SAFE' : 'OK'}
          </div>
        </div>
        <div className="gb-stat-box" style={{ padding: '6px 3px', background: PALETTE.brick, borderColor: '#4a4c3e' }}>
          <div className="gb-stat-label" style={{ marginBottom: 4, color: '#2a2c22' }}>HAZARDS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <div style={{ width: 8, height: 8, background: PALETTE.waterCore }} />
              <span style={{ fontSize: 6, color: '#2a2c22' }}>WATER</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <div style={{ width: 8, height: 8, background: PALETTE.lavaCore }} />
              <span style={{ fontSize: 6, color: '#2a2c22' }}>LAVA</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
