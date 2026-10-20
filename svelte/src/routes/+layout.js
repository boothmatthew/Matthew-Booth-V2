import { client } from '$lib/sanity/client.js';
import { siteFromHost } from '$lib/sites.js';
import { slugify } from '$lib/utils.js';
import { withCategoryFilters } from '$lib/entries.js';

export async function load({ url, untrack, data }) {
	// untrack: the host never changes within a session, and tracking url
	// would rerun this load (and refetch everything) on every navigation
	const site = untrack(() => siteFromHost(url.host));

	const { siteSettings, categories, entriesIndex } = await client.fetch(`{
		"siteSettings": *[_type == "siteSettings"][0]{
			...,
			ogImage{ asset->{ url } }
		},
		"categories": *[_type == "category" && count(*[_type == "entry" && $site in status && references(^._id)]) > 0] | order(orderRank asc) { _id, title, singularTitle },
		"entriesIndex": *[_type == "entry" && $site in status] | order(orderRank asc) { slug, categories[]->{ title } }
	}`, { site }).catch(() => ({ siteSettings: null, categories: [], entriesIndex: [] }));

	// filters/filterParam/entriesIndex are the public index's; /private's
	// layout overrides them with the user's collections
	return {
		...data,
		site,
		siteSettings,
		filters: categories.map((c) => ({ ...c, slug: slugify(c.title) })),
		filterParam: 'category',
		entriesIndex: withCategoryFilters(entriesIndex)
	};
}
