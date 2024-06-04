import { pb } from '$lib/pb';
import { lt } from 'typed-pocketbase';

export async function load() {
	return {
		test1: await pb.from('test1').getFullList({
			filter: lt('number', 1000)
		})
	};
}
