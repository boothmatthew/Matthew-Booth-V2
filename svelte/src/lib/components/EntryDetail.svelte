<script>
  import SingleMediaBlock from '$lib/components/blocks/SingleMediaBlock.svelte';
  import CarouselBlock from '$lib/components/blocks/CarouselBlock.svelte';
  import SoloCarousel from '$lib/components/blocks/SoloCarousel.svelte';
  import TextBlock from '$lib/components/blocks/TextBlock.svelte';

  const { data } = $props();

  const entry = $derived(data.entry);
  const blocks = $derived(entry.blocks ?? []);
  const isSingleBlock = $derived(blocks.length === 1);
  const singleBlock = $derived(isSingleBlock ? blocks[0] : null);

  const isFullscreen = $derived(
    isSingleBlock &&
    (singleBlock?._type === 'singleMediaBlock' || singleBlock?._type === 'carouselBlock')
  );
</script>

<svelte:head>
  {#each data.preloadUrls ?? [] as url}
    <link rel="prefetch" href={url} />
  {/each}
</svelte:head>

<!-- main slide -->
<div class="slide-item-inner relative h-dvh flex flex-col overflow-y-scroll overflow-x-hidden">

  {#if isFullscreen}
    <div class="slide-blocks flex-1 flex items-center justify-center w-full lg:w-2/3 mx-auto px-base lg:px-0">

      {#if singleBlock?._type === 'singleMediaBlock'}
        <SingleMediaBlock block={singleBlock} isSolo={true} eager={true} />
      {:else if singleBlock?._type === 'carouselBlock'}
        <SoloCarousel block={singleBlock} />
      {/if}

    </div>

  {:else}
    <div class="slide-blocks w-full lg:w-2/3 mx-auto px-base lg:px-0 multi-block-content">
      {#each blocks as block, i}
        {#if block._type === 'singleMediaBlock'}
          <section class="block-item">
            <SingleMediaBlock {block} isSolo={false} eager={i < 3} />
          </section>
        {:else if block._type === 'carouselBlock'}
          <section class="block-item">
            <CarouselBlock {block} eager={i < 3} />
          </section>
        {:else if block._type === 'textBlock'}
          <section class="block-item">
            <TextBlock {block} />
          </section>
        {/if}
      {/each}
    </div>
  {/if}

</div>
