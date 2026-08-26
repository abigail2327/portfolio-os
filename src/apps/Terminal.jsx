import { useState, useRef, useEffect } from 'react';
import { PROJECTS } from '../data/projects';
import { useWindowStore } from '../store/windowStore';
import { playError } from '../utils/sound';

const HELP_TEXT = `Available commands: help, whoami, projects, about, contact, gameboy, sudo make me a sandwich`;

export default function Terminal() {
  const openWindow = useWindowStore((s) => s.openWindow);
  const [lines, setLines] = useState([
    'portfolio-os terminal — type "help" to get started',
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const run = (cmdRaw) => {
    const cmd = cmdRaw.trim().toLowerCase();
    let output;
    switch (cmd) {
      case 'help':
        output = HELP_TEXT;
        break;
      case 'whoami':
        output = 'Abigail — creative developer, builder of whimsical things.';
        break;
      case 'projects':
        output = PROJECTS.map((p) => `- ${p.name} (${p.repoUrl})`).join('\n');
        break;
      case 'about':
        openWindow('aboutMe', { title: 'About Me' });
        output = 'Opening About Me...';
        break;
      case 'contact':
        openWindow('contact', { title: 'Contact' });
        output = 'Opening Contact...';
        break;
      case 'gameboy':
        openWindow('gameboy', { title: 'Game Boy' });
        output = '[ GAME BOY ]\nOpening cartridge select...';
        break;
      case 'sudo make me a sandwich':
        output = 'Okay.';
        break;
      case 'konami':
        output = '✨ You found a secret. Nothing here yet, but you found it. ✨';
        break;
      case '':
        output = '';
        break;
      default:
        output = `command not found: ${cmd} — try "help"`;
        playError();
    }
    setLines((prev) => [...prev, `> ${cmdRaw}`, ...(output ? [output] : [])]);
  };

  return (
    <div
      style={{
        padding: 14,
        fontFamily: "'Courier New', monospace",
        fontSize: 13,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#0b0d10',
      }}
      onClick={(e) => e.currentTarget.querySelector('input')?.focus()}
    >
      <div style={{ flex: 1, overflowY: 'auto', whiteSpace: 'pre-wrap', color: '#8ef58e' }}>
        {lines.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(input);
          setInput('');
        }}
        style={{ display: 'flex', gap: 6, marginTop: 6 }}
      >
        <span style={{ color: '#8ef58e' }}>&gt;</span>
        <input
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#8ef58e',
            fontFamily: 'inherit',
            fontSize: 13,
          }}
        />
      </form>
    </div>
  );
}
