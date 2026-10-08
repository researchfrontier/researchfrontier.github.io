import { API_BASE } from './config';
import type {
	Breadcrumb,
	Digest,
	Directions,
	DomainNode,
	HotField,
	InstitutionFieldsOut,
	InstitutionHit,
	Limits,
	Paper,
	PaperList,
	TopicPapers,
	TrendFieldDetail,
	TrendHistory,
	TrendHot
} from './types';

type Fetch = typeof fetch;

async function get<T>(f: Fetch, path: string): Promise<T> {
	const res = await f(`${API_BASE}${path}`, { headers: { accept: 'application/json' } });
	if (!res.ok) {
		throw new Error(`API ${res.status} on ${path}`);
	}
	return (await res.json()) as T;
}

const qs = (params: Record<string, string | number | undefined>) => {
	const u = new URLSearchParams();
	for (const [k, v] of Object.entries(params)) {
		if (v !== undefined && v !== null && v !== '') u.set(k, String(v));
	}
	const s = u.toString();
	return s ? `?${s}` : '';
};

export const api = {
	taxonomyTree: (f: Fetch) => get<DomainNode[]>(f, '/api/taxonomy/tree'),
	limits: (f: Fetch) => get<Limits>(f, '/api/limits'),
	breadcrumb: (f: Fetch, id: number) => get<Breadcrumb>(f, `/api/taxonomy/subfields/${id}`),
	hotFields: (f: Fetch, window = 30, limit = 12) =>
		get<HotField[]>(f, `/api/fields/hot${qs({ window, limit })}`),
	coldFields: (f: Fetch, limit = 12) => get<HotField[]>(f, `/api/fields/cold${qs({ limit })}`),
	fieldPapers: (
		f: Fetch,
		id: number,
		opts: { window?: number; status?: string; venue?: string; search?: string; limit?: number } = {}
	) => get<PaperList>(f, `/api/fields/${id}/papers${qs(opts)}`),
	fieldDirections: (f: Fetch, id: number, window = 30) =>
		get<Directions>(f, `/api/fields/${id}/directions${qs({ window })}`),
	fieldDigest: (f: Fetch, id: number) => get<Digest>(f, `/api/fields/${id}/digest`),
	topicPapers: (
		f: Fetch,
		id: number,
		opts: { window?: number; status?: string; venue?: string; search?: string; limit?: number } = {}
	) => get<TopicPapers>(f, `/api/topics/${id}/papers${qs(opts)}`),
	paper: (f: Fetch, id: number) => get<Paper>(f, `/api/papers/${id}`),
	trendsHot: (f: Fetch, limit = 12) => get<TrendHot>(f, `/api/trends/hot${qs({ limit })}`),
	trendsHistory: (f: Fetch, limit = 6) => get<TrendHistory>(f, `/api/trends/history${qs({ limit })}`),
	trendsField: (f: Fetch, id: number) => get<TrendFieldDetail>(f, `/api/trends/fields/${id}`),
	institutionSearch: (f: Fetch, q: string) =>
		get<InstitutionHit[]>(f, `/api/trends/institutions${qs({ q })}`),
	institutionFields: (f: Fetch, id: string) =>
		get<InstitutionFieldsOut>(f, `/api/trends/institutions/${id}`)
};
