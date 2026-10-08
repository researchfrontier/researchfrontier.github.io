<script lang="ts">
	import { browser } from '$app/environment';
	import { base } from '$app/paths';
	import { api } from '$lib/api';
	import PaperCard from '$lib/components/PaperCard.svelte';
	import { STATUS_LABEL } from '$lib/format';
	import { toggleTopicInterest, topicInterests } from '$lib/stores/topicInterests';
	import type { Paper, ReviewStatus, TopicPapers } from '$lib/types';

	export let data: { id: number; topic: TopicPapers | null; apiError: boolean };

	type StatusOpt = ReviewStatus | 'all';
	const STATUS_OPTS: StatusOpt[] = ['peer_reviewed', 'preprint', 'preprint_published', 'all'];
	const label = (s: StatusOpt) => (s === 'all' ? 'All' : STATUS_LABEL[s]);

	type VenueOpt = 'all' | 'journal' | 'conference';
	const VENUE_OPTS: VenueOpt[] = ['all', 'journal', 'conference'];
	const venueLabel = (v: VenueOpt) =>
		v === 'all' ? 'All' : v === 'journal' ? 'Journal' : 'Conference';

	$: id = data.id;
	$: topicName = data.topic?.topic_name ?? `Topic ${id}`;
	$: bc = data.topic?.subfield;
	$: following = $topicInterests.includes(id);

	// Load 5 at a time; "Load more" grows the request. Search/status/window run on the
	// backend (OpenAlex), so they filter the WHOLE topic feed, not just the loaded rows.
	const PAGE_SIZE = 5;
	let windowDays = 30;
	let status: StatusOpt = 'peer_reviewed';
	let venue: VenueOpt = 'all';
	let search = '';
	let papers: Paper[] = data.topic?.papers ?? [];
	let totalAvailable = data.topic?.total_available ?? 0;
	let limit = PAGE_SIZE;
	let loading = false;
	let loadingMore = false;
	let noMore = !(data.topic?.has_more ?? false);
	let errored = false;
	let initialized = false;

	// Monotonic token: only the most recently started request may write state, so a
	// slow in-flight fetch can't overwrite the list for a newer filter/search/window.
	let reqSeq = 0;

	function paperOpts(lim: number) {
		return {
			window: windowDays,
			status: status === 'all' ? undefined : status,
			venue: venue === 'all' ? undefined : venue,
			search: search.trim() || undefined,
			limit: lim
		};
	}

	async function loadPapers() {
		if (!browser) return;
		const myReq = ++reqSeq;
		loading = true;
		loadingMore = false; // a full reload supersedes any pending "load more"
		errored = false;
		limit = PAGE_SIZE;
		try {
			const r = await api.topicPapers(fetch, id, paperOpts(limit));
			if (myReq !== reqSeq) return;
			papers = r.papers;
			totalAvailable = r.total_available;
			noMore = !r.has_more;
		} catch {
			if (myReq !== reqSeq) return;
			errored = true;
			papers = [];
			noMore = true;
		}
		if (myReq === reqSeq) loading = false;
	}

	async function loadMorePapers() {
		if (!browser) return;
		const myReq = ++reqSeq;
		loadingMore = true;
		const next = limit + PAGE_SIZE;
		try {
			const r = await api.topicPapers(fetch, id, paperOpts(next));
			if (myReq !== reqSeq) return;
			papers = r.papers;
			totalAvailable = r.total_available;
			noMore = !r.has_more;
			limit = next;
		} catch {
			/* keep current list */
		}
		if (myReq === reqSeq) loadingMore = false;
	}

	// The load() already fetched the default view; refetch only on later changes.
	let lastKey = '';
	$: if (browser) {
		const k = `${id}|${windowDays}|${status}|${venue}`;
		if (!initialized) {
			initialized = true;
			lastKey = k;
		} else if (k !== lastKey) {
			lastKey = k;
			loadPapers();
		}
	}

	let searchTimer: ReturnType<typeof setTimeout>;
	function onSearch() {
		clearTimeout(searchTimer);
		searchTimer = setTimeout(loadPapers, 350);
	}
</script>

<svelte:head><title>{topicName} - ResearchFrontier</title></svelte:head>

