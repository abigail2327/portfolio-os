// Tiny original chiptune-style sound effects, synthesized in real time via the Web Audio
// API — no external audio files needed (and nothing ripped from any real game/console).
// Each "sound" is just a short oscillator blip with a fast gain envelope.

import { useWindowStore } from '../store/windowStore';

let ctx = null;
function getCtx() {
  if (!ctx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    ctx = new AudioContextClass();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function isEnabled() {
  return useWindowStore.getState().audioEnabled;
}

function tone({ freq, duration = 0.08, type = 'square', gain = 0.05, delay = 0, glideTo = null }) {
  const audioCtx = getCtx();
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  osc.type = type;
  const t0 = audioCtx.currentTime + delay;
  osc.frequency.setValueAtTime(freq, t0);
  if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t0 + duration);
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(g);
  g.connect(audioCtx.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

export function playClick() {
  if (!isEnabled()) return;
  tone({ freq: 740, duration: 0.035, gain: 0.03 });
}

export function playOpen() {
  if (!isEnabled()) return;
  tone({ freq: 440, duration: 0.09, glideTo: 880, gain: 0.045 });
}

export function playClose() {
  if (!isEnabled()) return;
  tone({ freq: 660, duration: 0.09, glideTo: 330, gain: 0.045 });
}

export function playError() {
  if (!isEnabled()) return;
  tone({ freq: 180, duration: 0.12, type: 'sawtooth', gain: 0.04 });
  tone({ freq: 140, duration: 0.16, type: 'sawtooth', gain: 0.04, delay: 0.09 });
}

export function playBoot() {
  if (!isEnabled()) return;
  // A tiny original four-note ascending arpeggio.
  const notes = [392, 523.25, 659.25, 783.99];
  notes.forEach((freq, i) => {
    tone({ freq, duration: 0.16, gain: 0.05, delay: i * 0.14 });
  });
}
