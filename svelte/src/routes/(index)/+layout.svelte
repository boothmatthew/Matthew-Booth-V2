<script>
  import IndexShell from '$lib/components/IndexShell.svelte';

  let { children, data } = $props();
</script>

<IndexShell
  siteTitle={data.siteSettings?.siteTitle ?? 'Matthew Booth'}
  entries={data.entries}
  entriesIndex={data.entriesIndex}
  filters={data.filters}
  filterParam={data.filterParam}
  indexPath="/"
  detailPath="/index"
  detailRouteId="/(index)/index/[slug]"
>
  {@render children()}
</IndexShell>
