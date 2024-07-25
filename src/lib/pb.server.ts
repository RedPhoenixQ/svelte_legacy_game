import { POCKETBASE_EMAIL, POCKETBASE_PASSWORD } from '$env/static/private';
import { pb } from './pb';

console.log("Debug log of env cred", POCKETBASE_EMAIL, POCKETBASE_PASSWORD?.slice?.(4))

async function getAdminAuth() {
	if (pb.authStore.isValid) return;
	console.log("pb inside getadminauth", pb, pb.url)
	await pb.admins.authWithPassword(POCKETBASE_EMAIL, POCKETBASE_PASSWORD);
}

getAdminAuth();

export { pb as serverPb };