{#if data.apiError}
	<p class="banner mono">Can't reach the API. Reload once it's up.</p>
{/if}

<section class="head">
	<nav class="crumbs mono">
		<a href="{base}/fields/">Fields</a>
		{#if bc?.field_name}<span aria-hidden="true">/</span><span>{bc.field_name}</span>{/if}
		{#if bc?.subfield_id}
			<span aria-hidden="true">/</span>
			<a href="{base}/field/{bc.subfield_id}/">{bc.subfield_name}</a>
		{/if}
	</nav>

	<p class="eyebrow">Direction</p>
	<div class="head__row">
		<h1>{topicName}</h1>
		<button class="btn" class:btn--solid={following} on:click={() => toggleTopicInterest(id)}>
			{following ? '✓ Following' : 'Follow topic'}
		</button>
	</div>

	<div class="toolbar">
		<input
			class="search"
			type="search"
			placeholder="Search papers in {topicName}…"
			bind:value={search}
			on:input={onSearch}
			aria-label="Search papers"
		/>
		<div class="windows mono" aria-label="Time window">
			<button class:on={windowDays === 7} on:click={() => (windowDays = 7)}>7d</button>
			<button class:on={windowDays === 30} on:click={() => (windowDays = 30)}>30d</button>
		</div>
		<div class="facet">
			<span class="facet__label mono" id="status-facet-{id}">Status</span>
			<div class="cluster status-chips" role="group" aria-labelledby="status-facet-{id}">
				{#each STATUS_OPTS as s (s)}
					<button class="chip" aria-pressed={status === s} on:click={() => (status = s)}>
						{label(s)}
					</button>
				{/each}
			</div>
		</div>
		<div class="facet">
			<span class="facet__label mono" id="venue-facet-{id}">Venue</span>
			<div class="cluster status-chips" role="group" aria-labelledby="venue-facet-{id}">
				{#each VENUE_OPTS as v (v)}
					<button class="chip" aria-pressed={venue === v} on:click={() => (venue = v)}>
						{venueLabel(v)}
					</button>
				{/each}
			</div>
		</div>
	</div>
</section>

{#if totalAvailable > 0}
	<p class="feed-note mono">
		Newest {papers.length} of {totalAvailable.toLocaleString()} papers · last {windowDays} days
	</p>
{/if}

{#if loading}
	<p class="muted feed-note">Loading…</p>
{:else if errored}
	<p class="banner mono">Couldn't load papers. Try again.</p>
{:else if papers.length === 0}
	<p class="muted empty">
		No {status === 'all' ? '' : label(status).toLowerCase() + ' '}{venue === 'all'
			? ''
			: venueLabel(venue).toLowerCase() + ' '}papers{search.trim()
			? ` matching “${search}”`
			: ''} in the last {windowDays} days.
	</p>
{:else}
	{#each papers as p, i (p.id || i)}
		<PaperCard paper={p} index={i} />
	{/each}
	{#if !noMore}
		<div class="load-more">
			<button class="btn" on:click={loadMorePapers} disabled={loadingMore}>
				{loadingMore ? 'Loading…' : 'Load more papers'}
			</button>
		</div>
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
		flex-wrap: wrap;
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
		margin: 0.2rem 0 0;
	}
	.head__row .btn {
		flex-shrink: 0;
		white-space: nowrap;
	}
	.toolbar {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-wrap: wrap;
		margin-top: 1rem;
	}
	.search {
		flex: 1 1 240px;
		min-width: 0;
		font-family: var(--font-ui);
		font-size: 0.95rem;
		padding: 0.5rem 0.75rem;
		background: var(--paper-2);
		border: 1px solid var(--rule-strong);
		color: var(--ink);
	}
	.search:focus {
		border-color: var(--accent);
		outline: none;
	}
	.windows {
		display: flex;
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
	.status-chips {
		gap: 0.4rem;
	}
	.facet {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.facet__label {
		color: var(--ink-3);
		font-size: 0.72rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}
	.feed-note {
		color: var(--ink-3);
		margin: 0 0 0.6rem;
	}
	.load-more {
		margin-top: 1.5rem;
	}
	.empty {
		padding-block: 2rem;
	}
</style>
