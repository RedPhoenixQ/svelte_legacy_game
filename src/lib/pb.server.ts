import { POCKETBASE_EMAIL, POCKETBASE_PASSWORD } from '$env/static/private';
import { pb } from './pb';

async function getAdminAuth() {
	if (pb.authStore.isValid) return;
	await pb.admins.authWithPassword(POCKETBASE_EMAIL, POCKETBASE_PASSWORD);
}

getAdminAuth();

export { pb as serverPb };
