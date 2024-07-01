import { TypedPocketBase } from 'typed-pocketbase';
import type { Schema } from './lib/schema';

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		interface Error {
			needsAuth?: boolean;
		}
		interface Locals {
			pb: TypedPocketBase<Schema>;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
