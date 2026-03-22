interface RequestRecord {
    timestamp: number;
    responseTimeMs: number;
    statusCode: number;
}

class MetricsStore {
    private records: RequestRecord[] = [];
    private readonly MAX_RECORDS = 10000;

    record(responseTimeMs: number, statusCode: number): void {
        this.records.push({ timestamp: Date.now(), responseTimeMs, statusCode });
        if (this.records.length > this.MAX_RECORDS) {
            this.records = this.records.slice(-this.MAX_RECORDS);
        }
    }

    getMetrics(): {
        requestCountLastHour: number;
        requestCountLast24h: number;
        averageResponseTimeMs: number;
        errorRate: number;
    } {
        const now = Date.now();
        const oneHourAgo = now - 60 * 60 * 1000;
        const oneDayAgo = now - 24 * 60 * 60 * 1000;

        const last24h = this.records.filter((r) => r.timestamp >= oneDayAgo);
        const lastHour = last24h.filter((r) => r.timestamp >= oneHourAgo);

        const totalTime = last24h.reduce((sum, r) => sum + r.responseTimeMs, 0);
        const errorCount = last24h.filter((r) => r.statusCode >= 500).length;

        return {
            requestCountLastHour: lastHour.length,
            requestCountLast24h: last24h.length,
            averageResponseTimeMs: last24h.length > 0 ? Math.round(totalTime / last24h.length) : 0,
            errorRate:
                last24h.length > 0
                    ? parseFloat((errorCount / last24h.length).toFixed(4))
                    : 0,
        };
    }
}

export const metricsStore = new MetricsStore();
