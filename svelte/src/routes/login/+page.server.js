import { fail, redirect } from '@sveltejs/kit';
import {
	SESSION_COOKIE,
	SESSION_DAYS,
	sessionSecret,
	createSession,
	findUserByPassword,
	safeRedirect
} from '$lib/server/auth.js';

export function load({ locals, url }) {
	if (locals.user) redirect(303, safeRedirect(url.searchParams.get('redirect')));
}

export const actions = {
	login: async (event) => {
		const form = await event.request.formData();
		const password = form.get('password');

		const secret = sessionSecret(event);
		if (!secret) return fail(503, { error: 'Logging in is unavailable right now.' });

		const user = typeof password === 'string' && password ? await findUserByPassword(password) : null;
		if (!user) return fail(400, { error: 'Incorrect password.' });

		event.cookies.set(SESSION_COOKIE, await createSession(user._id, secret), {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: event.url.protocol === 'https:',
			maxAge: SESSION_DAYS * 24 * 60 * 60
		});
		redirect(303, safeRedirect(form.get('redirect')));
	},

	logout: async ({ cookies }) => {
		cookies.delete(SESSION_COOKIE, { path: '/' });
		redirect(303, '/');
	}
};
