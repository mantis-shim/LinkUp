<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	let { data } = $props();
	let conversation = $state<any>((data as any).conversation || null);
	let messages = $state<any[]>((data as any).messages || []);
	let currentUserId = $state<number>((data as any).currentUserId || null);
	let newMessage = '';

	function goBack() {
		goto('/app/messages');
	}
</script>

<div class="chat-page">
	<header class="chat-header">
		<button class="back-button" on:click={goBack}>← Atgal</button>
		<h1>Pokalbis su #{$page.params.id}</h1>
	</header>

	<section class="chat-body">
		{#each messages as message}
			<div class="chat-bubble {message.sender_id === currentUserId ? 'me' : 'other'}">
				<p>{message.content}</p>
				<small>{message.sender_name} · {new Date(message.sent_at).toLocaleString()}</small>
			</div>
		{/each}
	</section>

	<form method="post" class="chat-actions">
		<input
			type="text"
			name="content"
			placeholder="Rašyti žinutę..."
			bind:value={newMessage}
			on:keydown={(event) => event.key === 'Enter' && event.preventDefault()}
		/>
		<button type="submit">Siųsti</button>
	</form>
</div>

<style>
	.chat-page {
		max-width: 760px;
		margin: 0 auto;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		height: 90dvh;
	}

	.chat-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.back-button {
		background: transparent;
		border: none;
		color: var(--color-primary);
		font-size: 1rem;
		cursor: pointer;
	}

	.chat-body {
		flex: 1;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding-right: 0.5rem;
		padding-bottom: 0.5rem;
	}

	.chat-bubble {
		max-width: 80%;
		padding: 0.75rem;
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-sm);
		position: relative;
	}

	.chat-bubble.other {
		align-self: flex-start;
		background: var(--color-bg-secondary);
	}

	.chat-bubble.me {
		align-self: flex-end;
		background: var(--color-primary);
		color: white;
	}

	.chat-bubble small {
		display: block;
		margin-top: 0.35rem;
		font-size: 0.75rem;
		color: var(--color-text-subtle);
	}

	.chat-actions {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.75rem;
	}

	.chat-actions input {
		flex: 1;
		padding: 0.75rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.chat-actions button {
		padding: 0.75rem 1rem;
		background: var(--color-primary);
		color: white;
		border: none;
		border-radius: var(--radius-lg);
		cursor: pointer;
	}
</style>