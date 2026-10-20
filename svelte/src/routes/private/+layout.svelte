<script>
  import IndexShell from '$lib/components/IndexShell.svelte';

  let { children, data } = $props();
</script>

<svelte:head>
  <meta name="robots" content="noindex" />
</svelte:head>

<IndexShell
  siteTitle={data.siteSettings?.siteTitle ?? 'Matthew Booth'}
  entries={data.entries}
  entriesIndex={data.entriesIndex}
  filters={data.filters}
  filterParam={data.filterParam}
  defaultFilter={data.defaultFilter}
  indexPath="/private"
  detailPath="/private"
  detailRouteId="/private/[slug]"
>
  {@render children()}
</IndexShell>
