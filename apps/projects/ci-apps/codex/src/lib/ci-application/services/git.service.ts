import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface GitCommit {
    hash: string;
    shortHash: string;
    message: string;
    author: string;
    date: string | Date;
    branch: string;
    files?: string[];
}

export interface GitDiffSummary {
    additions: number;
    deletions: number;
    modified: boolean;
    changesCount: number;
}

export interface GitSyncStatus {
    ahead: number;
    behind: number;
    isSyncing: boolean;
    lastSynced?: Date;
}

@Injectable({
    providedIn: 'root'
})
export class GitService {
    private readonly STORAGE_BRANCH_KEY = 'ci_codex_git_current_branch';
    private readonly STORAGE_BRANCHES_KEY = 'ci_codex_git_branches_list';
    private readonly STORAGE_COMMITS_KEY = 'ci_codex_git_commits_history';

    private currentBranchSubject: BehaviorSubject<string>;
    public currentBranch$: Observable<string>;

    private branchesSubject: BehaviorSubject<string[]>;
    public branches$: Observable<string[]>;

    private syncStatusSubject = new BehaviorSubject<GitSyncStatus>({
        ahead: 0,
        behind: 0,
        isSyncing: false
    });
    public syncStatus$ = this.syncStatusSubject.asObservable();

    private commitsSubject: BehaviorSubject<GitCommit[]>;
    public commits$: Observable<GitCommit[]>;

    constructor() {
        const savedBranch = this.loadFromStorage(this.STORAGE_BRANCH_KEY, 'development');
        const defaultBranches = ['development', 'main', 'feature/uml-blueprint', 'hotfix/v1.0.2'];
        const savedBranches = this.loadFromStorage<string[]>(this.STORAGE_BRANCHES_KEY, defaultBranches);

        const defaultCommits: GitCommit[] = [
            {
                hash: '3dade42492db06a7d1db9d0449d4f6d486c4f140',
                shortHash: '3dade42',
                message: 'refactor: Padroniza API do Portal, aprimora Codex e atualiza componentes UI',
                author: 'pLinho',
                date: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
                branch: 'development',
                files: ['projects/ci-apps/codex', 'projects/ci/portal-api']
            },
            {
                hash: '8f4c19a2b53e7d6c81093125e9821a7c413b52d9',
                shortHash: '8f4c19a',
                message: 'feat(uml): adiciona visualização blueprint glass e exportação multipágina PDF',
                author: 'Equipe Codex',
                date: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
                branch: 'development',
                files: ['projects/ci-apps/codex/src/lib/ci-application/uml-viewer/uml-viewer.ts']
            },
            {
                hash: 'a12b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
                shortHash: 'a12b3c4',
                message: 'feat(editor): integração com janelas flutuantes e sincronização monaco',
                author: 'CI Core Team',
                date: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
                branch: 'development',
                files: ['projects/ci-apps/codex/src/lib/ci-application/floating-editor']
            }
        ];

        const savedCommits = this.loadFromStorage<GitCommit[]>(this.STORAGE_COMMITS_KEY, defaultCommits);

        this.currentBranchSubject = new BehaviorSubject<string>(savedBranch);
        this.currentBranch$ = this.currentBranchSubject.asObservable();

        this.branchesSubject = new BehaviorSubject<string[]>(savedBranches);
        this.branches$ = this.branchesSubject.asObservable();

        this.commitsSubject = new BehaviorSubject<GitCommit[]>(savedCommits);
        this.commits$ = this.commitsSubject.asObservable();
    }

    public getCurrentBranch(): string {
        return this.currentBranchSubject.value;
    }

    public getBranches(): string[] {
        return this.branchesSubject.value;
    }

    public checkoutBranch(branchName: string): boolean {
        const cleanName = branchName?.trim();
        if (!cleanName) return false;

        this.currentBranchSubject.next(cleanName);
        this.saveToStorage(this.STORAGE_BRANCH_KEY, cleanName);

        const currentBranches = this.branchesSubject.value;
        if (!currentBranches.includes(cleanName)) {
            const updated = [...currentBranches, cleanName];
            this.branchesSubject.next(updated);
            this.saveToStorage(this.STORAGE_BRANCHES_KEY, updated);
        }

        return true;
    }

