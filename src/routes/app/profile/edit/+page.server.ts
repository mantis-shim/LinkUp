import { pool } from '$lib/database/connection';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	try {
		const userId = locals.user?.id ?? 1;

		const [rows] = await pool.query(
			'SELECT id, username FROM users WHERE id = ?',
			[userId]
		);

		const users = rows as { id: number; username: string }[];
		const user = users[0] || null;

		return { user };
	} catch (error) {
		console.error('Profile edit load failed:', error);
		return { user: null };
	}
};
