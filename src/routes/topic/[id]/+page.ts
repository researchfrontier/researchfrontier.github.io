import { api } from '$lib/api';
import type { TopicPapers } from '$lib/types';

export const prerender = false;

export const load = async ({ fetch, params }) => {
	const id = Number(params.id);
	try {
		// Initial page size must match the component's PAGE_SIZE (5); "Load more" grows it.
		const topic = await api.topicPapers(fetch, id, { status: 'peer_reviewed', window: 30, limit: 5 });
		return { id, topic, apiError: false };
	} catch {
		return { id, topic: null as TopicPapers | null, apiError: true };
	}
};
