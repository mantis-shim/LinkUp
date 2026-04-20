import { pool } from '$lib/database/connection';
import { deleteSession } from '$lib/server/session';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	try {
		const userId = locals.user?.id ?? 1;

		const [rows] = await pool.query(
			'SELECT id, name, lastname, email, city, username, CHAR_LENGTH(password) AS password_char_count FROM users WHERE id = ?',
			[userId]
		);

		const users = rows as {
			id: number;
			name: string | null;
			lastname: string | null;
			email: string;
			city: string | null;
			username: string;
			password_char_count: number;
		}[];
		const raw = users[0] || null;
		const user = raw
			? {
					id: raw.id,
					name: raw.name ?? '',
					lastname: raw.lastname ?? '',
					email: String(raw.email),
					city: raw.city ?? '',
					username: String(raw.username)
				}
			: null;
		const passwordCharCount = raw ? Number(raw.password_char_count) : 0;
		return { user, passwordCharCount };
	} catch {
		console.error('Profilio redagavimo užkrovimas nepavyko.');
		return { user: null, passwordCharCount: 0 };
	}
};

export const actions: Actions = {
	updateProfile: async ({ request, locals }) => {
		const userId = locals.user?.id ?? 1;
		const formData = await request.formData();

		const username = (formData.get('username') as string ?? '').trim();
		const name = (formData.get('name') as string ?? '').trim();
		const lastname = (formData.get('lastname') as string ?? '').trim();
		const email = (formData.get('email') as string ?? '').trim();
		const city = (formData.get('city') as string ?? '').trim();
		const newPassword = (formData.get('newPassword') as string ?? '');
		const confirmNew = (formData.get('confirmNewPassword') as string ?? '');
		const currentForChange = (formData.get('currentPasswordForChange') as string ?? '');
		const wantsPasswordChange = newPassword.length > 0;

		if (!username) {
			return fail(400, { usernameError: 'Vartotojo vardas privalomas.', username: '' });
		}
		if (!email) {
			return fail(400, { emailError: 'El. paštas privalomas.', username });
		}

		if (wantsPasswordChange) {
			if (!currentForChange) {
				return fail(400, { passwordError: 'Trūksta dabartinio slaptažodžio.', username });
			}
			if (newPassword !== confirmNew) {
				return fail(400, {
					passwordError: 'Naujas slaptažodis nesutampa su pakartotiniu slaptažodžiu.',
					username
				});
			}
			const [pwRows] = await pool.query('SELECT password FROM users WHERE id = ?', [userId]);
			const pwRow = (pwRows as { password: string }[])[0];
			if (!pwRow || pwRow.password !== currentForChange) {
				return fail(400, { passwordError: 'Neteisingas dabartinis slaptažodis.', username });
			}
		}

		try {
			const [takenUsername] = await pool.query(
				'SELECT id FROM users WHERE username = ? AND id != ?',
				[username, userId]
			);
			if ((takenUsername as { id: number }[]).length > 0) {
				return fail(400, { usernameError: 'Šis vartotojo vardas jau užimtas.', username });
			}

			const [takenEmail] = await pool.query(
				'SELECT id FROM users WHERE email = ? AND id != ?',
				[email, userId]
			);
			if ((takenEmail as { id: number }[]).length > 0) {
				return fail(400, { emailError: 'Šis el. paštas jau naudojamas.', username });
			}

			await pool.query(
				'UPDATE users SET username = ?, name = ?, lastname = ?, email = ?, city = ? WHERE id = ?',
				[username, name || null, lastname || null, email, city || null, userId]
			);
			if (wantsPasswordChange) {
				await pool.query('UPDATE users SET password = ? WHERE id = ?', [newPassword, userId]);
			}
		} catch {
			console.error('Profilio atnaujinimas nepavyko.');
			return fail(500, { usernameError: 'Nepavyko išsaugoti. Bandykite dar kartą.', username });
		}

		throw redirect(303, '/app/profile');
	},

	verifyCurrentPassword: async ({ request, locals }) => {
		const userId = locals.user?.id ?? 1;
		const formData = await request.formData();
		const currentRaw = formData.get('currentPassword');
		const current = typeof currentRaw === 'string' ? currentRaw : '';

		const [rows] = await pool.query('SELECT password FROM users WHERE id = ?', [userId]);
		const row = (rows as { password: string }[])[0];
		if (!row || row.password !== current) {
			return fail(400, { verifyError: 'Neteisingas dabartinis slaptažodis.' });
		}

		return { success: true };
	},

	deleteAccount: async ({ locals, cookies }) => {
		const userId = locals.user?.id;
		if (!userId) {
			throw redirect(303, '/login');
		}

		const sessionId = cookies.get('session');
		const conn = await pool.getConnection();

		try {
			await conn.beginTransaction();

			await conn.query('DELETE FROM sessions WHERE user_id = ?', [userId]);
			await conn.query('DELETE FROM friendships WHERE user_id = ? OR friend_id = ?', [userId, userId]);
			await conn.query('DELETE FROM messages WHERE sender_id = ?', [userId]);
			await conn.query('DELETE FROM conversation_members WHERE user_id = ?', [userId]);
			await conn.query(
				`DELETE m FROM messages m
				 WHERE NOT EXISTS (
				   SELECT 1 FROM conversation_members cm WHERE cm.conversation_id = m.conversation_id
				 )`
			);
			await conn.query(
				`DELETE c FROM conversations c
				 WHERE NOT EXISTS (
				   SELECT 1 FROM conversation_members cm WHERE cm.conversation_id = c.id
				 )`
			);
			await conn.query('DELETE FROM activity_participants WHERE user_id = ?', [userId]);
			await conn.query(
				'DELETE FROM activity_participants WHERE activity_id IN (SELECT id FROM activities WHERE creator_id = ?)',
				[userId]
			);
			await conn.query('DELETE FROM activities WHERE creator_id = ?', [userId]);
			await conn.query('DELETE FROM users WHERE id = ?', [userId]);

			await conn.commit();
		} catch {
			await conn.rollback();
			console.error('Paskyros ištrynimas nepavyko.');
			return fail(500, {
				deleteError: 'Nepavyko ištrinti paskyros. Bandykite dar kartą.'
			});
		} finally {
			conn.release();
		}

		if (sessionId) {
			await deleteSession(sessionId);
		}
		cookies.delete('session', { path: '/' });

		throw redirect(303, '/login');
	}
};
