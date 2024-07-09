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
		'diceRoll(rolledBy)': DiceRollCollection[];
	};
}

// ===== games =====

export interface GamesResponse extends BaseCollectionResponse {
	collectionName: 'games';
	dms: Array<string>;
	players: Array<string>;
	name: string;
	activeBoard: string;
}

export interface GamesCreate extends BaseCollectionCreate {
	dms: MaybeArray<string>;
	players?: MaybeArray<string>;
	name: string;
	activeBoard?: string;
}

export interface GamesUpdate extends BaseCollectionUpdate {
	dms?: MaybeArray<string>;
	'dms+'?: MaybeArray<string>;
	'dms-'?: MaybeArray<string>;
	players?: MaybeArray<string>;
	'players+'?: MaybeArray<string>;
	'players-'?: MaybeArray<string>;
	name?: string;
	activeBoard?: string;
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
		activeBoard: BoardCollection;
		'characters(game)': CharactersCollection[];
		'chat(game)': ChatCollection[];
		'diceRoll(game)': DiceRollCollection[];
		'board(game)': BoardCollection[];
		'stats(game)': StatsCollection[];
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
	token: string;
	art: string;
	race: 'khaviri' | 'dwarf' | 'elf' | 'half-elf' | 'moon-elf' | 'sun-elf' | 'sea-elf' | 'human';
	actions: Array<string>;
}

export interface CharactersCreate extends BaseCollectionCreate {
	game?: string;
	owner?: string;
	name: string;
	token?: File | null;
	art: File | null;
	race: 'khaviri' | 'dwarf' | 'elf' | 'half-elf' | 'moon-elf' | 'sun-elf' | 'sea-elf' | 'human';
	actions?: MaybeArray<string>;
}

export interface CharactersUpdate extends BaseCollectionUpdate {
	game?: string;
	owner?: string;
	name?: string;
	token?: File | null;
	art?: File | null;
	race?: 'khaviri' | 'dwarf' | 'elf' | 'half-elf' | 'moon-elf' | 'sun-elf' | 'sea-elf' | 'human';
	actions?: MaybeArray<string>;
	'actions+'?: MaybeArray<string>;
	'actions-'?: MaybeArray<string>;
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
		actions: ActionsCollection[];
		'token(character)': TokenCollection[];
		'stats(character)': StatsCollection[];
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

// ===== diceRoll =====

export interface DiceRollResponse extends BaseCollectionResponse {
	collectionName: 'diceRoll';
	game: string;
	rolledBy: string;
	sides: number;
	roll: number;
}

export interface DiceRollCreate extends BaseCollectionCreate {
	game: string;
	rolledBy: string;
	sides: number;
	roll?: number;
}

export interface DiceRollUpdate extends BaseCollectionUpdate {
	game?: string;
	rolledBy?: string;
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
	collectionName: 'diceRoll';
	response: DiceRollResponse;
	create: DiceRollCreate;
	update: DiceRollUpdate;
	relations: {
		game: GamesCollection;
		rolledBy: UsersCollection;
	};
}

// ===== board =====

export interface BoardResponse extends BaseCollectionResponse {
	collectionName: 'board';
	game: string;
	background: string;
	gridSize: number;
	width: number;
	height: number;
	time: number;
}

export interface BoardCreate extends BaseCollectionCreate {
	game: string;
	background: File | null;
	gridSize: number;
	width: number;
	height: number;
	time?: number;
}

export interface BoardUpdate extends BaseCollectionUpdate {
	game?: string;
	background?: File | null;
	gridSize?: number;
	'gridSize+'?: number;
	'gridSize-'?: number;
	width?: number;
	'width+'?: number;
	'width-'?: number;
	height?: number;
	'height+'?: number;
	'height-'?: number;
	time?: number;
	'time+'?: number;
	'time-'?: number;
}

export interface BoardCollection {
	type: 'base';
	collectionId: string;
	collectionName: 'board';
	response: BoardResponse;
	create: BoardCreate;
	update: BoardUpdate;
	relations: {
		'games(activeBoard)': GamesCollection[];
		game: GamesCollection;
		'token(board)': TokenCollection[];
		'actionItem(board)': ActionItemCollection[];
	};
}

// ===== token =====

export interface TokenResponse extends BaseCollectionResponse {
	collectionName: 'token';
	board: string;
	character: string;
	x: number;
	y: number;
	angle: number;
}

export interface TokenCreate extends BaseCollectionCreate {
	board: string;
	character?: string;
	x?: number;
	y?: number;
	angle?: number;
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
	angle?: number;
	'angle+'?: number;
	'angle-'?: number;
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
		'actionItem(token)': ActionItemCollection[];
		'stats(token)': StatsCollection[];
	};
}

