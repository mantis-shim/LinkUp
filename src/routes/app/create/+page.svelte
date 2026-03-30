<script lang="ts">
	let { form } = $props();
</script>

<svelte:head>
	<title>Kurti veiklą</title>
</svelte:head>

<div class="page">
	<div class="card">
		<h1>Kurti veiklą</h1>
		<p class="subtitle">Įvesk naujos veiklos informaciją.</p>

		<form method="POST" class="activity-form">
			<div class="field">
				<label for="name">Pavadinimas</label>
				<input id="name" name="name" type="text" maxlength="30" value={form?.values?.name ?? ''} />
				{#if form?.errors?.name}
					<small class="error">{form.errors.name}</small>
				{/if}
			</div>

			<div class="field">
				<label for="description">Aprašymas</label>
				<textarea id="description" name="description" rows="4">{form?.values?.description ?? ''}</textarea>
			</div>

			<div class="field">
				<label for="location">Vieta</label>
				<input id="location" name="location" type="text" value={form?.values?.location ?? ''} />
			</div>

			<div class="field">
				<label for="starts_at">Data ir laikas</label>
				<input id="starts_at" name="starts_at" type="datetime-local" value={form?.values?.starts_at ?? ''} />
				{#if form?.errors?.starts_at}
					<small class="error">{form.errors.starts_at}</small>
				{/if}
			</div>

			<div class="grid-two">
				<div class="field">
					<label for="category_id">Kategorijos ID</label>
					<input id="category_id" name="category_id" type="number" min="1" value={form?.values?.category_id ?? ''} />
					{#if form?.errors?.category_id}
						<small class="error">{form.errors.category_id}</small>
					{/if}
				</div>

				<div class="field">
					<label for="gender_id">Lyties ID</label>
					<input id="gender_id" name="gender_id" type="number" min="1" value={form?.values?.gender_id ?? ''} />
					{#if form?.errors?.gender_id}
						<small class="error">{form.errors.gender_id}</small>
					{/if}
				</div>
			</div>

			<div class="field">
				<label for="image_src">Nuotraukos nuoroda</label>
				<input id="image_src" name="image_src" type="text" value={form?.values?.image_src ?? ''} />
			</div>

			{#if form?.dbError}
				<div class="error-box">{form.dbError}</div>
			{/if}

			<div class="actions">
				<a class="secondary-btn" href="/app/activities">Atgal</a>
				<button type="submit" class="primary-btn">Sukurti veiklą</button>
			</div>
		</form>
	</div>
</div>

<style>
	.page { display:flex; justify-content:center; padding:var(--space-8); background:var(--color-bg); min-height:calc(100vh - 80px); }
	.card { width:100%; max-width:720px; background:var(--color-surface); border:1px solid var(--color-border); border-radius:var(--radius-xl); padding:var(--space-8); }
	h1 { margin-bottom:var(--space-2); }
	.subtitle { color:var(--color-text-subtle); margin-bottom:var(--space-8); }
	.activity-form { display:flex; flex-direction:column; gap:var(--space-5); }
	.field { display:flex; flex-direction:column; gap:var(--space-2); }
	label { font-weight:600; color:var(--color-text); }
	input, textarea { width:100%; padding:0.85rem 1rem; border:1px solid var(--color-border); border-radius:var(--radius-lg); background:white; font:inherit; box-sizing:border-box; }
	textarea { resize:vertical; min-height:110px; }
	.grid-two { display:grid; grid-template-columns:1fr 1fr; gap:var(--space-4); }
	.actions { display:flex; justify-content:flex-end; gap:var(--space-3); margin-top:var(--space-4); }
	.primary-btn, .secondary-btn { padding:0.85rem 1.2rem; border-radius:var(--radius-lg); border:none; font-weight:600; text-decoration:none; cursor:pointer; }
	.primary-btn { background:var(--color-primary); color:white; }
	.secondary-btn { background:var(--color-bg-secondary); color:var(--color-text); }
	.error { color:#d32f2f; font-size:0.9rem; }
	.error-box { background:#fde8e8; color:#b42318; border:1px solid #f5c2c7; padding:0.85rem 1rem; border-radius:var(--radius-lg); }
	@media (max-width:700px) { .grid-two { grid-template-columns:1fr; } }
</style>