    public createBranch(branchName: string): boolean {
        const cleanName = branchName?.trim().replace(/\s+/g, '-');
        if (!cleanName) return false;

        const currentBranches = this.branchesSubject.value;
        if (!currentBranches.includes(cleanName)) {
            const updated = [...currentBranches, cleanName];
            this.branchesSubject.next(updated);
            this.saveToStorage(this.STORAGE_BRANCHES_KEY, updated);
        }

        this.checkoutBranch(cleanName);
        return true;
    }

    public commit(message: string, filePath?: string | null): GitCommit {
        const cleanMessage = message?.trim() || 'Atualização de código-fonte';
        const fullHash = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
        const shortHash = fullHash.slice(0, 7);

        const newCommit: GitCommit = {
            hash: fullHash,
            shortHash,
            message: cleanMessage,
            author: 'Você (Usuário)',
            date: new Date().toISOString(),
            branch: this.getCurrentBranch(),
            files: filePath ? [filePath] : []
        };

        const updatedCommits = [newCommit, ...this.commitsSubject.value];
        this.commitsSubject.next(updatedCommits);
        this.saveToStorage(this.STORAGE_COMMITS_KEY, updatedCommits);

        // Incrementa status de commits à frente para sincronização
        const currentSync = this.syncStatusSubject.value;
        this.syncStatusSubject.next({
            ...currentSync,
            ahead: currentSync.ahead + 1
        });

        return newCommit;
    }

    public async sync(): Promise<GitSyncStatus> {
        this.syncStatusSubject.next({
            ...this.syncStatusSubject.value,
            isSyncing: true
        });

        // Simulação assíncrona com latência realista de rede Git
        await new Promise(resolve => setTimeout(resolve, 1200));

        const updatedStatus: GitSyncStatus = {
            ahead: 0,
            behind: 0,
            isSyncing: false,
            lastSynced: new Date()
        };

        this.syncStatusSubject.next(updatedStatus);
        return updatedStatus;
    }

    public getCommits(branch?: string): GitCommit[] {
        const all = this.commitsSubject.value;
        if (!branch) return all;
        return all.filter(c => c.branch === branch);
    }

    public calculateDiff(original: string = '', modified: string = ''): GitDiffSummary {
        if (original === modified) {
            return { additions: 0, deletions: 0, modified: false, changesCount: 0 };
        }

        const origLines = original.split('\n');
        const modLines = modified.split('\n');

        let additions = 0;
        let deletions = 0;

        const origSet = new Map<string, number>();
        for (const l of origLines) {
            origSet.set(l, (origSet.get(l) || 0) + 1);
        }

        const modSet = new Map<string, number>();
        for (const l of modLines) {
            modSet.set(l, (modSet.get(l) || 0) + 1);
        }

        for (const [line, count] of modSet.entries()) {
            const origCount = origSet.get(line) || 0;
            if (count > origCount) {
                additions += (count - origCount);
            }
        }

        for (const [line, count] of origSet.entries()) {
            const modCount = modSet.get(line) || 0;
            if (count > modCount) {
                deletions += (count - modCount);
            }
        }

        if (additions === 0 && deletions === 0 && original !== modified) {
            additions = 1;
            deletions = 1;
        }

        return {
            additions,
            deletions,
            modified: true,
            changesCount: additions + deletions
        };
    }

    private loadFromStorage<T>(key: string, defaultValue: T): T {
        if (typeof localStorage === 'undefined') return defaultValue;
        try {
            const raw = localStorage.getItem(key);
            if (!raw) return defaultValue;
            return JSON.parse(raw);
        } catch {
            return defaultValue;
        }
    }

    private saveToStorage<T>(key: string, value: T): void {
        if (typeof localStorage === 'undefined') return;
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch { }
    }
}
