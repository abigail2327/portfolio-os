import { useRef, useCallback } from 'react';
import { FileIcon } from '../components/Icons';
import { useWindowStore } from '../store/windowStore';
import { useGithubProjects } from '../hooks/useGithubProjects';

const LONG_PRESS_MS = 480;

export default function Explorer() {
  const openWindow = useWindowStore((s) => s.openWindow);
  const openContextMenu = useWindowStore((s) => s.openContextMenu);
  const { projects, status } = useGithubProjects();
  const longPressTimer = useRef(null);

  const openProject = (project) => {
    openWindow('projectViewer', {
      title: project.name,
      props: { instanceKey: project.id, project },
      width: 660,
      height: 560,
    });
  };

  const showFileMenu = useCallback(
    (x, y, project) => {
      openContextMenu(x, y, [
        { label: 'Open', onClick: () => openProject(project) },
        {
          label: 'Copy GitHub link',
          onClick: () => navigator.clipboard?.writeText(project.repoUrl),
        },
        { separator: true },
        {
          label: 'Properties',
          onClick: () =>
            alert(
              `${project.name}\n\nLanguage: ${project.language || 'n/a'}\nRepo: ${project.repoUrl}`
            ),
        },
      ]);
    },
    [openContextMenu]
  );

  const onFileContextMenu = (e, project) => {
    e.preventDefault();
    showFileMenu(e.clientX, e.clientY, project);
  };

  // Touch: tap opens directly (no double-click gesture on touch), hold opens the context menu.
  const onFilePointerDown = (e, project) => {
    if (e.pointerType !== 'touch') return;
    const startX = e.clientX;
    const startY = e.clientY;
    let moved = false;
    longPressTimer.current = setTimeout(() => {
      longPressTimer.current = null;
      showFileMenu(startX, startY, project);
    }, LONG_PRESS_MS);

    const onMove = (ev) => {
      if (Math.abs(ev.clientX - startX) > 6 || Math.abs(ev.clientY - startY) > 6) {
        moved = true;
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
      }
    };
    const onUp = () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
        if (!moved) openProject(project);
      }
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  return (
    <div style={{ padding: 16 }}>
      <div style={{ fontSize: 12.5, color: 'var(--text-dim)', marginBottom: 14 }}>
        {status === 'loading' && 'Loading projects from GitHub…'}
        {status === 'live' &&
          `${projects.length} project${projects.length === 1 ? '' : 's'} — synced live from GitHub, double-click to open`}
        {status === 'fallback' &&
          `${projects.length} project${projects.length === 1 ? '' : 's'} (offline copy — double-click to open)`}
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
          gridAutoRows: 'min-content',
          columnGap: 18,
          rowGap: 26,
        }}
      >
        {projects.map((p) => (
          <div
            key={p.id}
            onDoubleClick={() => openProject(p)}
            onContextMenu={(e) => onFileContextMenu(e, p)}
            onPointerDown={(e) => onFilePointerDown(e, p)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              padding: 8,
              borderRadius: 8,
              cursor: 'pointer',
              textAlign: 'center',
              touchAction: 'manipulation',
              minWidth: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <FileIcon size={44} />
            <span style={{ fontSize: 11.5, lineHeight: 1.25, overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
              {p.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
