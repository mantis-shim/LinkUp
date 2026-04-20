import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';

vi.mock('$lib/database/connection', () => ({
    pool: { query: vi.fn() }
}));

import { pool } from '$lib/database/connection';
import { load } from './+page.server.ts';

const mockQuery = pool.query as Mock;

beforeEach(() => {
    vi.clearAllMocks();
});

describe('activities page load', () => {
    it('applies activity filters and returns filtered data', async () => {
        const mockActivity = {
            id: 1,
            title: 'Morning Run',
            category_id: 2,
            location: 'Vilnius',
            gender_id: 1,
            starts_at: '2026-04-10 08:00:00',
            created_at: '2026-04-01 12:00:00'
        };

        mockQuery
            .mockResolvedValueOnce([[mockActivity], []])
            .mockResolvedValueOnce([[{ count: 5 }], []])
            .mockResolvedValueOnce([[{ id: 2, name: 'Sport' }], []])
            .mockResolvedValueOnce([[{ id: 1, name: 'Female' }], []])
            .mockResolvedValueOnce([[{ location: 'Vilnius' }], []]);

        const url = new URL(
            'http://localhost/app/activities?category=2&location=Vilnius&gender=1&startDate=2026-04-01&endDate=2026-04-30&offset=2'
        );

        const result = await load({ url, locals: { user: null } } as any);

        expect(result.activity).toEqual(mockActivity);
        expect(result.totalCount).toBe(5);
        expect(result.hasMore).toBe(true);
        expect(result.filters).toEqual({
            category: '2',
            location: 'Vilnius',
            gender: '1',
            startDate: '2026-04-01',
            endDate: '2026-04-30'
        });

        expect(mockQuery).toHaveBeenNthCalledWith(
            1,
            expect.stringContaining('SELECT * FROM activities WHERE 1=1 AND category_id = ? AND location = ? AND gender_id = ? AND DATE(starts_at) >= ? AND DATE(starts_at) <= ? ORDER BY created_at DESC LIMIT 1 OFFSET ?'),
            ['2', 'Vilnius', '1', '2026-04-01', '2026-04-30', 2]
        );

        expect(mockQuery).toHaveBeenNthCalledWith(
            2,
            expect.stringContaining('SELECT COUNT(*) as count FROM activities WHERE 1=1 AND category_id = ? AND location = ? AND gender_id = ? AND DATE(starts_at) >= ? AND DATE(starts_at) <= ?'),
            ['2', 'Vilnius', '1', '2026-04-01', '2026-04-30']
        );
    });

    it('excludes already accepted and rejected activities for logged-in users', async () => {
        const mockActivity = { id: 3, name: 'Yoga', category_id: 1, location: 'Kaunas', created_at: '2026-04-01' };

        mockQuery
            .mockResolvedValueOnce([[mockActivity], []])
            .mockResolvedValueOnce([[{ count: 1 }], []])
            .mockResolvedValueOnce([[{ id: 1, name: 'Sport' }], []])
            .mockResolvedValueOnce([[{ id: 1, name: 'Male' }], []])
            .mockResolvedValueOnce([[{ location: 'Kaunas' }], []]);

        const url = new URL('http://localhost/app/activities');
        const result = await load({ url, locals: { user: { id: 42, username: 'user1' } } } as any);

        expect(result.activity).toEqual(mockActivity);

        const [mainQuery, mainParams] = mockQuery.mock.calls[0];
        expect(mainQuery).toContain('activity_participants');
        expect(mainQuery).toContain('activity_rejections');
        expect(mainParams).toContain(42); // user id appears for both exclusion subqueries
    });

    it('uses offset=0 for logged-in users regardless of URL offset', async () => {
        mockQuery
            .mockResolvedValueOnce([[], []])
            .mockResolvedValueOnce([[{ count: 0 }], []])
            .mockResolvedValueOnce([[], []])
            .mockResolvedValueOnce([[], []])
            .mockResolvedValueOnce([[], []]);

        const url = new URL('http://localhost/app/activities?offset=5');
        await load({ url, locals: { user: { id: 7, username: 'tester' } } } as any);

        const [, mainParams] = mockQuery.mock.calls[0];
        // Last param is the offset – should be 0 for logged-in users
        expect(mainParams[mainParams.length - 1]).toBe(0);
    });

    it('respects URL offset for guest users (no session)', async () => {
        mockQuery
            .mockResolvedValueOnce([[], []])
            .mockResolvedValueOnce([[{ count: 0 }], []])
            .mockResolvedValueOnce([[], []])
            .mockResolvedValueOnce([[], []])
            .mockResolvedValueOnce([[], []]);

        const url = new URL('http://localhost/app/activities?offset=3');
        await load({ url, locals: { user: null } } as any);

        const [, mainParams] = mockQuery.mock.calls[0];
        expect(mainParams[mainParams.length - 1]).toBe(3);
    });
});
