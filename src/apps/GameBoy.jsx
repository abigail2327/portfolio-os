import { useState } from 'react';
import Stax from '../games/Stax';
import EmberTide from '../games/EmberTide';
import BarrelBound from '../games/BarrelBound';
import { playClick } from '../utils/sound';

const CARTRIDGES = [
  { id: 'stax', name: 'STAX', blurb: 'Block-stacking puzzle' },
  { id: 'ember-tide', name: 'Ember & Tide', blurb: 'Elemental duo platformer' },
  { id: 'barrel-bound', name: 'Barrel Bound', blurb: 'Ladder & barrel climber' },
];

function GameScreen({ id }) {
  switch (id) {
    case 'stax':
      return <Stax />;
    case 'ember-tide':
      return <EmberTide />;
    case 'barrel-bound':
      return <BarrelBound />;
    default:
      return null;
  }
}

export default function GameBoy() {
  const [selected, setSelected] = useState(null);

  const select = (id) => {
    playClick();
    setSelected(id);
  };
  const goBack = () => {
    playClick();
    setSelected(null);
  };

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px 16px 26px',
        overflow: 'auto',
      }}
    >
      {/* Device shell — pink console, no surrounding page background */}
      <div
        style={{
          background: '#e0447e',
          border: '4px solid #a12b58',
          borderRadius: 22,
          padding: '20px 20px 26px',
          width: '100%',
          maxWidth: 400,
          boxShadow: 'inset 0 3px 10px rgba(255,255,255,0.18), 0 16px 40px rgba(0,0,0,0.45)',
        }}
      >
        {/* Screen bezel */}
        <div
          style={{
            background: '#12141a',
            borderRadius: 10,
            padding: 16,
            boxShadow: 'inset 0 3px 14px rgba(0,0,0,0.6)',
          }}
        >
          <div
            style={{
              background: '#8ea86b',
              minHeight: 220,
              borderRadius: 3,
              padding: 14,
              fontFamily: "'Pixelify Sans', monospace",
              color: '#1c2a12',
              fontSize: 11,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
            }}
          >
            {!selected ? (
              <div style={{ width: '100%' }}>
                <div style={{ fontSize: 13, marginBottom: 8 }}>SELECT CARTRIDGE</div>
                {CARTRIDGES.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => select(c.id)}
                    style={{
                      cursor: 'pointer',
                      padding: '8px 6px',
                      background: 'rgba(28,42,18,0.08)',
                      lineHeight: 1.7,
                      marginBottom: 5,
                      fontSize: 12,
                    }}
                  >
                    ▸ {c.name}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <GameScreen id={selected} />
                <div onClick={goBack} style={{ marginTop: 6, cursor: 'pointer', fontSize: 10.5 }}>
                  ◂ BACK TO MENU
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Power indicator + label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, paddingLeft: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff8ab8' }} />
          <span style={{ fontSize: 11, color: '#3a1024', fontFamily: "'Pixelify Sans', monospace" }}>
            POWER
          </span>
        </div>

        {/* D-pad + buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 34, padding: '0 10px' }}>
          <div style={{ position: 'relative', width: 84, height: 84 }}>
            <div style={{ position: 'absolute', left: 28, top: 0, width: 28, height: 84, background: '#2a2a2a', borderRadius: 5 }} />
            <div style={{ position: 'absolute', left: 0, top: 28, width: 84, height: 28, background: '#2a2a2a', borderRadius: 5 }} />
          </div>
          <div style={{ display: 'flex', gap: 14, transform: 'rotate(-20deg)' }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#7a1638' }} />
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#7a1638' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
