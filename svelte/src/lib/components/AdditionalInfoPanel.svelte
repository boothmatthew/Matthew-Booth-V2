<script>
  import { toPlainText } from '@portabletext/svelte';
  import Portable from '$lib/components/Portable.svelte';

  let { entry, isOpen, onClose } = $props();

  const additionalInfoItems = $derived(
    (entry.additionalInfo ?? []).filter((info) => {
      const hasText = info.text?.length && toPlainText(info.text).trim().length > 0;
      const hasRelatedEntries = info.relatedEntries?.length > 0;
      return hasText || hasRelatedEntries;
    })
  );

  let panelEl = $state(null);

  function handleClose() {
    // reset scroll position before closing
    if (panelEl) panelEl.scrollTo({ top: 0 });
    onClose();
  }
</script>

<section
  bind:this={panelEl}
  class="additional-info-block"
  aria-hidden={!isOpen}
>
  <div class="additional-info-rows">
    {#if !entry.hideDefaultAdditionalInfo}
      <p class="row-title">Title</p>
      <div class={entry.italicizeTitle ? 'italic' : ''}>{entry.title}</div>

      {#if entry.year}
        <p class="row-title">Date</p>
        <p>{entry.year}</p>
      {/if}

      {#if entry.externalAuthor && entry.externalAuthorName}
        <p class="row-title">Author</p>
        <p>{entry.externalAuthorName}</p>
      {/if}

      {#if entry.categories?.length}
        <p class="row-title">Category</p>
        <p>{entry.categories.map((c) => c.singularTitle || c.title).join(', ')}</p>
      {/if}
    {/if}

    {#each additionalInfoItems as info}
      <p class="row-title">{info.title}</p>
      <div>
        {#if info.text?.length}
          <div class="rich-text">
            <Portable value={info.text} />
          </div>
        {/if}

        {#if info.relatedEntries?.length}
          <ul>
            {#each info.relatedEntries as related}
              <li>
                <a
                  href="/index/{related.slug.current}"
                  data-sveltekit-preload-data="hover"
                  class="def-underline"
                  class:italic={related.italicizeTitle}
                >{related.title}</a>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    {/each}
  </div>
</section>
