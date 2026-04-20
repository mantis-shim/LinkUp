<script lang="ts">
	let { data, form } = $props();

	const activity = data.activity;

	let imagePreview = $state(form?.values?.image_src ?? activity.image_src ?? '');

	const categoryOptions = [
		{ value: '1', label: 'Sportas' },
		{ value: '2', label: 'Žaidimai' },
		{ value: '3', label: 'Filmai' },
		{ value: '4', label: 'Muzika' },
		{ value: '5', label: 'Maistas' },
		{ value: '6', label: 'Kelionės' },
		{ value: '7', label: 'Mokslai' },
		{ value: '8', label: 'Laisvalaikis' }
	];

	const genderOptions = [
		{ value: '', label: 'Bet kas' },
		{ value: '1', label: 'Vyras' },
		{ value: '2', label: 'Moteris' },
		{ value: '3', label: 'Kita' }
	];

	function toDateTimeLocal(value: string | null) {
		if (!value) return '';
		const date = new Date(value);
		const offset = date.getTimezoneOffset();
		const local = new Date(date.getTime() - offset * 60 * 1000);
		return local.toISOString().slice(0, 16);
	}

	async function handleFileChange(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];

		if (!file) return;

		if (!file.type.startsWith('image/')) {
			alert('Pasirink failą, kuris yra nuotrauka.');
			input.value = '';
			return;
		}

		const reader = new FileReader();

		reader.onload = () => {
			const result = String(reader.result ?? '');
			imagePreview = result;

			const hiddenInput = document.getElementById('image_src') as HTMLInputElement | null;
			if (hiddenInput) {
				hiddenInput.value = result;
			}
		};

		reader.readAsDataURL(file);
	}
</script>

<div class="page">
	<div class="card">
		<h1>Redaguoti veiklą</h1>
		<p class="subtitle">Pakeisk pasirinktos veiklos informaciją.</p>

		<form method="POST" class="activity-form">
			<div class="field">
				<label for="name">Pavadinimas</label>
				<input
					id="name"
					name="name"
					type="text"
					maxlength="30"
					value={form?.values?.name ?? activity.name}
				/>
				{#if form?.errors?.name}
					<small class="error">{form.errors.name}</small>
				{/if}
			</div>

			<div class="field">
				<label for="description">Aprašymas</label>
				<textarea id="description" name="description" rows="4">{form?.values?.description ?? activity.description ?? ''}</textarea>
			</div>

			<div class="field">
				<label for="location">Vieta</label>
				<input
					id="location"
					name="location"
					type="text"
					value={form?.values?.location ?? activity.location ?? ''}
				/>
				{#if form?.errors?.location}
					<small class="error">{form.errors.location}</small>
				{/if}
			</div>

			<div class="field">
				<label for="starts_at">Data ir laikas</label>
				<input
					id="starts_at"
					name="starts_at"
					type="datetime-local"
					value={form?.values?.starts_at ?? toDateTimeLocal(activity.starts_at)}
				/>
				{#if form?.errors?.starts_at}
					<small class="error">{form.errors.starts_at}</small>
				{/if}
			</div>

			<div class="grid-two">
				<div class="field">
					<label for="category_id">Kategorija</label>
					<select id="category_id" name="category_id">
						<option value="">Pasirink kategoriją</option>
						{#each categoryOptions as option}
							<option
								value={option.value}
								selected={String(form?.values?.category_id ?? activity.category_id ?? '') === option.value}
							>
								{option.label}
							</option>
						{/each}
					</select>
					{#if form?.errors?.category_id}
						<small class="error">{form.errors.category_id}</small>
					{/if}
				</div>

				<div class="field">
					<label for="gender_id">Lytis</label>
					<select id="gender_id" name="gender_id">
						{#each genderOptions as option}
							<option
								value={option.value}
								selected={String(form?.values?.gender_id ?? activity.gender_id ?? '') === option.value}
							>
								{option.label}
							</option>
						{/each}
					</select>
					{#if form?.errors?.gender_id}
						<small class="error">{form.errors.gender_id}</small>
					{/if}
				</div>
			</div>

			<div class="field">
				<label for="image_upload">Įkelti naują nuotrauką iš kompiuterio</label>
				<input id="image_upload" type="file" accept="image/*" onchange={handleFileChange} />
			</div>

			<div class="field">
				<label for="image_src_url">Arba nuotraukos nuoroda</label>
				<input
					id="image_src_url"
					type="text"
					placeholder="https://..."
					value={
						form?.values?.image_src && !form.values.image_src.startsWith('data:image/')
							? form.values.image_src
							: activity.image_src && !String(activity.image_src).startsWith('data:image/')
								? activity.image_src
								: ''
					}
					oninput={(e) => {
						const value = (e.currentTarget as HTMLInputElement).value;
						imagePreview = value;
						const hiddenInput = document.getElementById('image_src') as HTMLInputElement | null;
						if (hiddenInput) hiddenInput.value = value;
					}}
				/>
			</div>

			<input
				id="image_src"
				name="image_src"
				type="hidden"
				value={form?.values?.image_src ?? activity.image_src ?? ''}
			/>

			{#if imagePreview}
				<div class="preview-box">
					<p class="preview-label">Nuotraukos peržiūra</p>
					<img src={imagePreview} alt="Nuotraukos peržiūra" class="preview-image" />
				</div>
			{/if}

			{#if form?.errors?.image_src}
				<small class="error">{form.errors.image_src}</small>
			{/if}

			{#if form?.dbError}
				<div class="error-box">{form.dbError}</div>
			{/if}

			<div class="actions">
				<a class="secondary-btn" href="/app/activities">Atgal</a>
				<button type="submit" class="primary-btn">Išsaugoti pakeitimus</button>
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
	input, textarea, select {
		width:100%;
		padding:0.85rem 1rem;
		border:1px solid var(--color-border);
		border-radius:var(--radius-lg);
		background:white;
		font:inherit;
		box-sizing:border-box;
	}
	textarea { resize:vertical; min-height:110px; }
	.grid-two { display:grid; grid-template-columns:1fr 1fr; gap:var(--space-4); }
	.actions { display:flex; justify-content:flex-end; gap:var(--space-3); margin-top:var(--space-4); }
	.primary-btn, .secondary-btn {
		padding:0.85rem 1.2rem;
		border-radius:var(--radius-lg);
		border:none;
		font-weight:600;
		text-decoration:none;
		cursor:pointer;
	}
	.primary-btn { background:var(--color-primary); color:white; }
	.secondary-btn { background:var(--color-bg-secondary); color:var(--color-text); }
	.error { color:#d32f2f; font-size:0.9rem; }
	.error-box { background:#fde8e8; color:#b42318; border:1px solid #f5c2c7; padding:0.85rem 1rem; border-radius:var(--radius-lg); }
	.preview-box {
		border:1px solid var(--color-border);
		border-radius:var(--radius-lg);
		padding:1rem;
		background:#fff;
	}
	.preview-label {
		margin:0 0 0.75rem 0;
		font-weight:600;
	}
	.preview-image {
		max-width:100%;
		max-height:260px;
		display:block;
		border-radius:12px;
		object-fit:cover;
	}
	@media (max-width:700px) {
		.grid-two { grid-template-columns:1fr; }
	}
</style>