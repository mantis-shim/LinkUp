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

        const result = await load({ url } as any);

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
});
