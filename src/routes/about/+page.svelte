<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { api } from '$lib/api';
	import Badge from '$lib/components/Badge.svelte';
	import type { Limits, ReviewStatus } from '$lib/types';

	let limits: Limits | null = null;
	onMount(async () => {
		try {
			limits = await api.limits(fetch);
		} catch {
			/* leave null — section stays hidden */
		}
	});

	const legend: { status: ReviewStatus; note: string }[] = [
		{ status: 'peer_reviewed', note: 'Published in a journal or conference — version of record.' },
		{ status: 'preprint_published', note: 'Started as a preprint; a peer-reviewed version now exists.' },
		{ status: 'preprint', note: 'Preprint / posted content (arXiv, bioRxiv…). Not yet peer reviewed.' },
		{ status: 'retracted', note: 'Retracted or under an expression of concern. Read with care.' },
		{ status: 'unknown', note: 'Metadata insufficient to verify — check at the source.' }
	];
</script>

<svelte:head><title>About - ResearchFrontier</title></svelte:head>

<article class="prose">
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

	<h2>Sources &amp; data licensing</h2>
	<p>
		Paper data is aggregated from authoritative open sources and stored only as
		<strong>metadata</strong> — we never host PDFs or full text. Every paper links out to its DOI
		or source.
	</p>
	<ul class="sources">
		<li>
			<strong>OpenAlex</strong> — the backbone: field taxonomy, works and DOIs. Released under
			<a href="https://help.openalex.org/data/licenses/" target="_blank" rel="noopener noreferrer">CC0</a>
			(public domain).
		</li>
		<li>
			<strong>arXiv</strong> — preprint metadata, under
			<a href="https://info.arxiv.org/help/license/index.html" target="_blank" rel="noopener noreferrer">CC0</a>.
			Full text stays on arXiv.org; we only link to it.
		</li>
		<li>
			<strong>Crossref</strong> — DOI and publication-type signals (open metadata).
		</li>
	</ul>
	<p class="muted small">
		Metadata from these sources is openly licensed for reuse. Abstracts are shown to help you
		decide what to read; their underlying rights may rest with authors or publishers, so for the
		full text always follow the DOI to the source.
	</p>

	<h2>Limits</h2>
	<p>
		The app runs entirely on free tiers. These are the plan limits (documented), with a few
		<strong>live</strong> numbers read safely server-side — no API keys are ever exposed to the
		browser.
	</p>
	{#if limits}
		<div class="limits">
			{#each limits.services as s (s.service)}
				<div class="limit-block">
					<div class="limit-head spread">
						<span class="limit-name">{s.service}</span>
						<span class="mono muted">{s.plan}</span>
					</div>
					<ul class="limit-items">
						{#each s.items as it (it.label)}
							<li class="limit-item">
								<span class="limit-label">{it.label}</span>
								<span class="mono limit-vals">
									{#if it.live}<span class="live-dot" title="live"></span>{/if}
									{#if it.now !== '—'}<b>{it.now}</b> · {/if}{it.limit}
								</span>
							</li>
						{/each}
					</ul>
					{#if s.note}<p class="limit-note muted">{s.note}</p>{/if}
				</div>
			{/each}
		</div>
	{:else}
		<p class="muted small">Live limits unavailable right now.</p>
	{/if}

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
	.sources {
		margin: 0.5rem 0 0.75rem;
		padding-left: 1.1rem;
	}
	.sources li {
		margin-bottom: 0.45rem;
		color: var(--ink-2);
	}
	.sources a {
		color: var(--accent);
	}
	.limits {
		margin: 0.5rem 0 0;
	}
	.limit-block {
		padding-block: 1rem;
		border-top: 1px solid var(--rule);
	}
	.limit-head {
		margin-bottom: 0.4rem;
	}
	.limit-name {
		font-family: var(--font-display);
		font-size: 1.15rem;
		color: var(--ink);
	}
	.limit-items {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.limit-item {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		padding-block: 0.25rem;
		color: var(--ink-2);
	}
	.limit-vals {
		color: var(--ink-3);
		white-space: nowrap;
	}
	.limit-vals b {
		color: var(--ink);
		font-weight: 500;
	}
	.live-dot {
		display: inline-block;
		width: 0.5em;
		height: 0.5em;
		border-radius: 50%;
		background: var(--good);
		margin-right: 0.4ch;
		vertical-align: middle;
	}
	.limit-note {
		font-size: 0.85rem;
		margin-top: 0.3rem;
	}
</style>
