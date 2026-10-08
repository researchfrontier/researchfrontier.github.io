import type { Author, ReviewStatus } from './types';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDate(iso?: string | null): string {
	if (!iso) return '';
	const [y, m, d] = iso.split('-').map(Number);
	if (!y || !m || !d) return iso;
	return `${d} ${MONTHS[m - 1]} ${y}`;
}

export function authorsLine(authors: Author[]): string {
	const names = authors.map((a) => a.name).filter(Boolean);
	if (names.length === 0) return 'Unknown authors';
	if (names.length <= 3) return names.join(', ');
	return `${names[0]} et al.`;
}

export const STATUS_LABEL: Record<ReviewStatus, string> = {
	peer_reviewed: 'Peer-reviewed',
	preprint_published: 'Preprint · published',
	preprint: 'Preprint',
	retracted: 'Retracted',
	unknown: 'Unverified'
};

export function signed(n: number): string {
	return n > 0 ? `+${n}` : `${n}`;
}

// Primary-venue type labels (OpenAlex source.type). The peer-reviewed venue types —
// journal / conference / book series — are shown as a label on a paper and are the
// values offered in the venue filter. Preprints/repositories/other get no label.
export const VENUE_LABEL: Record<string, string> = {
	journal: 'Journal',
	conference: 'Conference',
	'book series': 'Book series'
};

export function venueTypeLabel(type?: string | null): string | null {
	if (!type) return null;
	return VENUE_LABEL[type] ?? null;
}
