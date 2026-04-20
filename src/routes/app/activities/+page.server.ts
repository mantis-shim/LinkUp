import { fail, redirect } from '@sveltejs/kit';
import { pool } from '$lib/database/connection';
import type { Actions, PageServerLoad } from './$types';
import type { Activity } from '$lib/types';

export const load: PageServerLoad = async ({ url }) => {
	try {
		const limit = 1;
		const offset = Number(url.searchParams.get('offset')) || 0;

		const [rows] = await pool.query(
			'SELECT * FROM activities ORDER BY created_at DESC LIMIT 1 OFFSET ?',
			[offset]
		);

		const [countRows] = await pool.query('SELECT COUNT(*) as count FROM activities');
		const totalCount = (countRows as any)[0].count;

		const activities = rows as Activity[];

		return {
			dbStatus: 'Connected',
			activity: activities[0] || null,
			offset,
			hasMore: offset + 1 < totalCount
		};
	} catch (error: any) {
		return {
			dbStatus: 'Error',
			error: error.message,
			activity: null,
			offset: 0
		};
	}
};

// veiklos redagavimo veiksmas
export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();

		console.log('EDIT ACTION HIT');
		console.log({
		id: formData.get('id'),
		name: formData.get('name'),
		location: formData.get('location'),
		starts_at: formData.get('starts_at'),
		category_id: formData.get('category_id')
	});

		const id = Number(formData.get('id'));
		const name = String(formData.get('name') ?? '').trim();
		const description = String(formData.get('description') ?? '').trim();
		const location = String(formData.get('location') ?? '').trim();
		const starts_at = String(formData.get('starts_at') ?? '').trim();
		const category_id_raw = String(formData.get('category_id') ?? '').trim();
		const image_src = String(formData.get('image_src') ?? '').trim();

		const errors: Record<string, string> = {};

		if (!name) errors.name = 'Pavadinimas yra privalomas.';
		if (!location) errors.location = 'Vieta yra privaloma.';
		if (!starts_at) {
			errors.starts_at = 'Data yra privaloma.';
		} else {
			const selectedDate = new Date(starts_at);
			if (Number.isNaN(selectedDate.getTime())) {
				errors.starts_at = 'Neteisinga datos reikšmė.';
			}
		}
		if (!category_id_raw) errors.category_id = 'Kategorija yra privaloma.';

		if (Object.keys(errors).length > 0) {
			return fail(400, { errors });
		}

		try {
			await pool.query(
				`UPDATE activities 
				 SET name=?, description=?, location=?, starts_at=?, category_id=?, image_src=? 
				 WHERE id=?`,
				[name, description || null, location, starts_at, category_id_raw, image_src || null, id]
			);

			throw redirect(303, `/app/activities?edited=${id}`);
		} catch (error: any) {
			if (error?.status === 303) throw error;
			return fail(500, { dbError: 'Nepavyko atnaujinti veiklos.' });
		}
	}
};
