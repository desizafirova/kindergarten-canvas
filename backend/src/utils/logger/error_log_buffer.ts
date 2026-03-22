export interface ErrorLogEntry {
    timestamp: string;
    level: string;
    message: string;
    method?: string;
    url?: string;
    userId?: number | null;
    errorType?: string;
}

class ErrorLogBuffer {
    private entries: ErrorLogEntry[] = [];
    private readonly MAX_ENTRIES = 50;

    add(entry: ErrorLogEntry): void {
        this.entries.push(entry);
        if (this.entries.length > this.MAX_ENTRIES) {
            this.entries = this.entries.slice(-this.MAX_ENTRIES);
        }
    }

    getRecent(): ErrorLogEntry[] {
        return [...this.entries].reverse(); // most recent first
    }
}

export const errorLogBuffer = new ErrorLogBuffer();
