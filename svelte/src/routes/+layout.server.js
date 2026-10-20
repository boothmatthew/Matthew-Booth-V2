// Only what the client needs to know about the session: whether someone is
// logged in (for the Private link). Collection access stays on the server and
// is handed to /private's load.
export function load({ locals }) {
	return { loggedIn: Boolean(locals.user) };
}
