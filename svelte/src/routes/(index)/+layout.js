import { client } from '$lib/sanity/client.js';
import { ENTRY_LIST_PROJECTION, withCategoryFilters } from '$lib/entries.js';

export async function load({ parent }) {
  const { site } = await parent();

  const entries = await client.fetch(
    `*[_type == "entry" && $site in status] | order(orderRank asc) ${ENTRY_LIST_PROJECTION}`,
    { site }
  ).catch(() => []);

  return { entries: withCategoryFilters(entries) };
}
