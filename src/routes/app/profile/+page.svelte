<script lang="ts">
	let { data } = $props();
	
	let user = $derived(data.user);
	let activities = $derived(data.activities || []);
</script>

<div class="card-wrapper profile-view">
	{#if user}
		<article class="profile-card">
			<!-- Profile Header (Avatar/Name) -->
			<header class="profile-header">
				<div class="avatar-placeholder">
					<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-subtle)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
						<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
					</svg>
				</div>
				<div class="user-meta">
					<h1>{user.username ?? "Anonymous"}</h1>
					<mark>UID: #{user.id ?? "???"}</mark>
				</div>
			</header>

			<!-- Profile Stats (Mimics Activity info-list layout) -->
			<section class="profile-content">
				<div class="info-list">
					<div class="info-item">
						<span class="label">Total Activities</span>
						<span class="value">{activities?.length ?? 0}</span>
					</div>
					<div class="info-item">
						<span class="label">Member Since</span>
						<span class="value">{user.created_at ? new Date(user.created_at).toLocaleDateString() : "Not Set"}</span>
					</div>
				</div>

				<!-- Shared Styling: Activity List -->
				<div class="user-activities">
					<h2>My Activities</h2>
					{#if activities && activities.length > 0}
						<div class="activity-scroll">
							{#each activities as activity}
								<div class="activity-preview">
									<strong>{activity.name ?? "Untitled Activity"}</strong>
									<small>{activity.created_at ? new Date(activity.created_at).toLocaleDateString() : "Not Set"}</small>
									<span>{activity.location ?? "No location"}</span>
								</div>
							{/each}
						</div>
					{:else}
						<p class="empty-msg">You haven't created any activities yet.</p>
					{/if}
				</div>
			</section>

			<footer>
				<button class="action-btn" onclick={() => alert('Editing coming soon!')}>Edit Profile</button>
			</footer>
		</article>
	{:else}
		<div class="status-msg">
			<h2>User not found</h2>
			<a href="/app/activities" class="nav-arrow prev" style="position: static; text-decoration: none; padding: var(--space-2) var(--space-4); background: var(--color-surface); border-radius: var(--radius-lg); border: 1px solid var(--color-border);">Back to Activities</a>
		</div>
	{/if}
</div>

<style>
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
</style>