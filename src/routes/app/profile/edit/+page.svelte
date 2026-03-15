<script lang="ts">
	let { data } = $props();
	let user = $derived(data.user);
</script>

<div class="card-wrapper profile-view">
	<article class="profile-card">
		<h1 class="page-title">Edit profile</h1>
		<header class="profile-header">
			<div class="avatar-placeholder">
				<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-subtle)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
					<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
				</svg>
			</div>
			<div class="user-meta">
				{#if user}
					<h1>{user.username ?? 'Anonymous'}</h1>
					<mark>UID: #{user.id}</mark>
				{:else}
					<h1>User not found</h1>
				{/if}
			</div>
		</header>

		<section class="profile-content">
			{#if user}
				<div class="info-list">
					<div class="info-item">
						<span class="label">Username</span>
						<span class="value">{user.username}</span>
					</div>
					<div class="info-item">
						<span class="label">Password</span>
						<span class="value"></span>
					</div>
				</div>
			{:else}
				<p class="empty-msg">User not found. Return to profile.</p>
			{/if}
		</section>

	</article>
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

	.profile-view {
		min-height: 100%;
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

	.page-title {
		text-align: center;
		font-size: var(--text-2xl);
		margin: 0 0 var(--space-6);
		color: var(--color-text);
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

	.empty-msg {
		color: var(--color-text-subtle);
		font-style: italic;
		margin-top: var(--space-4);
	}

</style>
