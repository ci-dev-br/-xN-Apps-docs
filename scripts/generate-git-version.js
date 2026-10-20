const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function getGitInfo() {
  try {
    const fullHash = execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
    const shortHash = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
    let branch = 'main';
    try {
      branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
    } catch {}

    let collaborators = [];
    try {
      const rawAuthors = execSync('git log --format="%aN <%aE>"', { encoding: 'utf-8' });
      const unique = Array.from(new Set(rawAuthors.split(/\r?\n/).map(s => s.trim()).filter(Boolean)));
      collaborators = unique;
    } catch (e) {
      console.warn('Could not extract git authors:', e.message);
    }

    return {
      hash: fullHash,
      shortHash: shortHash,
      branch: branch,
      collaborators: collaborators,
      timestamp: new Date().toISOString()
    };
  } catch (e) {
    console.warn('Could not read git version, falling back to default:', e.message);
    return {
      hash: 'local-development',
      shortHash: 'local',
      branch: 'main',
      collaborators: ['Dev Team'],
      timestamp: new Date().toISOString()
    };
  }
}

const gitInfo = getGitInfo();
console.log('Detected Git Info:', gitInfo);

const targetPaths = [
  path.join(__dirname, '..', 'apps', 'projects', 'ci', 'core', 'src', 'lib', 'version', 'git-version.ts'),
  path.join(__dirname, '..', 'apps', 'src', 'git-version.ts')
];

const fileContent = `/**
 * Auto-generated file by scripts/generate-git-version.js
 * Do not modify manually.
 */
export const GIT_VERSION = {
  hash: ${JSON.stringify(gitInfo.hash)},
  shortHash: ${JSON.stringify(gitInfo.shortHash)},
  branch: ${JSON.stringify(gitInfo.branch)},
  collaborators: ${JSON.stringify(gitInfo.collaborators)} as string[],
  timestamp: ${JSON.stringify(gitInfo.timestamp)}
};
`;

for (const targetPath of targetPaths) {
  const dir = path.dirname(targetPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(targetPath, fileContent, 'utf-8');
  console.log('Wrote git version to:', targetPath);
}
