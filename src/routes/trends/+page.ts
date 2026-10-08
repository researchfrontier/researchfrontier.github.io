import { api } from '$lib/api';
import type { TrendHot } from '$lib/types';

export const prerender = false;

export const load = async ({ fetch }) => {
	try {
		const hot = await api.trendsHot(fetch, 16);
		return { hot, apiError: false };
	} catch {
		return { hot: null as TrendHot | null, apiError: true };
	}
};
