<script>
  // imports
  import { page } from '$app/state';
  import Portable from './Portable.svelte';
  import { slugify } from '$lib/utils.js';

  // derived
  const siteSettings = $derived(page?.data?.siteSettings);
  const categories = $derived(page?.data?.categories ?? []);

  // params
  const categoryParam = $derived(page.url.searchParams.get('category'));
  const viewParam = $derived(page.url.searchParams.get('view'));
  const showFilters = $derived(page.route.id === '/(index)' || page.route.id === '/(index)/index/[slug]');
  const toggleUrl = $derived(
    viewParam === 'grid'
      ? buildUrl({ category: categoryParam, view: null })
      : buildUrl({ category: categoryParam, view: 'grid' })
  );

  // function to build link urls
  function buildUrl(newParams) {
    const url = new URL(page.url);
    for (const [key, value] of Object.entries(newParams)) {
      if (value === null || value === undefined) {
        url.searchParams.delete(key);
      } else {
        url.searchParams.set(key, value);
      }
    }
    return url.pathname + (url.search || '');
  }

</script>

<header id="main-nav" class="px-base pt-line space-y-line">
  {#if siteSettings?.globalIntro}
    <div class="rich-text">
      <Portable value={siteSettings.globalIntro} />
    </div>
  {/if}

  {#if siteSettings?.navLinks && siteSettings.navLinks.length > 0}
    <nav class="main-links">
      <ul class="flex gap-x-[.75lh] lg:gap-x-base">
        <li>
          <a href="/" data-sveltekit-preload-data="hover" class={page.url.pathname !== '/' ? 'text-accent' : ''}>Index</a>
        </li>

        {#each siteSettings.navLinks as link, i}
          <li>
            <a href={link.url} target={link.openInNewTab ? '_blank' : null} rel={link.openInNewTab ? 'noopener noreferrer' : null} class={page.url.pathname !== link.url ? 'text-accent' : ''}>{link.label}</a>
          </li>
        {/each}
      </ul>
    </nav>
  {/if}

  <div id="entries-filters" class:active={showFilters}>
    <nav class="category-links">
      <ul class="flex items-center flex-wrap gap-x-[.75lh] gap-y-[.25lh] lg:gap-x-base lg:gap-y-line">
        <li>
          <a
            href={buildUrl({ category: null, view: viewParam })}
            class={categoryParam === null ? 'link-active' : ''}
          >Everything</a>
        </li>

        {#each categories as category}
          {@const slug = slugify(category.title)}
          <li>
            <a
              href={buildUrl({ category: slug, view: viewParam })}
              class={categoryParam === slug ? 'link-active' : ''}
            >{category.title}</a>
          </li>
        {/each}
      </ul>
    </nav>

    <nav>
      <ul class="flex gap-x-[.75lh] gap-y-[.25lh] lg:gap-x-base lg:gap-y-line">
        <li>
          <a href={buildUrl({ view: null })} class={viewParam !== 'grid' ? '' : 'text-accent'}>List View</a>
        </li>

        <li>
          <a href={buildUrl({ view: 'grid' })} class={viewParam === 'grid' ? '' : 'text-accent'}>Grid View</a>
        </li>
      </ul>
    </nav>
  </div>
</header>
