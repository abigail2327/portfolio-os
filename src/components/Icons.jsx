// Small inline SVG icon set — kept dependency-free (no icon library needed for 4-6 icons).

export function FolderIcon({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <defs>
        <linearGradient id="folderBack" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffd35c" />
          <stop offset="100%" stopColor="#f5a623" />
        </linearGradient>
        <linearGradient id="folderFront" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffe49a" />
          <stop offset="55%" stopColor="#ffc63d" />
          <stop offset="100%" stopColor="#f5a623" />
        </linearGradient>
      </defs>
      <path d="M4 10.5A2.5 2.5 0 0 1 6.5 8h10l3.2 3.6H41.5A2.5 2.5 0 0 1 44 14v2.5H4z" fill="url(#folderBack)" />
      <rect x="3" y="15" width="42" height="27" rx="3" fill="url(#folderFront)" />
      <path d="M3 18a3 3 0 0 1 3-3h36a3 3 0 0 1 3 3v1.5H3z" fill="rgba(255,255,255,0.55)" />
      <rect x="3" y="15" width="42" height="27" rx="3" fill="none" stroke="rgba(150, 95, 10, 0.35)" strokeWidth="0.6" />
    </svg>
  );
}

export function AboutMeIcon({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <rect x="6" y="4" width="36" height="40" rx="3" fill="#f4e9d8" />
      <rect x="6" y="4" width="36" height="40" rx="3" fill="none" stroke="#c9b896" strokeWidth="1" />
      <circle cx="24" cy="17" r="6" fill="#e59a6b" />
      <path d="M12 38c1-7 6-11 12-11s11 4 12 11" fill="#8a6a4a" />
      <rect x="11" y="10" width="10" height="2" fill="#c9b896" />
    </svg>
  );
}

export function ContactIcon({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <rect x="4" y="10" width="40" height="28" rx="3" fill="#5aa9e6" />
      <path d="M4 12l20 15L44 12" fill="none" stroke="#eaf6ff" strokeWidth="2.5" />
    </svg>
  );
}

export function GameboyIcon({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <rect x="10" y="2" width="24" height="44" rx="4" fill="#e0447e" stroke="#a12b58" strokeWidth="1" />
      <rect x="14" y="7" width="16" height="13" rx="1.5" fill="#1c1f26" />
      <rect x="15.5" y="8.5" width="13" height="10" fill="#8ea86b" />
      <circle cx="17" cy="27" r="2.6" fill="#2a2a2a" />
      <rect x="15.7" y="25.7" width="2.6" height="7.8" fill="#2a2a2a" />
      <rect x="13.1" y="24.7" width="7.8" height="2.6" fill="#2a2a2a" transform="rotate(0 17 27)" />
      <rect x="13.1" y="25.7" width="7.8" height="2.6" fill="#2a2a2a" />
      <circle cx="27" cy="34" r="1.8" fill="#7a1638" />
      <circle cx="31.5" cy="31.5" r="1.8" fill="#7a1638" />
    </svg>
  );
}

export function FileIcon({ size = 48, color = '#9fb6ff' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <path d="M10 4h18l10 10v30H10z" fill={color} />
      <path d="M28 4l10 10H28z" fill="rgba(255,255,255,0.5)" />
    </svg>
  );
}

export function TerminalIcon({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <rect x="4" y="8" width="40" height="32" rx="3" fill="#111318" stroke="#3a3f4b" strokeWidth="1" />
      <path d="M10 18l7 6-7 6" fill="none" stroke="#4ad0ff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="21" y="29" width="14" height="2.6" fill="#4ad0ff" />
    </svg>
  );
}

export function MyPcIcon({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <rect x="4" y="8" width="40" height="24" rx="2" fill="#5aa9e6" />
      <rect x="7" y="11" width="34" height="18" fill="#0e1620" />
      <rect x="18" y="34" width="12" height="4" fill="#8a8f9a" />
      <rect x="12" y="38" width="24" height="3" rx="1.5" fill="#8a8f9a" />
    </svg>
  );
}

export function GearIcon({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <circle cx="24" cy="24" r="8" fill="#b7bfcf" />
      <circle cx="24" cy="24" r="4" fill="#5a6478" />
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i * Math.PI) / 4;
        const x1 = 24 + Math.cos(angle) * 13;
        const y1 = 24 + Math.sin(angle) * 13;
        const x2 = 24 + Math.cos(angle) * 19;
        const y2 = 24 + Math.sin(angle) * 19;
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#8b93a5"
            strokeWidth="6"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

export function PaintIcon({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <path
        d="M24 4C13 4 4 12.5 4 23c0 7 5 11 10 11h3.2c1.5 0 2.7 1.2 2.7 2.7 0 .9-.4 1.6-.9 2.2-.6.7-1 1.6-1 2.6 0 2 1.8 3.5 5 3.5 11 0 20-9 20-19C43 12.5 34 4 24 4z"
        fill="#f2f2f2"
      />
      <circle cx="14" cy="20" r="3.4" fill="#e5484d" />
      <circle cx="22" cy="13" r="3.4" fill="#f5a623" />
      <circle cx="32" cy="16" r="3.4" fill="#4ad0ff" />
      <circle cx="35" cy="26" r="3.4" fill="#5ec26a" />
      <circle cx="18" cy="30" r="3.4" fill="#b968e0" />
    </svg>
  );
}

export const ICONS = {
  folder: FolderIcon,
  aboutMe: AboutMeIcon,
  contact: ContactIcon,
  gameboy: GameboyIcon,
  file: FileIcon,
  terminal: TerminalIcon,
  mypc: MyPcIcon,
  settings: GearIcon,
  paint: PaintIcon,
};
