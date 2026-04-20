<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { slide } from 'svelte/transition';
	import { untrack } from 'svelte';

	let { data } = $props();

	let activity = $derived(data.activity);
	let offset = $derived(data.offset);
	let hasMore = $derived(data.hasMore);
	let categories = $derived(data.categories || []);
	let genders = $derived(data.genders || []);
	let locations = $derived(data.locations || []);
	let filters = $derived(data.filters || {});

	// ── Filter state ───────────────────────────────────────────
	let filtersOpen = $state(false);
	let selectedCategory = $state(untrack(() => data.filters?.category || ''));
	let selectedLocation = $state(untrack(() => data.filters?.location || ''));
	let selectedGender = $state(untrack(() => data.filters?.gender || ''));
	let selectedStartDate = $state(untrack(() => data.filters?.startDate || ''));
	let selectedEndDate = $state(untrack(() => data.filters?.endDate || ''));

	let hasActiveFilters = $derived(
		!!(selectedCategory || selectedLocation || selectedGender || selectedStartDate || selectedEndDate)
	);

	function getFilterParams() {
		const params: string[] = [];
		if (selectedCategory) params.push(`category=${selectedCategory}`);
		if (selectedLocation) params.push(`location=${encodeURIComponent(selectedLocation)}`);
		if (selectedGender) params.push(`gender=${selectedGender}`);
		if (selectedStartDate) params.push(`startDate=${selectedStartDate}`);
		if (selectedEndDate) params.push(`endDate=${selectedEndDate}`);
		return params.length > 0 ? '&' + params.join('&') : '';
	}

	function resetFilters() {
		selectedCategory = '';
		selectedLocation = '';
		selectedGender = '';
		selectedStartDate = '';
		selectedEndDate = '';
		goto('?offset=0', { replaceState: true });
	}

	// ── Toast ──────────────────────────────────────────────────
	let toast = $state<{ message: string; type: 'success' | 'error' } | null>(null);
	let toastTimer: ReturnType<typeof setTimeout> | null = null;

	function showToast(message: string, type: 'success' | 'error' = 'success') {
		if (toastTimer) clearTimeout(toastTimer);
		toast = { message, type };
		toastTimer = setTimeout(() => { toast = null; }, 2500);
	}

	// ── Swipe logic ────────────────────────────────────────────
	let isDragging = $state(false);
	let startX = $state(0);
	let swipeX = $state(0);
	let isAnimatingOut = $state(false);

	const SWIPE_THRESHOLD = 100;

	// Stamp opacities: left stamp shows on left-drag, right stamp on right-drag
	let leftStampOpacity  = $derived(Math.min(Math.max(-swipeX / SWIPE_THRESHOLD, 0), 1));
	let rightStampOpacity = $derived(Math.min(Math.max( swipeX / SWIPE_THRESHOLD, 0), 1));
	let cardTransform = $derived(`translateX(${swipeX}px) rotate(${swipeX * 0.045}deg)`);
	let cardTransition = $derived(
		isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
	);

	function onPointerDown(e: PointerEvent) {
		if (isAnimatingOut) return;
		isDragging = true;
		startX = e.clientX;
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
	}

	function onPointerMove(e: PointerEvent) {
		if (!isDragging) return;
		swipeX = e.clientX - startX;
	}

	function onPointerUp() {
		if (!isDragging) return;
		isDragging = false;
		if (swipeX < -SWIPE_THRESHOLD) {
			swipeOut('left');
		} else if (swipeX > SWIPE_THRESHOLD) {
			swipeOut('right');
		} else {
			swipeX = 0;
		}
	}

	async function swipeOut(direction: 'left' | 'right') {
		if (!activity || isAnimatingOut) return;
		const activityId = activity.id;
		isAnimatingOut = true;
		swipeX = direction === 'left' ? -800 : 800;
		await new Promise<void>((r) => setTimeout(r, 380));

		const action = direction === 'left' ? 'accept' : 'reject';
		try {
			const response = await fetch('/app/activities', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ activityId, action })
			});
			const result = await response.json();
			if (response.ok && result.status) {
				showToast(result.status === 'accepted' ? 'Priimta! ✓' : 'Atmesta ✕', result.status === 'accepted' ? 'success' : 'error');
			} else {
				showToast('Nepavyko. Bandykite dar kartą.', 'error');
			}
		} catch {
			showToast('Nepavyko. Patikrinkite ryšį.', 'error');
		}

		// Reload data — DB exclusion now hides the acted-on activity
		await invalidateAll();
		swipeX = 0;
		isAnimatingOut = false;
	}

	async function acceptActivity() {
		await swipeOut('left');
	}

	async function rejectActivity() {
		await swipeOut('right');
	}

	function getCategoryLabel(categoryId: number | null | undefined) {
		switch (Number(categoryId)) {
			case 1:
				return 'Sportas';
			case 2:
				return 'Žaidimai';
			case 3:
				return 'Filmai';
			case 4:
				return 'Muzika';
			case 5:
				return 'Maistas';
			case 6:
				return 'Kelionės';
			case 7:
				return 'Mokslai';
			case 8:
				return 'Laisvalaikis';
			default:
				return 'Kita';
		}
	}

	function getGenderLabel(genderId: number | null | undefined) {
		switch (Number(genderId)) {
			case 1:
				return 'Vyras';
			case 2:
				return 'Moteris';
			case 3:
				return 'Kita';
			default:
				return 'Bet kas';
		}
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
					{#if offset > 0}
						<button class="nav-arrow prev" onclick={goToPrev} aria-label="Previous activity">
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<polyline points="15 18 9 12 15 6"></polyline>
							</svg>
						</button>
					{/if}

					{#if hasMore}
						<button class="nav-arrow next" onclick={goToNext} aria-label="Next activity">
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<polyline points="9 18 15 12 9 6"></polyline>
							</svg>
						</button>
					{/if}

					<figure>
						{#if activity.image_src}
							<img src={activity.image_src} alt={activity.name} />
						{:else}
							<div style="aspect-ratio: 1/1; background: var(--color-bg-secondary); display: flex; align-items: center; justify-content: center; border-radius: var(--radius-lg);">
								<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-subtle)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
									<circle cx="8.5" cy="8.5" r="1.5"/>
									<polyline points="21 15 16 10 5 21"/>
								</svg>
							</div>
						{/if}
					</figure>

					<section>
						<header>
							<div class="title-group">
								<h1>{activity.name}</h1>
								<small>By Creator #{activity.creator_id}</small>
							</div>
							<mark>{getCategoryLabel(activity.category_id)}</mark>
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
								<span class="value">{getGenderLabel(activity.gender_id)}</span>
							</div>
						</div>

						<footer>
							<small>Created {new Date(activity.created_at).toLocaleDateString()} (Index: {offset})</small>

							<div class="edit-wrapper">
								<a href={`/app/activities/edit/${activity.id}`} class="edit-btn">
									Redaguoti
								</a>
							</div>
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

<!-- ── Collapsible Filters Drawer ──────────────────────────── -->
{#if filtersOpen}
	<div class="filters-drawer" transition:slide={{ duration: 220 }}>
		<form method="GET" action="?" class="filters-form">
			<div class="filters-grid">
				<div class="filter-group">
					<label for="category">Kategorija</label>
					<select id="category" name="category" bind:value={selectedCategory}>
						<option value="">Visos kategorijos</option>
						{#each categories as cat}
							<option value={cat.id}>{cat.name}</option>
						{/each}
					</select>
				</div>

				<div class="filter-group">
					<label for="location">Vieta</label>
					<select id="location" name="location" bind:value={selectedLocation}>
						<option value="">Visos vietos</option>
						{#each locations as loc}
							<option value={loc.location}>{loc.location}</option>
						{/each}
					</select>
				</div>

				<div class="filter-group">
					<label for="gender">Lytis</label>
					<select id="gender" name="gender" bind:value={selectedGender}>
						<option value="">Visi</option>
						{#each genders as gen}
							<option value={gen.id}>{gen.name}</option>
						{/each}
					</select>
				</div>

				<div class="filter-group">
					<label for="startDate">Nuo</label>
					<input type="date" id="startDate" name="startDate" bind:value={selectedStartDate} />
				</div>

				<div class="filter-group">
					<label for="endDate">Iki</label>
					<input type="date" id="endDate" name="endDate" bind:value={selectedEndDate} />
				</div>
			</div>

			<div class="filters-actions">
				<button type="submit" class="btn-primary">Filtruoti</button>
				{#if hasActiveFilters}
					<button type="button" class="btn-ghost" onclick={resetFilters}>Atstatyti</button>
				{/if}
			</div>
		</form>
	</div>
{/if}

<!-- ── Deck ──────────────────────────────────────────────── -->
<div class="deck">
	{#if activity}
		<!-- Background swipe-direction arrows -->
		<div class="bg-arrow left-arrow" aria-hidden="true">
			<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M15 18l-6-6 6-6"/>
			</svg>
			<span>Priimti</span>
		</div>
		<div class="bg-arrow right-arrow" aria-hidden="true">
			<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M9 18l6-6-6-6"/>
			</svg>
			<span>Atmesti</span>
		</div>

		<!-- Swipeable card -->
		<div
			class="card"
			style:transform={cardTransform}
			style:transition={cardTransition}
			role="presentation"
			onpointerdown={onPointerDown}
			onpointermove={onPointerMove}
			onpointerup={onPointerUp}
			onpointercancel={onPointerUp}
		>
			<!-- Left-swipe stamp -->
			<div class="swipe-stamp left-stamp" style:opacity={leftStampOpacity} aria-hidden="true">
				<span>PRIIMTI</span>
			</div>

			<!-- Right-swipe stamp -->
			<div class="swipe-stamp right-stamp" style:opacity={rightStampOpacity} aria-hidden="true">
				<span>ATMESTI</span>
			</div>

			<!-- Image -->
			<div class="card-image">
				{#if activity.image_src}
					<img src={activity.image_src} alt={activity.name} draggable="false" />
				{:else}
					<img src="/images/article1.webp" alt="Veikla" draggable="false" />
				{/if}
				<div class="image-scrim" aria-hidden="true"></div>
			</div>

			<!-- Card body -->
			<div class="card-body">
				<div class="card-title-row">
					<h2>{activity.name}</h2>
					{#if activity.category_name}
						<mark>#{activity.category_name}</mark>
					{/if}
				</div>

				{#if activity.description}
					<p class="card-description">{activity.description}</p>
				{/if}

				<div class="info-chips">
					{#if activity.location}
						<div class="chip">
							<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
								<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="3" />
							</svg>
							{activity.location}
						</div>
					{/if}

					{#if activity.starts_at}
						<div class="chip">
							<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
								<rect width="18" height="18" x="3" y="4" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
							</svg>
							{new Date(activity.starts_at).toLocaleDateString('lt-LT')}
						</div>
					{/if}

					{#if activity.gender_id}
						<div class="chip">
							<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
								<circle cx="12" cy="8" r="5" /><path d="M20 21a8 8 0 1 0-16 0" />
							</svg>
							{activity.gender_id}
						</div>
					{/if}
				</div>

				<footer class="card-footer">
					<small>Sukūrė: {activity.creator_name} {activity.creator_lastname}</small>
				</footer>
			</div>
		</div>



	{:else}
		<!-- Empty state -->
		<div class="empty-state">
			<div class="empty-icon">
				<svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-subtle)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
				</svg>
			</div>
			<h3>Veiklų nerasta</h3>
			<p>Pabandykite pakeisti filtrus arba sukurkite naują veiklą.</p>
			<div class="empty-actions">
				<button class="btn-primary" onclick={() => location.reload()}>Atnaujinti</button>
				{#if hasActiveFilters}
					<button class="btn-ghost" onclick={resetFilters}>Pašalinti filtrus</button>
				{/if}
			</div>
		</div>
	{/if}
</div>

<!-- ── Toast ─────────────────────────────────────────────── -->
{#if toast}
	<div class="toast toast-{toast.type}" role="status" aria-live="polite">
		{toast.message}
	</div>
{/if}

<style>
<<<<<<< HEAD
	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.5; }
=======
	/* ── Filter Bar ──────────────────────────────────────────── */
	.filter-bar {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-3) var(--space-6);
		background: var(--color-bg);
		border-bottom: 1px solid var(--color-border);
		position: sticky;
		top: 0;
		z-index: var(--z-above);
		backdrop-filter: blur(8px);
>>>>>>> develop
	}

	.filter-toggle {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-4);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-full);
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		font-family: inherit;
		color: var(--color-text);
		cursor: pointer;
		transition: all var(--transition-fast);
		position: relative;
	}

	.filter-toggle:hover {
		border-color: var(--color-primary);
		color: var(--color-primary);
	}

	.filter-toggle.active {
		background: var(--color-primary);
		color: white;
		border-color: var(--color-primary);
	}

	.filter-dot {
		position: absolute;
		top: 5px;
		right: 5px;
		width: 7px;
		height: 7px;
		background: var(--color-accent);
		border-radius: 50%;
		border: 1.5px solid var(--color-bg);
	}

	.count-pill {
		font-size: var(--text-sm);
		color: var(--color-text-subtle);
		margin-left: auto;
	}

	.reset-pill {
		padding: var(--space-1) var(--space-3);
		background: none;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-full);
		font-size: var(--text-xs);
		font-family: inherit;
		color: var(--color-text-muted);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.reset-pill:hover {
		background: var(--color-danger);
		color: white;
		border-color: var(--color-danger);
	}

	/* ── Filters Drawer ──────────────────────────────────────── */
	.filters-drawer {
		background: var(--color-surface);
		border-bottom: 1px solid var(--color-border);
		padding: var(--space-5) var(--space-6);
	}

	.filters-form {
		max-width: var(--max-w-md);
		margin: 0 auto;
	}

	.filters-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
		gap: var(--space-3);
		margin-bottom: var(--space-5);
	}

	.filter-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.filter-group label {
		font-size: var(--text-xs);
		font-weight: var(--font-semibold);
		color: var(--color-text-subtle);
		text-transform: uppercase;
		letter-spacing: 0.07em;
	}

	.filter-group select,
	.filter-group input[type='date'] {
		padding: var(--space-2) var(--space-3);
		background: var(--color-bg-secondary);
		color: var(--color-text);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		font-family: inherit;
		transition:
			border-color var(--transition-fast),
			box-shadow var(--transition-fast);
		cursor: pointer;
	}

	.filter-group select:focus,
	.filter-group input[type='date']:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px rgba(124, 106, 247, 0.12);
	}

	.filters-actions {
		display: flex;
		gap: var(--space-3);
	}

	/* ── Deck ────────────────────────────────────────────────── */
	.deck {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--space-4);
		height: calc(100dvh - 52px);
		position: relative;
	}

	/* ── Swipeable Card ──────────────────────────────────────── */
	.card {
		position: relative;
		display: flex;
		flex-direction: column;
		width: 100%;
		max-width: 420px;
		height: min(640px, calc(100dvh - 52px - var(--space-8)));
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-top: 3px solid var(--color-primary);
		border-radius: var(--radius-xl);
		overflow: hidden;
		box-shadow: var(--shadow-lg);
		cursor: grab;
		user-select: none;
		-webkit-user-select: none;
		will-change: transform;
		touch-action: none;
		z-index: 1;
	}

	.card:active {
		cursor: grabbing;
	}

	/* ── Swipe stamps ────────────────────────────────────────── */
	.swipe-stamp {
		position: absolute;
		top: var(--space-6);
		z-index: 10;
		padding: var(--space-2) var(--space-4);
		border-radius: var(--radius-md);
		font-size: var(--text-2xl);
		font-weight: var(--font-black);
		letter-spacing: 0.1em;
		text-transform: uppercase;
		pointer-events: none;
		border: 3px solid currentColor;
	}

	.left-stamp {
		left: var(--space-6);
		color: var(--color-success);
		background: rgba(76, 175, 125, 0.06);
		transform: rotate(-14deg);
	}

	.right-stamp {
		right: var(--space-6);
		color: var(--color-danger);
		background: rgba(224, 92, 92, 0.06);
		transform: rotate(14deg);
	}

	/* ── Card image ──────────────────────────────────────────── */
	.card-image {
		position: relative;
		width: 100%;
		flex: 1;
		min-height: 0;
		overflow: hidden;
	}

	.card-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		pointer-events: none;
	}

	.image-scrim {
		position: absolute;
		inset: 0;
		background: linear-gradient(
			to bottom,
			transparent 45%,
			rgba(124, 106, 247, 0.06) 75%,
			rgba(124, 106, 247, 0.18) 100%
		);
		pointer-events: none;
	}

	/* ── Card body ───────────────────────────────────────────── */
	.card-body {
		flex-shrink: 0;
		padding: var(--space-4) var(--space-5);
	}

	.card-title-row {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--space-3);
		margin-bottom: var(--space-3);
	}

	.card-title-row h2 {
		font-size: var(--text-2xl);
		font-weight: var(--font-bold);
		line-height: var(--leading-tight);
		letter-spacing: -0.02em;
	}

	.card-title-row mark {
		background: rgba(124, 106, 247, 0.12);
		color: var(--color-primary);
		font-size: var(--text-xs);
		font-weight: var(--font-semibold);
		padding: var(--space-1) var(--space-3);
		border-radius: var(--radius-full);
		white-space: nowrap;
		flex-shrink: 0;
		align-self: flex-start;
	}

	.card-description {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		line-height: var(--leading-normal);
		margin-bottom: var(--space-4);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	/* ── Info chips ──────────────────────────────────────────── */
	.info-chips {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin-bottom: var(--space-4);
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
		font-weight: var(--font-medium);
		color: var(--color-text-muted);
	}

	.chip svg {
		flex-shrink: 0;
		color: var(--color-primary);
	}

	/* ── Card footer ─────────────────────────────────────────── */
	.card-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-top: var(--space-4);
		border-top: 1px solid var(--color-border);
	}

	.card-footer small {
		font-size: var(--text-xs);
		color: var(--color-text-subtle);
	}

	.card-counter {
		font-weight: var(--font-semibold);
		color: var(--color-primary) !important;
	}

	/* ── Background swipe arrows ────────────────────────────── */
	.bg-arrow {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-1);
		pointer-events: none;
		user-select: none;
	}

	.left-arrow {
		left: var(--space-2);
		color: var(--color-success);
		opacity: 0.18;
	}

	.right-arrow {
		right: var(--space-2);
		color: var(--color-danger);
		opacity: 0.18;
	}

	.bg-arrow span {
		font-size: var(--text-xs);
		font-weight: var(--font-bold);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	/* ── Empty state ─────────────────────────────────────────── */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: var(--space-12) var(--space-8);
		gap: var(--space-3);
	}

	.empty-icon {
		width: 88px;
		height: 88px;
		border-radius: 50%;
		background: var(--color-bg-secondary);
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: var(--space-4);
	}

	.empty-state h3 {
		font-size: var(--text-2xl);
		color: var(--color-text);
	}

	.empty-state p {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		max-width: 28ch;
	}

	.empty-actions {
		display: flex;
		gap: var(--space-3);
		margin-top: var(--space-4);
	}

	/* ── Shared buttons ──────────────────────────────────────── */
	.btn-primary {
		padding: var(--space-2) var(--space-6);
		background: var(--color-primary);
		color: white;
		border: none;
		border-radius: var(--radius-lg);
<<<<<<< HEAD
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
=======
>>>>>>> develop
		font-size: var(--text-sm);
		font-weight: var(--font-semibold);
		font-family: inherit;
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.btn-primary:hover {
		background: var(--color-primary-hover);
		box-shadow: var(--shadow-md);
		transform: translateY(-1px);
	}

	.btn-ghost {
		padding: var(--space-2) var(--space-6);
		background: none;
		color: var(--color-text-muted);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		font-size: var(--text-sm);
		font-family: inherit;
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.btn-ghost:hover {
		background: var(--color-bg-secondary);
		color: var(--color-text);
	}

	/* ── Toast ───────────────────────────────────────────────── */
	.toast {
		position: fixed;
		bottom: 2rem;
		left: 50%;
		transform: translateX(-50%);
		padding: 0.6rem 1.4rem;
		border-radius: var(--radius-full);
		font-size: var(--text-sm);
		font-weight: var(--font-semibold);
		font-family: inherit;
		z-index: 200;
		pointer-events: none;
		white-space: nowrap;
		box-shadow: var(--shadow-lg);
		animation: toast-in 0.2s ease;
	}

	@keyframes toast-in {
		from { opacity: 0; transform: translateX(-50%) translateY(8px); }
		to   { opacity: 1; transform: translateX(-50%) translateY(0); }
	}

	.toast-success {
		background: #16a34a;
		color: #fff;
	}

	.toast-error {
		background: #dc2626;
		color: #fff;
	}
<<<<<<< HEAD

	.edit-wrapper {
		margin-top: 12px;
	}

	.edit-btn {
		display: inline-block;
		padding: 0.65rem 1rem;
		background: #f3f3f3;
		color: #222;
		text-decoration: none;
		border-radius: 10px;
		font-weight: 600;
		transition: 0.2s ease;
	}

	.edit-btn:hover {
		background: #e2e2e2;
	}
</style>
=======
</style>
>>>>>>> develop
