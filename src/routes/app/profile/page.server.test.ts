import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { load } from './+page.server';
import { pool } from '$lib/database/connection';
import { redirect } from '@sveltejs/kit';

vi.mock('$lib/database/connection', () => ({
    pool: { query: vi.fn() }
}));

vi.mock('@sveltejs/kit', async () => {
    const actual = await vi.importActual('@sveltejs/kit');
    return {
        ...actual,
        redirect: vi.fn((status, location) => {
            throw { status, location, isRedirect: true };
        })
    };
});

const mockQuery = pool.query as Mock;

describe('Profile Page Load Function', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('AC2: redirects to /login if user is not authenticated', async () => {
        const event = {
            locals: { user: null },
            url: new URL('http://localhost:5173/app/profile')
        } as any;

        await expect(load(event)).rejects.toMatchObject({
            status: 302,
            location: '/login'
        });
    });

    it('AC1: fetches user profile data from DB for authenticated user', async () => {
        const mockUser = { 
            id: 1, 
            username: 'testuser', 
            password: 'testuser',
            name: 'Test',
            lastname: 'User',
        };
        
        mockQuery.mockResolvedValueOnce([[mockUser], []]);
        mockQuery.mockResolvedValueOnce([[], []]);
        mockQuery.mockResolvedValueOnce([[], []]);

        const event = {
            locals: { user: { id: 1 } },
            url: new URL('http://localhost:5173/app/profile')
        } as any;

        const result = await load(event);

        expect(result).toMatchObject({
            dbStatus: 'Connected',
            user: mockUser
        });
        expect(mockQuery).toHaveBeenCalledWith(
            expect.stringContaining('SELECT id, username FROM users WHERE id = ?'),
            [1]
        );
    });

    it('returns dbStatus Error if user is not found in DB', async () => {
        mockQuery.mockResolvedValueOnce([[], []]); // No user found

        const event = {
            locals: { user: { id: 999 } },
            url: new URL('http://localhost:5173/app/profile')
        } as any;

        const result = await load(event);

        expect(result.dbStatus).toBe('Error');
        expect(result.user).toBeNull();
    });
});
