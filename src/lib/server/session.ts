import { pool } from "$lib/database/connection"; 
import { randomBytes } from 'crypto';

export function generateSessionId() {
    return randomBytes(32).toString('hex');
}

export async function createSession(userId: number) {
    const id = generateSessionId();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

    /*await pool.execute(
        'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)',
        [id, userId, expiresAt]
    );*/
    return id;
}

export async function getSessionUser(sessionId: string) {
    const [rows] = await pool.execute(
        'SELECT users.* FROM sessions JOIN users ON sessions.user_id = users.id WHERE sessions.id = ? AND sessions.expires_at > NOW()',
        [sessionId]
    );

    return (rows as any[])[0] ?? null;
}

export async function deleteSession(sessionId: string) {
    await pool.execute('DELETE FROM sessions WHERE id = ?', [sessionId]);
}