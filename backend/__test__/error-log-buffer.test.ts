import { describe, it, expect, beforeEach } from '@jest/globals';

// Import directly — no mocks needed for a pure unit test
import { errorLogBuffer, ErrorLogEntry } from '../src/utils/logger/error_log_buffer';

// Since errorLogBuffer is a singleton, we need a fresh instance for isolation
// We'll test the class behavior through the singleton, accepting shared state
// and working around it by testing incremental behavior

describe('ErrorLogBuffer', () => {
    // Note: We cannot easily reset the singleton between tests,
    // so tests are designed to be order-independent

    const createEntry = (message: string): ErrorLogEntry => ({
        timestamp: new Date().toISOString(),
        level: 'error',
        message,
        method: 'GET',
        url: '/test',
        userId: null,
        errorType: 'Error',
    });

    it('add() stores entries and getRecent() returns them in reverse order', () => {
        const initialCount = errorLogBuffer.getRecent().length;

        errorLogBuffer.add(createEntry('first'));
        errorLogBuffer.add(createEntry('second'));
        errorLogBuffer.add(createEntry('third'));

        const recent = errorLogBuffer.getRecent();
        expect(recent.length).toBe(initialCount + 3);
        // Most recent first
        expect(recent[0].message).toBe('third');
        expect(recent[1].message).toBe('second');
        expect(recent[2].message).toBe('first');
    });

    it('getRecent() returns a copy, not a reference to internal array', () => {
        const recent1 = errorLogBuffer.getRecent();
        const recent2 = errorLogBuffer.getRecent();
        expect(recent1).not.toBe(recent2);
        expect(recent1).toEqual(recent2);
    });

    it('enforces MAX_ENTRIES limit of 50 with FIFO eviction', () => {
        // Add enough entries to exceed 50 total (accounting for entries from prior tests)
        for (let i = 0; i < 60; i++) {
            errorLogBuffer.add(createEntry(`overflow-${i}`));
        }

        const recent = errorLogBuffer.getRecent();
        expect(recent.length).toBeLessThanOrEqual(50);
        // The most recent entry should be the last one added
        expect(recent[0].message).toBe('overflow-59');
    });

    it('stores all optional fields correctly', () => {
        const entry: ErrorLogEntry = {
            timestamp: '2026-03-22T10:00:00.000Z',
            level: 'error',
            message: 'Test with all fields',
            method: 'POST',
            url: '/api/v1/test',
            userId: 42,
            errorType: 'TypeError',
        };
        errorLogBuffer.add(entry);

        const recent = errorLogBuffer.getRecent();
        const found = recent.find((e) => e.message === 'Test with all fields');
        expect(found).toBeDefined();
        expect(found!.method).toBe('POST');
        expect(found!.url).toBe('/api/v1/test');
        expect(found!.userId).toBe(42);
        expect(found!.errorType).toBe('TypeError');
    });

    it('handles entries with minimal fields (only required)', () => {
        const entry: ErrorLogEntry = {
            timestamp: '2026-03-22T11:00:00.000Z',
            level: 'error',
            message: 'Minimal entry',
        };
        errorLogBuffer.add(entry);

        const recent = errorLogBuffer.getRecent();
        const found = recent.find((e) => e.message === 'Minimal entry');
        expect(found).toBeDefined();
        expect(found!.method).toBeUndefined();
        expect(found!.url).toBeUndefined();
        expect(found!.userId).toBeUndefined();
        expect(found!.errorType).toBeUndefined();
    });
});
