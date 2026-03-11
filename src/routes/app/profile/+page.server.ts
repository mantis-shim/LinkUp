import { pool } from '$lib/database/connection';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    try {
        // Try to fetch the id from session (locals.user.id) first, fallback to 1
        const userId = locals.user?.id ?? 1;
        
        console.log(`Fetching user profile for id ${userId}...`);
        
        // Fetch user data
        const [rows] = await pool.query(
            'SELECT id, username FROM users WHERE id = ?',
            [userId]
        );
        
        const users = rows as any[];
        const user = users[0] || null;

        if (!user) {
            return {
                dbStatus: 'Error',
                user: null,

            };
        }


        return {
            dbStatus: 'Connected',
            user: user,
        };
    } catch (error: any) {
        console.error('Profile fetch failed:', error);
        return {
            dbStatus: 'Error',
            error: error.message,
            user: null,

        };
    }
};