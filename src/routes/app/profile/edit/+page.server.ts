import { pool } from '$lib/database/connection';
import { deleteSession } from '$lib/server/session';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	try {
		const userId = locals.user?.id ?? 1;

		const [rows] = await pool.query(
			'SELECT id, username, CHAR_LENGTH(password) AS password_char_count FROM users WHERE id = ?',
			[userId]
		);

		const users = rows as { id: number; username: string; password_char_count: number }[];
		const raw = users[0] || null;
		const user = raw ? { id: raw.id, username: String(raw.username) } : null;
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
		const usernameRaw = formData.get('username');
		const username = typeof usernameRaw === 'string' ? usernameRaw.trim() : '';
		const newPasswordRaw = formData.get('newPassword');
		const confirmNewRaw = formData.get('confirmNewPassword');
		const currentForChangeRaw = formData.get('currentPasswordForChange');
		const newPassword = typeof newPasswordRaw === 'string' ? newPasswordRaw : '';
		const confirmNew = typeof confirmNewRaw === 'string' ? confirmNewRaw : '';
		const currentForChange = typeof currentForChangeRaw === 'string' ? currentForChangeRaw : '';
		const wantsPasswordChange = newPassword.length > 0;

		if (!username) {
			return fail(400, {
				usernameError: 'Vartotojo vardas privalomas.',
				username: ''
			});
		}

		if (wantsPasswordChange) {
			if (!currentForChange) {
				return fail(400, {
					passwordError: 'Trūksta dabartinio slaptažodžio.',
					username
				});
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
				return fail(400, {
					passwordError: 'Neteisingas dabartinis slaptažodis.',
					username
				});
			}
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
			if (wantsPasswordChange) {
				await pool.query('UPDATE users SET password = ? WHERE id = ?', [newPassword, userId]);
			}
		} catch {
			console.error('Profilio atnaujinimas nepavyko.');
			return fail(500, {
				usernameError: 'Nepavyko išsaugoti. Bandykite dar kartą.',
				username
			});
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
