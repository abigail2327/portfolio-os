// An original, stylized pixel-art skyline silhouette evoking Dubai's skyline at dusk —
// not traced from any photo, just simple geometric blocks including one distinctly
// tall tapering spire (a generic architectural silhouette, not a licensed asset).

function Windows({ w, h, buildingId }) {
  const cols = Math.max(1, Math.floor(w / 6));
  const rows = Math.max(1, Math.floor(h / 8));
  const windows = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // Deterministic pseudo-random lit windows based on position, so it doesn't
      // re-shuffle every render.
      const seed = (buildingId * 31 + r * 7 + c * 13) % 5;
      if (seed === 0) continue; // unlit
      windows.push(
        <div
          key={`${r}-${c}`}
          className="dubai-window"
          style={{ left: c * 6 + 2, bottom: r * 8 + 3, width: 2, height: 3 }}
        />
      );
    }
  }
  return windows;
}

function Building({ width, height, id }) {
  return (
    <div className="dubai-building" style={{ width, height, position: 'relative' }}>
      <Windows w={width} h={height} buildingId={id} />
    </div>
  );
}

// The tall tapering spire — built from stacked segments that narrow toward the top,
// echoing a generic "tallest tower" silhouette without copying any specific building's
// actual architectural drawings.
function Spire() {
  const segments = [
    { w: 34, h: 40 },
    { w: 28, h: 40 },
    { w: 22, h: 50 },
    { w: 16, h: 50 },
    { w: 10, h: 60 },
    { w: 5, h: 50 },
    { w: 2, h: 40 },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {segments
        .slice()
        .reverse()
        .map((s, i) => (
          <div
            key={i}
            className="dubai-building"
            style={{ width: s.w, height: s.h, position: 'relative' }}
          >
            <Windows w={s.w} h={s.h} buildingId={i + 50} />
          </div>
        ))}
    </div>
  );
}

const BUILDINGS_LEFT = [
  { width: 46, height: 130 },
  { width: 30, height: 90 },
  { width: 38, height: 160 },
  { width: 24, height: 70 },
  { width: 42, height: 120 },
];
const BUILDINGS_RIGHT = [
  { width: 40, height: 110 },
  { width: 26, height: 80 },
  { width: 44, height: 150 },
  { width: 30, height: 95 },
  { width: 36, height: 130 },
];

export default function DubaiSkyline() {
  return (
    <>
      <div className="dubai-sun" style={{ width: 90, height: 90, top: '18%', left: '50%', transform: 'translateX(-50%)' }} />
      <div className="dubai-skyline">
        {BUILDINGS_LEFT.map((b, i) => (
          <Building key={`l${i}`} width={b.width} height={b.height} id={i} />
        ))}
        <Spire />
        {BUILDINGS_RIGHT.map((b, i) => (
          <Building key={`r${i}`} width={b.width} height={b.height} id={i + 20} />
        ))}
      </div>
    </>
  );
}
