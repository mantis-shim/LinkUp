import { pool } from '$lib/database/connection';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    // Get current user id from session (fallback to 1 for demo)
    const userId = locals.user?.id ?? 1;
    // Query all users who are NOT friends with current user and not the user themselves
    const [rows] = await pool.query(
        `SELECT id, username FROM users WHERE id != ? AND id NOT IN (
            SELECT friend_id FROM friendships WHERE user_id = ?
            UNION
            SELECT user_id FROM friendships WHERE friend_id = ?
        )`,
        [userId, userId, userId]
    );
    return {
        users: rows as { id: number; username: string }[]
    };
};
