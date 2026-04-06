// Mock the database and session


import { createSession } from '$lib/server/session';

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { actions } from './+page.server';
import { pool } from '$lib/database/connection';

vi.mock('$lib/database/connection', () => ({
	pool: {
		execute: vi.fn()
	}
}));

vi.mock('$lib/server/session', () => ({
	createSession: vi.fn()
}));
describe('login actions (real DB, no mocks)', () => {

    // Insert a test user before each test
    beforeEach(async () => {
        await pool.execute(
            'INSERT INTO users (id, username, password) VALUES (?, ?, ?)',
            [1, 'testuser', 'testpass']
        );
        // Clear any existing sessions
        await pool.execute('DELETE FROM sessions');
    });

    // Clean up after each test
    afterEach(async () => {
        await pool.execute('DELETE FROM sessions');
        await pool.execute('DELETE FROM users');
    });

    it('should login successfully with valid credentials', async () => {
        const mockRequest = {
            formData: async () => ({
                get: (key: string) => {
                    if (key === 'username') return 'testuser';
                    if (key === 'password') return 'testpass';
                    return null;
                }
            })
        };

        const mockCookies = {
            set: vi.fn()
        };

        // Call the real login action
        await expect(
            actions.default({
                request: mockRequest,
                cookies: mockCookies
            } as any)
        ).rejects.toThrow(); // SvelteKit redirect throws

        // Check that a session was created in the DB
        const [rows]: any = await pool.execute('SELECT * FROM sessions');
        expect(rows.length).toBe(1);
        expect(rows[0].user_id).toBe(1);

        // Check cookie was set correctly
        expect(mockCookies.set).toHaveBeenCalled();
        const cookieArgs = mockCookies.set.mock.calls[0];
        expect(cookieArgs[0]).toBe('session'); // cookie name
        expect(typeof cookieArgs[1]).toBe('string'); // session id
        expect(cookieArgs[2]).toMatchObject({
            path: '/',
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 30
        });
    });

    it('should fail with invalid credentials', async () => {
        const mockRequest = {
            formData: async () => ({
                get: (key: string) => {
                    if (key === 'username') return 'wronguser';
                    if (key === 'password') return 'wrongpass';
                    return null;
                }
            })
        };

        const mockCookies = {
            set: vi.fn()
        };

        const result = await actions.default({
            request: mockRequest,
            cookies: mockCookies
        } as any);

        expect(result).toEqual({
            status: 400,
            data: { error: 'Invalid username or password' }
        });

        // No session should be created
        const [rows]: any = await pool.execute('SELECT * FROM sessions');
        expect(rows.length).toBe(0);
    });
});