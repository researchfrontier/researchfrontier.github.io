import { api } from '$lib/api';
import type { TrendHistory, TrendHot } from '$lib/types';

export const prerender = false;

export const load = async ({ fetch }) => {
	let hot: TrendHot | null = null;
	let history: TrendHistory | null = null;
	let apiError = false;
	try {
		hot = await api.trendsHot(fetch, 16);
	} catch {
		apiError = true;
	}
	// History is non-fatal: if its table isn't populated yet the chart just shows an
	// "accruing" note, and the rest of the page still works.
	try {
		history = await api.trendsHistory(fetch, 6);
	} catch {
		history = null;
	}
	return { hot, history, apiError };
};
