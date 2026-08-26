import { useRef, useEffect, useState, useCallback } from 'react';
import { playClick } from '../utils/sound';

const PALETTE = [
  '#000000', '#7f7f7f', '#880015', '#ed1c24', '#ff7f27', '#fff200', '#22b14c', '#00a2e8', '#3f48cc', '#a349a4',
  '#ffffff', '#c3c3c3', '#b97a57', '#ffaec9', '#ffc90e', '#efe4b0', '#b5e61d', '#99d9ea', '#7092be', '#c8bfe7',
];

const TOOLS = [
  { id: 'pencil', label: 'Pencil' },
  { id: 'eraser', label: 'Eraser' },
  { id: 'fill', label: 'Fill' },
  { id: 'eyedropper', label: 'Picker' },
  { id: 'line', label: 'Line' },
  { id: 'rect', label: 'Rectangle' },
  { id: 'ellipse', label: 'Ellipse' },
];

const SIZES = [1, 3, 6, 10];
const CANVAS_BG = '#ffffff';

function ToolIcon({ id }) {
  const stroke = '#1c1f26';
  switch (id) {
    case 'pencil':
      return (
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path d="M4 17.5 15.5 6l2.5 2.5L6.5 20H4v-2.5z" fill="none" stroke={stroke} strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      );
    case 'eraser':
      return (
        <svg viewBox="0 0 24 24" width="18" height="18">
          <rect x="5" y="11" width="14" height="8" rx="1" fill="none" stroke={stroke} strokeWidth="1.6" transform="rotate(-20 12 15)" />
        </svg>
      );
    case 'fill':
      return (
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path d="M5 12l7-7 7 7-7 7z" fill="none" stroke={stroke} strokeWidth="1.6" strokeLinejoin="round" />
          <ellipse cx="12" cy="19" rx="3" ry="2" fill={stroke} />
        </svg>
      );
    case 'eyedropper':
      return (
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path d="M15 5l4 4-9 9-4-4 9-9z" fill="none" stroke={stroke} strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M5 19l1.5-4 2.5 2.5L5 19z" fill={stroke} />
        </svg>
      );
    case 'line':
      return <svg viewBox="0 0 24 24" width="18" height="18"><line x1="4" y1="20" x2="20" y2="4" stroke={stroke} strokeWidth="1.8" /></svg>;
    case 'rect':
      return <svg viewBox="0 0 24 24" width="18" height="18"><rect x="4" y="6" width="16" height="12" fill="none" stroke={stroke} strokeWidth="1.6" /></svg>;
    case 'ellipse':
      return <svg viewBox="0 0 24 24" width="18" height="18"><ellipse cx="12" cy="12" rx="8" ry="6" fill="none" stroke={stroke} strokeWidth="1.6" /></svg>;
    default:
      return null;
  }
}

function hexToRgba(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 255];
}

function floodFill(ctx, canvas, x, y, fillColor) {
  const { width, height } = canvas;
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  const startIdx = (y * width + x) * 4;
  const startColor = [data[startIdx], data[startIdx + 1], data[startIdx + 2], data[startIdx + 3]];
  const fill = hexToRgba(fillColor);
  if (startColor.every((v, i) => v === fill[i])) return;

  const matches = (idx) =>
    data[idx] === startColor[0] &&
    data[idx + 1] === startColor[1] &&
    data[idx + 2] === startColor[2] &&
    data[idx + 3] === startColor[3];

  const stack = [[x, y]];
  while (stack.length) {
    const [cx, cy] = stack.pop();
    if (cx < 0 || cy < 0 || cx >= width || cy >= height) continue;
    const idx = (cy * width + cx) * 4;
    if (!matches(idx)) continue;
    data[idx] = fill[0];
    data[idx + 1] = fill[1];
    data[idx + 2] = fill[2];
    data[idx + 3] = fill[3];
    stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
  }
  ctx.putImageData(imgData, 0, 0);
}

