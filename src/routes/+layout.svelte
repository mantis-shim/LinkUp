<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>


<header>
	<nav class="navbar">
		<div class="nav-container">
			<div class="nav-brand">
				<span class="logo-accent">◆</span>
				<span class="logo-text">LinkUp</span>
			</div>
			<div class="nav-links">
				<a href="/" class="nav-link" class:active={true}>Pagrindinis</a> <!-- NEEDS ACTIVE CLASS LOGIC-->
				<a href="/create" class="nav-link" class:active={false}>Kurti</a>
				<a href="/messages" class="nav-link" class:active={false}>Žinutės <span class="notification-dot"></span></a>
                <a href="/user" class="user-menu">
                    <img src="/images/account.svg" alt="Paskyra" class="user-avatar">
                    <span class="user-name">Username</span>
                </a>
			</div>
		</div>
	</nav>
</header>
<main class="main-content">
	{@render children()}
</main>


<style>
.navbar {
    background: var(--color-white);
    border-bottom: 1px solid var(--color-bo);
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: var(--shadow-sm);
}

.nav-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 1rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.nav-brand {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-family: var(--font-display);
    font-weight: 700;
}

.logo-accent {
    color: var(--color-primary);
    font-size: 1.5rem;
    animation: rotate 10s linear infinite;
}

@keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

.logo-text {
    font-size: 1.5rem;
    color: var(--color-secondary);
    letter-spacing: -0.02em;
}

.nav-links {
    display: flex;
    align-items: center;
    gap: 2rem;
}

.nav-link {
    color: var(--color-text-light);
    text-decoration: none;
    font-weight: 500;
    transition: var(--transition);
    position: relative;
}

.nav-link:hover,
.nav-link.active {
    color: var(--color-primary);
}

.nav-link.active::after {
    content: '';
    position: absolute;
    bottom: -1.5rem;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--color-primary);
    border-radius: 3px 3px 0 0;
}

.notification-dot {
    position: absolute;
    top: -4px;
    right: -8px;
    width: 8px;
    height: 8px;
    background: var(--color-primary);
    border-radius: 50%;
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.2); }
}

.user-menu {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 1rem;
    background: var(--color-bg);
    border-radius: 50px;
    cursor: pointer;
    transition: var(--transition);
    text-decoration: none;
}

.user-menu:hover {
    background: var(--color-border);
}

.user-avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;

}

.user-name {
    font-weight: 600;
    color: var(--color-secondary);
}

@media (max-width: 768px) {
    .nav-container {
        flex-direction: column;
        gap: 1rem;
    }
    
    .nav-links {
        width: 100%;
        justify-content: space-between;
        flex-wrap: wrap;
    }
}
</style>