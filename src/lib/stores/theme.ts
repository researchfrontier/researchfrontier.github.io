import { browser } from '$app/environment';
import { writable } from 'svelte/store';

// null = follow the OS; otherwise an explicit override.
type Theme = 'light' | 'dark' | null;
const KEY = 'rf:theme';

function init(): Theme {
	if (!browser) return null;
	const v = localStorage.getItem(KEY);
	return v === 'light' || v === 'dark' ? v : null;
}

export const theme = writable<Theme>(init());

if (browser) {
	theme.subscribe((v) => {
		try {
			if (v) {
				localStorage.setItem(KEY, v);
				document.documentElement.setAttribute('data-theme', v);
			} else {
				localStorage.removeItem(KEY);
				document.documentElement.removeAttribute('data-theme');
			}
		} catch {
			/* ignore */
		}
	});
}

export function cycleTheme(): void {
	theme.update((t) => (t === 'light' ? 'dark' : t === 'dark' ? null : 'light'));
}
