import { pool } from '$lib/database/connection';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, url }) => {
    try {
        // AC2: Tik prisijungęs vartotojas mato savo profilio informaciją.
        if (!locals.user) {
            throw redirect(302, '/login');
        }

        const userId = locals.user.id;
        const category = url.searchParams.get('category') || 'created';

        console.log(`Fetching profile for id ${userId} category=${category}`);

        // AC1 fields: id, username, first_name, last_name, email, city
        const [rows] = await pool.query(
            'SELECT id, username, first_name, last_name, email, city, created_at FROM users WHERE id = ?',
            [userId]
        );

        const users = rows as any[];
        const user = users[0] || null;

        if (!user) {
            return {
                dbStatus: 'Error',
                user: null,
                activities: []
            };
        }

        // Query cases for activity filters
        let activitiesQuery = 'SELECT * FROM activities WHERE creator_id = ? ORDER BY starts_at DESC, created_at DESC';
        let params: any[] = [userId];

        if (category === 'past') {
            activitiesQuery = 'SELECT * FROM activities WHERE creator_id = ? AND starts_at IS NOT NULL AND starts_at < NOW() ORDER BY starts_at DESC';
        } else if (category === 'upcoming') {
            activitiesQuery = 'SELECT * FROM activities WHERE creator_id = ? AND starts_at IS NOT NULL AND starts_at >= NOW() ORDER BY starts_at ASC';
        }

        const [activityRows] = await pool.query(activitiesQuery, params);
        const activities = activityRows as any[];

        return {
            dbStatus: 'Connected',
            user,
            activities,
            category
        };

    } catch (error: any) {
        if (error?.status === 302) throw error; 

        console.error('Profile fetch failed:', error);
        return {
            dbStatus: 'Error',
            error: error.message,
            user: null,
            activities: []
        };
    }
};