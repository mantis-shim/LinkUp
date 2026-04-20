import { pool } from '$lib/database/connection';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
    try {
        if (!locals.user) {
            throw redirect(302, '/login');
        }

        const userId = locals.user.id;

        // AC1 fields: id, username, name, lastname, email, city
        const [rows] = await pool.query(
            'SELECT id, username, name, lastname, email, city FROM users WHERE id = ?',
            [userId]
        );

        const users = rows as any[];
        const user = users[0] || null;

        if (!user) {
            return { dbStatus: 'Error', user: null, createdActivities: [], participatedActivities: [] };
        }

        const [createdRows] = await pool.query(
            'SELECT * FROM activities WHERE creator_id = ? ORDER BY starts_at DESC, created_at DESC',
            [userId]
        );

        const [participatedRows] = await pool.query(
            `SELECT a.* FROM activities a
             JOIN activity_participants ap ON a.id = ap.activity_id
             WHERE ap.user_id = ? AND a.creator_id != ?
             ORDER BY a.starts_at ASC`,
            [userId, userId]
        );

        return {
            dbStatus: 'Connected',
            user,
            createdActivities: createdRows as any[],
            participatedActivities: participatedRows as any[]
        };

    } catch (error: any) {
        if (error?.status === 302) throw error;

        console.error('Profile fetch failed:', error);
        return {
            dbStatus: 'Error',
            error: error.message,
            user: null,
            createdActivities: [],
            participatedActivities: []
        };
    }
};