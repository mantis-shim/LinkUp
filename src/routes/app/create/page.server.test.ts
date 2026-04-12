import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/database/connection', () => {
	return {
		pool: {
			query: vi.fn()
		}
	};
});

import { pool } from '$lib/database/connection';
import { actions } from './+page.server';

describe('Veiklos kūrimo integraciniai testai', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('neleidžia kurti veiklos be pavadinimo', async () => {
		const formData = new FormData();
		formData.set('name', '');
		formData.set('category_id', '1');

		const request = new Request('http://localhost', {
			method: 'POST',
			body: formData
		});

		const result: any = await actions.default({ request } as any);

		expect(result.status).toBe(400);
		expect(result.data?.errors?.name).toBeDefined();
		expect(pool.query).not.toHaveBeenCalled();
	});

	it('neleidžia kurti veiklos be kategorijos', async () => {
		const formData = new FormData();
		formData.set('name', 'Test veikla');

		const request = new Request('http://localhost', {
			method: 'POST',
			body: formData
		});

		const result: any = await actions.default({ request } as any);

		expect(result.status).toBe(400);
		expect(result.data?.errors?.category_id).toBeDefined();
		expect(pool.query).not.toHaveBeenCalled();
	});

	it('leidžia kurti veiklą be datos', async () => {
		(pool.query as any).mockResolvedValueOnce([{ insertId: 123 }]);

		const formData = new FormData();
		formData.set('name', 'Test veikla');
		formData.set('category_id', '1');

		const request = new Request('http://localhost', {
			method: 'POST',
			body: formData
		});

		await expect(actions.default({ request } as any)).rejects.toMatchObject({
			status: 303
		});

		expect(pool.query).toHaveBeenCalledOnce();
	});

	it('sėkmingai įrašo veiklą į duomenų bazę su validžiais duomenimis', async () => {
		(pool.query as any).mockResolvedValueOnce([{ insertId: 456 }]);

		const formData = new FormData();
		formData.set('name', 'Krepsinis');
		formData.set('description', 'Vakarinis zaidimas');
		formData.set('location', 'Vilnius');
		formData.set('starts_at', '2030-01-01T10:00');
		formData.set('category_id', '1');
		formData.set('gender_id', '2');
		formData.set('image_src', 'https://example.com/img.jpg');

		const request = new Request('http://localhost', {
			method: 'POST',
			body: formData
		});

		await expect(actions.default({ request } as any)).rejects.toMatchObject({
			status: 303
		});

		expect(pool.query).toHaveBeenCalledOnce();
	});
});