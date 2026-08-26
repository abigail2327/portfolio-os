// Live GitHub integration — no manual data entry needed. Every public repo under this
// username shows up automatically; nothing to update when a new project goes live.
const GITHUB_USERNAME = 'abigail2327';

export async function fetchGithubRepos() {
  const res = await fetch(
    `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`
  );
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  const data = await res.json();
  return data
    .filter((r) => !r.fork) // skip forked repos, keep it to original work
    .map((r) => ({
      id: r.name,
      name: r.name,
      description: r.description || 'No description provided yet.',
      language: r.language,
      topics: r.topics || [],
      repoUrl: r.html_url,
      defaultBranch: r.default_branch || 'main',
      updatedAt: r.updated_at,
      stars: r.stargazers_count,
    }));
}

export async function fetchReadme(repoName, defaultBranch = 'main') {
  // Try the default branch first, then a couple of common fallbacks — repos vary.
  const branches = [defaultBranch, 'main', 'master'];
  for (const branch of [...new Set(branches)]) {
    try {
      const res = await fetch(
        `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${repoName}/${branch}/README.md`
      );
      if (res.ok) {
        const text = await res.text();
        return text;
      }
    } catch {
      // try next branch
    }
  }
  return null;
}
