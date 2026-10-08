import { browser } from '$app/environment';
import { writable } from 'svelte/store';

// Topics the user follows (the "directions" drill-down). Kept separate from the
// field interests store because topic and subfield IDs share the same numeric
// space and would otherwise collide. Client-side for now (localStorage); Phase 2
// migrates both to the server alongside the account.
const KEY = 'rf:topics:v1';

function load(): number[] {
	if (!browser) return [];
	try {
		const raw = localStorage.getItem(KEY);
		const parsed = raw ? JSON.parse(raw) : [];
		return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'number') : [];
	} catch {
		return [];
	}
}

export const topicInterests = writable<number[]>(load());

if (browser) {
	topicInterests.subscribe((list) => {
		try {
			localStorage.setItem(KEY, JSON.stringify(list));
		} catch {
			/* private mode / blocked storage — ignore, UI still works */
		}
	});
}

export function toggleTopicInterest(id: number): void {
	topicInterests.update((list) =>
		list.includes(id) ? list.filter((x) => x !== id) : [...list, id]
	);
}
