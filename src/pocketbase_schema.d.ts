/**
 * This file was @generated using typed-pocketbase
 */

// https://pocketbase.io/docs/collections/#base-collection
export interface BaseCollectionResponse {
	/**
	 * 15 characters string to store as record ID.
	 */
	id: string;
	/**
	 * Date string representation for the creation date.
	 */
	created: string;
	/**
	 * Date string representation for the creation date.
	 */
	updated: string;
	/**
	 * The collection id.
	 */
	collectionId: string;
	/**
	 * The collection name.
	 */
	collectionName: string;
}

// https://pocketbase.io/docs/api-records/#create-record
export interface BaseCollectionCreate {
	/**
	 * 15 characters string to store as record ID.
	 * If not set, it will be auto generated.
	 */
	id?: string;
}

// https://pocketbase.io/docs/api-records/#update-record
export interface BaseCollectionUpdate {
	test?: null;
}

// https://pocketbase.io/docs/collections/#auth-collection
export interface AuthCollectionResponse extends BaseCollectionResponse {
	/**
	 * The username of the auth record.
	 */
	username: string;
	/**
	 * Auth record email address.
	 */
	email: string;
	/**
	 * Whether to show/hide the auth record email when fetching the record data.
	 */
	emailVisibility: boolean;
	/**
	 * Indicates whether the auth record is verified or not.
	 */
	verified: boolean;
}

// https://pocketbase.io/docs/api-records/#create-record
export interface AuthCollectionCreate extends BaseCollectionCreate {
	/**
	 * The username of the auth record.
	 * If not set, it will be auto generated.
	 */
	username?: string;
	/**
	 * Auth record email address.
	 */
	email?: string;
	/**
	 * Whether to show/hide the auth record email when fetching the record data.
	 */
	emailVisibility?: boolean;
	/**
	 * Auth record password.
	 */
	password: string;
	/**
	 * Auth record password confirmation.
	 */
	passwordConfirm: string;
	/**
	 * Indicates whether the auth record is verified or not.
	 * This field can be set only by admins or auth records with "Manage" access.
	 */
	verified?: boolean;
}

// https://pocketbase.io/docs/api-records/#update-record
export interface AuthCollectionUpdate {
	/**
	 * The username of the auth record.
	 */
	username?: string;
	/**
	 * The auth record email address.
	 * This field can be updated only by admins or auth records with "Manage" access.
	 * Regular accounts can update their email by calling "Request email change".
	 */
	email?: string;
	/**
	 * Whether to show/hide the auth record email when fetching the record data.
	 */
	emailVisibility?: boolean;
	/**
	 * Old auth record password.
	 * This field is required only when changing the record password. Admins and auth records with "Manage" access can skip this field.
	 */
	oldPassword?: string;
	/**
	 * New auth record password.
	 */
	password?: string;
	/**
	 * New auth record password confirmation.
	 */
	passwordConfirm?: string;
	/**
	 * Indicates whether the auth record is verified or not.
	 * This field can be set only by admins or auth records with "Manage" access.
	 */
	verified?: boolean;
}

// https://pocketbase.io/docs/collections/#view-collection
export interface ViewCollectionRecord {
	id: string;
}

// utilities

type MaybeArray<T> = T | T[];

// ===== users =====

export interface UsersResponse extends AuthCollectionResponse {
	collectionName: 'users';
	name: string;
	avatar: string;
}

export interface UsersCreate extends AuthCollectionCreate {
	name?: string;
	avatar?: File | null;
}

export interface UsersUpdate extends AuthCollectionUpdate {
	name?: string;
	avatar?: File | null;
}

export interface UsersCollection {
	type: 'auth';
	collectionId: string;
	collectionName: 'users';
	response: UsersResponse;
	create: UsersCreate;
	update: UsersUpdate;
	relations: {
		'games(dms)': GamesCollection[];
		'games(players)': GamesCollection[];
	};
}

// ===== games =====

export interface GamesResponse extends BaseCollectionResponse {
	collectionName: 'games';
	dms: Array<string>;
	players: Array<string>;
	name: string;
}

export interface GamesCreate extends BaseCollectionCreate {
	dms: MaybeArray<string>;
	players?: MaybeArray<string>;
	name: string;
}

export interface GamesUpdate extends BaseCollectionUpdate {
	dms?: MaybeArray<string>;
	'dms+'?: MaybeArray<string>;
	'dms-'?: MaybeArray<string>;
	players?: MaybeArray<string>;
	'players+'?: MaybeArray<string>;
	'players-'?: MaybeArray<string>;
	name?: string;
}

export interface GamesCollection {
	type: 'base';
	collectionId: string;
	collectionName: 'games';
	response: GamesResponse;
	create: GamesCreate;
	update: GamesUpdate;
	relations: {
		dms: UsersCollection[];
		players: UsersCollection[];
	};
}

// ===== test1 =====

export interface Test1Response extends BaseCollectionResponse {
	collectionName: 'test1';
	text: string;
	number: number;
}

export interface Test1Create extends BaseCollectionCreate {
	text?: string;
	number?: number;
}

export interface Test1Update extends BaseCollectionUpdate {
	text?: string;
	number?: number;
	'number+'?: number;
	'number-'?: number;
}

export interface Test1Collection {
	type: 'base';
	collectionId: string;
	collectionName: 'test1';
	response: Test1Response;
	create: Test1Create;
	update: Test1Update;
	relations: Record<string, never>;
}

// ===== characters =====

export interface CharactersResponse extends BaseCollectionResponse {
	collectionName: 'characters';
	name: string;
}

export interface CharactersCreate extends BaseCollectionCreate {
	name?: string;
}

export interface CharactersUpdate extends BaseCollectionUpdate {
	name?: string;
}

export interface CharactersCollection {
	type: 'base';
	collectionId: string;
	collectionName: 'characters';
	response: CharactersResponse;
	create: CharactersCreate;
	update: CharactersUpdate;
	relations: Record<string, never>;
}

// ===== Schema =====

export type Schema = {
	users: UsersCollection;
	games: GamesCollection;
	test1: Test1Collection;
	characters: CharactersCollection;
};
