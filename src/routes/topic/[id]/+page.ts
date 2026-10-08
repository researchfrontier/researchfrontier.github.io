import { api } from '$lib/api';
import type { TopicPapers } from '$lib/types';

export const prerender = false;

export const load = async ({ fetch, params }) => {
	const id = Number(params.id);
	try {
		const topic = await api.topicPapers(fetch, id, { status: 'peer_reviewed', window: 30, limit: 15 });
		return { id, topic, apiError: false };
	} catch {
		return { id, topic: null as TopicPapers | null, apiError: true };
	}
};