export default function Paint() {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const snapshotRef = useRef(null);
  const drawing = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const last = useRef({ x: 0, y: 0 });
  const [color, setColor] = useState('#ed1c24');
  const [bgColor, setBgColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(SIZES[1]);
  const [tool, setTool] = useState('pencil');
  const [openMenu, setOpenMenu] = useState(null);
  const prevToolRef = useRef('pencil');

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const resize = () => {
      const { width, height } = wrap.getBoundingClientRect();
      const prev = document.createElement('canvas');
      prev.width = canvas.width;
      prev.height = canvas.height;
      if (canvas.width && canvas.height) prev.getContext('2d').drawImage(canvas, 0, 0);
      canvas.width = Math.max(1, width - 24);
      canvas.height = Math.max(1, height - 24);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = CANVAS_BG;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      if (prev.width && prev.height) ctx.drawImage(prev, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: Math.round(e.clientX - rect.left), y: Math.round(e.clientY - rect.top) };
  };

  const strokeLine = (ctx, from, to, strokeColor) => {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  };

  const onPointerDown = useCallback(
    (e) => {
      const pos = getPos(e);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (tool === 'eyedropper') {
        const pixel = ctx.getImageData(pos.x, pos.y, 1, 1).data;
        const hex = `#${[pixel[0], pixel[1], pixel[2]].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
        setColor(hex);
        setTool(prevToolRef.current);
        return;
      }
      if (tool === 'fill') {
        floodFill(ctx, canvas, pos.x, pos.y, color);
        return;
      }
      if (tool !== 'eraser') prevToolRef.current = tool;

      drawing.current = true;
      startPos.current = pos;
      last.current = pos;
      e.currentTarget.setPointerCapture?.(e.pointerId);

      if (tool === 'line' || tool === 'rect' || tool === 'ellipse') {
        snapshotRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
      }
    },
    [tool, color]
  );

  const onPointerMove = useCallback(
    (e) => {
      if (!drawing.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const pos = getPos(e);

      if (tool === 'pencil') {
        strokeLine(ctx, last.current, pos, color);
        last.current = pos;
      } else if (tool === 'eraser') {
        strokeLine(ctx, last.current, pos, CANVAS_BG);
        last.current = pos;
      } else if (tool === 'line') {
        ctx.putImageData(snapshotRef.current, 0, 0);
        strokeLine(ctx, startPos.current, pos, color);
      } else if (tool === 'rect') {
        ctx.putImageData(snapshotRef.current, 0, 0);
        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize;
        const w = pos.x - startPos.current.x;
        const h = pos.y - startPos.current.y;
        ctx.strokeRect(startPos.current.x, startPos.current.y, w, h);
      } else if (tool === 'ellipse') {
        ctx.putImageData(snapshotRef.current, 0, 0);
        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize;
        const rx = Math.abs(pos.x - startPos.current.x) / 2;
        const ry = Math.abs(pos.y - startPos.current.y) / 2;
        const cx = (pos.x + startPos.current.x) / 2;
        const cy = (pos.y + startPos.current.y) / 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    },
    [tool, color, brushSize]
  );

  const onPointerUp = useCallback(() => {
    drawing.current = false;
    snapshotRef.current = null;
  }, []);

  const handleClear = () => {
    playClick();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = CANVAS_BG;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setOpenMenu(null);
  };

  const handleSave = () => {
    playClick();
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'doodle.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    setOpenMenu(null);
  };

  const MENUS = {
    File: [
      { label: 'New', onClick: handleClear },
      { label: 'Save As…', onClick: handleSave },
    ],
    Edit: [{ label: 'Clear canvas', onClick: handleClear }],
    View: [{ label: 'Zoom: 100%', onClick: () => setOpenMenu(null) }],
    Image: [{ label: 'Clear canvas', onClick: handleClear }],
    Colors: [{ label: 'Edit colors…', onClick: () => setOpenMenu(null) }],
    Help: [{ label: 'About Paint', onClick: () => { alert('A tiny original doodle app.'); setOpenMenu(null); } }],
  };

  return (
    <div className="paint-app" onClick={() => openMenu && setOpenMenu(null)}>
      {/* Menu bar */}
      <div className="paint-menubar">
        {Object.keys(MENUS).map((m) => (
          <div key={m} className="paint-menu-wrap">
            <span
              className={`paint-menu-label${openMenu === m ? ' open' : ''}`}
              onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === m ? null : m); }}
            >
              {m}
            </span>
            {openMenu === m && (
              <div className="paint-dropdown" onClick={(e) => e.stopPropagation()}>
                {MENUS[m].map((item) => (
                  <div key={item.label} className="paint-dropdown-item" onClick={item.onClick}>
                    {item.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="paint-body">
        {/* Toolbox */}
        <div className="paint-toolbox">
          <div className="paint-tool-grid">
            {TOOLS.map((t) => (
              <div
                key={t.id}
                className={`paint-tool-btn${tool === t.id ? ' active' : ''}`}
                title={t.label}
                onClick={() => setTool(t.id)}
              >
                <ToolIcon id={t.id} />
              </div>
            ))}
          </div>
          <div className="paint-tool-options">
            <div style={{ fontSize: 10.5, color: '#555', marginBottom: 4 }}>Line width</div>
            {SIZES.map((s) => (
              <div
                key={s}
                className={`paint-size-row${brushSize === s ? ' active' : ''}`}
                onClick={() => setBrushSize(s)}
              >
                <div style={{ width: 30, height: Math.max(2, s), background: '#000' }} />
              </div>
            ))}
          </div>
        </div>

        {/* Canvas area */}
        <div className="paint-canvas-area" ref={wrapRef}>
          <canvas
            ref={canvasRef}
            className="paint-canvas"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
          />
        </div>
      </div>

      {/* Color palette */}
      <div className="paint-palette-bar">
        <div className="paint-swatch-indicator">
          <div className="paint-swatch-bg" style={{ background: bgColor }} />
          <div className="paint-swatch-fg" style={{ background: color }} />
        </div>
        <div className="paint-palette-grid">
          {PALETTE.map((c) => (
            <div
              key={c}
              className="paint-palette-cell"
              style={{ background: c }}
              onClick={() => setColor(c)}
              onContextMenu={(e) => { e.preventDefault(); setBgColor(c); }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
