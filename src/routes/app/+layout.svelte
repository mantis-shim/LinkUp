<script lang="ts">
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