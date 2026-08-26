import { useWindowStore } from '../store/windowStore';

const WALLPAPERS = [
  { label: 'Sky & Hill', swatchClass: 'wallpaper-swatch-1' },
  { label: 'Nebula', swatchClass: 'wallpaper-swatch-2' },
  { label: 'Sunset', swatchClass: 'wallpaper-swatch-3' },
  { label: 'Dubai Skyline', swatchClass: 'wallpaper-swatch-4' },
];

export default function Settings() {
  const wallpaperIndex = useWindowStore((s) => s.wallpaperIndex);
  const setWallpaper = useWindowStore((s) => s.setWallpaper);
  const audioEnabled = useWindowStore((s) => s.audioEnabled);
  const setAudioEnabled = useWindowStore((s) => s.setAudioEnabled);
  const resetDesktop = useWindowStore((s) => s.resetDesktop);

  const handleReset = () => {
    if (confirm('Reset the desktop back to default? This clears your local layout, wallpaper, and open windows.')) {
      resetDesktop();
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <div
        style={{
          fontSize: 11.5,
          color: 'var(--text-dim)',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 6,
          padding: '8px 10px',
          marginBottom: 18,
          lineHeight: 1.5,
        }}
      >
        Changes here only affect <em>your</em> browser — they're saved locally on this
        device, not published to the live site. Only the site owner can change what every
        visitor sees by default.
      </div>

      <h3 style={{ fontSize: 13.5, margin: '0 0 10px' }}>Wallpaper</h3>
      <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
        {WALLPAPERS.map((wp, i) => (
          <div
            key={wp.label}
            onClick={() => setWallpaper(i)}
            className={wp.swatchClass}
            style={{
              width: 64,
              height: 44,
              borderRadius: 6,
              cursor: 'pointer',
              border: wallpaperIndex === i ? '2px solid var(--accent)' : '2px solid transparent',
              boxSizing: 'content-box',
            }}
            title={wp.label}
          />
        ))}
      </div>

      <h3 style={{ fontSize: 13.5, margin: '0 0 10px' }}>Sound</h3>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginBottom: 22, cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={audioEnabled}
          onChange={(e) => setAudioEnabled(e.target.checked)}
        />
        UI sounds enabled
      </label>

      <h3 style={{ fontSize: 13.5, margin: '0 0 10px' }}>About this OS</h3>
      <p style={{ fontSize: 12.5, color: 'var(--text-dim)', lineHeight: 1.6, marginBottom: 18 }}>
        Built with React, Vite, Zustand, and Framer Motion. Projects sync live from{' '}
        <a href="https://github.com/abigail2327" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-2)' }}>
          github.com/abigail2327
        </a>
        . Concept inspired by{' '}
        <a href="https://github.com/DustinBrett/daedalOS" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-2)' }}>
          daedalOS
        </a>
        .
      </p>

      <button
        onClick={handleReset}
        style={{
          fontSize: 12.5,
          padding: '8px 14px',
          borderRadius: 6,
          border: '1px solid rgba(255,255,255,0.2)',
          background: 'rgba(255,255,255,0.05)',
          color: 'var(--text-light)',
          cursor: 'pointer',
        }}
      >
        Reset desktop to default
      </button>
    </div>
  );
}
