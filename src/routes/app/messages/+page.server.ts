import { pool } from '$lib/database/connection';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	const userId = locals.user.id;

	const [conversations] = await pool.query(
		`SELECT c.id, c.name, (SELECT content FROM messages m WHERE m.conversation_id = c.id ORDER BY m.sent_at DESC LIMIT 1) AS last_message,
		        (SELECT sent_at FROM messages m WHERE m.conversation_id = c.id ORDER BY m.sent_at DESC LIMIT 1) AS updated_at
		 FROM conversations c
		 JOIN conversation_members cm ON cm.conversation_id = c.id
		 WHERE cm.user_id = ?
		 ORDER BY updated_at DESC`,
		 [userId]
	);

	const [rows] = await pool.query(
		`SELECT id, username
		 FROM users
		 WHERE id != ?
		   AND id NOT IN (
		     SELECT friend_id FROM friendships WHERE user_id = ?
		     UNION
		     SELECT user_id FROM friendships WHERE friend_id = ?
		   )`,
		[userId, userId, userId]
	);

	const [pendingRows] = await pool.query(
		`SELECT f.user_id AS id, u.username
		 FROM friendships f
		 JOIN users u ON u.id = f.user_id
		 WHERE f.friend_id = ?
		   AND f.status = 'pending'
		 ORDER BY f.created_at DESC`,
		[userId]
	);

	return {
		conversations: conversations as any[],
		users: rows as { id: number; username: string }[],
		pendingRequests: pendingRows as { id: number; username: string }[],
	};
};