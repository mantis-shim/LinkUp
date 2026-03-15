import { pool } from '$lib/database/connection';
import type { PageServerLoad } from './$types';
import type { Activity } from '$lib/types';

export const load: PageServerLoad = async ({ url }) => {
    try {
        const limit = 1;
        const offset = Number(url.searchParams.get('offset')) || 0;
        
        console.log(`Fetching activity with offset ${offset}...`);
        
        // Fetch exactly one activity
        const [rows] = await pool.query(
            'SELECT * FROM activities ORDER BY created_at DESC LIMIT 1 OFFSET ?',
            [offset]
        );

        // Fetch total count to know if there's a next one
        const [countRows] = await pool.query('SELECT COUNT(*) as count FROM activities');
        const totalCount = (countRows as any)[0].count;
        
        const activities = rows as Activity[];
        
        return {
            dbStatus: 'Connected',
            activity: activities[0] || null,
            offset: offset,
            hasMore: offset + 1 < totalCount
        };
    } catch (error: any) {
        console.error('Database fetch failed:', error);
        return {
            dbStatus: 'Error',
            error: error.message,
            activity: null,
            offset: 0
        };
    }
};

// Handle API requests (SvelteKit Actions or handle function could also work, 
// but for simple fetch we can use a standalone endpoint or just check headers in load)
// For simplicity in SvelteKit 2, we should use a +server.ts for the fetch calls 
// but I'll add an export for the fetch logic here if needed, 
// or let the user know we need a +server.ts.
