import { loadEntryDetail } from '$lib/entries.js';

export async function load({ params, parent }) {
  const { entriesIndex, site } = await parent();

  return loadEntryDetail({
    scope: '/',
    slug: params.slug,
    entriesIndex,
    filter: '$site in status',
    params: { site }
  });
}
