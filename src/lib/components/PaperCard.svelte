<script lang="ts">
	import { authorsLine, formatDate, venueTypeLabel } from '$lib/format';
	import type { Paper } from '$lib/types';
	import Badge from './Badge.svelte';

	export let paper: Paper;
	export let index = 0;

	$: href = paper.doi_url ?? paper.landing_page_url ?? undefined;
	// Venue type (journal / conference / book series) for a published venue — shown next
	// to the review badge. Null for preprints/repositories, so no label appears there.
	$: venueType = venueTypeLabel(paper.primary_source_type);
</script>

<article class="paper enter" style="animation-delay:{Math.min(index, 12) * 40}ms">
	<div class="paper__meta mono">
		<span>{formatDate(paper.publication_date)}</span>
		<span aria-hidden="true">·</span>
		<span>{paper.primary_source_name ?? '—'}</span>
		{#if paper.cited_by_count > 0}
			<span aria-hidden="true">·</span>
			<span>{paper.cited_by_count} cited</span>
		{/if}
	</div>

	<h3 class="paper__title">
		{#if href}
			<a {href} target="_blank" rel="noopener noreferrer">{paper.title}</a>
		{:else}
			{paper.title}
		{/if}
	</h3>

	<p class="paper__authors">{authorsLine(paper.authors)}</p>

	{#if paper.abstract}
		<p class="paper__abstract">{paper.abstract}</p>
	{/if}

	<div class="paper__foot">
		<Badge status={paper.review_status} confidence={paper.review_confidence} />
		{#if venueType}
			<span class="venue mono" title="Primary venue type">{venueType}</span>
		{/if}
		{#if paper.primary_topic}
			<span class="tag mono">{paper.primary_topic}</span>
		{/if}
		{#if paper.doi}
			<a class="doi mono" href={paper.doi_url ?? href} target="_blank" rel="noopener noreferrer">
				{paper.doi} ↗
			</a>
		{/if}
	</div>
</article>

<style>
	.paper {
		padding-block: 1.6rem;
		border-top: 1px solid var(--rule);
	}
	.paper__meta {
		color: var(--ink-3);
		display: flex;
		gap: 0.5ch;
		flex-wrap: wrap;
	}
	.paper__title {
		font-size: var(--step-1);
		margin: 0.35rem 0 0.3rem;
	}
	.paper__title a {
		background-image: linear-gradient(var(--accent), var(--accent));
		background-size: 0% 1.5px;
		background-position: 0 100%;
		background-repeat: no-repeat;
		transition:
			background-size 0.3s,
			color 0.2s;
	}
	.paper__title a:hover {
		background-size: 100% 1.5px;
		color: var(--accent);
	}
	.paper__authors {
		margin: 0.1rem 0;
		color: var(--ink-2);
		font-size: 0.95rem;
	}
	.paper__abstract {
		margin: 0.5rem 0 0.9rem;
		color: var(--ink-2);
		max-width: 68ch;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.paper__foot {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-wrap: wrap;
	}
	.venue {
		color: var(--ink-3);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		font-size: 0.72rem;
		padding: 0.08rem 0.5rem;
		border: 1px solid var(--rule-strong);
	}
	.tag {
		color: var(--ink-2);
		border-left: 2px solid var(--rule-strong);
		padding-left: 0.5rem;
	}
	.doi {
		color: var(--ink-3);
		margin-left: auto;
	}
	.doi:hover {
		color: var(--accent);
	}
</style>
