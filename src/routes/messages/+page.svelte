<script lang="ts">
  export let data: { users: { id: number; username: string }[] };
  import { onMount, onDestroy } from 'svelte';
  let showDropdown = false;
  let dropdownRef: HTMLDivElement | null = null;
  let feedback = '';

  function handleClick(event: MouseEvent) {
    if (showDropdown && dropdownRef && !dropdownRef.contains(event.target as Node)) {
      showDropdown = false;
    }
  }

  async function addFriend(friendId: number) {
    feedback = '';
    try {
      const res = await fetch('/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId })
      });
      const result = await res.json();
      if (result.success) {
        feedback = 'Friend request sent!';
        showDropdown = false;
      } else {
        feedback = result.error || 'Failed to send request.';
      }
    } catch (e) {
      feedback = 'Network error.';
    }
  }

  // Only run in browser
  onMount(() => {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      document.addEventListener('mousedown', handleClick);
    }
  });
  onDestroy(() => {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      document.removeEventListener('mousedown', handleClick);
    }
  });
</script>

<style>
.add-button {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: #007bff;
  color: white;
  font-size: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  border: none;
  cursor: pointer;
  transition: background 0.2s;
  z-index: 10;
}
.add-button:hover {
  background: #0056b3;
}
.dropdown {
  position: fixed;
  bottom: 6rem;
  right: 2rem;
  background: white;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  padding: 1rem;
  min-width: 220px;
  z-index: 100;
}
.dropdown h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}
.dropdown ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
.dropdown li {
  padding: 0.5rem 0.25rem;
  cursor: pointer;
  border-radius: 0.25rem;
  transition: background 0.15s;
}
.dropdown li:hover {
  background: #f0f0f0;
}
.empty {
  color: #888;
  font-size: 0.95rem;
  padding: 0.5rem 0;
}
.feedback {
  position: fixed;
  bottom: 6rem;
  right: 2rem;
  background: #e6f7ff;
  color: #007bff;
  border: 1px solid #b3e0ff;
  border-radius: 0.5rem;
  padding: 0.75rem 1.25rem;
  z-index: 200;
  font-size: 1rem;
  margin-top: 0.5rem;
}
</style>

<main>
  <h1>Messages</h1>
  <!-- Content will go here -->
  <button class="add-button" aria-label="Add new message" on:click={() => showDropdown = !showDropdown}>+</button>
  {#if showDropdown}
    <div class="dropdown" bind:this={dropdownRef}>
      <h2>Select a user to message</h2>
      {#if data.users.length === 0}
        <div class="empty">No users available</div>
      {:else}
        <ul>
          {#each data.users as user}
            <li on:click={() => addFriend(user.id)}>{user.username}</li>
          {/each}
        </ul>
      {/if}
    </div>
  {/if}
  {#if feedback}
    <div class="feedback">{feedback}</div>
  {/if}
</main>

