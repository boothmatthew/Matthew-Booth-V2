import { loadEntryDetail } from '$lib/entries.js';

// Private entries can be any status, so access is the user's private index
// itself rather than a status filter.
export async function load({ params, parent }) {
  const { entriesIndex } = await parent();

  return loadEntryDetail({
    scope: '/private',
    slug: params.slug,
    entriesIndex,
    filter: '_id in $ids',
    params: { ids: entriesIndex.map((e) => e._id) }
  });
}
