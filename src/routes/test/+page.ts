import { pb } from '$lib/pb';

export async function load() {
	return {
		test1: await pb.from('test1').getFullList()
	};
}
