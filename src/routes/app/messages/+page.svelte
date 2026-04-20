<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { onDestroy, onMount } from 'svelte';
	let { data } = $props();

	interface Conversation {
		id: number;
		name: string;
		last_message: string | null;
		updated_at: string | null;
	}

	interface User {
		id: number;
		username: string;
	}

	let conversations = $state<Conversation[]>((data as any).conversations || []);
	let users = $state<User[]>((data as any).users || []);
	let pendingRequests = $state<User[]>((data as any).pendingRequests || []);
	let showDropdown = $state(false);
	let feedback = $state('');
	let dropdownRef: HTMLDivElement | null = null;
	let feedbackTimeout: ReturnType<typeof setTimeout> | null = null;

	$effect(() => {
		conversations = (data as any).conversations || [];
		users = (data as any).users || [];
		pendingRequests = (data as any).pendingRequests || [];
	});

	function openConversation(conversation: Conversation) {
		goto(`/app/messages/${conversation.id}`);
	}

	function handleClick(event: MouseEvent) {
		if (showDropdown && dropdownRef && !dropdownRef.contains(event.target as Node)) {
			showDropdown = false;
		}
	}

	function setFeedback(message: string) {
		feedback = message;

		if (feedbackTimeout) {
			clearTimeout(feedbackTimeout);
		}

		feedbackTimeout = setTimeout(() => {
			feedback = '';
			feedbackTimeout = null;
		}, 2000);
	}

	async function addFriend(friendId: number) {
		feedback = '';

		try {
			const res = await fetch('/app/messages', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ friendId })
			});

			const result = await res.json();

			if (result.success) {
				setFeedback('Draugo užklausa išsiųsta!');
				users = users.filter((user) => user.id !== friendId);
				showDropdown = false;
			} else {
				setFeedback(result.error || 'Nepavyko išsiųsti užklausos.');
			}
		} catch (e) {
			setFeedback('Tinklo klaida.');
		}
	}

	async function acceptFriendRequest(friendId: number) {
		feedback = '';

		try {
			const res = await fetch('/app/messages', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ friendId })
			});

			const result = await res.json();

			if (result.success) {
				setFeedback('Draugo užklausa priimta!');
				pendingRequests = pendingRequests.filter((user) => user.id !== friendId);
				await invalidateAll();
			} else {
				setFeedback(result.error || 'Nepavyko priimti užklausos.');
			}
		} catch (e) {
			setFeedback('Tinklo klaida.');
		}
	}

	async function deleteFriendRequest(friendId: number) {
		feedback = '';

		try {
			const res = await fetch('/app/messages', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ friendId })
			});

			const result = await res.json();

			if (result.success) {
				setFeedback('Draugo užklausa atmesta.');
				pendingRequests = pendingRequests.filter((user) => user.id !== friendId);
			} else {
				setFeedback(result.error || 'Nepavyko atmesti užklausos.');
			}
		} catch (e) {
			setFeedback('Tinklo klaida.');
		}
	}

	onMount(() => {
		document.addEventListener('mousedown', handleClick);
	});

	onDestroy(() => {
		document.removeEventListener('mousedown', handleClick);
		if (feedbackTimeout) {
			clearTimeout(feedbackTimeout);
		}
	});
</script>

