import { pool } from '$lib/database/connection';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
    const userId = locals.user?.id ?? 1;
    const { friendId } = await request.json();

    if (!friendId || friendId === userId) {
        return new Response(JSON.stringify({ error: 'Invalid friendId' }), { status: 400 });
    }

    try {
        await pool.query(
            'INSERT INTO friendships (user_id, friend_id, status) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE status = VALUES(status)',
            [userId, friendId, 'pending']
        );
        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (e) {
        return new Response(JSON.stringify({ error: 'Database error' }), { status: 500 });
    }
};

export const PATCH: RequestHandler = async ({ request, locals }) => {
    const userId = locals.user?.id ?? 1;
    const { friendId } = await request.json();

    if (!friendId || friendId === userId) {
        return new Response(JSON.stringify({ error: 'Invalid friendId' }), { status: 400 });
    }

    try {
        const [result] = await pool.query(
            'UPDATE friendships SET status = ? WHERE user_id = ? AND friend_id = ? AND status = ?',
            ['accepted', friendId, userId, 'pending']
        );

        if (!(result as any).affectedRows) {
            return new Response(JSON.stringify({ error: 'Request not found' }), { status: 404 });
        }

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (e) {
        return new Response(JSON.stringify({ error: 'Database error' }), { status: 500 });
    }
};

export const DELETE: RequestHandler = async ({ request, locals }) => {
    const userId = locals.user?.id ?? 1;
    const { friendId } = await request.json();

    if (!friendId || friendId === userId) {
        return new Response(JSON.stringify({ error: 'Invalid friendId' }), { status: 400 });
    }

    try {
        const [result] = await pool.query(
            'DELETE FROM friendships WHERE user_id = ? AND friend_id = ? AND status = ?',
            [friendId, userId, 'pending']
        );

        if (!(result as any).affectedRows) {
            return new Response(JSON.stringify({ error: 'Request not found' }), { status: 404 });
        }

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (e) {
        return new Response(JSON.stringify({ error: 'Database error' }), { status: 500 });
    }
};
