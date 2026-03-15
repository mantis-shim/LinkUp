import { getSessionUser } from "$lib/server/session";
import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({event, resolve}) => {
    const sessionId = event.cookies.get('session');
    event.locals.user = sessionId ? await getSessionUser(sessionId) : null;
    return resolve(event);
}