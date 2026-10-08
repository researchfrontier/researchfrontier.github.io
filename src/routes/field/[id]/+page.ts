import { api } from '$lib/api';
import type { Digest, Directions, PaperList } from '$lib/types';

// IDs are unknown at build time — this route is served by the SPA 404.html fallback.
export const prerender = false;

export const load = async ({ fetch, params, url }) => {
	const id = Number(params.id);
	const windowDays = Number(url.searchParams.get('w') ?? 30);
	try {
		const [papers, directions, digest] = await Promise.all([
			api.fieldPapers(fetch, id, { window: windowDays, limit: 100 }),
			api.fieldDirections(fetch, id, windowDays),
			api.fieldDigest(fetch, id)
		]);
		return { id, windowDays, papers, directions, digest, apiError: false };
	} catch {
		return {
			id,
			windowDays,
			papers: null as PaperList | null,
			directions: null as Directions | null,
			digest: null as Digest | null,
			apiError: true
		};
	}
};
