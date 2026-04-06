import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { actions } from './+page.server.ts';

// --- Mocks ---

vi.mock('$lib/database/connection', () => ({
    pool: { execute: vi.fn() }
}));

vi.mock('$lib/server/session', () => ({
    createSession: vi.fn()
}));

vi.mock('@sveltejs/kit', async () => {
    const actual = await vi.importActual('@sveltejs/kit');
    return {
        ...actual,
        redirect: vi.fn((status, location) => {
            throw { status, location, isRedirect: true };
        }),
        fail: vi.fn((status, data) => ({ status, data }))
    };
});

import { pool } from '$lib/database/connection';
import { createSession } from '$lib/server/session';
import { redirect, fail } from '@sveltejs/kit';

const mockExecute = pool.execute as Mock;

// --- Helpers ---

function makeRequest(fields: Record<string, string>) {
    return {
        request: {
            formData: async () => ({
                get: (key: string) => fields[key] ?? null
            })
        },
        cookies: {
            set: vi.fn()
        }
    } as any;
}

const mockUser = { id: 1, username: 'alice', password: 'secret123' };

beforeEach(() => {
    vi.clearAllMocks();
});

// --- Tests ---

describe('login action', () => {
    describe('successful login', () => {
        it('sets a session cookie and redirects to / on valid credentials', async () => {
            mockExecute.mockResolvedValueOnce([[mockUser], []]);
            vi.mocked(createSession).mockResolvedValueOnce('session-token-abc');

            const ctx = makeRequest({ username: 'alice', password: 'secret123' });

            await expect(actions.default(ctx)).rejects.toMatchObject({
                isRedirect: true,
                status: 302,
                location: '/'
            });

            expect(ctx.cookies.set).toHaveBeenCalledWith(
                'session',
                'session-token-abc',
                { path: '/', httpOnly: true, maxAge: 60 * 60 * 24 * 30 }
            );
        });

        it('creates a session with the matched user id', async () => {
            mockExecute.mockResolvedValueOnce([[mockUser], []]);
            vi.mocked(createSession).mockResolvedValueOnce('session-token-abc');

            const ctx = makeRequest({ username: 'alice', password: 'secret123' });
            await expect(actions.default(ctx)).rejects.toMatchObject({ isRedirect: true });

            expect(createSession).toHaveBeenCalledWith(mockUser.id);
        });

        it('queries the database with the submitted username', async () => {
            mockExecute.mockResolvedValueOnce([[mockUser], []]);
            vi.mocked(createSession).mockResolvedValueOnce('tok');

            const ctx = makeRequest({ username: 'alice', password: 'secret123' });
            await expect(actions.default(ctx)).rejects.toMatchObject({ isRedirect: true });

            expect(pool.execute).toHaveBeenCalledWith(
                expect.stringContaining('WHERE username = ?'),
                ['alice']
            );
        });
    });

    describe('failed login', () => {
        it('returns fail(400) when the user does not exist', async () => {
            mockExecute.mockResolvedValueOnce([[], []]);

            const ctx = makeRequest({ username: 'ghost', password: 'anything' });
            const result = await actions.default(ctx);

            expect(fail).toHaveBeenCalledWith(400, { error: 'Invalid username or password' });
            expect(result).toMatchObject({ status: 400, data: { error: 'Invalid username or password' } });
        });

        it('returns fail(400) when the password is wrong', async () => {
            mockExecute.mockResolvedValueOnce([[mockUser], []]);

            const ctx = makeRequest({ username: 'alice', password: 'wrongpassword' });
            const result = await actions.default(ctx);

            expect(fail).toHaveBeenCalledWith(400, { error: 'Invalid username or password' });
            expect(result).toMatchObject({ status: 400, data: { error: 'Invalid username or password' } });
        });

        it('does not create a session on failed login', async () => {
            mockExecute.mockResolvedValueOnce([[], []]);

            const ctx = makeRequest({ username: 'ghost', password: 'anything' });
            await actions.default(ctx);

            expect(createSession).not.toHaveBeenCalled();
        });

        it('does not set a cookie on failed login', async () => {
            mockExecute.mockResolvedValueOnce([[], []]);

            const ctx = makeRequest({ username: 'ghost', password: 'anything' });
            await actions.default(ctx);

            expect(ctx.cookies.set).not.toHaveBeenCalled();
        });
    });

    describe('edge cases', () => {
        it('returns fail(400) when username is an empty string', async () => {
            mockExecute.mockResolvedValueOnce([[], []]);

            const ctx = makeRequest({ username: '', password: 'secret123' });
            const result = await actions.default(ctx);

            expect(result).toMatchObject({ status: 400 });
        });

        it('returns fail(400) when password is an empty string', async () => {
            mockExecute.mockResolvedValueOnce([[mockUser], []]);

            const ctx = makeRequest({ username: 'alice', password: '' });
            const result = await actions.default(ctx);

            expect(result).toMatchObject({ status: 400 });
        });

        it('propagates unexpected database errors', async () => {
            mockExecute.mockRejectedValueOnce(new Error('DB connection lost'));

            const ctx = makeRequest({ username: 'alice', password: 'secret123' });

            await expect(actions.default(ctx)).rejects.toThrow('DB connection lost');
        });
    });
});