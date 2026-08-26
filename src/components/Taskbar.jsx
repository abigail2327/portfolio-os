import { useEffect, useState } from 'react';
import { useWindowStore } from '../store/windowStore';
import { ICONS } from './Icons';
import { playClick } from '../utils/sound';

function Clock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(t);
  }, []);
  const time = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  return <div className="taskbar-clock">{time}</div>;
}

export default function Taskbar() {
  const windows = useWindowStore((s) => s.windows);
  const focusWindow = useWindowStore((s) => s.focusWindow);
  const restoreWindow = useWindowStore((s) => s.restoreWindow);
  const minimizeWindow = useWindowStore((s) => s.minimizeWindow);
  const toggleStartMenu = useWindowStore((s) => s.toggleStartMenu);

  const topZ = windows.reduce((max, w) => (w.minimized ? max : Math.max(max, w.z)), -1);

  const handleClick = (win) => {
    playClick();
    if (win.minimized) {
      restoreWindow(win.id);
    } else if (win.z === topZ) {
      minimizeWindow(win.id);
    } else {
      focusWindow(win.id);
    }
  };

  return (
    <div className="taskbar">
      <button className="start-button" onClick={() => { playClick(); toggleStartMenu(); }}>
        ★ Start
      </button>
      <div className="taskbar-divider" />
      {windows.map((win) => {
        const Icon = ICONS[win.icon] || ICONS.file;
        return (
          <div
            key={win.id}
            className={`taskbar-item${!win.minimized && win.z === topZ ? ' active' : ''}`}
            onClick={() => handleClick(win)}
          >
            <Icon size={16} />
            <span>{win.title}</span>
          </div>
        );
      })}
      <Clock />
    </div>
  );
}
