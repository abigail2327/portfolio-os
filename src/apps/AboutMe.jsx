// Real content — bio, background, and interests, with actual photos in a layered
// "postcard + photo" treatment (postcard backing card behind, tilted photo print on top).

function Stamp() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26">
      <rect x="0.5" y="0.5" width="25" height="25" rx="2" fill="none" stroke="#9c8f78" strokeWidth="1" strokeDasharray="2,1.4" />
      <path d="M4 17c2-3 2-6 0-9 3 1 5 1 8-1 2 3 5 4 9 3-2 3-2 6 0 9-3-1-6-1-9 1-2-2-5-3-8-3z" fill="none" stroke="#7a8fa6" strokeWidth="1.3" />
    </svg>
  );
}

function Postcard({ src, location, float, focus }) {
  return (
    <div
      style={{
        float: float || 'none',
        margin: float ? '6px 0 34px 22px' : '18px auto 34px',
        width: 280,
        position: 'relative',
      }}
    >
      {/* Postcard backing */}
      <div
        style={{
          background: '#f6f1e6',
          border: '1.5px dashed #b8ab8f',
          borderRadius: 4,
          padding: '10px 12px 12px',
          transform: `rotate(${float === 'left' ? -1.5 : 1.5}deg)`,
          color: '#3a2f22',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            fontSize: 9,
            letterSpacing: 3,
            color: '#8a7c62',
            marginBottom: 6,
          }}
        >
          POSTCARD
        </div>
        <div style={{ display: 'flex', gap: 10, minHeight: 44, alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0, borderRight: '1px solid #d8cdb8', paddingRight: 8 }}>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: 17, fontWeight: 700, lineHeight: 1.1 }}>
              POSTCARD
            </div>
            <div style={{ fontFamily: "'Caveat', cursive", fontSize: 15, color: '#5a4f3d', marginTop: 4 }}>
              from {location}
            </div>
          </div>
          <div style={{ width: 40, flexShrink: 0, display: 'flex', justifyContent: 'flex-end' }}>
            <Stamp />
          </div>
        </div>
      </div>

      {/* Overlapping photo print */}
      <div
        style={{
          position: 'relative',
          marginTop: -16,
          marginLeft: float === 'right' ? 'auto' : 18,
          marginRight: float === 'left' ? 'auto' : 0,
          width: '82%',
          background: '#fff',
          padding: 6,
          borderRadius: 3,
          boxShadow: '0 10px 22px rgba(0,0,0,0.4)',
          transform: `rotate(${float === 'left' ? 2 : -2}deg)`,
        }}
      >
        <img
          src={src}
          alt={location}
          style={{ width: '100%', height: 130, objectFit: 'cover', objectPosition: focus || 'center', borderRadius: 1, display: 'block' }}
        />
      </div>
    </div>
  );
}

export default function AboutMe() {
  return (
    <div style={{ padding: '20px 24px', lineHeight: 1.7, fontSize: 14.5 }}>
      <h2 style={{ marginTop: 0, marginBottom: 4, fontSize: 20 }}>Hi, I'm Abigail 👋</h2>
      <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 18 }}>
        Computing &amp; IT graduate · Dubai, UAE
      </div>

      <Postcard src="/photos/team.jpg" location="capstone crunch" focus="center 75%" float="left" />

      <p>
        I'm a Computing &amp; IT graduate turning messy data into decisions people can actually
        act on. I work mostly in Python, SQL, and Power BI, with a growing love for building
        AI-driven automation — from multi-agent workflows to demand-forecasting models. I like
        problems where a good model or a clean dashboard saves someone real time. Off-screen,
        I'm probably cooking up a storm or on the squash court.
      </p>

      <h3 style={{ fontSize: 15, marginTop: 28 }}>Background</h3>
      <p>
        I studied Computing and Information Technologies at RIT Dubai (Dean's List), and along
        the way picked up hands-on experience across AI/ML, data science, and business
        analytics — everything from agentic AI workflows to executive Power BI dashboards.
      </p>
      <p>
        Most recently I was a Power Systems Intern at <strong>Schneider Electric</strong>, where I
        built an NLP chatbot that cut repetitive support queries by 40%, cleaned up CRM data
        across six Gulf markets, and put together the monthly sales-performance dashboards
        leadership actually used. Before that, at <strong>Betr Beta</strong>, I built multi-agent AI
        workflows for supply-chain optimization and improved demand-prediction accuracy by 18%
        with time-series forecasting. My first internship, at <strong>EOS Group</strong>, had me
        shipping full-stack apps that cut manual processing time by a quarter.
      </p>
      <p>
        My capstone project — a smart campus digital twin that cut measured energy use by
        48.2% — won <strong>Best Capstone Award</strong> at RIT Dubai and got presented at a
        regional applied-computing conference. The rest of my projects (this site included) live
        in the Projects folder on the desktop.
      </p>

      <Postcard src="/photos/cooking.jpg" location="the kitchen" float="right" />

      <h3 style={{ fontSize: 15, marginTop: 28, clear: 'none' }}>Outside of work</h3>
      <p>
        When I'm not at a keyboard, I'm usually cooking, playing squash, or planning the next
        trip. Travel is a big one for me — a few favorites from recent trips below.
      </p>

      <div style={{ clear: 'both' }} />

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', margin: '20px 0' }}>
        <Postcard src="/photos/hoian-lanterns.jpg" location="Hoi An" />
        <Postcard src="/photos/hoian-boats.jpg" location="Hoi An" />
        <Postcard src="/photos/hoian-night.jpg" location="Hoi An" />
        <Postcard src="/photos/hoian-cat.jpg" location="Hoi An" />
        <Postcard src="/photos/goa-beach.jpg" location="Goa" />
        <Postcard src="/photos/goa-river.jpg" location="Goa" />
        <Postcard src="/photos/switzerland.jpg" location="Switzerland" />
        <Postcard src="/photos/london.jpg" location="London" />
        <Postcard src="/photos/singapore.jpg" location="Singapore" />
        <Postcard src="/photos/malaysia.jpg" location="Malaysia" focus="center 15%" />
        <Postcard src="/photos/dubai.jpg" location="Dubai" />
        <Postcard src="/photos/food.jpg" location="everywhere" />
      </div>

      <p style={{ marginTop: 24 }}>
        Thanks for reading this far — feel free to poke around the rest of the desktop.
      </p>
    </div>
  );
}
