<script lang="ts">
	import { goto } from '$app/navigation';

	interface Conversation {
		id: number;
		name: string;
		lastMessage: string;
		updatedAt: string;
		unread: number;
	}

	const conversations: Conversation[] = [
		{ id: 1, name: 'Julija', lastMessage: 'Ar vis dar planuojame penktadienį?', updatedAt: '2026-03-15 14:30', unread: 2 },
		{ id: 2, name: 'Rokas', lastMessage: 'Puiku, susitinkame prie ežero.', updatedAt: '2026-03-14 19:05', unread: 0 },
		{ id: 3, name: 'Draugų grupė', lastMessage: 'Naujas renginys pridėtas!', updatedAt: '2026-03-13 09:10', unread: 5 },
		{ id: 4, name: 'Mantas', lastMessage: 'Ačiū už pagalbą su kodu.', updatedAt: '2026-03-12 21:22', unread: 0 }
	];

	function openConversation(conversation: Conversation) {
		goto(`/app/messages/${conversation.id}`);
	}
</script>

<div class="page-wrapper">
	<h1>Visi pokalbiai</h1>

	{#if conversations.length > 0}
		<div class="conversation-list">
			{#each conversations as conversation}
				<button class="conversation-card" on:click={() => openConversation(conversation)}>
					<div class="conversation-head">
						<h2>{conversation.name}</h2>
						{#if conversation.unread > 0}
							<span class="badge">{conversation.unread}</span>
						{/if}
					</div>
					<p class="last-message">{conversation.lastMessage}</p>
					<small class="timestamp">{new Date(conversation.updatedAt).toLocaleString()}</small>
				</button>
			{/each}
		</div>
	{:else}
		<p class="empty-message">Nėra pokalbių</p>
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
</style>