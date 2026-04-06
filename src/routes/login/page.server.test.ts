import { describe, it, expect, vi, beforeEach } from 'vitest';
import { actions } from './+page.server';

// Mock the database and session
vi.mock('$lib/database/connection', () => ({
	pool: {
		execute: vi.fn()
	}
}));

vi.mock('$lib/server/session', () => ({
	createSession: vi.fn()
}));

import { pool } from '$lib/database/connection';
import { createSession } from '$lib/server/session';

describe('login actions', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should login successfully with valid credentials', async () => {
		const mockUser = { id: 1, username: 'testuser', password: 'testpass' };
		const mockSessionId = 'session123';

		// Make the pool.execute return a user for SELECT query
		(pool.execute as any).mockImplementation((sql: string, params: any[]) => {
			if (sql.startsWith('SELECT * FROM users')) {
				return Promise.resolve([[mockUser]]);
			} else {
				// Any other query (like INSERT) throws an error
				return Promise.reject(new Error('Invalid SQL'));
			}
		});

		(createSession as any).mockImplementation(async (userId: number) => {
			if (userId !== 1) throw new Error('Invalid userId');
			return mockSessionId;
		});

		const mockRequest = {
			formData: vi.fn().mockResolvedValue({
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

		// Since redirect throws, we expect it to throw
		await expect(actions.default({
			request: mockRequest,
			cookies: mockCookies
		} as any)).rejects.toThrow();

		expect(pool.execute).toHaveBeenCalledWith('SELECT * FROM users where username = ?', ['testuser']);
		expect(createSession).toHaveBeenCalledWith(1);
		expect(mockCookies.set).toHaveBeenCalledWith('session', 'session123', {
			path: '/',
			httpOnly: true,
			maxAge: 60*60*24*30
		});
	});

	it('should fail with invalid credentials', async () => {
		(pool.execute as any).mockResolvedValue([[]]);

		const mockRequest = {
			formData: vi.fn().mockResolvedValue({
				get: (key: string) => {
					if (key === 'username') return 'wronguser';
					if (key === 'password') return 'wrongpass';
					return null;
				}
			})
		};

		const result = await actions.default({
			request: mockRequest,
			cookies: {}
		} as any);

		expect(result).toEqual({
			status: 400,
			data: { error: 'Invalid username or password' }
		});
	});
});