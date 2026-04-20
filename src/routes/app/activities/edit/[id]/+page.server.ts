import { fail, redirect, error } from '@sveltejs/kit';
import { pool } from '$lib/database/connection';
import type { Actions, PageServerLoad } from './$types';
import type { Activity } from '$lib/types';

export const load: PageServerLoad = async ({ params }) => {
	const id = Number(params.id);

	if (Number.isNaN(id)) {
		throw error(400, 'Neteisingas veiklos ID.');
	}

	try {
		const [rows] = await pool.query('SELECT * FROM activities WHERE id = ? LIMIT 1', [id]);
		const activity = (rows as Activity[])[0];

		if (!activity) {
			throw error(404, 'Veikla nerasta.');
		}

		return { activity };
	} catch (err: any) {
		if (err?.status) throw err;
		throw error(500, 'Nepavyko gauti veiklos duomenų.');
	}
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const id = Number(params.id);

		if (Number.isNaN(id)) {
			return fail(400, { dbError: 'Neteisingas veiklos ID.' });
		}

		const formData = await request.formData();

		const name = String(formData.get('name') ?? '').trim();
		const description = String(formData.get('description') ?? '').trim();
		const location = String(formData.get('location') ?? '').trim();
		const starts_at = String(formData.get('starts_at') ?? '').trim();
		const category_id_raw = String(formData.get('category_id') ?? '').trim();
		const gender_id_raw = String(formData.get('gender_id') ?? '').trim();
		const image_src = String(formData.get('image_src') ?? '').trim();

		const category_id = Number(category_id_raw);
		const gender_id = gender_id_raw ? Number(gender_id_raw) : null;

		const errors: Record<string, string> = {};

		if (!name) {
			errors.name = 'Veiklos pavadinimas yra privalomas.';
		} else if (name.length > 30) {
			errors.name = 'Veiklos pavadinimas negali viršyti 30 simbolių.';
		}

		if (!category_id_raw || Number.isNaN(category_id)) {
			errors.category_id = 'Kategorijos ID yra privalomas.';
		}

		if (gender_id_raw && Number.isNaN(gender_id as number)) {
			errors.gender_id = 'Lyties ID turi būti skaičius.';
		}

		if (starts_at) {
			const selectedDate = new Date(starts_at);
			const now = new Date();

			if (Number.isNaN(selectedDate.getTime())) {
				errors.starts_at = 'Neteisinga datos reikšmė.';
			} else if (selectedDate < now) {
				errors.starts_at = 'Veiklos data negali būti ankstesnė nei dabartinis laikas.';
			}
		}

		if (Object.keys(errors).length > 0) {
			return fail(400, {
				errors,
				values: {
					name,
					description,
					location,
					starts_at,
					category_id: category_id_raw,
					gender_id: gender_id_raw,
					image_src
				}
			});
		}

		try {
			await pool.query(
				`UPDATE activities
				SET name = ?, description = ?, location = ?, image_src = ?, category_id = ?, starts_at = ?, gender_id = ?
				WHERE id = ?`,
				[
					name,
					description || null,
					location || null,
					image_src || null,
					category_id,
					starts_at || null,
					gender_id,
					id
				]
			);

			throw redirect(303, `/app/activities?updated=${id}`);
		} catch (err: any) {
			if (err?.status === 303) throw err;

			return fail(500, {
				dbError: 'Nepavyko atnaujinti veiklos.',
				values: {
					name,
					description,
					location,
					starts_at,
					category_id: category_id_raw,
					gender_id: gender_id_raw,
					image_src
				}
			});
		}
	}
};