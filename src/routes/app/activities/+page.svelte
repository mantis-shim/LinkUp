<script lang="ts">
	import type { Activity } from '$lib/types';
	import { goto } from '$app/navigation';
	import { fly } from 'svelte/transition';

	let { data } = $props();
	
	let activity = $derived(data.activity);
	let offset = $derived(data.offset);
	let hasMore = $derived(data.hasMore);
	let categories = $derived(data.categories || []);
	let genders = $derived(data.genders || []);
	let locations = $derived(data.locations || []);
	let filters = $derived(data.filters || {});

	// Track filter state
	let selectedCategory = $state(filters.category);
	let selectedLocation = $state(filters.location);
	let selectedGender = $state(filters.gender);
	let selectedStartDate = $state(filters.startDate);
	let selectedEndDate = $state(filters.endDate);

	// Tracking direction for transition
	let direction = $state(1); // 1 for right, -1 for left

	function goToNext() {
		if (!hasMore) return;
		direction = 1;
		const nextOffset = offset + 1;
		goto(`?offset=${nextOffset}${getFilterParams()}`, { replaceState: false, keepFocus: true, noScroll: true });
	}

	function goToPrev() {
		if (offset <= 0) return;
		direction = -1;
		const prevOffset = offset - 1;
		goto(`?offset=${prevOffset}${getFilterParams()}`, { replaceState: false, keepFocus: true, noScroll: true });
	}

	function getFilterParams() {
		const params = [];
		if (selectedCategory) params.push(`category=${selectedCategory}`);
		if (selectedLocation) params.push(`location=${encodeURIComponent(selectedLocation)}`);
		if (selectedGender) params.push(`gender=${selectedGender}`);
		if (selectedStartDate) params.push(`startDate=${selectedStartDate}`);
		if (selectedEndDate) params.push(`endDate=${selectedEndDate}`);
		return params.length > 0 ? '&' + params.join('&') : '';
	}

	function applyFilters() {
		goto(`?offset=0${getFilterParams()}`, { replaceState: true });
	}

	function resetFilters() {
		selectedCategory = '';
		selectedLocation = '';
		selectedGender = '';
		selectedStartDate = '';
		selectedEndDate = '';
		goto('?offset=0', { replaceState: true });
	}
</script>

