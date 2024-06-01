import { pb } from '$lib/pb';
import type { RecordModel } from 'pocketbase';

export type Test1 = RecordModel & { text: string; number: number };

export async function load() {
	return {
		test1: await pb.collection<Test1>('test1').getFullList()
	};
}
