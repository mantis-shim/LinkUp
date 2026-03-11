<script lang="ts">
	import type { Activity } from '$lib/types';
	import { onMount } from 'svelte';

	let { data } = $props();
	
	let activities = $state<Activity[]>(data.activities || []);
	let nextOffset = $state(data.nextOffset);
	let loading = $state(false);

	// Container for the list of cards
	let scrollContainer: HTMLDivElement;

	async function loadMore() {
		if (loading || nextOffset === null) return;
		loading = true;

		try {
			const res = await fetch(`/app/activities?offset=${nextOffset}`);
			const newData = await res.json();
			
			activities = [...activities, ...newData.activities];
			nextOffset = newData.nextOffset;
		} catch (e) {
			console.error('Failed to load more activities', e);
		} finally {
			loading = false;
		}
	}

	function handleScroll(e: Event) {
		const target = e.target as HTMLDivElement;
		// If we are near the bottom of the scrollable content
		if (target.scrollHeight - target.scrollTop <= target.clientHeight + 100) {
			loadMore();
		}
	}
</script>

<div class="scroll-wrapper" onscroll={handleScroll}>
	{#if activities.length > 0}
		{#each activities as activity}
			<article>
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
						<small>Created {new Date(activity.created_at).toLocaleDateString()}</small>
					</footer>
				</section>
			</article>
		{/each}
		
		{#if loading}
			<div class="status-msg">Loading more...</div>
		{/if}
		
		{#if nextOffset === null && activities.length > 0}
			<div class="status-msg">No more activities to show</div>
		{/if}
	{:else}
		<div class="status-msg">No activities found</div>
	{/if}
</div>

<style>
	.scroll-wrapper {
		height: 100dvh;
		overflow-y: auto;
		scroll-snap-type: y mandatory;
		background: var(--color-bg);
	}

	article {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-xl);
		padding: var(--space-8);
		max-width: var(--max-w-sm);
		margin: 0 auto;
		height: 100dvh;
		display: flex;
		flex-direction: column;
		box-shadow: none;
		box-sizing: border-box;
		overflow: hidden;
		scroll-snap-align: start;
		scroll-snap-stop: always;
	}

	.status-msg {
		text-align: center;
		padding: var(--space-8);
		color: var(--color-text-muted);
		font-size: var(--text-sm);
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

