import { pool } from '$lib/database/connection';
import type { RequestHandler } from './$types';
import type { Activity } from '$lib/types';
import { json } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
    try {
        const limit = 3;
        const offset = Number(url.searchParams.get('offset')) || 0;
        
        const [rows] = await pool.query(
            'SELECT * FROM activities ORDER BY created_at DESC LIMIT ? OFFSET ?',
            [limit, offset]
        );
        
        const activities = rows as Activity[];
        
        return json({
            activities: activities,
            nextOffset: activities.length === limit ? offset + limit : null
        });
    } catch (error: any) {
        console.error('API Database fetch failed:', error);
        return json({
            activities: [],
            nextOffset: null,
            error: error.message
        }, { status: 500 });
    }
};
