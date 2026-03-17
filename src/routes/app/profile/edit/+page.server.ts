import { pool } from '$lib/database/connection';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	try {
		const userId = locals.user?.id ?? 1;

		const [rows] = await pool.query(
			'SELECT id, username FROM users WHERE id = ?',
			[userId]
		);

		const users = rows as { id: number; username: string }[];
		const raw = users[0] || null;
		const user = raw ? { id: raw.id, username: String(raw.username) } : null;
		return { user };
	} catch (error) {
		console.error('Profile edit load failed:', error);
		return { user: null };
	}
};

export const actions: Actions = {
	updateProfile: async () => {
		// TODO: validate and update user in DB, then redirect
		return { success: false };
	}
};
