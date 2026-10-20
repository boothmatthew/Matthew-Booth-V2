// An entry's status: which audiences it's shown to. `public` entries appear
// on the index; `wip` and `testing` entries appear on the gated subdomains and
// as extra collections on /private for users with access. Values must match
// the host → status mapping in svelte/src/lib/sites.js.
export const STATUSES = [
  {title: 'Public', value: 'public'},
  {title: 'WIP', value: 'wip'},
  {title: 'Testing', value: 'testing'},
]

// Password-protected subdomains a site user can be granted.
export const GATED_SITES = [
  {title: 'wip.matthewbooth.com', value: 'wip'},
  {title: 'testing.matthewbooth.com', value: 'testing'},
]
