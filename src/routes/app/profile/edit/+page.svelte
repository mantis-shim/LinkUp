<script lang="ts">
	import type { ActionResult } from '@sveltejs/kit';
	import { browser } from '$app/environment';
	import { deserialize, enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	let { data, form } = $props();
	let user = $derived(data.user);
	let username = $state('');
	let name = $state('');
	let lastname = $state('');
	let email = $state('');
	let city = $state('');
	let usernameErrorAlertKey = $state<string | null>(null);
	let emailErrorAlertKey = $state<string | null>(null);
	let passwordErrorAlertKey = $state<string | null>(null);
	let showPasswordFields = $state(false);
	let currentPassword = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');
	let pendingPasswordLength = $state<number | null>(null);
	let pendingCurrentPassword = $state('');
	let pendingNewPassword = $state('');
	let pendingConfirmNew = $state('');

	let passwordDotsCount = $derived(
		pendingPasswordLength !== null ? pendingPasswordLength : (data.passwordCharCount ?? 0)
	);
	let passwordDotsDisplay = $derived('•'.repeat(passwordDotsCount));

	$effect(() => {
		username = data.user?.username ?? '';
		name = data.user?.name ?? '';
		lastname = data.user?.lastname ?? '';
		email = data.user?.email ?? '';
		city = data.user?.city ?? '';
	});

	$effect(() => {
		if (!browser) return;
		const msg = form?.usernameError;
		if (!msg) { usernameErrorAlertKey = null; return; }
		const key = `${msg}\0${form.username ?? ''}`;
		if (usernameErrorAlertKey === key) return;
		usernameErrorAlertKey = key;
		alert(msg);
	});

	$effect(() => {
		if (!browser) return;
		const msg = form?.emailError;
		if (!msg) { emailErrorAlertKey = null; return; }
		const key = `${msg}\0${form.username ?? ''}`;
		if (emailErrorAlertKey === key) return;
		emailErrorAlertKey = key;
		alert(msg);
	});

	$effect(() => {
		if (!browser) return;
		const msg = form?.passwordError;
		if (!msg) { passwordErrorAlertKey = null; return; }
		const key = `${msg}\0${form.username ?? ''}`;
		if (passwordErrorAlertKey === key) return;
		passwordErrorAlertKey = key;
		alert(msg);
	});

	async function confirmDeleteAccount() {
		if (!browser) return;
		if (!confirm('Ar tikrai norite ištrinti savo paskyrą?')) return;
		const res = await fetch(`${page.url.pathname}?/deleteAccount`, {
			method: 'POST',
			body: new FormData()
		});
		const result = deserialize(await res.text());
		if (result.type === 'redirect') {
			await goto(result.location);
			return;
		}
		if (result.type === 'failure') {
			const err = result.data?.deleteError;
			alert(typeof err === 'string' ? err : 'Nepavyko ištrinti paskyros.');
		}
	}

	function closePasswordFields() {
		showPasswordFields = false;
		currentPassword = '';
		newPassword = '';
		confirmPassword = '';
	}

	async function handleSavePassword() {
		if (!currentPassword || !newPassword || !confirmPassword) return;
		if (newPassword !== confirmPassword) {
			alert('Naujas slaptažodis nesutampa su pakartotiniu slaptažodžiu.');
			return;
		}
		const fd = new FormData();
		fd.set('currentPassword', currentPassword);
		const res = await fetch(`${page.url.pathname}?/verifyCurrentPassword`, {
			method: 'POST',
			body: fd
		});
		const result = deserialize(await res.text());
		if (result.type === 'failure') {
			const err = result.data?.verifyError;
			alert(typeof err === 'string' ? err : 'Įvyko klaida.');
			return;
		}
		pendingCurrentPassword = currentPassword;
		pendingNewPassword = newPassword;
		pendingConfirmNew = confirmPassword;
		pendingPasswordLength = newPassword.length;
		closePasswordFields();
	}

	function enhanceProfileForm() {
		return async ({
			result,
			update
		}: {
			result: ActionResult;
			update: (options?: { reset?: boolean; invalidateAll?: boolean }) => Promise<void>;
		}) => {
			if (result.type === 'redirect') {
				alert('Profilio duomenys sėkmingai atnaujinti!');
			}
			await update();
		};
	}
</script>

<div class="card-wrapper profile-view">
	<article class="profile-card">
		<h1 class="page-title">Redaguoti profilį</h1>
		<header class="profile-header">
			<div class="avatar-placeholder">
				<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-subtle)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
					<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
				</svg>
			</div>
			<div class="user-meta">
				{#if user}
					<h1>{username || (user.username ?? 'Anonimas')}</h1>
					<mark>UID: #{user.id}</mark>
				{:else}
					<h1>Vartotojas nerastas</h1>
				{/if}
			</div>
		</header>

		<section class="profile-content">
			{#if user}
				<form
					id="edit-profile-form"
					method="POST"
					action="?/updateProfile"
					novalidate
					use:enhance={enhanceProfileForm}
				>
					{#if pendingNewPassword}
						<input type="hidden" name="currentPasswordForChange" value={pendingCurrentPassword} />
						<input type="hidden" name="newPassword" value={pendingNewPassword} />
						<input type="hidden" name="confirmNewPassword" value={pendingConfirmNew} />
					{/if}
					<div class="info-list">
						<div class="info-item">
							<span class="label">Vardas</span>
							<input name="name" type="text" bind:value={name} class="value value-input" placeholder="–" />
						</div>
						<div class="info-item">
							<span class="label">Pavardė</span>
							<input name="lastname" type="text" bind:value={lastname} class="value value-input" placeholder="–" />
						</div>
						<div class="info-item">
							<span class="label">El. paštas</span>
							<input name="email" type="email" bind:value={email} class="value value-input" />
						</div>
						<div class="info-item">
							<span class="label">Miestas</span>
							<input name="city" type="text" bind:value={city} class="value value-input" placeholder="–" />
						</div>
						<div class="info-item">
							<span class="label">Vartotojo vardas</span>
							<input name="username" type="text" bind:value={username} class="value value-input" />
						</div>
						<div class="info-item">
							<span class="label">Slaptažodis</span>
							<span class="value value-password-row">
								{#if passwordDotsCount > 0}
									<span class="password-dots" aria-hidden="true">{passwordDotsDisplay}</span>
								{/if}
								<button type="button" class="btn-change" onclick={() => (showPasswordFields = true)}>Keisti</button>
							</span>
						</div>
						<div class="info-item">
							<span class="label">Paskyra</span>
							<button type="button" class="btn-change" onclick={() => void confirmDeleteAccount()}>Ištrinti paskyrą</button>
						</div>
					</div>
				</form>
			{:else}
				<p class="empty-msg">Vartotojas nerastas. Grįžti į profilį.</p>
			{/if}
		</section>

		{#if user}
			<footer class="action-buttons">
				<a href="/app/profile" class="action-btn action-btn-cancel">Atšaukti</a>
				<button type="submit" form="edit-profile-form" class="action-btn">Išsaugoti</button>
			</footer>
		{/if}
	</article>

	{#if showPasswordFields}
		<div class="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="password-modal-title" onclick={closePasswordFields}>
			<div class="modal-box" onclick={(e) => e.stopPropagation()}>
				<h2 id="password-modal-title" class="modal-title">Keisti slaptažodį</h2>
				<div class="password-change-fields">
					<label class="password-label">
						<span class="password-label-text">Dabartinis slaptažodis</span>
						<input type="password" bind:value={currentPassword} class="password-input" autocomplete="current-password" />
					</label>
					<label class="password-label">
						<span class="password-label-text">Naujas slaptažodis</span>
						<input type="password" bind:value={newPassword} class="password-input" autocomplete="new-password" />
					</label>
					<label class="password-label">
						<span class="password-label-text">Pakartokite naują slaptažodį</span>
						<input type="password" bind:value={confirmPassword} class="password-input" autocomplete="new-password" />
					</label>
				</div>
				<div class="modal-actions">
					<button type="button" class="btn-change-cancel" onclick={closePasswordFields}>Atšaukti</button>
					<button
					type="button"
					class="btn-change-save"
					disabled={!currentPassword || !newPassword || !confirmPassword}
					onclick={() => void handleSavePassword()}
				>Išsaugoti</button>
				</div>
			</div>
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
		padding-top: var(--space-1);
	}

	.info-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		min-height: 2.25rem;
		padding-bottom: var(--space-2);
		border-bottom: 1px solid var(--color-border);
		overflow: visible;
	}

	.label {
		font-family: var(--font-sans);
		font-size: var(--text-base);
		font-weight: var(--font-regular);
		color: var(--color-text-subtle);
	}

	.value {
		font-family: var(--font-sans);
		font-size: var(--text-base);
		font-weight: var(--font-semibold);
		color: var(--color-text);
		line-height: 1.5;
		min-height: 1.5rem;
		display: inline-flex;
		align-items: center;
	}

	.value-input {
		font-family: var(--font-sans);
		font-size: var(--text-base);
		font-weight: var(--font-semibold);
		line-height: 1.5;
		color: var(--color-text);
		background: var(--color-bg-secondary, #f5f3ff);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		text-align: right;
		min-width: 8ch;
		max-width: 12rem;
		padding: var(--space-1) var(--space-2);
		box-sizing: border-box;
		outline: none;
		transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
	}

	.value-input:hover {
		border-color: var(--color-primary);
	}

	.value-input:focus {
		border-color: var(--color-primary);
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-primary) 20%, transparent);
		outline: none;
	}

	.btn-change {
		font-family: var(--font-sans);
		font-size: var(--text-sm);
		font-weight: var(--font-semibold);
		color: white;
		background: var(--color-primary);
		border: none;
		border-radius: var(--radius-lg);
		padding: var(--space-2) var(--space-4);
		cursor: pointer;
		transition: background-color var(--transition-fast), transform var(--transition-fast), box-shadow var(--transition-fast);
	}

	.btn-change:hover {
		background: var(--color-primary-hover);
		box-shadow: var(--shadow-glow);
		transform: translateY(-1px);
	}

	.btn-change:active {
		transform: translateY(0);
	}

	.btn-change:focus-visible {
		outline: 2px solid var(--color-primary);
		outline-offset: 2px;
	}

	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.4);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: var(--space-4);
	}

	.modal-box {
		background: var(--color-surface);
		border-radius: var(--radius-xl);
		border: 1px solid var(--color-border);
		box-shadow: var(--shadow-lg);
		padding: var(--space-6);
		max-width: 22rem;
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.modal-title {
		font-size: var(--text-xl);
		font-weight: var(--font-semibold);
		color: var(--color-text);
		margin: 0 0 var(--space-2);
	}

	.password-change-fields {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.password-label {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.password-label-text {
		font-family: var(--font-sans);
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		color: var(--color-text-subtle);
	}

	.password-input {
		font-family: var(--font-sans);
		font-size: var(--text-base);
		padding: var(--space-2) var(--space-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-surface);
		color: var(--color-text);
	}

	.password-input:focus {
		outline: 2px solid var(--color-primary);
		outline-offset: 1px;
	}

	.value-password-row {
		display: inline-flex;
		align-items: center;
		gap: var(--space-3);
	}

	.password-dots {
		color: #000;
		font-family: var(--font-mono);
		font-size: var(--text-base);
		letter-spacing: 0.05em;
	}

	.modal-actions {
		display: flex;
		gap: var(--space-3);
		margin-top: var(--space-2);
		justify-content: flex-end;
	}

	.btn-change-cancel {
		font-family: var(--font-sans);
		font-size: var(--text-sm);
		font-weight: var(--font-semibold);
		color: var(--color-primary);
		background: #e8e4fc;
		border: none;
		border-radius: var(--radius-lg);
		padding: var(--space-2) var(--space-4);
		cursor: pointer;
	}

	.btn-change-cancel:hover {
		background: #ddd8f7;
	}

	.btn-change-save {
		font-family: var(--font-sans);
		font-size: var(--text-sm);
		font-weight: var(--font-semibold);
		color: white;
		background: var(--color-primary);
		border: none;
		border-radius: var(--radius-lg);
		padding: var(--space-2) var(--space-4);
		cursor: pointer;
	}

	.btn-change-save:hover {
		background: var(--color-primary-hover);
		box-shadow: var(--shadow-glow);
	}

	.btn-change-save:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-change-save:disabled:hover {
		background: var(--color-primary);
		box-shadow: none;
	}

	.empty-msg {
		color: var(--color-text-subtle);
		font-style: italic;
		margin-top: var(--space-4);
	}

	.action-buttons {
		display: flex;
		gap: var(--space-4);
		margin-top: var(--space-4);
		justify-content: center;
	}

	.action-buttons .action-btn {
		flex: 1;
		min-width: 10rem;
		max-width: 70%;
	}

	.action-btn {
		display: block;
		text-align: center;
		width: 100%;
		box-sizing: border-box;
		padding: var(--space-4);
		font-size: var(--text-sm);
		line-height: 1.5;
		background: var(--color-primary);
		color: white;
		border: none;
		border-radius: var(--radius-lg);
		font-weight: 600;
		cursor: pointer;
		margin-top: 0;
		text-decoration: none;
		transition: background-color var(--transition-fast), transform var(--transition-fast), box-shadow var(--transition-fast);
	}

	.action-btn:hover {
		box-shadow: var(--shadow-glow);
		transform: translateY(-1px);
		text-decoration: none;
		color: white;
	}

	.action-btn:active {
		transform: translateY(0);
	}

	.action-btn:focus-visible {
		outline: 2px solid var(--color-primary);
		outline-offset: 3px;
	}

	.action-btn-cancel {
		background-color: #e8e4fc;
		color: var(--color-primary);
	}

	.action-btn-cancel:hover {
		background-color: #ddd8f7;
		color: var(--color-primary);
	}

</style>
