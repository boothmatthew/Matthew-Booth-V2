<script>
  // imports
  import Image from './Image.svelte';
  import IconDocument from './IconDocument.svelte';
  import Portable from './Portable.svelte';
  import { slugify } from '$lib/utils.js';
  import { muxPosterUrl } from '$lib/mux.js';
  import { toPlainText } from '@portabletext/svelte';

  // props — categoryParam comes from the layout (URL on the index, stored
  // context while the detail overlay is open)
  const { entry, categoryParam = null } = $props();

  // derive slugified category values to match against ?category param
  const categorySlugs = $derived((entry.categories ?? []).map((c) => slugify(c.title)));

  // active when no category filter is set, or the entry belongs to the active category
  const isActive = $derived(
    categoryParam === null || categorySlugs.includes(categoryParam)
  );

  // used to show the document icon + text preview fallback when there's no featured image
  const isTextsCategory = $derived(
    (entry.categories ?? []).some((c) => c.title === 'Texts')
  );

  // comma-separated singular category titles for display
  const categoryLabels = $derived(
    (entry.categories ?? []).map((c) => c.singularTitle).join(', ')
  );

  // plain text version of description for list display
  const descriptionText = $derived(toPlainText(entry.description ?? []));

  // param-free so the same entry URL is :visited from every filtered view;
  // the filter context lives in the indexContext store instead
  const entryUrl = $derived(`/index/${entry.slug.current}`);

  // resolve thumbnail: custom override or auto-derived from first block
  const thumbnail = $derived((() => {
    if (entry.useCustomThumbnail && entry.customThumbnail) return entry.customThumbnail;
    const b = entry.firstBlock;
    if (!b) return null;
    if (b._type === 'singleMediaBlock') return { mediaType: b.mediaType, image: b.image, video: { asset: { url: b.video?.asset?.url ?? null } }, muxPlaybackId: b.muxPlaybackId ?? null, muxThumbTime: b.muxThumbTime ?? null };
    if (b._type === 'carouselBlock' && b.firstMedia) return { mediaType: b.firstMedia.mediaType, image: b.firstMedia.image, video: { asset: { url: b.firstMedia.videoUrl ?? null } }, muxPlaybackId: b.firstMedia.muxPlaybackId ?? null, muxThumbTime: b.firstMedia.muxThumbTime ?? null };
    return null;
  })());

  const hasImage = $derived(thumbnail?.mediaType === 'image' && !!thumbnail?.image?.asset?.url);
  const hasVideo = $derived(thumbnail?.mediaType === 'video' && !!thumbnail?.video?.asset?.url);
  const hasMuxVideo = $derived(thumbnail?.mediaType === 'muxVideo' && !!thumbnail?.muxPlaybackId);
</script>

<div class="entry-item {isActive ? 'active' : ''} {entry.externalAuthor ? 'external-author' : ''}" categories={categorySlugs.join(',')}>
  <a href={entryUrl} data-sveltekit-preload-data="hover">
    <div class="image">
      {#if hasImage}
        <figure class="img-thumbnail aspect-square">
          <Image item={thumbnail.image} fetchWidth={500} />
        </figure>
      {:else if hasMuxVideo}
        <figure class="img-thumbnail aspect-square">
          <!-- no loading="lazy": the global img[loading="lazy"] fade-in rule
               expects Image.svelte's onload handling, which this plain img lacks -->
          <img src={muxPosterUrl(thumbnail.muxPlaybackId, 500, thumbnail.muxThumbTime ?? 0)} alt={entry.title} />
        </figure>
      {:else if hasVideo}
        <figure class="img-thumbnail aspect-square">
          <video muted preload="metadata">
            <source src="{thumbnail.video.asset.url}#t=0.1" type="video/mp4" />
          </video>
        </figure>
      {:else if isTextsCategory}
        <!-- no featured image: show document icon and text preview for Texts entries -->
        <figure class="text-icon aspect-square">
          <IconDocument />
        </figure>

        <div class="text-preview text-sm">
          {#if entry.firstTextBlock?.length}
            <div class="rich-text-breaks-only">
              <Portable value={entry.firstTextBlock} plainLinks />
            </div>
          {:else}
            <p>{entry.title}</p>
          {/if}
        </div>
      {/if}
    </div>

    <div class="title">
      <span class={entry.italicizeTitle ? 'italic' : ''}>{entry.title}</span>
    </div>

    <div class="categories">
      {#if categoryLabels}
        <span class="text-accent">{categoryLabels}</span>
      {/if}
    </div>

    <div class="description">
      {#if descriptionText}
        <span>{descriptionText}</span>
      {/if}
    </div>

    <div class="date flex justify-end lg:justify-start">
      <span>{ entry.year }</span>
    </div>
  </a>
</div>
