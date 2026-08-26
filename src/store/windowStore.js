import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { playOpen, playClose } from '../utils/sound';

let nextZ = 1;
let nextId = 1;

// Default window geometry per app, so windows don't all stack in the exact same spot.
const DEFAULT_GEOMETRY = {
  width: 640,
  height: 460,
};

export const useWindowStore = create(
  persist(
    (set, get) => ({
      windows: [], // { id, appId, title, icon, x, y, width, height, z, minimized, maximized, props }
      startMenuOpen: false,
      iconPositions: {}, // { [appId]: { x, y } }
      wallpaperIndex: 0,
      audioEnabled: true,
      contextMenu: null, // { x, y, items: [{ label, onClick }] }

      openWindow: (appId, { title, icon, props, width, height } = {}) => {
        const existing = get().windows.find((w) => w.appId === appId && !w.props?.instanceKey);
        if (existing) {
          get().focusWindow(existing.id);
          if (existing.minimized) get().restoreWindow(existing.id);
          return existing.id;
        }
        const id = nextId++;
        const openCount = get().windows.length;
        const offset = (openCount % 6) * 28;
        const requestedWidth = width || DEFAULT_GEOMETRY.width;
        const requestedHeight = height || DEFAULT_GEOMETRY.height;
        // Clamp to the viewport so windows don't spawn larger than a phone screen.
        const maxW = typeof window !== 'undefined' ? window.innerWidth - 16 : requestedWidth;
        const maxH = typeof window !== 'undefined' ? window.innerHeight - 80 : requestedHeight;
        const finalWidth = Math.min(requestedWidth, maxW);
        const finalHeight = Math.min(requestedHeight, maxH);
        const startX = Math.min(120 + offset, Math.max(8, maxW - finalWidth));
        const startY = Math.min(90 + offset, Math.max(8, maxH - finalHeight));
        const w = {
          id,
          appId,
          title: title || appId,
          icon: icon || null,
          x: startX,
          y: startY,
          width: finalWidth,
          height: finalHeight,
          z: nextZ++,
          minimized: false,
          maximized: false,
          props: props || {},
        };
        set((state) => ({ windows: [...state.windows, w] }));
        playOpen();
        return id;
      },

      closeWindow: (id) => {
        set((state) => ({ windows: state.windows.filter((w) => w.id !== id) }));
        playClose();
      },

      focusWindow: (id) => {
        set((state) => ({
          windows: state.windows.map((w) =>
            w.id === id ? { ...w, z: nextZ++ } : w
          ),
        }));
      },

      // Alt+Tab-style cycling: focus the next non-minimized window after the current
      // topmost one, wrapping around. Best-effort — real Alt+Tab is usually intercepted
      // by the OS before it ever reaches the browser, same limitation daedalOS has.
      cycleFocus: () => {
        const open = get().windows.filter((w) => !w.minimized);
        if (open.length < 2) return;
        const sorted = [...open].sort((a, b) => a.z - b.z);
        const currentTop = sorted[sorted.length - 1];
        const currentIndex = sorted.findIndex((w) => w.id === currentTop.id);
        const next = sorted[(currentIndex + 1) % sorted.length];
        get().focusWindow(next.id);
      },

      minimizeWindow: (id) => {
        set((state) => ({
          windows: state.windows.map((w) =>
            w.id === id ? { ...w, minimized: true } : w
          ),
        }));
      },

      restoreWindow: (id) => {
        set((state) => ({
          windows: state.windows.map((w) =>
            w.id === id ? { ...w, minimized: false, z: nextZ++ } : w
          ),
        }));
      },

      toggleMaximize: (id) => {
        set((state) => ({
          windows: state.windows.map((w) =>
            w.id === id ? { ...w, maximized: !w.maximized, z: nextZ++ } : w
          ),
        }));
      },

      moveWindow: (id, x, y) => {
        set((state) => ({
          windows: state.windows.map((w) => (w.id === id ? { ...w, x, y } : w)),
        }));
      },

      resizeWindow: (id, width, height) => {
        set((state) => ({
          windows: state.windows.map((w) => (w.id === id ? { ...w, width, height } : w)),
        }));
      },

      toggleStartMenu: () => set((state) => ({ startMenuOpen: !state.startMenuOpen })),
      closeStartMenu: () => set({ startMenuOpen: false }),

      setIconPosition: (appId, pos) => {
        set((state) => ({ iconPositions: { ...state.iconPositions, [appId]: pos } }));
      },

      setWallpaper: (index) => set({ wallpaperIndex: index }),
      cycleWallpaper: () => set((state) => ({ wallpaperIndex: (state.wallpaperIndex + 1) % 4 })),
      setAudioEnabled: (value) => set({ audioEnabled: value }),

      resetDesktop: () => {
        set({ windows: [], iconPositions: {}, wallpaperIndex: 0, audioEnabled: true });
      },

      openContextMenu: (x, y, items) => set({ contextMenu: { x, y, items } }),
      closeContextMenu: () => set({ contextMenu: null }),
    }),
    {
      name: 'portfolio-os-state',
      // Skip persisting project-viewer windows (their data comes from a live fetch and can
      // go stale) and the transient startMenu/contextMenu state.
      partialize: (state) => ({
        windows: state.windows.filter((w) => !w.props?.instanceKey),
        iconPositions: state.iconPositions,
        wallpaperIndex: state.wallpaperIndex,
        audioEnabled: state.audioEnabled,
      }),
      onRehydrateStorage: () => (state) => {
        // Module-level id/z counters need to pick up where persisted data left off,
        // otherwise a freshly reloaded page could hand out a duplicate id.
        if (state?.windows?.length) {
          nextId = Math.max(...state.windows.map((w) => w.id)) + 1;
          nextZ = Math.max(...state.windows.map((w) => w.z)) + 1;
        }
      },
    }
  )
);
