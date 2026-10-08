import { browser } from '$app/environment';
import { writable } from 'svelte/store';

// Phase 1 keeps the user's chosen research fields client-side in localStorage.
// Phase 2 migrates this to the server (ORCID/Google account + preferences).
const KEY = 'rf:interests:v1';

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

export const interests = writable<number[]>(load());

if (browser) {
	interests.subscribe((list) => {
		try {
			localStorage.setItem(KEY, JSON.stringify(list));
		} catch {
			/* private mode / blocked storage — ignore, UI still works */
		}
	});
}

export function toggleInterest(id: number): void {
	interests.update((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]));
}
