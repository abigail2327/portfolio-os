import { useState, useRef, useCallback } from 'react';
import { useWindowStore } from '../store/windowStore';
import { APPS } from '../data/apps';
import { ICONS } from './Icons';

const DESKTOP_APPS = ['explorer', 'aboutMe', 'contact', 'gameboy', 'paint'];
const LONG_PRESS_MS = 480;

// Default grid layout used until the person drags an icon somewhere else.
function defaultPosition(index) {
  return { x: 24, y: 24 + index * 118 };
}

function isCoarsePointer() {
  return typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches;
}

export default function DesktopIcons() {
  const openWindow = useWindowStore((s) => s.openWindow);
  const iconPositions = useWindowStore((s) => s.iconPositions);
  const setIconPosition = useWindowStore((s) => s.setIconPosition);
  const openContextMenu = useWindowStore((s) => s.openContextMenu);
  const [selected, setSelected] = useState(null);
  const dragInfo = useRef(null);
  const longPressTimer = useRef(null);

  const handleOpen = (appId) => {
    const def = APPS[appId];
    openWindow(appId, { title: def.title, icon: def.icon, width: def.width, height: def.height });
  };

  const onIconContextMenu = useCallback(
    (e, appId) => {
      e.preventDefault();
      e.stopPropagation();
      setSelected(appId);
      const def = APPS[appId];
      openContextMenu(e.clientX, e.clientY, [
        { label: 'Open', onClick: () => handleOpen(appId) },
        { separator: true },
        { label: 'Properties', onClick: () => alert(`${def.title}\n\nA desktop app.`) },
      ]);
    },
    [openContextMenu]
  );

  const onIconPointerDown = useCallback(
    (e, appId, pos) => {
      if (e.button !== undefined && e.button !== 0) return;
      setSelected(appId);
      const startX = e.clientX;
      const startY = e.clientY;
      let moved = false;
      dragInfo.current = { appId, origX: pos.x, origY: pos.y };

      // Touch devices don't have right-click — hold-to-open-context-menu instead.
      if (e.pointerType === 'touch') {
        longPressTimer.current = setTimeout(() => {
          longPressTimer.current = null;
          onIconContextMenu(e, appId);
        }, LONG_PRESS_MS);
      }

      const onMove = (ev) => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
          moved = true;
          if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
          }
        }
        if (moved) {
          setIconPosition(appId, {
            x: Math.max(4, dragInfo.current.origX + dx),
            y: Math.max(4, dragInfo.current.origY + dy),
          });
        }
      };
      const onUp = () => {
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
          // A tap that didn't move, on a touch device, opens the app directly —
          // touch users don't have a natural "double-click" gesture.
          if (!moved && e.pointerType === 'touch' && isCoarsePointer()) {
            handleOpen(appId);
          }
        }
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        dragInfo.current = null;
      };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    },
    [setIconPosition, onIconContextMenu]
  );

  return (
    <>
      {DESKTOP_APPS.map((appId, i) => {
        const def = APPS[appId];
        const Icon = ICONS[def.icon] || ICONS.file;
        const pos = iconPositions[appId] || defaultPosition(i);
        return (
          <div
            key={appId}
            className={`desktop-icon${selected === appId ? ' selected' : ''}`}
            style={{ position: 'absolute', left: pos.x, top: pos.y, touchAction: 'none' }}
            onPointerDown={(e) => onIconPointerDown(e, appId, pos)}
            onContextMenu={(e) => onIconContextMenu(e, appId)}
            onDoubleClick={() => handleOpen(appId)}
          >
            <div className="icon-art">
              <Icon size={52} />
            </div>
            <div className="icon-label">{def.title}</div>
          </div>
        );
      })}
    </>
  );
}
