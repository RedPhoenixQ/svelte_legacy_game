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
export interface BaseCollectionUpdate {}

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
		'characters(owner)': CharactersCollection[];
		'chat(sender)': ChatCollection[];
		'dice_roll(rolled_by)': DiceRollCollection[];
	};
}

// ===== games =====

export interface GamesResponse extends BaseCollectionResponse {
	collectionName: 'games';
	dms: Array<string>;
	players: Array<string>;
	name: string;
	active_board: string;
}

export interface GamesCreate extends BaseCollectionCreate {
	dms: MaybeArray<string>;
	players?: MaybeArray<string>;
	name: string;
	active_board?: string;
}

export interface GamesUpdate extends BaseCollectionUpdate {
	dms?: MaybeArray<string>;
	'dms+'?: MaybeArray<string>;
	'dms-'?: MaybeArray<string>;
	players?: MaybeArray<string>;
	'players+'?: MaybeArray<string>;
	'players-'?: MaybeArray<string>;
	name?: string;
	active_board?: string;
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
		active_board: BoardCollection;
		'characters(game)': CharactersCollection[];
		'chat(game)': ChatCollection[];
		'dice_roll(game)': DiceRollCollection[];
		'board(game)': BoardCollection[];
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
	game: string;
	owner: string;
	name: string;
	race: 'khaviri' | 'dwarf' | 'elf' | 'half-elf' | 'moon-elf' | 'sun-elf' | 'sea-elf' | 'human';
}

export interface CharactersCreate extends BaseCollectionCreate {
	game?: string;
	owner?: string;
	name: string;
	race: 'khaviri' | 'dwarf' | 'elf' | 'half-elf' | 'moon-elf' | 'sun-elf' | 'sea-elf' | 'human';
}

export interface CharactersUpdate extends BaseCollectionUpdate {
	game?: string;
	owner?: string;
	name?: string;
	race?: 'khaviri' | 'dwarf' | 'elf' | 'half-elf' | 'moon-elf' | 'sun-elf' | 'sea-elf' | 'human';
}

export interface CharactersCollection {
	type: 'base';
	collectionId: string;
	collectionName: 'characters';
	response: CharactersResponse;
	create: CharactersCreate;
	update: CharactersUpdate;
	relations: {
		game: GamesCollection;
		owner: UsersCollection;
		'token(character)': TokenCollection[];
	};
}

// ===== chat =====

export interface ChatResponse extends BaseCollectionResponse {
	collectionName: 'chat';
	game: string;
	sender: string;
	content: string;
}

export interface ChatCreate extends BaseCollectionCreate {
	game?: string;
	sender?: string;
	content?: string;
}

export interface ChatUpdate extends BaseCollectionUpdate {
	game?: string;
	sender?: string;
	content?: string;
}

export interface ChatCollection {
	type: 'base';
	collectionId: string;
	collectionName: 'chat';
	response: ChatResponse;
	create: ChatCreate;
	update: ChatUpdate;
	relations: {
		game: GamesCollection;
		sender: UsersCollection;
	};
}

// ===== dice_roll =====

export interface DiceRollResponse extends BaseCollectionResponse {
	collectionName: 'dice_roll';
	game: string;
	rolled_by: string;
	sides: number;
	roll: number;
}

export interface DiceRollCreate extends BaseCollectionCreate {
	game: string;
	rolled_by: string;
	sides: number;
	roll?: number;
}

export interface DiceRollUpdate extends BaseCollectionUpdate {
	game?: string;
	rolled_by?: string;
	sides?: number;
	'sides+'?: number;
	'sides-'?: number;
	roll?: number;
	'roll+'?: number;
	'roll-'?: number;
}

export interface DiceRollCollection {
	type: 'base';
	collectionId: string;
	collectionName: 'dice_roll';
	response: DiceRollResponse;
	create: DiceRollCreate;
	update: DiceRollUpdate;
	relations: {
		game: GamesCollection;
		rolled_by: UsersCollection;
	};
}

// ===== board =====

export interface BoardResponse extends BaseCollectionResponse {
	collectionName: 'board';
	game: string;
}

export interface BoardCreate extends BaseCollectionCreate {
	game: string;
}

export interface BoardUpdate extends BaseCollectionUpdate {
	game?: string;
}

export interface BoardCollection {
	type: 'base';
	collectionId: string;
	collectionName: 'board';
	response: BoardResponse;
	create: BoardCreate;
	update: BoardUpdate;
	relations: {
		'games(active_board)': GamesCollection[];
		game: GamesCollection;
		'token(board)': TokenCollection[];
	};
}

// ===== token =====

export interface TokenResponse extends BaseCollectionResponse {
	collectionName: 'token';
	board: string;
	character: string;
	x: number;
	y: number;
}

export interface TokenCreate extends BaseCollectionCreate {
	board: string;
	character?: string;
	x?: number;
	y?: number;
}

export interface TokenUpdate extends BaseCollectionUpdate {
	board?: string;
	character?: string;
	x?: number;
	'x+'?: number;
	'x-'?: number;
	y?: number;
	'y+'?: number;
	'y-'?: number;
}

export interface TokenCollection {
	type: 'base';
	collectionId: string;
	collectionName: 'token';
	response: TokenResponse;
	create: TokenCreate;
	update: TokenUpdate;
	relations: {
		board: BoardCollection;
		character: CharactersCollection;
	};
}

// ===== Schema =====

export type Schema = {
	users: UsersCollection;
	games: GamesCollection;
	test1: Test1Collection;
	characters: CharactersCollection;
	chat: ChatCollection;
	dice_roll: DiceRollCollection;
	board: BoardCollection;
	token: TokenCollection;
};
