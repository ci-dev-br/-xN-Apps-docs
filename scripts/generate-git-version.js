const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function extractCoAuthors(commitBody) {
  if (!commitBody) return [];
  const coAuthors = [];
  const regex = /(?:co-authored-by|co-author|co-autor|co-autores|co-authored by)[:\s]+([^\r\n]+)/gi;
  let match;
  while ((match = regex.exec(commitBody)) !== null) {
    const rawVal = match[1].trim();
    const parts = rawVal.split(/[,;]/).map(s => s.trim()).filter(Boolean);
    for (const part of parts) {
      if (part && !coAuthors.includes(part)) {
        coAuthors.push(part);
      }
    }
  }
  return coAuthors;
}

function getFolderGitInfo(folderPath, globalBranch) {
  const gitPath = folderPath.replace(/\\/g, '/');
  try {
    let lastCommit = '';
    try {
      lastCommit = execSync(`git log -n 1 --format="%H%x09%h%x09%cI" -- "${gitPath}"`, { encoding: 'utf-8' }).trim();
    } catch {}

    let hash = 'local';
    let shortHash = 'local';
    let lastCommitDate = new Date().toISOString();

    if (lastCommit) {
      const parts = lastCommit.split('\t');
      if (parts[0]) hash = parts[0];
      if (parts[1]) shortHash = parts[1];
      if (parts[2]) lastCommitDate = parts[2];
    }

    let authors = [];
    try {
      const rawAuthors = execSync(`git log --format="%aN <%aE>" -- "${gitPath}"`, { encoding: 'utf-8' });
      authors = Array.from(new Set(rawAuthors.split(/\r?\n/).map(s => s.trim()).filter(Boolean)));
    } catch {}

    let coAuthors = [];
    try {
      const rawBodies = execSync(`git log --format="%B%x1E" -- "${gitPath}"`, { encoding: 'utf-8' });
      const bodies = rawBodies.split('\x1E').filter(Boolean);
      const coAuthorSet = new Set();
      for (const b of bodies) {
        for (const ca of extractCoAuthors(b)) {
          coAuthorSet.add(ca);
        }
      }
      coAuthors = Array.from(coAuthorSet);
    } catch {}

    let commitCount = 0;
    try {
      commitCount = parseInt(execSync(`git rev-list --count HEAD -- "${gitPath}"`, { encoding: 'utf-8' }).trim(), 10) || 0;
    } catch {}

    const collaborators = Array.from(new Set([...authors, ...coAuthors]));

    return {
      folderPath: gitPath,
      hash,
      shortHash,
      branch: globalBranch,
      lastCommitDate,
      commitCount,
      authors,
      coAuthors,
      collaborators
    };
  } catch (e) {
    return {
      folderPath: gitPath,
      hash: 'local',
      shortHash: 'local',
      branch: globalBranch,
      lastCommitDate: new Date().toISOString(),
      commitCount: 0,
      authors: [],
      coAuthors: [],
      collaborators: []
    };
  }
}

