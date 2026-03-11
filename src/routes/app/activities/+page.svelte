<script lang="ts">
	import type { Activity } from '$lib/types';

	export let data;
	const activity: Activity = data?.activity || {
		id: 1,
		name: 'Sample Activity',
		description: 'This is a detailed description of the activity. It explains what will happen, what to bring, and any other relevant details.',
		location: 'City Center, Main St 1',
		image_src: "/images/article1.webp",
		creator_id: 1,
		category_id: 2,
		created_at: new Date().toISOString(),
		starts_at: new Date().toISOString(),
		gender_id: 1
	};
</script>

<div>
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
</div>

<style>
	article {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-xl);
		padding: var(--space-8);
		max-width: var(--max-w-sm);
		margin: 0 auto;
		height: 90dvh;
		display: flex;
		flex-direction: column;
		box-shadow: none;
		box-sizing: border-box;
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

