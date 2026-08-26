import { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useWindowStore } from '../store/windowStore';

export default function Window({ win, children }) {
  const closeWindow = useWindowStore((s) => s.closeWindow);
  const focusWindow = useWindowStore((s) => s.focusWindow);
  const minimizeWindow = useWindowStore((s) => s.minimizeWindow);
  const toggleMaximize = useWindowStore((s) => s.toggleMaximize);
  const moveWindow = useWindowStore((s) => s.moveWindow);
  const resizeWindow = useWindowStore((s) => s.resizeWindow);

  const dragState = useRef(null);
  const resizeState = useRef(null);

  // Pointer Events unify mouse, touch, and pen in one API — this is what makes dragging
  // and resizing work on phones/tablets, not just desktop mice.
  const onTitlePointerDown = useCallback(
    (e) => {
      if (win.maximized) return;
      focusWindow(win.id);
      e.currentTarget.setPointerCapture?.(e.pointerId);
      dragState.current = {
        startX: e.clientX,
        startY: e.clientY,
        origX: win.x,
        origY: win.y,
      };
      const onMove = (ev) => {
        if (!dragState.current) return;
        const dx = ev.clientX - dragState.current.startX;
        const dy = ev.clientY - dragState.current.startY;
        moveWindow(win.id, dragState.current.origX + dx, Math.max(0, dragState.current.origY + dy));
      };
      const onUp = () => {
        dragState.current = null;
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    },
    [win, moveWindow, focusWindow]
  );

  const onResizePointerDown = useCallback(
    (e) => {
      e.stopPropagation();
      if (win.maximized) return;
      e.currentTarget.setPointerCapture?.(e.pointerId);
      resizeState.current = {
        startX: e.clientX,
        startY: e.clientY,
        origW: win.width,
        origH: win.height,
      };
      const onMove = (ev) => {
        if (!resizeState.current) return;
        const dx = ev.clientX - resizeState.current.startX;
        const dy = ev.clientY - resizeState.current.startY;
        resizeWindow(
          win.id,
          Math.max(280, resizeState.current.origW + dx),
          Math.max(200, resizeState.current.origH + dy)
        );
      };
      const onUp = () => {
        resizeState.current = null;
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    },
    [win, resizeWindow]
  );

  if (win.minimized) return null;

  const style = win.maximized
    ? { left: 0, top: 0, width: '100%', height: 'calc(100% - var(--taskbar-height))', zIndex: win.z }
    : { left: win.x, top: win.y, width: win.width, height: win.height, zIndex: win.z };

  return (
    <motion.div
      className="os-window"
      style={style}
      initial={{ opacity: 0, scale: 0.94, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, y: 10 }}
      transition={{ duration: 0.16 }}
      onPointerDown={() => focusWindow(win.id)}
    >
      <div
        className="os-window-titlebar"
        onPointerDown={onTitlePointerDown}
        onDoubleClick={() => toggleMaximize(win.id)}
      >
        <span className="os-window-title">{win.title}</span>
        <div className="os-window-controls">
          <button className="win-btn" onClick={() => minimizeWindow(win.id)} aria-label="Minimize">
            &#8211;
          </button>
          <button className="win-btn" onClick={() => toggleMaximize(win.id)} aria-label="Maximize">
            &#9633;
          </button>
          <button className="win-btn close" onClick={() => closeWindow(win.id)} aria-label="Close">
            &#10005;
          </button>
        </div>
      </div>
      <div className="os-window-body">{children}</div>
      {!win.maximized && <div className="resize-handle" onPointerDown={onResizePointerDown} />}
    </motion.div>
  );
}
