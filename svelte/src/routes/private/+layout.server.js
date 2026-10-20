import { redirect } from '@sveltejs/kit';

// Everything under /private needs a logged-in site user; anyone else is sent
// to the login page and brought back here afterwards.
export function load({ locals, url, untrack }) {
	if (!locals.user) {
		// untracked: this only runs for logged-out visitors, and tracking url
		// would rerun the load (and refetch the private index) on every
		// navigation between private entries
		const target = untrack(() => url.pathname + url.search);
		redirect(303, `/login?redirect=${encodeURIComponent(target)}`);
	}

	const { collectionIds, canSeeWip, canSeeTesting } = locals.user;
	return {
		access: {
			collectionIds: collectionIds ?? [],
			canSeeWip: Boolean(canSeeWip),
			canSeeTesting: Boolean(canSeeTesting)
		}
	};
}