<div class="filters-container">
	<div class="filters-panel">
		<div class="filters-header">
			<h2>Filtrai</h2>
			<div class="button-group">
				<button class="filter-btn" onclick={applyFilters}>Filtruoti</button>
				{#if selectedCategory || selectedLocation || selectedGender || selectedStartDate || selectedEndDate}
					<button class="reset-btn" onclick={resetFilters}>Atsatyti</button>
				{/if}
			</div>
		</div>

		<div class="filters-grid">
			<!-- Category Filter -->
			<div class="filter-group">
				<label for="category">Kategorija</label>
				<select id="category" bind:value={selectedCategory}>
					<option value="">Visos kategorijos</option>
					{#each categories as cat}
						<option value={cat.id}>{cat.name}</option>
					{/each}
				</select>
			</div>

			<!-- Location Filter -->
			<div class="filter-group">
				<label for="location">Vieta</label>
				<select id="location" bind:value={selectedLocation}>
					<option value="">Visos vietos</option>
					{#each locations as loc}
						<option value={loc.location}>{loc.location}</option>
					{/each}
				</select>
			</div>

			<!-- Gender Filter -->
			<div class="filter-group">
				<label for="gender">Lytis</label>
				<select id="gender" bind:value={selectedGender}>
					<option value="">Visos</option>
					{#each genders as gen}
						<option value={gen.id}>{gen.name}</option>
					{/each}
				</select>
			</div>

			<!-- Date Range Filters -->
			<div class="filter-group">
				<label for="startDate">Nuo</label>
				<input 
					type="date" 
					id="startDate" 
					bind:value={selectedStartDate}
				/>
			</div>

			<div class="filter-group">
				<label for="endDate">Iki</label>
				<input 
					type="date" 
					id="endDate" 
					bind:value={selectedEndDate}
				/>
			</div>
		</div>

		{#if data.totalCount !== undefined}
			<div class="results-info">
				Rasta {data.totalCount} {data.totalCount === 1 ? 'veikla' : 'veiklos'}
			</div>
		{/if}
	</div>
</div>

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
						<img src={'/images/article1.webp'}>
					{/if}
				</figure>

				<!-- Content -->
				<section>
					<header>
						<div class="title-group">
							<h1>{activity.name}</h1>
							<small>Sukūrė: #{activity.creator_id}</small>
						</div>
						<mark>Kategorija #{activity.category_id}</mark>
					</header>

					{#if activity.description}
						<p>{activity.description}</p>
					{/if}

					<div class="info-list">
						<div class="info-item">
							<span class="label">Vieta</span>
							<span class="value">{activity.location || 'Not set'}</span>
						</div>
						<div class="info-item">
							<span class="label">Data</span>
							<span class="value">{activity.starts_at ? new Date(activity.starts_at).toLocaleDateString() : 'TBD'}</span>
						</div>
						<div class="info-item">
							<span class="label">Lytis</span>
							<span class="value">{activity.gender_id || '-'}</span>
						</div>
					</div>

					<footer>
						<small>Paskelbta {new Date(activity.created_at).toLocaleDateString()}</small>
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

	/* Filter Styles */
	.filters-container {
		width: 100%;
		background: var(--color-bg);
		padding: var(--space-8) 0;
		border-bottom: 1px solid var(--color-border);
	}

	.filters-panel {
		max-width: var(--max-w-4xl);
		margin: 0 auto;
		padding: 0 var(--space-8);
	}

	.filters-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-6);
	}

	.filters-header h2 {
		font-size: var(--text-2xl);
		font-weight: var(--font-bold);
		color: var(--color-text);
		margin: 0;
	}

	.reset-btn {
		padding: var(--space-2) var(--space-4);
		background: var(--color-bg-secondary);
		color: var(--color-text);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		font-size: var(--text-sm);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.reset-btn:hover {
		background: var(--color-border);
		transform: translateY(-2px);
	}

	.button-group {
		display: flex;
		gap: var(--space-3);
		align-items: center;
	}

	.filter-btn {
		padding: var(--space-2) var(--space-4);
		background: var(--color-primary);
		color: white;
		border: 1px solid var(--color-primary);
		border-radius: var(--radius-lg);
		font-size: var(--text-sm);
		font-weight: var(--font-semibold);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.filter-btn:hover {
		background: var(--color-primary-dark);
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
	}

	.filters-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: var(--space-4);
		margin-bottom: var(--space-6);
	}

	.filter-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.filter-group label {
		font-size: var(--text-sm);
		font-weight: var(--font-semibold);
		color: var(--color-text);
		text-transform: capitalize;
	}

	.filter-group select,
	.filter-group input[type="date"] {
		padding: var(--space-3) var(--space-3);
		background: var(--color-surface);
		color: var(--color-text);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		font-size: var(--text-sm);
		font-family: inherit;
		transition: all 0.2s ease;
		cursor: pointer;
	}

	.filter-group select:hover,
	.filter-group input[type="date"]:hover {
		border-color: var(--color-primary);
		box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.1);
	}

	.filter-group select:focus,
	.filter-group input[type="date"]:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.15);
	}

	.filter-group input[type="date"]::placeholder {
		color: var(--color-text-muted);
	}

	.results-info {
		font-size: var(--text-sm);
		color: var(--color-text-subtle);
		text-align: center;
		padding: var(--space-4);
		background: var(--color-bg-secondary);
		border-radius: var(--radius-lg);
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.filters-grid {
			grid-template-columns: 1fr 1fr;
		}

		.filters-panel {
			padding: 0 var(--space-4);
		}

		.filters-header h2 {
			font-size: var(--text-xl);
		}
	}

	@media (max-width: 480px) {
		.filters-grid {
			grid-template-columns: 1fr;
		}

		.filters-container {
			padding: var(--space-4) 0;
		}

		.filters-panel {
			padding: 0 var(--space-4);
		}

		.filters-header {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--space-3);
		}
	}

</style>

