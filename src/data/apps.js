// Central registry of "apps" the desktop/taskbar/start menu know about.
// Each entry maps an appId to display info + default window geometry.
export const APPS = {
  explorer: {
    id: 'explorer',
    title: 'Projects',
    icon: 'folder',
    width: 720,
    height: 480,
  },
  aboutMe: {
    id: 'aboutMe',
    title: 'About Me',
    icon: 'aboutMe',
    width: 760,
    height: 640,
  },
  contact: {
    id: 'contact',
    title: 'Contact',
    icon: 'contact',
    width: 420,
    height: 380,
  },
  gameboy: {
    id: 'gameboy',
    title: 'Game Boy',
    icon: 'gameboy',
    width: 520,
    height: 640,
  },
  projectViewer: {
    id: 'projectViewer',
    title: 'Project',
    icon: 'file',
    width: 620,
    height: 520,
  },
  terminal: {
    id: 'terminal',
    title: 'Terminal',
    icon: 'terminal',
    width: 560,
    height: 380,
  },
  settings: {
    id: 'settings',
    title: 'Settings',
    icon: 'settings',
    width: 460,
    height: 480,
  },
  paint: {
    id: 'paint',
    title: 'Paint',
    icon: 'paint',
    width: 560,
    height: 480,
  },
};
