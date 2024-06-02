import { TypedPocketBase } from 'typed-pocketbase';
import type { Schema } from './pocketbase_schema';

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			pb: TypedPocketBase<Schema>;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
