<script lang="ts">
    const {form} = $props();
</script>

<form class="login-form" method="POST">
    <h3 style="text-align: center;">Prisijungimas</h3>
    {#if form?.error}
        <p class="error-message">{form.error}</p>
    {/if}

    <input name="username" type="text" placeholder="Vartotojo vardas" required>
    <input type="password" name="password" placeholder="Slaptažodis" required>

    <button type="submit">Prisijungti</button>

    <a class="secondary-link" href="/register">Registruotis</a>
</form>


<style>
.login-form {
  max-width: 400px;
  margin: 6rem auto;
  padding: var(--space-8);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.login-form input {
  padding: var(--space-3) var(--space-4);
}

.login-form button {
  margin-top: var(--space-2);
}

.login-form .error-message {
  color: var(--color-danger);
  font-size: var(--text-sm);
  text-align: center;
}

.login-form .secondary-link {
  display: block;
  text-align: center;
  margin-top: var(--space-4);
  color: var(--color-primary);
}

.login-form .secondary-link:hover {
  text-decoration: underline;
}
</style>