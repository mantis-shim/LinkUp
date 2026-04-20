import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/database/connection', () => ({
	pool: {
		query: vi.fn(),
		getConnection: vi.fn()
	}
}));

import { pool } from '$lib/database/connection';
import { load, actions } from './+page.server';

function formRequest(entries: Record<string, string>) {
	const fd = new FormData();
	for (const [k, v] of Object.entries(entries)) {
		fd.set(k, v);
	}
	return new Request('http://localhost/app/profile/edit', {
		method: 'POST',
		body: fd
	});
}

describe('profile edit load', () => {
	beforeEach(() => {
		vi.mocked(pool.query).mockReset();
	});

	it('grąžina vartotoją ir slaptažodžio ilgį, kai DB pavyksta', async () => {
		vi.mocked(pool.query).mockResolvedValueOnce([
			[{ id: 5, username: 'Jonas', password_char_count: 6 }]
		] as never);

		const data = (await load({
			locals: { user: { id: 5, username: 'Jonas' } }
		} as Parameters<typeof load>[0])) as {
			user: { id: number; username: string } | null;
			passwordCharCount: number;
		};

		expect(data.user).toEqual({ id: 5, username: 'Jonas' });
		expect(data.passwordCharCount).toBe(6);
		expect(pool.query).toHaveBeenCalledOnce();
	});

	it('grąžina null vartotoją, kai užklausa meta klaidą (atsparumas triktims)', async () => {
		vi.mocked(pool.query).mockRejectedValueOnce(new Error('connection refused'));

		const data = (await load({
			locals: { user: { id: 1, username: 'a' } }
		} as Parameters<typeof load>[0])) as {
			user: { id: number; username: string } | null;
			passwordCharCount: number;
		};

		expect(data.user).toBeNull();
		expect(data.passwordCharCount).toBe(0);
	});
});

describe('profile edit updateProfile', () => {
	beforeEach(() => {
		vi.mocked(pool.query).mockReset();
	});

	it('grąžina klaidą, kai vartotojo vardas tuščias (validacija be DB)', async () => {
		const result = await actions.updateProfile({
			request: formRequest({ username: '   ' }),
			locals: { user: { id: 1, username: 'a' } }
		} as Parameters<typeof actions.updateProfile>[0]);

		expect(result).toMatchObject({
			status: 400,
			data: { usernameError: 'Vartotojo vardas privalomas.' }
		});
		expect(pool.query).not.toHaveBeenCalled();
	});

	it('atnaujina vardą ir nukreipia į profilį, kai vardas laisvas', async () => {
		vi.mocked(pool.query)
			.mockResolvedValueOnce([[]] as never)
			.mockResolvedValueOnce([[], []] as never);

		try {
			await actions.updateProfile({
				request: formRequest({ username: 'Naujas' }),
				locals: { user: { id: 1, username: 'Senas' } }
			} as Parameters<typeof actions.updateProfile>[0]);
			expect.fail('turėjo mesti redirect');
		} catch (e: unknown) {
			expect(e).toMatchObject({ status: 303, location: '/app/profile' });
		}

		expect(pool.query).toHaveBeenCalledTimes(2);
	});

	it('grąžina užimto vardo klaidą, kai DB randa kitą naudotoją', async () => {
		vi.mocked(pool.query).mockResolvedValueOnce([[{ id: 99 }]] as never);

		const result = await actions.updateProfile({
			request: formRequest({ username: 'Užimtas' }),
			locals: { user: { id: 1, username: 'a' } }
		} as Parameters<typeof actions.updateProfile>[0]);

		expect(result).toMatchObject({
			status: 400,
			data: { usernameError: 'Šis vartotojo vardas jau užimtas.', username: 'Užimtas' }
		});
	});
});
