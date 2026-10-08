// Mirrors the backend Pydantic schemas. In a later phase this file is generated
// from the API's /openapi.json (orval -> TanStack Query); hand-written for the slice.

export type ReviewStatus =
	| 'peer_reviewed'
	| 'preprint_published'
	| 'preprint'
	| 'retracted'
	| 'unknown';

export interface Author {
	name: string;
	position?: string | null;
}

export interface Breadcrumb {
	domain_id?: number | null;
	domain_name?: string | null;
	field_id?: number | null;
	field_name?: string | null;
	subfield_id?: number | null;
	subfield_name?: string | null;
	subfield_description?: string | null;
	subfield_wikipedia_url?: string | null;
	subfield_wikidata_id?: string | null;
}

export interface Paper {
	id: number;
	title: string;
	abstract?: string | null;
	authors: Author[];
	doi?: string | null;
	doi_url?: string | null;
	published_doi?: string | null;
	publication_date?: string | null;
	cited_by_count: number;
	primary_source_name?: string | null;
	primary_source_type?: string | null;
	landing_page_url?: string | null;
	pdf_url?: string | null;
	is_oa: boolean;
	review_status: ReviewStatus;
	review_confidence: string;
	review_evidence: Record<string, unknown>;
	primary_topic?: string | null;
}

export interface PaperList {
	subfield: Breadcrumb;
	window_days: number;
	reference_date: string;
	total: number;
	total_available: number;
	has_more: boolean;
	papers: Paper[];
}

export interface TopicPapers {
	topic_id: number;
	topic_name: string;
	subfield: Breadcrumb;
	window_days: number;
	total_available: number;
	has_more: boolean;
	papers: Paper[];
}

export interface Direction {
	topic_id: number;
	topic_name: string;
	count: number;
	share: number;
	delta: number;
	keywords: string[];
}

export interface Directions {
	subfield: Breadcrumb;
	window_days: number;
	reference_date: string;
	total: number;
	directions: Direction[];
}

export interface HotField {
	subfield_id: number;
	subfield_name: string;
	field_id: number;
	field_name: string;
	domain_name: string;
	count: number;
	prev_count: number;
	delta: number;
	momentum: number;
}

export interface SubfieldNode {
	id: number;
	name: string;
	works_count: number;
}
export interface FieldNode {
	id: number;
	name: string;
	works_count: number;
	subfields: SubfieldNode[];
}
export interface DomainNode {
	id: number;
	name: string;
	works_count: number;
	fields: FieldNode[];
}

export interface LimitItem {
	label: string;
	now: string;
	limit: string;
	live: boolean;
}
export interface ServiceLimit {
	service: string;
	plan: string;
	items: LimitItem[];
	note?: string | null;
}
export interface Limits {
	services: ServiceLimit[];
}

export interface TrendYearPoint {
	year: number;
	count: number;
}
export interface TrendField {
	subfield_id: number;
	subfield_name: string;
	field_name?: string | null;
	domain_name?: string | null;
	count_30d: number;
	prev_30d: number;
	momentum: number;
	years: TrendYearPoint[];
}
export interface TrendHot {
	fields: TrendField[];
}
export interface TrendRankItem {
	rank: number;
	name: string;
	key: string;
	count: number;
}
export interface TrendCitedItem {
	rank: number;
	title: string;
	doi?: string | null;
	url?: string | null;
	cited_by_count: number;
	year?: number | null;
}
export interface TrendMomentumPoint {
	date: string;
	works_30d: number;
}
export interface TrendTopic {
	topic_id: number;
	topic_name: string;
	count: number;
}
export interface TrendFieldDetail {
	subfield: Breadcrumb;
	years: TrendYearPoint[];
	momentum: TrendMomentumPoint[];
	top_topics: TrendTopic[];
	most_cited: TrendCitedItem[];
	institutions: TrendRankItem[];
	countries: TrendRankItem[];
}
export interface TrendSeriesPoint {
	date: string;
	value: number;
}
export interface TrendSeries {
	subfield_id: number;
	name: string;
	points: TrendSeriesPoint[];
}
export interface TrendHistory {
	series: TrendSeries[];
}

export interface InstitutionHit {
	id: string;
	name?: string | null;
	country_code?: string | null;
	works_count: number;
}
export interface InstitutionFieldItem {
	subfield_id?: number | null;
	name?: string | null;
	count: number;
}
export interface InstitutionFieldsOut {
	id: string;
	fields: InstitutionFieldItem[];
}

export interface Digest {
	subfield: Breadcrumb;
	edition_date: string;
	window_days: number;
	headline?: string | null;
	summary?: string | null;
	stats: Record<string, unknown>;
	papers: Paper[];
	generated: boolean;
}
