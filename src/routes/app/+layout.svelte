<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { get } from 'svelte/store';

    let { children } = $props();

</script>

<div class="app-container">
    {@render children()}    

</div>


<style>
    .app-container{
        max-width: 1024px;
        margin: auto;
    }
</style>