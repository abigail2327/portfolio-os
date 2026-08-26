export default function Contact() {
  return (
    <div style={{ padding: 22 }}>
      <h2 style={{ marginTop: 0, fontSize: 18 }}>Get in touch</h2>
      <p style={{ fontSize: 13.5, color: 'var(--text-dim)', lineHeight: 1.6 }}>
        Based in Dubai, UAE — always happy to talk tech, data, or travel.
      </p>
      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <a href="mailto:abigail271004@hotmail.com" style={{ color: 'var(--accent-2)', fontSize: 13.5 }}>
          abigail271004@hotmail.com
        </a>
        <a href="https://www.linkedin.com/in/abigail-da-costa" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-2)', fontSize: 13.5 }}>
          linkedin.com/in/abigail-da-costa
        </a>
        <a href="https://github.com/abigail2327" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-2)', fontSize: 13.5 }}>
          github.com/abigail2327
        </a>
      </div>
    </div>
  );
}
