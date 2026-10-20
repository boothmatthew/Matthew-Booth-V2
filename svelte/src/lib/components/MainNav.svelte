<script>
  // imports
  import { page } from '$app/state';
  import { enhance } from '$app/forms';
  import Portable from './Portable.svelte';
  import { linkAttrs } from '$lib/utils.js';

  // derived — filters are categories on the public index, the user's
  // collections on /private (each layout's load supplies its own)
  const siteSettings = $derived(page?.data?.siteSettings);
  const filters = $derived(page?.data?.filters ?? []);
  const filterParam = $derived(page?.data?.filterParam ?? 'category');
  // set on /private, which always shows one collection and has no Everything
  const defaultFilter = $derived(page?.data?.defaultFilter ?? null);
  const loggedIn = $derived(page?.data?.loggedIn ?? false);
  const isPrivate = $derived(page.route.id?.startsWith('/private') ?? false);

  // params
  const filterSlug = $derived(page.url.searchParams.get(filterParam) ?? defaultFilter);
  const viewParam = $derived(page.url.searchParams.get('view'));
  const showFilters = $derived(
    ['/(index)', '/(index)/index/[slug]', '/private', '/private/[slug]'].includes(page.route.id)
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
            <a href={link.url} {...linkAttrs(link.url, page.url.origin)} class={page.url.pathname !== link.url ? 'text-accent' : ''}>{link.label}</a>
          </li>
        {/each}

        <li>
          <a href={loggedIn ? '/private' : '/login'} class={isPrivate ? '' : 'text-accent'}>Private</a>
        </li>

        {#if loggedIn && isPrivate}
          <li>
            <form method="post" action="/login?/logout" use:enhance>
              <button class="text-accent cursor-pointer">Log out</button>
            </form>
          </li>
        {/if}
      </ul>
    </nav>
  {/if}

  <div id="entries-filters" class:active={showFilters}>
    <nav class="category-links">
      <ul class="flex items-center flex-wrap gap-x-[.75lh] gap-y-[.25lh] lg:gap-x-base lg:gap-y-line">
        {#if !defaultFilter}
          <li>
            <a
              href={buildUrl({ [filterParam]: null, view: viewParam })}
              class={filterSlug === null ? 'link-active' : ''}
            >Everything</a>
          </li>
        {/if}

        {#each filters as filter}
          <li>
            <a
              href={buildUrl({ [filterParam]: filter.slug, view: viewParam })}
              class={filterSlug === filter.slug ? 'link-active' : ''}
            >{filter.title}</a>
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
