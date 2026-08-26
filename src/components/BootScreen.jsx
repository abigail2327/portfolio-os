import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playBoot } from '../utils/sound';

export default function BootScreen({ onDone }) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    playBoot();
    const start = performance.now();
    const duration = 1400;
    let raf;
    const tick = (t) => {
      const pct = Math.min(1, (t - start) / duration);
      setProgress(pct);
      if (pct < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setTimeout(() => setVisible(false), 200);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <AnimatePresence onExitComplete={onDone}>
      {visible && (
        <motion.div className="boot-screen" exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
          <div className="boot-logo">ABIGAIL OS</div>
          <div className="boot-bar">
            <div className="boot-bar-fill" style={{ width: `${progress * 100}%` }} />
          </div>
          <div className="boot-hint">loading desktop…</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
