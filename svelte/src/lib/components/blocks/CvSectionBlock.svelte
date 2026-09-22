<script>
  import Portable from '$lib/components/Portable.svelte';
  const { block } = $props();
</script>

<div class="cv-section-block space-y-base">
  {#if block.title}
    <h2>{block.title}</h2>
  {/if}

  {#if block.years?.length}
    <div>
      {#each block.years as item}
        <div class="grid year-row gap-sm">
          {#if item.year}
            <span class="text-accent">{item.year}</span>
          {/if}
          
          <div class="rich-text"><Portable value={item.text} /></div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .year-row {
    grid-template-columns: minmax(10ch, 1fr) 5fr;
  }
</style>
