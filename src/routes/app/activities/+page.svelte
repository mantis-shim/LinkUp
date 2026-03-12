<script lang="ts">
	import type { Activity } from '$lib/types';
	import { goto } from '$app/navigation';
	import { fly } from 'svelte/transition';

	let { data } = $props();
	
	let activity = $derived(data.activity);
	let offset = $derived(data.offset);
	let hasMore = $derived(data.hasMore);

	// Tracking direction for transition
	let direction = $state(1); // 1 for right, -1 for left

	function goToNext() {
		if (!hasMore) return;
		direction = 1;
		const nextOffset = offset + 1;
		goto(`?offset=${nextOffset}`, { replaceState: false, keepFocus: true, noScroll: true });
	}

	function goToPrev() {
		if (offset <= 0) return;
		direction = -1;
		const prevOffset = offset - 1;
		goto(`?offset=${prevOffset}`, { replaceState: false, keepFocus: true, noScroll: true });
	}
</script>

<div class="card-wrapper">
	{#if activity}
		<div class="animation-container">
			{#key offset}
				<article
					in:fly={{ x: 300 * direction, opacity: 0, duration: 400, delay: 100 }}
					out:fly={{ x: -150 * direction, opacity: 0, duration: 300 }}
				>
					<!-- Previous Arrow (only if not at first) -->
				{#if offset > 0}
					<button class="nav-arrow prev" onclick={goToPrev} aria-label="Previous activity">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<polyline points="15 18 9 12 15 6"></polyline>
						</svg>
					</button>
				{/if}

				<!-- Next Arrow (only if has more) -->
				{#if hasMore}
					<button class="nav-arrow next" onclick={goToNext} aria-label="Next activity">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<polyline points="9 18 15 12 9 6"></polyline>
						</svg>
					</button>
				{/if}

				<!-- Image Placeholder -->
				<figure>
					{#if activity.image_src}
						<img src={activity.image_src} alt={activity.name} />
					{:else}
						<div style="aspect-ratio: 1/1; background: var(--color-bg-secondary); display: flex; align-items: center; justify-content: center; border-radius: var(--radius-lg);">
							<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-subtle)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
							</svg>
						</div>
					{/if}
				</figure>

				<!-- Content -->
				<section>
					<header>
						<div class="title-group">
							<h1>{activity.name}</h1>
							<small>By Creator #{activity.creator_id}</small>
						</div>
						<mark>Category #{activity.category_id}</mark>
					</header>

					{#if activity.description}
						<p>{activity.description}</p>
					{/if}

					<div class="info-list">
						<div class="info-item">
							<span class="label">Location</span>
							<span class="value">{activity.location || 'Not set'}</span>
						</div>
						<div class="info-item">
							<span class="label">Date</span>
							<span class="value">{activity.starts_at ? new Date(activity.starts_at).toLocaleDateString() : 'TBD'}</span>
						</div>
						<div class="info-item">
							<span class="label">Gender</span>
							<span class="value">{activity.gender_id || 'Any'}</span>
						</div>
					</div>

					<footer>
						<small>Created {new Date(activity.created_at).toLocaleDateString()} (Index: {offset})</small>
					</footer>
				</section>
			</article>
		{/key}
		</div>
	{:else}
		<article class="skeleton-card">
			<div class="skeleton-image"></div>
			<section>
				<div class="skeleton-header">
					<div class="skeleton-title"></div>
					<div class="skeleton-badge"></div>
				</div>
				<div class="skeleton-desc"></div>
				<div class="skeleton-desc short"></div>
				<div class="skeleton-info-list">
					<div class="skeleton-info-item"></div>
					<div class="skeleton-info-item"></div>
					<div class="skeleton-info-item"></div>
				</div>
			</section>
			<div class="status-overlay">
				<h2>No Activities Found</h2>
				<p>Be the first to create one!</p>
				<button class="action-btn" onclick={() => location.reload()}>Refresh Feed</button>
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
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-xl);
		padding: var(--space-8);
		width: 100%;
		height: 90dvh;
		position: relative;
		opacity: 0.7;
	}

	.skeleton-image {
		aspect-ratio: 1/1;
		background: var(--color-bg-secondary);
		border-radius: var(--radius-lg);
		margin-bottom: var(--space-6);
		animation: pulse 2s infinite ease-in-out;
	}

	.skeleton-title {
		height: 2rem;
		width: 60%;
		background: var(--color-bg-secondary);
		border-radius: var(--radius-md);
		margin-bottom: var(--space-2);
		animation: pulse 2s infinite ease-in-out;
	}

	.skeleton-badge {
		height: 1.5rem;
		width: 80px;
		background: var(--color-bg-secondary);
		border-radius: var(--radius-full);
		animation: pulse 2s infinite ease-in-out;
	}

	.skeleton-desc {
		height: 1rem;
		width: 90%;
		background: var(--color-bg-secondary);
		border-radius: var(--radius-sm);
		margin-bottom: var(--space-2);
		animation: pulse 2s infinite ease-in-out;
	}

	.skeleton-desc.short { width: 40%; }

	.skeleton-info-list {
		margin-top: var(--space-8);
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.skeleton-info-item {
		height: 1.5rem;
		background: var(--color-bg-secondary);
		border-radius: var(--radius-sm);
		animation: pulse 2s infinite ease-in-out;
	}

	.status-overlay {
		position: absolute;
		inset: 0;
		background: rgba(0,0,0,0.05);
		backdrop-filter: blur(2px);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: var(--space-8);
		border-radius: var(--radius-xl);
	}

	.status-overlay h2 { color: var(--color-text); margin-bottom: var(--space-2); }
	.status-overlay p { color: var(--color-text-subtle); margin-bottom: var(--space-8); }

	.action-btn {
		padding: var(--space-3) var(--space-8);
		background: var(--color-primary);
		color: white;
		border: none;
		border-radius: var(--radius-lg);
		font-weight: 600;
		cursor: pointer;
	}

	.animation-container {
		position: relative;
		width: 100%;
		max-width: var(--max-w-sm);
		height: 90dvh;
		display: grid;
		place-items: center;
	}

	.animation-container > :global(article) {
		grid-area: 1 / 1;
	}

	.card-wrapper {
		background: var(--color-bg);
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		position: relative;
	}

	article {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-xl);
		padding: var(--space-8);
		max-width: var(--max-w-sm);
		width: 100%;
		height: 90dvh;
		display: flex;
		flex-direction: column;
		box-shadow: none;
		box-sizing: border-box;
		overflow: hidden;
	}

	.nav-arrow {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		color: var(--color-text);
		border-radius: var(--radius-full);
		width: 44px;
		height: 44px;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: var(--shadow-md);
		z-index: 10;
		padding: 0;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.nav-arrow:hover {
		background: var(--color-bg-secondary);
		transform: translateY(-50%) scale(1.1);
	}

	.nav-arrow.next {
		right: var(--space-4);
	}

	.nav-arrow.prev {
		left: var(--space-4);
	}

	figure {
		flex: 1;
		min-height: 0;
		margin: 0 0 var(--space-8) 0;
		border-radius: var(--radius-lg);
		overflow: hidden;
	}

	figure {
		flex: 1;
		min-height: 0;
		margin: 0 0 var(--space-8) 0;
		border-radius: var(--radius-lg);
		overflow: hidden;
	}

	figure img, 
	figure div {
		height: 100%;
		width: 100%;
		object-fit: cover;
	}

	header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: var(--space-6);
	}

	.title-group h1 {
		font-size: var(--text-3xl);
		line-height: var(--leading-tight);
	}

	section {
		display: flex;
		flex-direction: column;
		flex-shrink: 0;
	}

	section > p {
		color: var(--color-text-muted);
		margin-bottom: var(--space-6);
		font-size: var(--text-sm);
		max-width: 100%;
	}

	.info-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		margin-bottom: var(--space-6);
	}

	.info-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-bottom: var(--space-2);
		border-bottom: 1px solid var(--color-bg-secondary);
	}

	.label {
		font-size: var(--text-xs);
		font-weight: var(--font-medium);
		color: var(--color-text-subtle);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.value {
		font-size: var(--text-sm);
		font-weight: var(--font-semibold);
		color: var(--color-text);
	}

	footer {
		margin-top: auto;
		border-top: 1px solid var(--color-border);
		padding-top: var(--space-4);
		text-align: center;
	}
</style>

