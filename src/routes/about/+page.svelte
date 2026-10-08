<script lang="ts">
	import { base } from '$app/paths';
	import Badge from '$lib/components/Badge.svelte';
	import type { ReviewStatus } from '$lib/types';

	const legend: { status: ReviewStatus; note: string }[] = [
		{ status: 'peer_reviewed', note: 'Published in a journal or conference — version of record.' },
		{ status: 'preprint_published', note: 'Started as a preprint; a peer-reviewed version now exists.' },
		{ status: 'preprint', note: 'Preprint / posted content (arXiv, bioRxiv…). Not yet peer reviewed.' },
		{ status: 'retracted', note: 'Retracted or under an expression of concern. Read with care.' },
		{ status: 'unknown', note: 'Metadata insufficient to verify — check at the source.' }
	];
</script>

<svelte:head><title>About — ResearchFrontier</title></svelte:head>

<article class="prose">
	<p class="eyebrow">About</p>
	<h1>A front door to the frontier.</h1>

	<p class="lede">
		ResearchFrontier is a simplified way into the current state of a research field. It is
		<em>not</em> a replacement for reading the papers — every item links to its DOI so you go
		straight to the source. It helps you see, at a glance, what is new this week, where the field
		is moving, and which claims are peer-reviewed versus still preprints.
	</p>

	<h2>How it works</h2>
	<p>
		Fields follow the <strong>OpenAlex</strong> taxonomy (domain → field → subfield → topic), which
		is continuously maintained, so new and emerging areas appear on their own as they form. Papers
		are aggregated from authoritative sources — OpenAlex as the backbone, with arXiv and Crossref
		for freshness and provenance — deduplicated on DOI, and classified into that taxonomy.
	</p>

	<h2>What the badges mean</h2>
	<ul class="legend">
		{#each legend as l (l.status)}
			<li class="legend__row">
				<Badge status={l.status} />
				<span class="muted">{l.note}</span>
			</li>
		{/each}
	</ul>
	<p class="muted small">
		Status is derived from metadata (venue type, version, work type, retraction flags), never
		guessed, and stored with a confidence level you can see on hover.
	</p>

	<h2>The digest</h2>
	<p>
		For the fields you follow, a short brief is assembled every Monday, Wednesday and Friday — the
		notable new work, the leading directions, and the peer-review mix — readable in a minute.
	</p>

	<h2>Roadmap</h2>
	<p class="muted">
		This is phase one (a thin slice): browse, follow fields, see fresh papers and directions, read
		the in-app brief. Next: sign in with ORCID or Google, personalised home and digest seeded from
		your ORCID record, and more sources (bioRxiv/medRxiv, Europe PMC) with retraction monitoring.
	</p>

	<p><a class="btn btn--solid" href="{base}/fields/">Choose your fields →</a></p>
</article>

<style>
	.prose {
		max-width: 68ch;
	}
	.prose h1 {
		font-size: var(--step-3);
		margin: 0.4rem 0 1rem;
	}
	.prose h2 {
		font-size: var(--step-2);
		margin: 2rem 0 0.5rem;
	}
	.prose p {
		color: var(--ink-2);
	}
	.lede {
		font-size: var(--step-1);
		color: var(--ink) !important;
	}
	.legend {
		list-style: none;
		margin: 0.5rem 0;
		padding: 0;
	}
	.legend__row {
		display: flex;
		align-items: center;
		gap: 0.9rem;
		padding-block: 0.5rem;
		border-top: 1px solid var(--rule);
	}
	.small {
		font-size: 0.85rem;
	}
</style>
