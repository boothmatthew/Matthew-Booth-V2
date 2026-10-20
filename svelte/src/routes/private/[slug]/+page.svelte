<script>
  import EntryDetail from '$lib/components/EntryDetail.svelte';

  const { data } = $props();
</script>

<EntryDetail {data} />
