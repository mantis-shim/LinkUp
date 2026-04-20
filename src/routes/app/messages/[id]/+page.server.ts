import { pool } from '$lib/database/connection';
import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	const conversationId = Number(params.id);
	if (Number.isNaN(conversationId)) {
		throw redirect(302, '/app/messages');
	}

	// Verify user is member of conversation
	const [memberRows] = await pool.query(
		'SELECT 1 FROM conversation_members WHERE conversation_id = ? AND user_id = ?',
		[conversationId, locals.user.id]
	);

	if (!(memberRows as any[]).length) {
		throw redirect(302, '/app/messages');
	}

	const [conversationRows] = await pool.query(
		`SELECT c.id, c.is_group,
		        COALESCE(c.name, (
		            SELECT u.username
		            FROM conversation_members cm2
		            JOIN users u ON u.id = cm2.user_id
		            WHERE cm2.conversation_id = c.id AND cm2.user_id != ?
		            LIMIT 1
		        )) AS name
		 FROM conversations c WHERE c.id = ?`,
		[locals.user.id, conversationId]
	);
	const conversation = (conversationRows as any[])[0];

	const [messages] = await pool.query(
		`SELECT m.id, m.content, m.sent_at, m.sender_id, u.username as sender_name
		 FROM messages m
		 JOIN users u ON u.id = m.sender_id
		 WHERE m.conversation_id = ?
		 ORDER BY m.sent_at ASC`,
		[conversationId]
	);

	return {
		conversation,
		messages: messages as any[],
		currentUserId: locals.user.id
	};
};

export const actions: Actions = {
	default: async ({ request, locals, params }) => {
		if (!locals.user) {
			return fail(401, { error: 'Not authenticated' });
		}

		const form = await request.formData();
		const content = (form.get('content') as string || '').trim();
		if (!content) {
			return fail(400, { error: 'Message is required' });
		}

		const conversationId = Number(params.id);
		if (Number.isNaN(conversationId)) {
			return fail(400, { error: 'Invalid conversation ID' });
		}

		await pool.execute(
			'INSERT INTO messages (conversation_id, sender_id, content, sent_at) VALUES (?, ?, ?, NOW())',
			[conversationId, locals.user.id, content]
		);

		return { success: true };
	}
};