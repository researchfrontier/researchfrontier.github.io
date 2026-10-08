import { api } from '$lib/api';
import type { DomainNode, HotField } from '$lib/types';

export const load = async ({ fetch }) => {
	try {
		const [hot, tree] = await Promise.all([api.hotFields(fetch, 30, 12), api.taxonomyTree(fetch)]);
		return { hot, tree, apiError: false };
	} catch {
		return { hot: [] as HotField[], tree: [] as DomainNode[], apiError: true };
	}
};
