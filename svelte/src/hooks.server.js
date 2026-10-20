import { siteFromHost, GATED_SITES } from '$lib/sites.js';
import {
	SESSION_COOKIE,
	sessionSecret,
	createSession,
	verifySession,
	sessionCookieHeader,
	getActiveUser,
	findUserByPassword
} from '$lib/server/auth.js';

// Attaches the logged-in site user (if any) to event.locals for the
// /private pages, and password-gates the wip./testing. subdomains. Session
// and password handling live in $lib/server/auth.js.

const LOGIN_FIELD = '__site_password';

const loginPage = (showError) => `<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta name="robots" content="noindex" />
	<title>Matthew Booth</title>
	<style>
		body {
			margin: 0;
			display: grid;
			place-items: center;
			min-height: 100svh;
			font-family: 'Times New Roman', serif;
			font-size: 16px;
			line-height: 1.25;
		}
		form {
			display: flex;
			flex-direction: column;
			gap: 1em;
			width: min(20em, 80vw);
		}
		input,
		button {
			font: inherit;
			padding: 0.25em 0.5em;
			border: 1px solid #000;
			border-radius: 0.25em;
			background: #fff;
			color: #000;
		}
		button {
			cursor: pointer;
		}
		p {
			margin: 0;
			color: rgba(0, 0, 0, 0.35);
		}
	</style>
</head>
<body>
	<form method="post">
		<input type="password" name="${LOGIN_FIELD}" placeholder="Password" autofocus required />
		<button type="submit">Enter</button>
		${showError ? '<p>Incorrect password.</p>' : ''}
	</form>
</body>
</html>`;

const htmlResponse = (body, status) =>
	new Response(body, { status, headers: { 'content-type': 'text/html; charset=utf-8' } });

export async function handle({ event, resolve }) {
	const site = siteFromHost(event.url.host);

	// robots.txt must come from the worker, not a static file: Cloudflare
	// serves static assets before the worker runs, so a static robots.txt
	// would shadow the gated sites' disallow-everything version
	if (event.url.pathname === '/robots.txt') {
		const body = GATED_SITES.includes(site)
			? 'User-agent: *\nDisallow: /\n'
			: 'User-agent: *\nDisallow: /private\nDisallow: /login\n';
		return new Response(body, { headers: { 'content-type': 'text/plain' } });
	}

	const secret = sessionSecret(event);

	const token = event.cookies.get(SESSION_COOKIE);
	const userId = token && secret ? await verifySession(token, secret) : null;
	event.locals.user = userId ? await getActiveUser(userId) : null;

	if (!GATED_SITES.includes(site)) return resolve(event);

	// refuse to serve the gated sites rather than run with forgeable cookies
	if (!secret) {
		return new Response('SESSION_SECRET is not configured for this deployment.', { status: 503 });
	}

	if (event.locals.user?.sites?.includes(site)) return resolve(event);

	if (event.request.method === 'POST') {
		const form = await event.request.formData().catch(() => null);
		const password = form?.get(LOGIN_FIELD);
		if (typeof password === 'string' && password) {
			const user = await findUserByPassword(password, site);
			if (user) {
				const session = await createSession(user._id, secret);
				return new Response(null, {
					status: 303,
					headers: {
						location: event.url.pathname + event.url.search,
						'set-cookie': sessionCookieHeader(session, event.url)
					}
				});
			}
			return htmlResponse(loginPage(true), 401);
		}
	}

	return htmlResponse(loginPage(false), 401);
}
