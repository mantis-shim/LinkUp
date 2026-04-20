<script lang="ts">
	import { goto } from '$app/navigation';
import { getTomorrowAlert } from './tomorrow-alert';

	let { data } = $props();

	const user = $derived(() => (data as any).user || null);
	const createdActivities = $derived(() => (data as any).createdActivities || []);
	const participatedActivities = $derived(() => (data as any).participatedActivities || []);
	let selectedCategory = $state<'created' | 'past' | 'upcoming'>('created');
	let tomorrowAlert = $state<string | null>(null);
	let selectedActivity = $state<any | null>(null);

	$effect(() => {
		tomorrowAlert = getTomorrowAlert(createdActivities());
	});

	function getFilteredActivities() {
		if (selectedCategory === 'created') return createdActivities();
		const now = new Date();
		return participatedActivities().filter((activity: any) => {
			if (!activity.starts_at) return false;
			const startsAt = new Date(activity.starts_at);
			if (selectedCategory === 'past') return startsAt < now;
			if (selectedCategory === 'upcoming') return startsAt >= now;
			return false;
		});
	}
	function editProfile() {
		goto('/app/profile/edit')
	}

	function totalActivities() {
		return createdActivities().length + participatedActivities().length;
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
					<mark>UID: #{user().id ?? "???"}</mark>
					{#if user().first_name || user().last_name}
						<p class="full-name">{user().first_name ?? ''} {user().last_name ?? ''}</p>
					{/if}
					<p class="contact-info">{user().email ?? 'Nenurodyta'} · {user().city ?? 'Miestas nenurodytas'}</p>
				</div>
			</header>

			<!-- Profile Stats (Mimics Activity info-list layout) -->
			<section class="profile-content">
				<div class="info-list">
					<div class="info-item">
						<span class="label">Iš viso veiklų</span>
						<span class="value">{totalActivities()}</span>
					</div>
					<div class="info-item">
						<span class="label">Paskyra sukurta</span>
						<span class="value">{user().created_at ? new Date(user().created_at).toLocaleDateString() : "Nenurodyta"}</span>
					</div>
				</div>

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
							<button class="activity-preview" onclick={() => (selectedActivity = activity)}>
								<strong>{activity.name ?? "Be pavadinimo"}</strong>
								<small>{activity.starts_at ? new Date(activity.starts_at).toLocaleDateString() : "Nustatyta"}</small>
								<span>{activity.location ?? "Vieta nenustatyta"}</span>
							</button>
						{/each}
					</div>
				{:else}
					<p class="empty-msg">Šioje kategorijoje veiklų nėra.</p>
					{/if}
				</div>
			</section>

			<footer>
				<button class="action-btn" onclick={editProfile}>Redaguoti profilį</button>
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
{#if selectedActivity}
	<div class="detail-backdrop" onclick={() => (selectedActivity = null)} role="button" tabindex="-1" onkeydown={(e) => e.key === 'Escape' && (selectedActivity = null)} aria-label="Uždaryti">
		<div class="detail-modal" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()} role="dialog" aria-modal="true" tabindex="-1">
			<button class="detail-close" onclick={() => (selectedActivity = null)} aria-label="Uždaryti">✕</button>
			<h2>{selectedActivity.name ?? 'Be pavadinimo'}</h2>
			<dl class="detail-list">
				{#if selectedActivity.description}
					<dt>Aprašymas</dt>
					<dd>{selectedActivity.description}</dd>
				{/if}
				<dt>Vieta</dt>
				<dd>{selectedActivity.location ?? 'Nenustatyta'}</dd>
				<dt>Data</dt>
				<dd>{selectedActivity.starts_at ? new Date(selectedActivity.starts_at).toLocaleString() : 'Nenustatyta'}</dd>
				{#if selectedActivity.gender_id}
					<dt>Lytis</dt>
					<dd>{selectedActivity.gender_id}</dd>
				{/if}
			</dl>
		</div>
	</div>
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
	.activity-preview {
		background: var(--color-bg-secondary);
		border-radius: var(--radius-lg);
		padding: var(--space-4);
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		border: 1px solid var(--color-border);
		text-align: left;
		width: 100%;
		cursor: pointer;
		color: var(--color-text);
		transition: border-color var(--transition-fast);
	}

	.activity-preview:hover {
		border-color: var(--color-primary);
	}

	.activity-preview strong {
		color: var(--color-primary);
		font-size: var(--text-sm);
	}

	.activity-preview small {
		color: var(--color-text-muted);
		font-size: var(--text-xs);
	}

	.activity-preview span {
		color: var(--color-text-subtle);
		font-size: var(--text-xs);
	}

	.detail-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
		padding: var(--space-4);
	}

	.detail-modal {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-xl);
		padding: var(--space-8);
		max-width: var(--max-w-sm);
		width: 100%;
		position: relative;
	}

	.detail-modal h2 {
		margin-bottom: var(--space-6);
		font-size: var(--text-xl);
		color: var(--color-primary);
	}

	.detail-close {
		position: absolute;
		top: var(--space-4);
		right: var(--space-4);
		background: none;
		border: none;
		font-size: var(--text-lg);
		cursor: pointer;
		color: var(--color-text-subtle);
		line-height: 1;
	}

	.detail-list {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--space-2) var(--space-4);
	}

	.detail-list dt {
		color: var(--color-text-subtle);
		font-size: var(--text-sm);
		font-weight: 500;
		padding-top: 2px;
	}

	.detail-list dd {
		color: var(--color-text);
		margin: 0;
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