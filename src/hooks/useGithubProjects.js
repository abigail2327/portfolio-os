import { useEffect, useState } from 'react';
import { fetchGithubRepos } from '../utils/github';
import { PROJECTS as FALLBACK_PROJECTS } from '../data/projects';

export function useGithubProjects() {
  const [projects, setProjects] = useState(null);
  const [status, setStatus] = useState('loading'); // 'loading' | 'live' | 'fallback'

  useEffect(() => {
    let cancelled = false;
    fetchGithubRepos()
      .then((repos) => {
        if (cancelled) return;
        if (repos.length === 0) {
          setProjects(FALLBACK_PROJECTS);
          setStatus('fallback');
        } else {
          setProjects(repos);
          setStatus('live');
        }
      })
      .catch(() => {
        if (cancelled) return;
        // Offline, rate-limited, or blocked — fall back to the last-known static list
        // rather than showing an empty/broken folder.
        setProjects(FALLBACK_PROJECTS);
        setStatus('fallback');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { projects: projects || [], status };
}
