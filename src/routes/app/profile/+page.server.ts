import { pool } from '$lib/database/connection';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
    try {
        if (!locals.user) {
            throw redirect(302, '/login');
        }

        const userId = locals.user.id;

        const [rows] = await pool.query(
            'SELECT id, username, name, lastname, email, city FROM users WHERE id = ?',
            [userId]
        );

        const users = rows as any[];
        const user = users[0] || null;

        if (!user) {
            return { dbStatus: 'Error', user: null, createdActivities: [], upcomingActivities: [], pastActivities: [] };
        }

        const activitySelect = `
            SELECT a.*, c.name AS category_name
            FROM activities a
            LEFT JOIN categories c ON c.id = a.category_id
        `;

        const [createdRows] = await pool.query(
            `${activitySelect} WHERE a.creator_id = ? ORDER BY a.starts_at DESC, a.created_at DESC`,
            [userId]
        );

        const [upcomingRows] = await pool.query(
            `${activitySelect}
             JOIN activity_participants ap ON ap.activity_id = a.id
             WHERE ap.user_id = ? AND a.starts_at >= NOW()
             ORDER BY a.starts_at ASC`,
            [userId]
        );

        const [pastRows] = await pool.query(
            `${activitySelect}
             JOIN activity_participants ap ON ap.activity_id = a.id
             WHERE ap.user_id = ? AND a.starts_at < NOW()
             ORDER BY a.starts_at DESC`,
            [userId]
        );

        return {
            dbStatus: 'Connected',
            user,
            createdActivities: createdRows as any[],
            upcomingActivities: upcomingRows as any[],
            pastActivities: pastRows as any[],
        };

    } catch (error: any) {
        if (error?.status === 302) throw error;

        console.error('Profile fetch failed:', error);
        return {
            dbStatus: 'Error',
            error: error.message,
            user: null,
            createdActivities: [],
            upcomingActivities: [],
            pastActivities: [],
        };
    }
};
