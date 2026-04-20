<script lang="ts">
	import { getTomorrowAlert } from './tomorrow-alert';
	interface User {
		id: number;
		username: string;
		name: string | null;
		lastname: string | null;
		email: string | null;
		city: string | null;
		gender?: string | null;
	}
	let { data } = $props();

	const user = $derived(() => (data as { user: User }).user || null);
	const createdActivities = $derived(() => (data as any).createdActivities || []);
	const upcomingActivities = $derived(() => (data as any).upcomingActivities || []);
	const pastActivities = $derived(() => (data as any).pastActivities || []);
	let selectedCategory = $state<'created' | 'past' | 'upcoming'>('created');
	let tomorrowAlert = $state<string | null>(null);
	let selectedActivity = $state<any | null>(null);

	$effect(() => {
		tomorrowAlert = getTomorrowAlert(upcomingActivities());
	});

	function getFilteredActivities() {
		if (selectedCategory === 'created') return createdActivities();
		if (selectedCategory === 'upcoming') return upcomingActivities();
		if (selectedCategory === 'past') return pastActivities();
		return [];
	}
</script>

<div class="card-wrapper profile-view">
	{#if tomorrowAlert}
		<div class="tomorrow-alert">{tomorrowAlert}</div>
	{/if}
	{#if user()}
		<article class="profile-card">
			<header class="profile-header">
				<div class="avatar-placeholder">
					<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-subtle)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
						<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
					</svg>
				</div>
				<div class="user-meta">
					<h1>{user().username ?? "Anonymous"}</h1>
					{#if user().name || user().lastname}
						<p class="full-name">{user().name ?? 'Vardenis'} {user().lastname ?? 'Pavardenis'}</p>
					{/if}
					<p class="gender">Lytis: {user().gender ?? 'Nenurodyta'}</p>
					<p class="contact-info">El-Paštas: {user().email ?? 'Nenurodyta'}</p>
					<p class="contact-info">Miestas: {user().city ?? 'Vilnius'}</p>
				</div>
			</header>

			<section class="profile-content">
				<div class="user-activities">
					<h2>Mano veiklos ({getFilteredActivities().length})</h2>

					<div class="category-tabs" role="tablist" aria-label="Veiklos kategorijų filtras">
						<button
							class:selected={selectedCategory === 'created'}
							onclick={() => (selectedCategory = 'created')}
							role="tab"
							aria-selected={selectedCategory === 'created'}
						>Sukurtos</button>
						<button
							class:selected={selectedCategory === 'upcoming'}
							onclick={() => (selectedCategory = 'upcoming')}
							role="tab"
							aria-selected={selectedCategory === 'upcoming'}
						>Ateinančios</button>
						<button
							class:selected={selectedCategory === 'past'}
							onclick={() => (selectedCategory = 'past')}
							role="tab"
							aria-selected={selectedCategory === 'past'}
						>Praėjusios</button>
					</div>

					{#if getFilteredActivities().length > 0}
						<div class="activity-scroll">
							{#each getFilteredActivities() as act}
								<button class="activity-preview" onclick={() => (selectedActivity = act)}>
									<strong>{act.name ?? "Be pavadinimo"}</strong>
									<small>{act.starts_at ? new Date(act.starts_at).toLocaleDateString('lt-LT') : "Data nenustatyta"}</small>
									<span>{act.location ?? "Vieta nenustatyta"}</span>
									{#if act.category_name}<mark class="cat-tag">#{act.category_name}</mark>{/if}
								</button>
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

{#if selectedActivity}
	<div class="detail-overlay" role="presentation" onclick={() => (selectedActivity = null)} onkeydown={(e) => e.key === 'Escape' && (selectedActivity = null)}>
		<div class="detail-card" role="dialog" aria-modal="true" tabindex="-1" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
			<button class="detail-close" onclick={() => (selectedActivity = null)} aria-label="Uždaryti">✕</button>

			{#if selectedActivity.image_src}
				<div class="detail-image">
					<img src={selectedActivity.image_src} alt={selectedActivity.name} />
				</div>
			{/if}

			<div class="detail-body">
				<div class="detail-title-row">
					<h2>{selectedActivity.name ?? "Be pavadinimo"}</h2>
					{#if selectedActivity.category_name}
						<mark class="cat-tag">#{selectedActivity.category_name}</mark>
					{/if}
				</div>

				{#if selectedActivity.description}
					<p class="detail-description">{selectedActivity.description}</p>
				{/if}

				<div class="detail-chips">
					{#if selectedActivity.location}
						<div class="chip">
							<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
							{selectedActivity.location}
						</div>
					{/if}
					{#if selectedActivity.starts_at}
						<div class="chip">
							<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
							{new Date(selectedActivity.starts_at).toLocaleDateString('lt-LT')}
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}

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
		width: 100%;
		text-align: left;
		cursor: pointer;
		font-family: inherit;
		font-size: inherit;
		color: var(--color-text);
		transition: border-color 0.15s, box-shadow 0.15s;
	}

	.activity-preview:hover {
		border-color: var(--color-primary);
		box-shadow: 0 0 0 2px rgba(124, 106, 247, 0.1);
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

	.info-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	/* Activity detail modal */
	.detail-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.55);
		backdrop-filter: blur(3px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
		padding: var(--space-4);
	}

	.detail-card {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-xl);
		width: 100%;
		max-width: 420px;
		max-height: 85dvh;
		overflow-y: auto;
		position: relative;
		box-shadow: var(--shadow-lg);
	}

	.detail-close {
		position: absolute;
		top: var(--space-3);
		right: var(--space-3);
		width: 32px;
		height: 32px;
		border-radius: var(--radius-full);
		border: 1px solid var(--color-border);
		background: var(--color-bg-secondary);
		color: var(--color-text);
		font-size: var(--text-sm);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1;
	}

	.detail-image {
		width: 100%;
		height: 200px;
		overflow: hidden;
		border-radius: var(--radius-xl) var(--radius-xl) 0 0;
	}

	.detail-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.detail-body {
		padding: var(--space-5);
	}

	.detail-title-row {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--space-3);
		margin-bottom: var(--space-3);
	}

	.detail-title-row h2 {
		font-size: var(--text-xl);
		font-weight: var(--font-bold);
	}

	.detail-description {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		line-height: var(--leading-normal);
		margin-bottom: var(--space-4);
	}

	.detail-chips {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.cat-tag {
		background: rgba(124, 106, 247, 0.12);
		color: var(--color-primary);
		font-size: var(--text-xs);
		font-weight: 600;
		padding: var(--space-1) var(--space-3);
		border-radius: var(--radius-full);
		white-space: nowrap;
		flex-shrink: 0;
		align-self: flex-start;
	}

	.chip {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		padding: var(--space-1) var(--space-3);
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-full);
		font-size: var(--text-xs);
		font-weight: 500;
		color: var(--color-text-muted);
	}

	.chip svg { color: var(--color-primary); flex-shrink: 0; }
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