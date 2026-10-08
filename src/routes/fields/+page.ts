import { api } from '$lib/api';
import type { DomainNode } from '$lib/types';

export const load = async ({ fetch }) => {
	try {
		const tree = await api.taxonomyTree(fetch);
		return { tree, apiError: false };
	} catch {
		return { tree: [] as DomainNode[], apiError: true };
	}
};
