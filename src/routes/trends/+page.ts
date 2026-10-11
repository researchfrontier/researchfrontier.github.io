import { api } from '$lib/api';
import type { TrendHot } from '$lib/types';

export const prerender = false;

export const load = async ({ fetch }) => {
	let hot: TrendHot | null = null;
	let apiError = false;
	try {
		hot = await api.trendsHot(fetch, 16);
	} catch {
		apiError = true;
	}
	return { hot, apiError };
};
