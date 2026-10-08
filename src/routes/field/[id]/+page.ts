import { api } from '$lib/api';
import type { Digest, Directions } from '$lib/types';

// IDs are unknown at build time — this route is served by the SPA 404.html fallback.
export const prerender = false;

export const load = async ({ fetch, params }) => {
	const id = Number(params.id);
	// Papers are fetched client-side (they react to window/status/search); load the
	// aggregate views (directions, digest) that also carry the field breadcrumb.
	try {
		const [directions, digest] = await Promise.all([
			api.fieldDirections(fetch, id, 30),
			api.fieldDigest(fetch, id)
		]);
		return { id, directions, digest, apiError: false };
	} catch {
		return { id, directions: null as Directions | null, digest: null as Digest | null, apiError: true };
	}
};
