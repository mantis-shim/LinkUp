import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';

vi.mock('$lib/database/connection', () => ({
    pool: { query: vi.fn(), execute: vi.fn() }
}));

import { pool } from '$lib/database/connection';
import { POST } from './+server.ts';

const mockQuery = pool.query as Mock;

beforeEach(() => {
    vi.clearAllMocks();
});

function makeRequest(body: unknown): Request {
    return new Request('http://localhost/app/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
}

function makeLocals(user: { id: number; username: string } | null) {
    return { user };
}

describe('POST /app/activities – accept', () => {
    it('inserts into activity_participants and returns { status: "accepted" }', async () => {
        mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }, undefined]);

        const response = await POST({
            request: makeRequest({ activityId: 5, action: 'accept' }),
            locals: makeLocals({ id: 1, username: 'alice' })
        } as any);

        const json = await response.json();
        expect(response.status).toBe(200);
        expect(json).toEqual({ status: 'accepted' });
        expect(mockQuery).toHaveBeenCalledWith(
            'INSERT IGNORE INTO activity_participants (activity_id, user_id) VALUES (?, ?)',
            [5, 1]
        );
    });
});

describe('POST /app/activities – reject', () => {
    it('inserts into activity_rejections and returns { status: "rejected" }', async () => {
    mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }, undefined]);

        const response = await POST({
            request: makeRequest({ activityId: 9, action: 'reject' }),
            locals: makeLocals({ id: 2, username: 'bob' })
        } as any);

        const json = await response.json();
        expect(response.status).toBe(200);
        expect(json).toEqual({ status: 'rejected' });
        expect(mockQuery).toHaveBeenCalledWith(
            'INSERT IGNORE INTO activity_rejections (activity_id, user_id) VALUES (?, ?)',
            [9, 2]
        );
    });
});

describe('POST /app/activities – auth & validation', () => {
    it('returns 401 when user is not logged in', async () => {
        const response = await POST({
            request: makeRequest({ activityId: 1, action: 'accept' }),
            locals: makeLocals(null)
        } as any);

        expect(response.status).toBe(401);
        const json = await response.json();
        expect(json).toHaveProperty('error');
        expect(mockQuery).not.toHaveBeenCalled();
    });

    it('returns 400 for an invalid action string', async () => {
        const response = await POST({
            request: makeRequest({ activityId: 1, action: 'like' }),
            locals: makeLocals({ id: 1, username: 'alice' })
        } as any);

        expect(response.status).toBe(400);
        const json = await response.json();
        expect(json.error).toMatch(/invalid action/i);
        expect(mockQuery).not.toHaveBeenCalled();
    });

    it('returns 400 when activityId is missing', async () => {
        const response = await POST({
            request: makeRequest({ action: 'accept' }),
            locals: makeLocals({ id: 1, username: 'alice' })
        } as any);

        expect(response.status).toBe(400);
        const json = await response.json();
        expect(json.error).toMatch(/invalid activityId/i);
        expect(mockQuery).not.toHaveBeenCalled();
    });

    it('returns 400 when activityId is not an integer', async () => {
        const response = await POST({
            request: makeRequest({ activityId: 'abc', action: 'accept' }),
            locals: makeLocals({ id: 1, username: 'alice' })
        } as any);

        expect(response.status).toBe(400);
        expect(mockQuery).not.toHaveBeenCalled();
    });

    it('returns 400 for invalid JSON body', async () => {
        const request = new Request('http://localhost/app/activities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: 'not-json'
        });

        const response = await POST({
            request,
            locals: makeLocals({ id: 1, username: 'alice' })
        } as any);

        expect(response.status).toBe(400);
    });

    it('returns 500 when the database throws', async () => {
        mockQuery.mockRejectedValueOnce(new Error('DB error'));

        const response = await POST({
            request: makeRequest({ activityId: 1, action: 'accept' }),
            locals: makeLocals({ id: 1, username: 'alice' })
        } as any);

        expect(response.status).toBe(500);
        const json = await response.json();
        expect(json).toHaveProperty('error');
    });
});
