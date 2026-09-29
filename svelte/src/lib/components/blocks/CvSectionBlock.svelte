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
        <div class="grid grid-cols-[minmax(10ch,1fr)_5fr] gap-sm lg:grid-cols-12 lg:gap-x-base">
          {#if item.year}
            <span class="text-accent lg:col-span-2 xl:col-span-1">{item.year}</span>
          {/if}
          
          <div class="rich-text col-start-2 lg:col-start-3 lg:col-end-8 xl:col-start-2"><Portable value={item.text} /></div>
        </div>
      {/each}
    </div>
  {/if}
</div>
