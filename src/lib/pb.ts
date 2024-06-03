import { PUBLIC_PB_URL } from '$env/static/public';
import { TypedPocketBase } from 'typed-pocketbase';
import type { Schema, UsersResponse } from './schema';
import { writable } from 'svelte/store';

export const pb = new TypedPocketBase<Schema>(PUBLIC_PB_URL);

export const user = writable(pb.authStore.model as UsersResponse | null);

// TODO: Make sure the authmodel is from the users collection
//       Important for multiple auth collenctions in the future or admin auth
pb.authStore.onChange((_token, model) => user.set(model as UsersResponse | null));