function getGitInfo() {
  let fullHash = 'local-development';
  let shortHash = 'local';
  let branch = 'main';
  let globalCollaborators = ['Dev Team'];

  try {
    fullHash = execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
    shortHash = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
    try {
      branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
    } catch {}

    try {
      const rawAuthors = execSync('git log --format="%aN <%aE>"', { encoding: 'utf-8' });
      const unique = Array.from(new Set(rawAuthors.split(/\r?\n/).map(s => s.trim()).filter(Boolean)));
      if (unique.length > 0) {
        globalCollaborators = unique;
      }
    } catch (e) {
      console.warn('Could not extract global git authors:', e.message);
    }
  } catch (e) {
    console.warn('Could not read git version, falling back to default:', e.message);
  }

  // Descobre todas as aplicações em apps/projects/ci-apps e apps/projects/ci
  const rootDir = path.resolve(__dirname, '..');
  const ciAppsDir = path.join(rootDir, 'apps', 'projects', 'ci-apps');
  const ciDir = path.join(rootDir, 'apps', 'projects', 'ci');

  const appKeyMapping = {
    'arquivos': 'Arquivos',
    'blog': 'Blog',
    'cadastros': 'Cadastros',
    'cms': 'CMS',
    'codex': 'Codex',
    'crm': 'CRM',
    'dev-tools': 'DevTools',
    'documentos': 'Documentos',
    'dynamic': 'Dynamic',
    'financeiro': 'Financeiro',
    'formularios': 'Formularios',
    'gerencial': 'Gerencial',
    'grupos': 'Grupos',
    'icons': 'Icons',
    'imersao': 'Imersao',
    'infra': 'Infra',
    'instalacao': 'Installation',
    'low-code': 'LowCode',
    'mensagens': 'Mensagens',
    'organizacao': 'Organizacao',
    'produtos': 'Produtos',
    'profile': 'Profile',
    'projetos': 'Projetos',
    'seo': 'SEO',
    'sites': 'Sites',
    'threejs': 'Threejs',
    'treinamento': 'Treinamento',
    'vendas': 'Vendas',
    'launcher': 'Launcher'
  };

  const applications = {};

  if (fs.existsSync(ciAppsDir)) {
    const folders = fs.readdirSync(ciAppsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const folder of folders) {
      const relPath = `apps/projects/ci-apps/${folder}`;
      const canonicalKey = appKeyMapping[folder.toLowerCase()] || folder;
      const info = getFolderGitInfo(relPath, branch);

      // Mapeia tanto pela chave canônica quanto pelo nome da pasta e minúsculo
      applications[canonicalKey] = {
        appKey: canonicalKey,
        ...info
      };
      if (canonicalKey.toLowerCase() !== folder.toLowerCase()) {
        applications[folder] = applications[canonicalKey];
      }
      applications[canonicalKey.toLowerCase()] = applications[canonicalKey];
    }
  }

  if (fs.existsSync(ciDir)) {
    const folders = fs.readdirSync(ciDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const folder of folders) {
      const relPath = `apps/projects/ci/${folder}`;
      const canonicalKey = appKeyMapping[folder.toLowerCase()] || (folder.charAt(0).toUpperCase() + folder.slice(1));
      const info = getFolderGitInfo(relPath, branch);

      applications[canonicalKey] = {
        appKey: canonicalKey,
        ...info
      };
      applications[canonicalKey.toLowerCase()] = applications[canonicalKey];
    }
  }

  // Aliases úteis
  if (applications['Gerencial']) {
    applications['Loja'] = applications['Gerencial'];
    applications['loja'] = applications['Gerencial'];
  }
  if (applications['Installation']) {
    applications['Instalacao'] = applications['Installation'];
    applications['instalacao'] = applications['Installation'];
  }
  if (applications['Dynamic']) {
    applications['Dynamic XD'] = applications['Dynamic'];
  }

  return {
    hash: fullHash,
    shortHash: shortHash,
    branch: branch,
    collaborators: globalCollaborators,
    timestamp: new Date().toISOString(),
    applications: applications
  };
}

const gitInfo = getGitInfo();
console.log(`Detected Git Info. Global shortHash: ${gitInfo.shortHash}, Apps cataloged: ${Object.keys(gitInfo.applications).length}`);

const targetPaths = [
  path.join(__dirname, '..', 'apps', 'projects', 'ci', 'core', 'src', 'lib', 'version', 'git-version.ts'),
  path.join(__dirname, '..', 'apps', 'src', 'git-version.ts')
];

const fileContent = `/**
 * Auto-generated file by scripts/generate-git-version.js
 * Do not modify manually.
 */
export interface IGitAppVersion {
  appKey: string;
  folderPath: string;
  hash: string;
  shortHash: string;
  branch: string;
  lastCommitDate: string;
  commitCount: number;
  authors: string[];
  coAuthors: string[];
  collaborators: string[];
}

export const GIT_VERSION = {
  hash: ${JSON.stringify(gitInfo.hash)},
  shortHash: ${JSON.stringify(gitInfo.shortHash)},
  branch: ${JSON.stringify(gitInfo.branch)},
  collaborators: ${JSON.stringify(gitInfo.collaborators)} as string[],
  timestamp: ${JSON.stringify(gitInfo.timestamp)},
  applications: ${JSON.stringify(gitInfo.applications, null, 2)} as Record<string, IGitAppVersion>,
  getAppGitInfo(appKey: string): IGitAppVersion | undefined {
    if (!appKey) return undefined;
    const cleanKey = appKey.replace(/^\\//, '').trim();
    return this.applications[cleanKey] || this.applications[cleanKey.toLowerCase()] || undefined;
  }
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
