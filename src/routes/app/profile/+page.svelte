<script lang="ts">
	import { getTomorrowAlert } from './tomorrow-alert';
	interface User {
		id: number;
		username: string;
		name: string | null;
		lastname: string | null;
		email: string | null;
		city: string | null;
	}
	let { data } = $props();

	const user = $derived(() => (data as { user: User }).user || null);
	const activities = $derived(() => (data as any).activities || []);
	let selectedCategory = $state<'created' | 'past' | 'upcoming'>('created');
	let tomorrowAlert = $state<string | null>(null);

	$effect(() => {
		tomorrowAlert = getTomorrowAlert(activities());
	});

	function getFilteredActivities() {
		const now = new Date();
		return (activities() || []).filter((activity: any) => {
			if (selectedCategory === 'created') return true;
			if (!activity.starts_at) return false;
			const startsAt = new Date(activity.starts_at);
			if (selectedCategory === 'past') return startsAt < now;
			if (selectedCategory === 'upcoming') return startsAt >= now;
			return true;
		});
	}
</script>

<div class="card-wrapper profile-view">
	{#if tomorrowAlert}
		<div class="tomorrow-alert">{tomorrowAlert}</div>
	{/if}
	{#if user()}
		<article class="profile-card">
			<!-- Profile Header (Avatar/Name) -->
			<header class="profile-header">
				<div class="avatar-placeholder">
					<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-subtle)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
						<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
					</svg>
				</div>
				<div class="user-meta">
					<h1>{user().username ?? "Anonymous"}</h1>
					{#if user().name || user().lastname}
						<p class="full-name"> {user().name ?? 'Vardenis'} {user().lastname ?? 'Pavardenis'}</p>
					{/if}
					<p class="gender">Lytis: {user().gender ?? 'Nenurodyta'}</p>
					<p class="contact-info">El-Paštas: {user().email ?? 'Nenurodyta'} </p>
					<p class="contact-info">Miestas: {user().city ?? 'Vilnius'}</p>
				</div>
			</header>

			<!-- Profile Stats (Mimics Activity info-list layout) -->
			<section class="profile-content">
				<!-- <div class="info-list">
					<div class="info-item">
						<span class="label">Iš viso veiklų</span>
						<span class="value">{activities()?.length ?? 0}</span> -->
					<!-- </div>  -->
					<!-- <div class="info-item">
						<span class="label">Paskyra sukurta</span>
						<span class="value">{user().created_at ? new Date(user().created_at).toLocaleDateString() : "Nenurodyta"}</span>
					</div> -->
				<!-- </div> -->

				<!-- Shared Styling: Activity List -->
				<div class="user-activities">
				<h2>Mano veiklos ({getFilteredActivities().length})</h2>

				<div class="category-tabs" role="tablist" aria-label="Veiklos kategorijų filtras">
					<button
						class:selected={selectedCategory === 'created'}
						onclick={() => (selectedCategory = 'created')}
						role="tab"
						aria-selected={selectedCategory === 'created'}
					>
						Sukurtos
					</button>
					<button
						class:selected={selectedCategory === 'upcoming'}
						onclick={() => (selectedCategory = 'upcoming')}
						role="tab"
						aria-selected={selectedCategory === 'upcoming'}
					>
						Ateinančios
					</button>
					<button
						class:selected={selectedCategory === 'past'}
						onclick={() => (selectedCategory = 'past')}
						role="tab"
						aria-selected={selectedCategory === 'past'}
					>
						Praėjusios
					</button>
				</div>

				{#if getFilteredActivities().length > 0}
					<div class="activity-scroll">
						{#each getFilteredActivities() as activity}
							<div class="activity-preview">
								<strong>{activity.name ?? "Be pavadinimo"}</strong>
								<small>{activity.starts_at ? new Date(activity.starts_at).toLocaleDateString() : "Nustatyta"}</small>
								<span>{activity.location ?? "Vieta nenustatyta"}</span>
							</div>
						{/each}
					</div>
				{:else}
					<p class="empty-msg">Šioje kategorijoje veiklų nėra.</p>
					{/if}
				</div>
			</section>

			<footer>
				<button class="action-btn" onclick={() => alert('Redagavimas netrukus!')}>Redaguoti profilį</button>
			</footer>
		</article>
	{:else}
		<article class="profile-card skeleton-card">
			<header class="profile-header skeleton">
				<div class="avatar-placeholder skeleton-circle"></div>
				<div class="user-meta">
					<div class="skeleton-line title"></div>
					<div class="skeleton-line badge"></div>
				</div>
			</header>

			<section class="profile-content">
				<div class="info-list">
					<div class="skeleton-info-item"></div>
					<div class="skeleton-info-item"></div>
				</div>

				<div class="user-activities">
					<div class="skeleton-line subtitle"></div>
					<div class="activity-scroll">
						<div class="skeleton-box"></div>
						<div class="skeleton-box"></div>
					</div>
				</div>
			</section>

			<div class="status-overlay">
				<h2>Vartotojas nerastas</h2>
				<p>Ieškomas profilis neegzistuoja.</p>
				<a href="/app/profile" class="action-btn-link">Įkelti iš naujo</a>
			</div>
		</article>
	{/if}
</div>

<style>
	/* Skeleton Animations */
	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.5; }
	}

	.skeleton-card {
		position: relative;
		opacity: 0.6;
	}

	.skeleton-circle {
		width: 80px;
		height: 80px;
		background: var(--color-bg-secondary);
		border-radius: var(--radius-full);
		animation: pulse 2s infinite ease-in-out;
	}

	.skeleton-line {
		background: var(--color-bg-secondary);
		border-radius: var(--radius-sm);
		animation: pulse 2s infinite ease-in-out;
		margin-bottom: var(--space-2);
	}

	.skeleton-line.title { height: 1.5rem; width: 120px; }
	.skeleton-line.badge { height: 1rem; width: 60px; }
	.skeleton-line.subtitle { height: 1.5rem; width: 100px; margin-top: var(--space-8); margin-bottom: var(--space-4); }

	.skeleton-info-item {
		height: 2.5rem;
		background: var(--color-bg-secondary);
		border-radius: var(--radius-sm);
		animation: pulse 2s infinite ease-in-out;
		margin-bottom: var(--space-4);
	}

	.skeleton-box {
		height: 80px;
		background: var(--color-bg-secondary);
		border-radius: var(--radius-lg);
		animation: pulse 2s infinite ease-in-out;
		margin-bottom: var(--space-3);
	}

	.status-overlay {
		position: absolute;
		inset: 0;
		background: rgba(var(--color-bg-rgb), 0.5);
		backdrop-filter: blur(2px);
		display: flex;
		flex-direction: column;
		align-items: center;
		bottom: 15%;
		justify-content: center;
		text-align: center;
		padding: var(--space-8);
		border-radius: var(--radius-xl);
	}

	.status-overlay h2 { color: var(--color-text); margin-bottom: var(--space-2); }
	.status-overlay p { color: var(--color-text-subtle); margin-bottom: var(--space-8); }

	.action-btn-link {
		padding: var(--space-3) var(--space-8);
		background: var(--color-primary);
		color: white;
		text-decoration: none;
		border-radius: var(--radius-lg);
		font-weight: 600;
	}

	.card-wrapper {
		background: var(--color-bg);
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		position: relative;
	}

	.profile-card {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-xl);
		padding: var(--space-8);
		max-width: var(--max-w-sm);
		width: 100%;
		height: 90dvh;
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
		overflow: hidden;
	}

	.profile-header {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		margin-bottom: var(--space-8);
		padding-bottom: var(--space-6);
		border-bottom: 1px solid var(--color-border);
	}

	.avatar-placeholder {
		width: 80px;
		height: 80px;
		background: var(--color-bg-secondary);
		border-radius: var(--radius-full);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.user-meta h1 {
		font-size: var(--text-2xl);
		margin-bottom: var(--space-1);
		
	}
	.user-meta p {
		margin: 0px;
		
	}


	.profile-content {
		flex: 1;
		overflow-y: auto;
		padding-right: var(--space-2);
	}

	.user-activities h2 {
		font-size: var(--text-lg);
		margin: var(--space-8) 0 var(--space-4);
		color: var(--color-text);
	}

	.category-tabs {
		display: flex;
		gap: var(--space-2);
		margin-bottom: var(--space-4);
	}

	.category-tabs button {
		border: 1px solid var(--color-border);
		background: var(--color-bg-secondary);
		color: var(--color-text);
		border-radius: var(--radius-lg);
		padding: var(--space-2) var(--space-4);
		font-weight: 600;
		cursor: pointer;
	}

	.category-tabs button.selected,
	.category-tabs button:hover {
		background: var(--color-primary);
		color: white;
	}

	.activity-scroll {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.activity-preview {
		background: var(--color-bg-secondary);
		border-radius: var(--radius-lg);
		padding: var(--space-4);
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		border: 1px solid var(--color-border);
	}

	.activity-preview strong {
		color: var(--color-primary);
	}

	.action-btn {
		width: 100%;
		padding: var(--space-4);
		background: var(--color-primary);
		color: white;
		border: none;
		border-radius: var(--radius-lg);
		font-weight: 600;
		cursor: pointer;
		margin-top: var(--space-4);
	}

	.empty-msg {
		color: var(--color-text-subtle);
		font-style: italic;
	}

	/* Reusing info-list from activities page */
	.info-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.info-item {
		display: flex;
		justify-content: space-between;
		padding-bottom: var(--space-2);
		border-bottom: 1px solid var(--color-border);
	}

	.label {
		color: var(--color-text-subtle);
		font-size: var(--text-sm);
		font-weight: 500;
	}

	.value {
		color: var(--color-text);
		font-weight: 600;
	}
	/* Tomorrow Alert Styling */
	.tomorrow-alert {
		background: var(--color-warning, #fff3cd);
		color: var(--color-warning-text, #856404);
		border: 1px solid var(--color-warning-border, #ffeeba);
		border-radius: var(--radius-lg);
		padding: var(--space-4);
		margin-bottom: var(--space-6);
		font-weight: 600;
		text-align: center;
		box-shadow: 0 2px 8px rgba(0,0,0,0.04);
	}
</style>