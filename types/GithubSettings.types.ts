export interface GitHubCommit {
    sha: string;
    message: string;
    date: string;
    repo: string;
    url: string;
}

export interface SyncSettings {
    enabled: boolean;
    lastSyncDate: string | null;
    autoCreateCommits: boolean;
    dailySyncEnabled?: boolean;
    dailySyncTime?: string;
    lastDailySyncDate?: string | null;
}