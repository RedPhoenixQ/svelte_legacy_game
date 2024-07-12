export type AutoclearMapOptions<K, T> = {
	/**Amount of milliseconds that needs to pass for key to be removed */
	threshold: number;
	/**Amount of time in milliseconds to wait between checking for removals */
	checkTimeout: number;
	onDelete?: (key: K, value: T) => void;
};

const defaultAutoclearMapOptions = {
	threshold: 1000 * 60 * 5, // 5 min
	checkTimeout: 1000 * 60 * 5 // 5 min;
} as const satisfies AutoclearMapOptions<unknown, unknown>;

export class AutoclearMap<K, T> extends Map<K, T> {
	#lastUsed = new Map<K, number>();
	#timeout?: ReturnType<typeof setTimeout>;
	#options: AutoclearMapOptions<K, T>;

	constructor(
		options?: Partial<AutoclearMapOptions<K, T>>,
		...args: ConstructorParameters<typeof Map<K, T>>
	) {
		super(...args);
		this.#options = {
			...defaultAutoclearMapOptions,
			...options
		};
		this.#handleRemovals();
	}

	get(key: K) {
		this.#lastUsed.set(key, Date.now());
		return super.get(key);
	}

	set(key: K, value: T) {
		if (this.#timeout === undefined) {
			// Restart autoclear if there is no current timeout
			this.#handleRemovals();
		}
		this.#lastUsed.set(key, Date.now());
		return super.set(key, value);
	}

	delete(key: K) {
		this.#lastUsed.delete(key);
		if (this.#lastUsed.size === 0) {
			// Clear the timeout if last element was removed
			clearTimeout(this.#timeout);
			this.#timeout = undefined;
		}
		return super.delete(key);
	}

	/**Removes key from the map that are too old and resets the timeout for the next removal */
	#handleRemovals() {
		console.log('AUTP REMOVING');
		const minimumTime = Date.now() - this.#options.threshold;
		for (const [key, lastUsed] of this.#lastUsed) {
			if (lastUsed < minimumTime) {
				const value = super.get(key);
				try {
					if (value) this.#options.onDelete?.(key, value);
				} catch (err) {
					console.error('AutoclearMap onDelete error:', err);
				}
				this.delete(key);
			}
		}
		// Only reset if there are items to track
		if (this.#lastUsed.size > 0) {
			this.#timeout = setTimeout(this.#handleRemovals.bind(this), this.#options.checkTimeout);
		}
	}
}
