import { useEffect, useRef } from 'react';
import { useWindowStore } from '../store/windowStore';
import DesktopIcons from './DesktopIcons';
import Taskbar from './Taskbar';
import StartMenu from './StartMenu';
import WindowManager from './WindowManager';
import ContextMenu from './ContextMenu';
import DubaiSkyline from './DubaiSkyline';

export default function Desktop() {
  const closeStartMenu = useWindowStore((s) => s.closeStartMenu);
  const closeContextMenu = useWindowStore((s) => s.closeContextMenu);
  const openContextMenu = useWindowStore((s) => s.openContextMenu);
  const cycleWallpaper = useWindowStore((s) => s.cycleWallpaper);
  const wallpaperIndex = useWindowStore((s) => s.wallpaperIndex);

  const openWindow = useWindowStore((s) => s.openWindow);

  useEffect(() => {
    const onKeyDown = (e) => {
      // Ignore shortcuts while typing in an input/textarea (e.g. the Terminal app).
      const tag = document.activeElement?.tagName;
      const isTyping = tag === 'INPUT' || tag === 'TEXTAREA';

      if (e.key === 'Escape') {
        const state = useWindowStore.getState();
        if (state.contextMenu) {
          state.closeContextMenu();
          return;
        }
        if (state.startMenuOpen) {
          state.closeStartMenu();
          return;
        }
        const open = state.windows.filter((w) => !w.minimized);
        if (open.length) {
          const top = open.reduce((a, b) => (b.z > a.z ? b : a));
          state.closeWindow(top.id);
        }
        return;
      }

      if (e.altKey && e.key === 'Tab' && !isTyping) {
        e.preventDefault();
        useWindowStore.getState().cycleFocus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleDesktopContextMenu = (e) => {
    e.preventDefault();
    openContextMenu(e.clientX, e.clientY, [
      {
        label: 'New Folder',
        onClick: () => {
          // Placeholder — creating real custom folders is a later phase; for now this is a
          // friendly no-op so right-click behaves the way people expect it to.
        },
      },
      { label: 'Change wallpaper', onClick: cycleWallpaper },
      {
        label: 'Open Settings',
        onClick: () => openWindow('settings', { title: 'Settings', icon: 'settings', width: 460, height: 480 }),
      },
      { label: 'Refresh', onClick: () => {} },
    ]);
  };

  const desktopLongPress = useRef(null);
  const onDesktopPointerDown = (e) => {
    if (e.pointerType !== 'touch' || e.target !== e.currentTarget) return;
    const { clientX, clientY } = e;
    desktopLongPress.current = setTimeout(() => {
      desktopLongPress.current = null;
      handleDesktopContextMenu({ preventDefault: () => {}, clientX, clientY });
    }, 480);
  };
  const clearDesktopLongPress = () => {
    if (desktopLongPress.current) {
      clearTimeout(desktopLongPress.current);
      desktopLongPress.current = null;
    }
  };

  return (
    <div
      className={`desktop-root wallpaper-${wallpaperIndex + 1}`}
      onMouseDown={() => {
        closeStartMenu();
        closeContextMenu();
      }}
      onContextMenu={handleDesktopContextMenu}
      onPointerDown={onDesktopPointerDown}
      onPointerUp={clearDesktopLongPress}
      onPointerMove={clearDesktopLongPress}
    >
      {wallpaperIndex === 0 && (
        <>
          <div className="hill back" />
          <div className="hill" />
          <div className="cloud" style={{ width: 140, height: 34, top: '10%', left: '8%' }} />
          <div className="cloud" style={{ width: 90, height: 24, top: '15%', left: '20%' }} />
          <div className="cloud" style={{ width: 170, height: 40, top: '22%', left: '55%' }} />
          <div className="cloud" style={{ width: 100, height: 26, top: '28%', left: '70%' }} />
          <div className="cloud" style={{ width: 120, height: 30, top: '8%', left: '75%' }} />
        </>
      )}
      {wallpaperIndex === 1 && <div className="stars" />}
      {wallpaperIndex === 3 && <DubaiSkyline />}
      <DesktopIcons />
      <WindowManager />
      <StartMenu />
      <ContextMenu />
      <Taskbar />
    </div>
  );
}
