import { useWindowStore } from '../store/windowStore';
import { APPS } from '../data/apps';
import { ICONS } from './Icons';
import { playClick } from '../utils/sound';

const MENU_APPS = ['explorer', 'aboutMe', 'contact', 'gameboy', 'paint', 'terminal', 'settings'];

export default function StartMenu() {
  const startMenuOpen = useWindowStore((s) => s.startMenuOpen);
  const closeStartMenu = useWindowStore((s) => s.closeStartMenu);
  const openWindow = useWindowStore((s) => s.openWindow);

  if (!startMenuOpen) return null;

  const launch = (appId) => {
    playClick();
    const def = APPS[appId];
    openWindow(appId, { title: def.title, icon: def.icon, width: def.width, height: def.height });
    closeStartMenu();
  };

  return (
    <div className="start-menu" onMouseDown={(e) => e.stopPropagation()}>
      <div className="start-menu-header">Abigail's Desktop</div>
      {MENU_APPS.map((appId) => {
        const def = APPS[appId];
        const Icon = ICONS[def.icon] || ICONS.file;
        return (
          <div key={appId} className="start-menu-item" onClick={() => launch(appId)}>
            <Icon size={20} />
            <span>{def.title}</span>
          </div>
        );
      })}
    </div>
  );
}
