import { pool } from '$lib/database/connection';
import type { PageServerLoad } from './$types';
import type { Activity } from '$lib/types';

export const load: PageServerLoad = async ({ url }) => {
    try {
        const limit = 3;
        const offset = Number(url.searchParams.get('offset')) || 0;
        
        console.log(`Fetching activities with limit ${limit} and offset ${offset}...`);
        
        // Fetch a page of activities
        const [rows] = await pool.query(
            'SELECT * FROM activities ORDER BY created_at DESC LIMIT ? OFFSET ?',
            [limit, offset]
        );
        
        const activities = rows as Activity[];
        
        return {
            dbStatus: 'Connected',
            activities: activities,
            nextOffset: activities.length === limit ? offset + limit : null
        };
    } catch (error: any) {
        console.error('Database fetch failed:', error);
        
        // Return structured error for regular loads
        return {
            dbStatus: 'Error',
            error: error.message,
            activities: [],
            nextOffset: null
        };
    }
};

// Handle API requests (SvelteKit Actions or handle function could also work, 
// but for simple fetch we can use a standalone endpoint or just check headers in load)
// For simplicity in SvelteKit 2, we should use a +server.ts for the fetch calls 
// but I'll add an export for the fetch logic here if needed, 
// or let the user know we need a +server.ts.
