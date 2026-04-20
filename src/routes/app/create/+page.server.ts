import { fail, redirect } from '@sveltejs/kit';
import { pool } from '$lib/database/connection';
import type { Actions, PageServerLoad } from './$types';
import { writeFile } from 'fs/promises';
import path from 'path';
import { randomBytes } from 'crypto';

export const load: PageServerLoad = async () => {
	const [categories] = await pool.query<{ id: number; name: string }[]>('SELECT id, name FROM categories ORDER BY name');
	const [genders] = await pool.query<{ id: number; name: string }[]>('SELECT id, name FROM genders ORDER BY id');
	return { categories, genders };
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
		const imageFile = formData.get('image') as File | null;

		const category_id = Number(category_id_raw);
		const gender_id = gender_id_raw ? Number(gender_id_raw) : null;

		const errors: Record<string, string> = {};

		if (!name) {
			errors.name = 'Veiklos pavadinimas yra privalomas.';
		} else if (name.length > 30) {
			errors.name = 'Veiklos pavadinimas negali viršyti 30 simbolių.';
		}

		if (!category_id_raw || Number.isNaN(category_id)) {
			errors.category_id = 'Kategorija yra privaloma.';
		}

		if (gender_id_raw && Number.isNaN(gender_id as number)) {
			errors.gender_id = 'Neteisinga lyties reikšmė.';
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
				values: { name, description, location, starts_at, category_id: category_id_raw, gender_id: gender_id_raw }
			});
		}

		let image_src: string | null = null;

		if (imageFile && imageFile.size > 0) {
			const ext = path.extname(imageFile.name) || '.jpg';
			const filename = `${randomBytes(8).toString('hex')}${ext}`;
			const buffer = Buffer.from(await imageFile.arrayBuffer());
			await writeFile(path.join(process.cwd(), 'static', 'images', filename), buffer);
			image_src = `/images/${filename}`;
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
					location || null,
					image_src,
					creator_id,
					category_id,
					starts_at || null,
					gender_id
				]
			);

			const insertedId = (result as any).insertId;

			throw redirect(303, `/app/activities?created=${insertedId}`);
		} catch (error: any) {
			if (error?.status === 303) throw error;

			return fail(500, {
				dbError: 'Nepavyko sukurti veiklos.',
				values: { name, description, location, starts_at, category_id: category_id_raw, gender_id: gender_id_raw }
			});
		}
	}
};
