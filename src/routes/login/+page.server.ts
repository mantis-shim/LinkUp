import { pool } from "$lib/database/connection";
import { createSession } from "$lib/server/session";
import { redirect, fail } from "@sveltejs/kit";
import type { Actions } from "./$types.js";

 export const actions: Actions = {
    default: async ({ request, cookies }) => {
        const data = await request.formData();
        const username = data.get('username') as string;
        const password = data.get('password') as string;

        const [rows] = await pool.execute('SELECT * FROM users where username = ?', [username]);
        const user = (rows as any[])[0];

        if (!user || user.password !== password) {
            return fail(400, { error: 'Invalid username or password'});
        }
        const sessionId = await createSession(user.id);
        cookies.set('session', sessionId, { path: '/', httpOnly: true, maxAge: 60*60*24*30});

        redirect(302, '/');
    }
};