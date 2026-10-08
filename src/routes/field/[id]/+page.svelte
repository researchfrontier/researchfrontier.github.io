<script lang="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import Directions from '$lib/components/Directions.svelte';
	import PaperCard from '$lib/components/PaperCard.svelte';
	import { STATUS_LABEL } from '$lib/format';
	import { interests, toggleInterest } from '$lib/stores/interests';
	import type { Digest, Directions as Dir, PaperList, ReviewStatus } from '$lib/types';

	export let data: {
		id: number;
		windowDays: number;
		papers: PaperList | null;
		directions: Dir | null;
		digest: Digest | null;
		apiError: boolean;
	};

	let tab: 'papers' | 'directions' | 'digest' = 'papers';
	let status: ReviewStatus | 'all' = 'all';

	$: bc = data.papers?.subfield;
	$: name = bc?.subfield_name ?? `Field ${data.id}`;
	$: allPapers = data.papers?.papers ?? [];
	$: statuses = Array.from(new Set(allPapers.map((p) => p.review_status))) as ReviewStatus[];
	$: shown = status === 'all' ? allPapers : allPapers.filter((p) => p.review_status === status);
	$: following = $interests.includes(data.id);

	function setWindow(w: number) {
		goto(`${base}/field/${data.id}/?w=${w}`, { keepFocus: true, noScroll: true });
	}
</script>

<svelte:head><title>{name} - ResearchFrontier</title></svelte:head>

{#if data.apiError}
	<p class="banner mono">Can't reach the API. Start the backend and reload.</p>
{/if}

<section class="head">
	<nav class="crumbs mono">
		<a href="{base}/fields/">Fields</a>
		{#if bc?.domain_name}<span aria-hidden="true">/</span><span>{bc.domain_name}</span>{/if}
		{#if bc?.field_name}<span aria-hidden="true">/</span><span>{bc.field_name}</span>{/if}
	</nav>

	<div class="head__row">
		<h1>{name}</h1>
		<button class="btn" class:btn--solid={following} on:click={() => toggleInterest(data.id)}>
			{following ? '✓ Following' : 'Follow field'}
		</button>
	</div>

	<div class="controls">
		<div class="tabs" role="tablist">
			<button role="tab" aria-selected={tab === 'papers'} on:click={() => (tab = 'papers')}>
				Papers{#if data.papers}&nbsp;<span class="mono">{data.papers.total}</span>{/if}
			</button>
			<button role="tab" aria-selected={tab === 'directions'} on:click={() => (tab = 'directions')}>
				Directions
			</button>
			<button role="tab" aria-selected={tab === 'digest'} on:click={() => (tab = 'digest')}>
				Digest
			</button>
		</div>

		{#if tab !== 'digest'}
			<div class="windows mono" aria-label="Time window">
				<button class:on={data.windowDays === 7} on:click={() => setWindow(7)}>7d</button>
				<button class:on={data.windowDays === 30} on:click={() => setWindow(30)}>30d</button>
			</div>
		{/if}
	</div>
</section>

{#if tab === 'papers'}
	{#if data.papers && data.papers.total_available > 0}
		<p class="feed-note mono">
			Newest {allPapers.length} of {data.papers.total_available.toLocaleString()} papers · last {data.windowDays} days
		</p>
	{/if}
	{#if statuses.length > 1}
		<div class="filters cluster">
			<button class="chip" aria-pressed={status === 'all'} on:click={() => (status = 'all')}>
				All
			</button>
			{#each statuses as s (s)}
				<button class="chip" aria-pressed={status === s} on:click={() => (status = s)}>
					{STATUS_LABEL[s]}
				</button>
			{/each}
		</div>
	{/if}

	{#if shown.length === 0}
		<p class="muted empty">No papers in the last {data.windowDays} days for this view.</p>
	{:else}
		{#each shown as p, i (p.id)}
			<PaperCard paper={p} index={i} />
		{/each}
	{/if}
{:else if tab === 'directions'}
	<p class="section-lede muted">
		Topics ranked by output over the last {data.windowDays} days, with the change vs the previous
		{data.windowDays} days — where attention is shifting.
	</p>
	{#if data.directions}
		<Directions directions={data.directions.directions} />
	{/if}
{:else}
	<!-- digest -->
	{#if data.digest}
		<article class="digest">
			<div class="eyebrow">
				Brief · {data.digest.edition_date}
				{#if data.digest.generated}· live{/if}
			</div>
			<h2 class="digest__headline">{data.digest.headline}</h2>
			{#if data.digest.summary}<p class="digest__summary">{data.digest.summary}</p>{/if}
			{#each data.digest.papers as p, i (p.id)}
				<PaperCard paper={p} index={i} />
			{/each}
		</article>
	{/if}
{/if}

<style>
	.head {
		border-bottom: 1px solid var(--rule-strong);
		padding-bottom: 1rem;
		margin-bottom: 1rem;
	}
	.crumbs {
		display: flex;
		gap: 0.6ch;
		color: var(--ink-3);
		margin-bottom: 0.6rem;
	}
	.crumbs a:hover {
		color: var(--accent);
	}
	.head__row {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 1rem;
		flex-wrap: wrap;
	}
	.head h1 {
		font-size: var(--step-3);
	}
	.controls {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin-top: 1.1rem;
		flex-wrap: wrap;
	}
	.tabs {
		display: flex;
		gap: 1.3rem;
	}
	.tabs button {
		background: none;
		border: none;
		padding: 0 0 0.35rem;
		font-family: var(--font-ui);
		font-size: 1rem;
		color: var(--ink-3);
		border-bottom: 2px solid transparent;
		cursor: pointer;
	}
	.tabs button[aria-selected='true'] {
		color: var(--ink);
		border-color: var(--accent);
	}
	.windows {
		display: flex;
		gap: 0;
		border: 1px solid var(--rule-strong);
	}
	.windows button {
		background: none;
		border: none;
		padding: 0.3rem 0.7rem;
		color: var(--ink-3);
		cursor: pointer;
		font-family: var(--font-mono);
	}
	.windows button.on {
		background: var(--ink);
		color: var(--paper);
	}
	.filters {
		margin-bottom: 0.2rem;
	}
	.feed-note {
		color: var(--ink-3);
		margin: 0 0 0.6rem;
	}
	.empty {
		padding-block: 2rem;
	}
	.section-lede {
		max-width: 64ch;
		margin: 0.3rem 0 0.5rem;
	}
	.digest__headline {
		font-size: var(--step-2);
		margin: 0.4rem 0 0.4rem;
	}
	.digest__summary {
		max-width: 64ch;
		color: var(--ink-2);
		margin-bottom: 0.5rem;
	}
</style>
