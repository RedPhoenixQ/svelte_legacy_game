import { PUBLIC_PB_URL } from '$env/static/public';
import { TypedPocketBase } from 'typed-pocketbase';
import type { Schema } from './schema';

export const pb = new TypedPocketBase<Schema>(PUBLIC_PB_URL);
