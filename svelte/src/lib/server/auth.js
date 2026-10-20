import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { client } from '$lib/sanity/client.js';

// Site-user sessions. Users and their hashed passwords live as siteUser
// documents in Sanity; a signed cookie keeps them logged in. Hash format
// matches the studio's PasswordInput component: sha-256 of `${salt}:${password}`.

export const SESSION_COOKIE = 'mb_session';
export const SESSION_DAYS = 30;

// Non-CDN client so new users/passwords work immediately after saving.
const freshClient = client.withConfig({ useCdn: false });

const encoder = new TextEncoder();

const toHex = (buffer) =>
	Array.from(new Uint8Array(buffer))
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');

const sha256Hex = async (text) => toHex(await crypto.subtle.digest('SHA-256', encoder.encode(text)));

const hmacHex = async (secret, text) => {
	const key = await crypto.subtle.importKey(
		'raw',
		encoder.encode(secret),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign']
	);
	return toHex(await crypto.subtle.sign('HMAC', key, encoder.encode(text)));
};

// Without a real secret, session cookies would be forgeable, so callers must
// refuse to log anyone in when this is null (dev gets a fallback).
export const sessionSecret = (event) =>
	event.platform?.env?.SESSION_SECRET ?? env.SESSION_SECRET ?? (dev ? 'dev-only-secret' : null);

export const createSession = async (userId, secret) => {
	const expires = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
	const payload = `${userId}.${expires}`;
	return `${payload}.${await hmacHex(secret, payload)}`;
};

export const verifySession = async (token, secret) => {
	const [userId, expires, signature] = token?.split('.') ?? [];
	if (!userId || !expires || !signature) return null;
	if (Number(expires) < Date.now()) return null;
	if ((await hmacHex(secret, `${userId}.${expires}`)) !== signature) return null;
	return userId;
};

// set-cookie as a literal header: hooks returns its own Response objects for
// the subdomain gate, and event.cookies only applies to resolve() responses
export const sessionCookieHeader = (session, url) => {
	const secure = url.protocol === 'https:' ? '; Secure' : '';
	return `${SESSION_COOKIE}=${session}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_DAYS * 24 * 60 * 60}${secure}`;
};

const passwordMatches = async (auth, password) =>
	Boolean(auth?.hash && auth?.salt) && (await sha256Hex(`${auth.salt}:${password}`)) === auth.hash;

// Per-isolate cache of active users' access so requests don't query Sanity
// every time. Revocation and collection changes apply within a minute.
const userCache = new Map();

export const getActiveUser = async (userId) => {
	const cached = userCache.get(userId);
	if (cached && cached.expires > Date.now()) return cached.user;

	const user = await client
		.fetch(
			`*[_type == "siteUser" && _id == $userId && active == true][0]{
				_id,
				sites,
				"collectionIds": collections[]._ref,
				canSeeWip,
				canSeeTesting
			}`,
			{ userId }
		)
		.catch(() => null);

	userCache.set(userId, { user, expires: Date.now() + 60 * 1000 });
	return user;
};

// Logins are password only: the password is checked against every active
// user (each hash has its own salt), limited to users with access to `site`
// for the subdomain gate. The studio refuses duplicate passwords, so at most
// one user matches.
export const findUserByPassword = async (password, site = null) => {
	const users = await freshClient
		.fetch(`*[_type == "siteUser" && active == true && ($site == null || $site in sites)]{ _id, auth }`, {
			site
		})
		.catch(() => []);

	for (const user of users) {
		if (await passwordMatches(user.auth, password)) return user;
	}
	return null;
};

// Only same-site paths, so ?redirect= can't send people to another origin.
export const safeRedirect = (target, fallback = '/private') =>
	typeof target === 'string' && target.startsWith('/') && !target.startsWith('//') && !target.startsWith('/\\')
		? target
		: fallback;
