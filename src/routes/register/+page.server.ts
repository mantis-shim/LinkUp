import { pool } from "$lib/database/connection";
import { createSession } from "$lib/server/session";
import { redirect, fail } from "@sveltejs/kit";
import type { Actions } from "./$types";

export const actions: Actions = {
    default: async ({ request, cookies }) => {
        const data = await request.formData();
        const username = data.get('username') as string;
        const password = data.get('password') as string;

        if (!username || username.trim().length < 3) {
            return fail(400, { error: 'Username must be at least 3 characters' });
        }
        if (!password || password.length < 1) {
            return fail(400, { error: 'Password is required' });
        }

        let result: any;
        try {
            [result] = await pool.execute(
                'INSERT INTO users (username, password) VALUES (?, ?)',
                [username.trim(), password]
            ) as any;
        } catch (err: any) {
            // MySQL duplicate entry error code
            if (err.code === 'ER_DUP_ENTRY') {
                return fail(400, { error: 'Username already taken' });
            }
            console.error('DB error during register:', err);
            return fail(500, { error: 'Something went wrong, please try again' });
        }

        let sessionId: string;
        try {
            sessionId = await createSession(result.insertId);
        } catch (err) {
            console.error('Failed to create session:', err);
            return fail(500, { error: 'Account created but could not log in, please try logging in' });
        }

        cookies.set('session', sessionId, { path: '/', httpOnly: true, maxAge: 60 * 60 * 24 * 30 });
        redirect(302, '/login');
    }
};