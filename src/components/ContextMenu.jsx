import { useWindowStore } from '../store/windowStore';

export default function ContextMenu() {
  const contextMenu = useWindowStore((s) => s.contextMenu);
  const closeContextMenu = useWindowStore((s) => s.closeContextMenu);

  if (!contextMenu) return null;
  const { x, y, items } = contextMenu;

  return (
    <div
      className="context-menu"
      style={{ left: x, top: y }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {items.map((item, i) =>
        item.separator ? (
          <div key={i} className="context-menu-separator" />
        ) : (
          <div
            key={i}
            className="context-menu-item"
            onClick={() => {
              item.onClick?.();
              closeContextMenu();
            }}
          >
            {item.label}
          </div>
        )
      )}
    </div>
  );
}
