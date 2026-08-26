import { AnimatePresence } from 'framer-motion';
import { useWindowStore } from '../store/windowStore';
import Window from './Window';
import AppContent from '../apps/AppContent';

export default function WindowManager() {
  const windows = useWindowStore((s) => s.windows);

  return (
    <AnimatePresence>
      {windows.map((win) => (
        <Window key={win.id} win={win}>
          <AppContent appId={win.appId} props={win.props} />
        </Window>
      ))}
    </AnimatePresence>
  );
}
