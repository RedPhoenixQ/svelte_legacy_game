import { error } from '@sveltejs/kit';

export function authError(message?: string) {
	error(403, { message: message ?? 'You must be logged in to view this page', needs_auth: true });
}
