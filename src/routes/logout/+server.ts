import { deleteSession } from '$lib/server/session';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ cookies }) => {
	const sessionId = cookies.get('session');
	if (sessionId) {
		await deleteSession(sessionId);
	}
	cookies.delete('session', { path: '/' });
	throw redirect(303, '/login');
};