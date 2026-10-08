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
