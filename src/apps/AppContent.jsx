import Explorer from './Explorer';
import ProjectViewer from './ProjectViewer';
import AboutMe from './AboutMe';
import Contact from './Contact';
import GameBoy from './GameBoy';
import Terminal from './Terminal';
import Settings from './Settings';
import Paint from './Paint';

export default function AppContent({ appId, props }) {
  switch (appId) {
    case 'explorer':
      return <Explorer />;
    case 'projectViewer':
      return <ProjectViewer project={props?.project} />;
    case 'aboutMe':
      return <AboutMe />;
    case 'contact':
      return <Contact />;
    case 'gameboy':
      return <GameBoy />;
    case 'terminal':
      return <Terminal />;
    case 'settings':
      return <Settings />;
    case 'paint':
      return <Paint />;
    default:
      return <div style={{ padding: 20 }}>Unknown app: {appId}</div>;
  }
}
