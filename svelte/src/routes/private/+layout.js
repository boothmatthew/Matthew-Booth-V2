import { client } from '$lib/sanity/client.js';
import { ENTRY_LIST_PROJECTION } from '$lib/entries.js';

// Built-in collections for users allowed to see every WIP/Testing entry.
// Their slugs are reserved in the studio's collection schema.
const STATUS_COLLECTIONS = [
  { status: 'wip', title: 'WIP', accessKey: 'canSeeWip' },
  { status: 'testing', title: 'Testing', accessKey: 'canSeeTesting' }
];

export async function load({ data }) {
  const { access } = data;

  const { collections, entries } = await client.fetch(`{
    "collections": *[_type == "collection" && _id in $collectionIds] {
      _id,
      title,
      "slug": slug.current,
      "entryIds": entries[]._ref
    },
    "entries": *[_type == "entry" && (
      _id in *[_type == "collection" && _id in $collectionIds].entries[]._ref
      || ($canSeeWip && "wip" in status)
      || ($canSeeTesting && "testing" in status)
    )] | order(orderRank asc) ${ENTRY_LIST_PROJECTION}
  }`, access).catch(() => ({ collections: [], entries: [] }));

  // each user's collections appear in the order they're listed on that user
  collections.sort((a, b) => access.collectionIds.indexOf(a._id) - access.collectionIds.indexOf(b._id));

  const statusCollections = STATUS_COLLECTIONS.filter((c) => access[c.accessKey]);

  const privateEntries = entries.map((entry) => ({
    ...entry,
    filterSlugs: [
      ...collections.filter((c) => c.entryIds?.includes(entry._id)).map((c) => c.slug),
      ...statusCollections.filter((c) => entry.status?.includes(c.status)).map((c) => c.status)
    ]
  }));

  const filters = [
    ...collections.map(({ title, slug }) => ({ title, slug })),
    ...statusCollections.map(({ title, status }) => ({ title, slug: status }))
  ];

  // overrides the root layout's public filters and index; there's no
  // all-collections view, so /private opens on the first collection
  return {
    filters,
    filterParam: 'collection',
    defaultFilter: filters[0]?.slug ?? null,
    entries: privateEntries,
    entriesIndex: privateEntries
  };
}
