import { api } from '$lib/api';
import type { DomainNode, HotField } from '$lib/types';

export const load = async ({ fetch }) => {
	try {
		const [hot, tree] = await Promise.all([api.hotFields(fetch, 30, 12), api.taxonomyTree(fetch)]);
		// Coldest is a nice-to-have: keep its failure from blanking the home page (e.g.
		// the static frontend deployed before the backend has the /cold route yet).
		const cold = await api.coldFields(fetch, 8).catch(() => [] as HotField[]);
		return { hot, cold, tree, apiError: false };
	} catch {
		return {
			hot: [] as HotField[],
			cold: [] as HotField[],
			tree: [] as DomainNode[],
			apiError: true
		};
	}
};