<div class="page-wrapper">
	{#if pendingRequests.length > 0}
		<div class="request-panel">
			<h2>Friendship requests</h2>
			<ul>
				{#each pendingRequests as request}
					<li>
						<span>{request.username} wants to be your friend.</span>
						<div class="request-actions">
							<button class="accept-btn" on:click={() => acceptFriendRequest(request.id)}>Accept</button>
							<button class="delete-btn" on:click={() => deleteFriendRequest(request.id)}>Delete</button>
						</div>
					</li>
				{/each}
			</ul>
		</div>
	{/if}

	<h1>Visi pokalbiai</h1>

	{#if conversations.length > 0}
		<div class="conversation-list">
			{#each conversations as conversation}
				<button class="conversation-card" on:click={() => openConversation(conversation)}>
					<div class="conversation-head">
						<h2>{conversation.name}</h2>
						<!-- Unread indicator is not tracked by schema, so hide or set zero -->
					</div>
					<p class="last-message">{conversation.last_message ?? 'Nėra žinučių'}</p>
					<small class="timestamp">{conversation.updated_at ? new Date(conversation.updated_at).toLocaleString() : ''}</small>
				</button>
			{/each}
		</div>
	{:else}
		<p class="empty-message">Nėra pokalbių</p>
	{/if}

	<button class="add-button" aria-label="Pridėti draugą" on:click={() => (showDropdown = !showDropdown)}>
		+
	</button>

	{#if showDropdown}
		<div class="dropdown" bind:this={dropdownRef}>
			<h2>Pasirinkite vartotoją</h2>
			{#if users.length === 0}
				<div class="empty">Nėra vartotojų</div>
			{:else}
				<ul>
					{#each users as user}
						<li on:click={() => addFriend(user.id)}>{user.username}</li>
					{/each}
				</ul>
			{/if}
		</div>
	{/if}

	{#if feedback}
		<div class="feedback">{feedback}</div>
	{/if}
</div>

<style>
	.page-wrapper {
		max-width: 900px;
		margin: 0 auto;
		padding: 1.5rem;
	}

	h1 {
		font-size: var(--text-2xl);
		margin-bottom: 1rem;
	}

	.conversation-list {
		display: grid;
		grid-template-columns: 1fr;
		gap: 0.8rem;
	}

	.conversation-card {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: 1rem;
		text-align: left;
		cursor: pointer;
		transition: transform 100ms ease, box-shadow 120ms ease;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.conversation-card:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-sm);
	}

	.conversation-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.conversation-head h2 {
		margin: 0;
		font-size: var(--text-lg);
	}

	.badge {
		background: var(--color-primary);
		color: white;
		border-radius: 9999px;
		padding: 0.2rem 0.6rem;
		font-size: 0.75rem;
		font-weight: 700;
	}

	.last-message {
		margin: 0;
		color: var(--color-text-subtle);
	}

	.timestamp {
		font-size: 0.75rem;
		color: var(--color-text-subtle);
	}

	.empty-message {
		text-align: center;
		padding: 2rem;
		color: var(--color-text-subtle);
	}

	.request-panel {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: 1rem;
		margin-bottom: 1rem;
	}

	.request-panel h2 {
		margin: 0 0 0.75rem;
		font-size: var(--text-lg);
	}

	.request-panel ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0.6rem;
	}

	.request-panel li {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.75rem;
		padding: 0.6rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}

	.request-actions {
		display: flex;
		gap: 0.5rem;
	}

	.accept-btn,
	.delete-btn {
		border: 1px solid var(--color-border);
		padding: 0.4rem 0.7rem;
		border-radius: var(--radius-md);
		cursor: pointer;
		font-weight: 600;
	}

	.accept-btn {
		background: color-mix(in oklab, var(--color-primary) 18%, white);
		color: var(--color-primary);
	}

	.delete-btn {
		background: color-mix(in oklab, #d11a2a 12%, white);
		color: #a0121f;
	}

	.add-button {
		position: fixed;
		bottom: 2rem;
		right: 2rem;
		width: 3rem;
		height: 3rem;
		border-radius: 50%;
		background: var(--color-primary);
		color: white;
		font-size: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: var(--shadow-sm);
		border: none;
		cursor: pointer;
		z-index: 10;
	}

	.add-button:hover {
		filter: brightness(0.92);
	}

	.dropdown {
		position: fixed;
		bottom: 6rem;
		right: 2rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-md);
		padding: 1rem;
		min-width: 220px;
		z-index: 100;
	}

	.dropdown h2 {
		margin: 0 0 0.5rem 0;
		font-size: var(--text-base);
	}

	.dropdown ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.dropdown li {
		padding: 0.5rem 0.25rem;
		cursor: pointer;
		border-radius: var(--radius-sm);
		transition: background 120ms ease;
	}

	.dropdown li:hover {
		background: color-mix(in oklab, var(--color-primary) 10%, transparent);
	}

	.empty {
		color: var(--color-text-subtle);
		font-size: 0.95rem;
		padding: 0.5rem 0;
	}

	.feedback {
		position: fixed;
		bottom: 6rem;
		right: 2rem;
		background: color-mix(in oklab, var(--color-primary) 10%, white);
		color: var(--color-primary);
		border: 1px solid color-mix(in oklab, var(--color-primary) 30%, white);
		border-radius: var(--radius-lg);
		padding: 0.75rem 1.25rem;
		z-index: 200;
		font-size: 1rem;
	}
</style>