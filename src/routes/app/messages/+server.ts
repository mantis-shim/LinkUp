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

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [result] = await connection.query(
            'UPDATE friendships SET status = ? WHERE user_id = ? AND friend_id = ? AND status = ?',
            ['accepted', friendId, userId, 'pending']
        );

        if (!(result as any).affectedRows) {
            await connection.rollback();
            return new Response(JSON.stringify({ error: 'Request not found' }), { status: 404 });
        }

        const [existingConversationRows] = await connection.query(
            `SELECT c.id
             FROM conversations c
             JOIN conversation_members cm1 ON cm1.conversation_id = c.id
             JOIN conversation_members cm2 ON cm2.conversation_id = c.id
             WHERE c.is_group = FALSE AND cm1.user_id = ? AND cm2.user_id = ?
             LIMIT 1`,
            [userId, friendId]
        );

        let conversationId = (existingConversationRows as any[])[0]?.id as number | undefined;

        if (!conversationId) {
            const [insertConversationResult] = await connection.query(
                'INSERT INTO conversations (name, is_group) VALUES (?, ?)',
                [null, false]
            );

            conversationId = (insertConversationResult as any).insertId as number;

            await connection.query(
                'INSERT INTO conversation_members (conversation_id, user_id) VALUES (?, ?), (?, ?)',
                [conversationId, userId, conversationId, friendId]
            );
        }

        await connection.commit();

        return new Response(JSON.stringify({ success: true, conversationId }), { status: 200 });
    } catch (e) {
        await connection.rollback();
        return new Response(JSON.stringify({ error: 'Database error' }), { status: 500 });
    } finally {
        connection.release();
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
