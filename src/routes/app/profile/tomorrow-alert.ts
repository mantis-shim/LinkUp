type ActivityLike = {
	name?: string | null;
	starts_at?: string | null;
};

function isTomorrow(dateString: string, now: Date) {
	const tomorrow = new Date(now);
	tomorrow.setDate(now.getDate() + 1);
	const date = new Date(dateString);

	return (
		date.getFullYear() === tomorrow.getFullYear() &&
		date.getMonth() === tomorrow.getMonth() &&
		date.getDate() === tomorrow.getDate()
	);
}

export function getTomorrowAlert(activities: ActivityLike[], now: Date = new Date()) {
	for (const activity of activities) {
		if (activity.starts_at && isTomorrow(activity.starts_at, now)) {
			return `Įvykis "${activity.name ?? 'Be pavadinimo'}" prasideda rytoj!`;
		}
	}

	return null;
}
