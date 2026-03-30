import { pool } from '$lib/database/connection';
import { fail, redirect } from '@sveltejs/kit';
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
	} catch {
		console.error('Profilio redagavimo užkrovimas nepavyko.');
		return { user: null };
	}
};

export const actions: Actions = {
	updateProfile: async ({ request, locals }) => {
		const userId = locals.user?.id ?? 1;
		const formData = await request.formData();
		const usernameRaw = formData.get('username');
		const username = typeof usernameRaw === 'string' ? usernameRaw.trim() : '';

		if (!username) {
			return fail(400, {
				usernameError: 'Vartotojo vardas privalomas.',
				username: ''
			});
		}

		try {
			const [taken] = await pool.query(
				'SELECT id FROM users WHERE username = ? AND id != ?',
				[username, userId]
			);
			const rows = taken as { id: number }[];
			if (rows.length > 0) {
				return fail(400, {
					usernameError: 'Šis vartotojo vardas jau užimtas.',
					username
				});
			}

			await pool.query('UPDATE users SET username = ? WHERE id = ?', [username, userId]);
		} catch {
			console.error('Profilio atnaujinimas nepavyko.');
			return fail(500, {
				usernameError: 'Nepavyko išsaugoti. Bandykite dar kartą.',
				username
			});
		}

		throw redirect(303, '/app/profile');
	}
};
