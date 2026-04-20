<script lang="ts">
	import { goto } from '$app/navigation';
	let { data } = $props();

	interface Conversation {
		id: number;
		name: string;
		last_message: string | null;
		updated_at: string | null;
	}

	let conversations = $state<Conversation[]>((data as any).conversations || []);

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