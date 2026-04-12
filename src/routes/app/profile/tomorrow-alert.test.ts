import { describe, it, expect } from 'vitest';
import { getTomorrowAlert } from './tomorrow-alert';

describe('getTomorrowAlert', () => {
	it('returns alert text when an activity starts tomorrow', () => {
		const now = new Date('2026-04-06T10:00:00.000Z');
		const alert = getTomorrowAlert(
			[
				{
					name: 'Rytojaus veikla',
					starts_at: '2026-04-07T12:00:00.000Z'
				}
			],
			now
		);

		expect(alert).toContain('prasideda rytoj');
	});

	it('returns null when no activity starts tomorrow', () => {
		const now = new Date('2026-04-06T10:00:00.000Z');
		const alert = getTomorrowAlert(
			[
				{
					name: 'Ne rytoj',
					starts_at: '2026-04-08T12:00:00.000Z'
				}
			],
			now
		);

		expect(alert).toBeNull();
	});
});
