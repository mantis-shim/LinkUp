import { pool } from '$lib/database/connection';
import type { RequestHandler } from './$types';
import type { Activity } from '$lib/types';
import { json } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, locals }) => {
    if (!locals.user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: { activityId: unknown; action: unknown };
    try {
        body = await request.json();
    } catch {
        return json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { activityId, action } = body;

    if (!activityId || !Number.isInteger(activityId)) {
        return json({ error: 'Invalid activityId' }, { status: 400 });
    }

    if (action !== 'accept' && action !== 'reject') {
        return json({ error: 'Invalid action' }, { status: 400 });
    }

    try {
        if (action === 'accept') {
            await pool.query(
                'INSERT IGNORE INTO activity_participants (activity_id, user_id) VALUES (?, ?)',
                [activityId, locals.user.id]
            );
            return json({ status: 'accepted' });
        } else {
            await pool.query(
                'INSERT IGNORE INTO activity_rejections (activity_id, user_id) VALUES (?, ?)',
                [activityId, locals.user.id]
            );
            return json({ status: 'rejected' });
        }
    } catch {
        return json({ error: 'Server error' }, { status: 500 });
    }
};

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
