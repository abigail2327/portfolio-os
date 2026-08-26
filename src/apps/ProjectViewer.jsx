import { useEffect, useState } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { fetchReadme } from '../utils/github';
import { PROJECT_IMAGES } from '../data/projectImages';

export default function ProjectViewer({ project }) {
  const [readmeHtml, setReadmeHtml] = useState(null);
  const [readmeStatus, setReadmeStatus] = useState('loading'); // loading | ok | missing

  useEffect(() => {
    if (!project) return;
    let cancelled = false;
    fetchReadme(project.name, project.defaultBranch).then((md) => {
      if (cancelled) return;
      if (md) {
        // README content comes from a public GitHub repo, but sanitize before injecting
        // as HTML regardless — never trust content just because the source is "your own repo."
        const rawHtml = marked.parse(md);
        setReadmeHtml(DOMPurify.sanitize(rawHtml, { ADD_ATTR: ['target'] }));
        setReadmeStatus('ok');
      } else {
        setReadmeStatus('missing');
      }
    });
    return () => {
      cancelled = true;
    };
  }, [project]);

  if (!project) return null;
  const images = PROJECT_IMAGES[project.name] || [];

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ margin: '0 0 4px', fontSize: 19 }}>{project.name}</h2>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '8px 0 16px' }}>
        {project.language && (
          <span
            style={{
              fontSize: 11.5,
              padding: '3px 9px',
              borderRadius: 999,
              background: 'rgba(74, 208, 255, 0.15)',
              color: 'var(--accent-2)',
              border: '1px solid rgba(74, 208, 255, 0.3)',
            }}
          >
            {project.language}
          </span>
        )}
        {(project.topics || []).map((t) => (
          <span
            key={t}
            style={{
              fontSize: 11.5,
              padding: '3px 9px',
              borderRadius: 999,
              background: 'rgba(255, 93, 162, 0.12)',
              color: 'var(--accent)',
              border: '1px solid rgba(255, 93, 162, 0.28)',
            }}
          >
            {t}
          </span>
        ))}
      </div>

      {images.length > 0 && (
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', marginBottom: 16 }}>
          {images.map((src) => (
            <img
              key={src}
              src={src}
              alt={`${project.name} screenshot`}
              style={{ height: 140, borderRadius: 6, flexShrink: 0 }}
            />
          ))}
        </div>
      )}

      {readmeStatus === 'loading' && (
        <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>Loading README…</p>
      )}
      {readmeStatus === 'missing' && (
        <p style={{ fontSize: 14, lineHeight: 1.6 }}>{project.description}</p>
      )}
      {readmeStatus === 'ok' && (
        <div
          className="readme-body"
          style={{ fontSize: 13.5, lineHeight: 1.7 }}
          dangerouslySetInnerHTML={{ __html: readmeHtml }}
        />
      )}

      <a
        href={project.repoUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-block',
          marginTop: 18,
          fontSize: 13,
          color: 'var(--accent)',
          textDecoration: 'none',
          border: '1px solid var(--accent)',
          padding: '8px 14px',
          borderRadius: 6,
        }}
      >
        View on GitHub →
      </a>
    </div>
  );
}
