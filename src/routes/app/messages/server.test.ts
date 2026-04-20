import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

vi.mock('$lib/database/connection', () => ({
	pool: { query: vi.fn(), getConnection: vi.fn() }
}));

import { pool } from '$lib/database/connection';
import { DELETE, PATCH, POST } from './+server';

const mockQuery = pool.query as Mock;
const mockGetConnection = pool.getConnection as Mock;

beforeEach(() => {
	vi.clearAllMocks();
});

function makeRequest(body: unknown, method = 'POST'): Request {
	return new Request('http://localhost/app/messages', {
		method,
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
}

describe('POST /app/messages', () => {
	it('creates a pending friendship request', async () => {
		mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }, undefined]);

		const response = await POST({
			request: makeRequest({ friendId: 2 }),
			locals: { user: { id: 1, username: 'alice' } }
		} as any);

		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({ success: true });
		expect(mockQuery).toHaveBeenCalledWith(
			'INSERT INTO friendships (user_id, friend_id, status) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE status = VALUES(status)',
			[1, 2, 'pending']
		);
	});

	it('returns 400 when friendId is invalid', async () => {
		const response = await POST({
			request: makeRequest({ friendId: 1 }),
			locals: { user: { id: 1, username: 'alice' } }
		} as any);

		expect(response.status).toBe(400);
		expect(await response.json()).toEqual({ error: 'Invalid friendId' });
		expect(mockQuery).not.toHaveBeenCalled();
	});
});

describe('PATCH /app/messages', () => {
	it('accepts invitation and returns conversation id', async () => {
		const connection = {
			beginTransaction: vi.fn().mockResolvedValue(undefined),
			query: vi
				.fn()
				.mockResolvedValueOnce([{ affectedRows: 1 }, undefined])
				.mockResolvedValueOnce([[{ id: 33 }], undefined]),
			commit: vi.fn().mockResolvedValue(undefined),
			rollback: vi.fn().mockResolvedValue(undefined),
			release: vi.fn()
		};

		mockGetConnection.mockResolvedValueOnce(connection);

		const response = await PATCH({
			request: makeRequest({ friendId: 2 }, 'PATCH'),
			locals: { user: { id: 1, username: 'alice' } }
		} as any);

		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({ success: true, conversationId: 33 });
		expect(connection.beginTransaction).toHaveBeenCalled();
		expect(connection.query).toHaveBeenNthCalledWith(
			1,
			'UPDATE friendships SET status = ? WHERE user_id = ? AND friend_id = ? AND status = ?',
			['accepted', 2, 1, 'pending']
		);
		expect(connection.commit).toHaveBeenCalled();
		expect(connection.release).toHaveBeenCalled();
	});
});

describe('DELETE /app/messages', () => {
	it('deletes a pending invitation and returns success', async () => {
		mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }, undefined]);

		const response = await DELETE({
			request: makeRequest({ friendId: 2 }, 'DELETE'),
			locals: { user: { id: 1, username: 'alice' } }
		} as any);

		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({ success: true });
		expect(mockQuery).toHaveBeenCalledWith(
			'DELETE FROM friendships WHERE user_id = ? AND friend_id = ? AND status = ?',
			[2, 1, 'pending']
		);
	});
});
