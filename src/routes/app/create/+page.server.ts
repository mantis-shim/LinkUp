import { fail, redirect } from '@sveltejs/kit';
import { pool } from '$lib/database/connection';
import type { Actions, PageServerLoad } from './$types';

function isValidImageSource(value: string) {
	return (
		!value ||
		value.startsWith('http://') ||
		value.startsWith('https://') ||
		value.startsWith('data:image/')
	);
}

export const load: PageServerLoad = async () => {
	return {};
};

export const actions: Actions = {
	default: async ({ request }) => {
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

		if (!location) {
			errors.location = 'Vieta yra privaloma.';
		}

		if (!category_id_raw || Number.isNaN(category_id)) {
			errors.category_id = 'Kategorija yra privaloma.';
		}

		if (gender_id_raw && Number.isNaN(gender_id as number)) {
			errors.gender_id = 'Lytis turi būti korektiška.';
		}

		if (!starts_at) {
			errors.starts_at = 'Data yra privaloma.';
		} else {
			const selectedDate = new Date(starts_at);
			const now = new Date();

			if (Number.isNaN(selectedDate.getTime())) {
				errors.starts_at = 'Neteisinga datos reikšmė.';
			} else if (selectedDate < now) {
				errors.starts_at = 'Veiklos data negali būti ankstesnė nei dabartinis laikas.';
			}
		}

		if (!isValidImageSource(image_src)) {
			errors.image_src = 'Netinkamas nuotraukos formatas.';
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
			const creator_id = 1;

			const [result] = await pool.query(
				`INSERT INTO activities
				(name, description, location, image_src, creator_id, category_id, starts_at, gender_id)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
				[
					name,
					description || null,
					location,
					image_src || null,
					creator_id,
					category_id,
					starts_at,
					gender_id
				]
			);

			const insertedId = (result as any).insertId;

			throw redirect(303, `/app/activities?created=${insertedId}`);
				} catch (error: any) {
			if (error?.status === 303) throw error;

			console.error('CREATE ERROR:', error);

			return fail(500, {
				dbError: `Nepavyko sukurti veiklos. ${error?.message ?? ''}`,
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