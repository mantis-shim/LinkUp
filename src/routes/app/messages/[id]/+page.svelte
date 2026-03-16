<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	const dummyMessages = [
		{ id: 1, author: 'other', text: 'Sveikas! Ar nori susitikti šiandien?', time: '2026-03-15 13:10' },
		{ id: 2, author: 'me', text: 'Taip, galiu 17:00. Kur susitinkame?', time: '2026-03-15 13:12' },
		{ id: 3, author: 'other', text: 'Pasitikime prie kavinės „Žalias puodelis“.', time: '2026-03-15 13:14' },
	];

	let newMessage = '';

	function sendMessage() {
		if (!newMessage.trim()) return;
		dummyMessages.push({
			id: dummyMessages.length + 1,
			author: 'me',
			text: newMessage.trim(),
			time: new Date().toLocaleString()
		});
		newMessage = '';
	}

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
		{#each dummyMessages as message}
			<div class="chat-bubble {message.author}">
				<p>{message.text}</p>
				<small>{message.time}</small>
			</div>
		{/each}
	</section>

	<footer class="chat-actions">
		<input
			type="text"
			placeholder="Rašyti žinutę..."
			bind:value={newMessage}
			on:keydown={(event) => event.key === 'Enter' && sendMessage()}
		/>
		<button on:click={sendMessage}>Siųsti</button>
	</footer>
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