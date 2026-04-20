import { fail, redirect } from '@sveltejs/kit';
import { pool } from '$lib/database/connection';
import type { Actions, PageServerLoad } from './$types';
import type { Activity } from '$lib/types';
import type { RowDataPacket } from 'mysql2';

export const load: PageServerLoad = async ({ url, locals }) => {
    try {
        const limit = 1;
        const category = url.searchParams.get('category');
        const location = url.searchParams.get('location');
        const gender = url.searchParams.get('gender');
        const startDate = url.searchParams.get('startDate');
        const endDate = url.searchParams.get('endDate');

        let filterQuery = 'WHERE 1=1';
        const params: any[] = [];

        if (category)   { filterQuery += ' AND category_id = ?'; params.push(category); }
        if (location)   { filterQuery += ' AND location = ?';     params.push(location); }
        if (gender)     { filterQuery += ' AND gender_id = ?';    params.push(gender); }
        if (startDate)  { filterQuery += ' AND DATE(starts_at) >= ?'; params.push(startDate); }
        if (endDate)    { filterQuery += ' AND DATE(starts_at) <= ?'; params.push(endDate); }

        const userId = locals.user?.id ?? null;
        if (userId) {
            filterQuery += ` AND a.id NOT IN (
                SELECT activity_id FROM activity_participants WHERE user_id = ?
                UNION
                SELECT activity_id FROM activity_rejections WHERE user_id = ?
            )`;
            params.push(userId, userId);
        }

        // For logged-in users the DB exclusion always returns the next unacted activity at offset 0.
        // For guests, honour the URL offset so browsing still works.
        const offset = userId ? 0 : (Number(url.searchParams.get('offset')) || 0);

        // ✅ Provide the generic so TypeScript knows the result is a row array, not OkPacket
        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT a.*,c.name as category_name, u.name as creator_name, u.lastname as creator_lastname
             FROM activities a 
             JOIN users u ON u.id = a.creator_id
             JOIN categories c ON c.id = a.category_id
             ${filterQuery} ORDER BY a.created_at DESC LIMIT 1 OFFSET ?`,
            [...params, offset]
        );

        const [countRows] = await pool.query<RowDataPacket[]>(
            `SELECT COUNT(*) as count FROM activities a ${filterQuery}`,
            params
        );
        const totalCount = countRows[0].count;

        const [categories] = await pool.query<RowDataPacket[]>('SELECT id, name FROM categories ORDER BY name');
        const [genders]    = await pool.query<RowDataPacket[]>('SELECT id, name FROM genders ORDER BY name');
        const [locations]  = await pool.query<RowDataPacket[]>(
            'SELECT DISTINCT location FROM activities WHERE location IS NOT NULL ORDER BY location'
        );

        const activities = rows as Activity[];

        return {
            dbStatus: 'Connected',
            activity: activities[0] || null,
            offset,
            hasMore: offset + 1 < totalCount,
            totalCount,
            categories,
            genders,
            locations,
            filters: {
                category:  category  || '',
                location:  location  || '',
                gender:    gender    || '',
                startDate: startDate || '',
                endDate:   endDate   || ''
            }
        };
    } catch (error: any) {
        console.error('Database fetch failed:', error);
        return {
            dbStatus: 'Error',
            error: error.message,
            activity: null,
            offset: 0,
            categories: [],
            genders: [],
            locations: [],
            filters: { category: '', location: '', gender: '', startDate: '', endDate: '' }
        };
    }
};
