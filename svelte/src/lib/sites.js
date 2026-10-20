// Maps the request host to the entry status it shows. Values must match the
// `status` checkbox values in the studio (studio-matthew-booth-v2/utils/sites.ts).
// Prefix-based so wip.localhost / testing.localhost work in dev too.
export function siteFromHost(host) {
	if (host.startsWith('wip.')) return 'wip';
	if (host.startsWith('testing.')) return 'testing';
	return 'public';
}

// Sites behind the password gate in hooks.server.js.
export const GATED_SITES = ['wip', 'testing'];