// ===== actionItem =====

export interface ActionItemResponse extends BaseCollectionResponse {
	collectionName: 'actionItem';
	tempName: string;
	actionValue: number;
	board: string;
	token: string;
}

export interface ActionItemCreate extends BaseCollectionCreate {
	tempName?: string;
	actionValue?: number;
	board: string;
	token?: string;
}

export interface ActionItemUpdate extends BaseCollectionUpdate {
	tempName?: string;
	actionValue?: number;
	'actionValue+'?: number;
	'actionValue-'?: number;
	board?: string;
	token?: string;
}

export interface ActionItemCollection {
	type: 'base';
	collectionId: string;
	collectionName: 'actionItem';
	response: ActionItemResponse;
	create: ActionItemCreate;
	update: ActionItemUpdate;
	relations: {
		board: BoardCollection;
		token: TokenCollection;
	};
}

// ===== actions =====

export interface ActionsResponse extends BaseCollectionResponse {
	collectionName: 'actions';
	name: string;
}

export interface ActionsCreate extends BaseCollectionCreate {
	name?: string;
}

export interface ActionsUpdate extends BaseCollectionUpdate {
	name?: string;
}

export interface ActionsCollection {
	type: 'base';
	collectionId: string;
	collectionName: 'actions';
	response: ActionsResponse;
	create: ActionsCreate;
	update: ActionsUpdate;
	relations: {
		'characters(actions)': CharactersCollection[];
	};
}

// ===== stats =====

export interface StatsResponse extends BaseCollectionResponse {
	collectionName: 'stats';
	game: string;
	character: string;
	token: string;
	hp: number;
	maxHp: number;
}

export interface StatsCreate extends BaseCollectionCreate {
	game: string;
	character?: string;
	token?: string;
	hp?: number;
	maxHp?: number;
}

export interface StatsUpdate extends BaseCollectionUpdate {
	game?: string;
	character?: string;
	token?: string;
	hp?: number;
	'hp+'?: number;
	'hp-'?: number;
	maxHp?: number;
	'maxHp+'?: number;
	'maxHp-'?: number;
}

export interface StatsCollection {
	type: 'base';
	collectionId: string;
	collectionName: 'stats';
	response: StatsResponse;
	create: StatsCreate;
	update: StatsUpdate;
	relations: {
		game: GamesCollection;
		character: CharactersCollection;
		token: TokenCollection;
		'modifiers(stats)': ModifiersCollection[];
	};
}

// ===== modifiers =====

export interface ModifiersResponse extends BaseCollectionResponse {
	collectionName: 'modifiers';
	stats: string;
	attribute: 'hp' | 'maxHp';
	multiplier: number;
	flat: number;
}

export interface ModifiersCreate extends BaseCollectionCreate {
	stats: string;
	attribute: 'hp' | 'maxHp';
	multiplier?: number;
	flat?: number;
}

export interface ModifiersUpdate extends BaseCollectionUpdate {
	stats?: string;
	attribute?: 'hp' | 'maxHp';
	multiplier?: number;
	'multiplier+'?: number;
	'multiplier-'?: number;
	flat?: number;
	'flat+'?: number;
	'flat-'?: number;
}

export interface ModifiersCollection {
	type: 'base';
	collectionId: string;
	collectionName: 'modifiers';
	response: ModifiersResponse;
	create: ModifiersCreate;
	update: ModifiersUpdate;
	relations: {
		stats: StatsCollection;
	};
}

// ===== Schema =====

export type Schema = {
	users: UsersCollection;
	games: GamesCollection;
	test1: Test1Collection;
	characters: CharactersCollection;
	chat: ChatCollection;
	diceRoll: DiceRollCollection;
	board: BoardCollection;
	token: TokenCollection;
	actionItem: ActionItemCollection;
	actions: ActionsCollection;
	stats: StatsCollection;
	modifiers: ModifiersCollection;
};
