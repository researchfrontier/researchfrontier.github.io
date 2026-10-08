<script lang="ts">
	import { browser } from '$app/environment';
	import { base } from '$app/paths';
	import { api } from '$lib/api';
	import Directions from '$lib/components/Directions.svelte';
	import PaperCard from '$lib/components/PaperCard.svelte';
	import { STATUS_LABEL } from '$lib/format';
	import { interests, toggleInterest } from '$lib/stores/interests';
	import type { Digest, Directions as Dir, Paper, ReviewStatus } from '$lib/types';

	export let data: { id: number; directions: Dir | null; digest: Digest | null; apiError: boolean };

	type StatusOpt = ReviewStatus | 'all';
	const STATUS_OPTS: StatusOpt[] = ['peer_reviewed', 'preprint', 'preprint_published', 'all'];
	const label = (s: StatusOpt) => (s === 'all' ? 'All' : STATUS_LABEL[s]);

	$: id = data.id;
	$: bc = data.directions?.subfield ?? data.digest?.subfield;
	$: name = bc?.subfield_name ?? `Field ${id}`;
	$: following = $interests.includes(id);

	let tab: 'papers' | 'directions' | 'digest' = 'directions';

	// --- papers (fetched live, reactive to window/status/search) ---
	// Load 15 at a time; "Load more" grows the request. The search/status/window all
	// run on the backend (OpenAlex), so they filter the WHOLE field feed, not just the
	// rows already loaded.
	const PAGE_SIZE = 15;
	let windowDays = 30;
	let status: StatusOpt = 'peer_reviewed';
	let search = '';
	let papers: Paper[] = [];
	let totalAvailable = 0;
	let limit = PAGE_SIZE;
	let loadingPapers = false;
	let loadingMore = false;
	let noMore = false;
	let papersError = false;

	// Monotonic token: only the most recently started request may write state, so a
	// slow in-flight fetch can't overwrite the list for a newer filter/search/window.
	let reqSeq = 0;

	function paperOpts(lim: number) {
		return {
			window: windowDays,
			status: status === 'all' ? undefined : status,
			search: search.trim() || undefined,
			limit: lim
		};
	}

	async function loadPapers() {
		if (!browser) return;
		const myReq = ++reqSeq;
		loadingPapers = true;
		loadingMore = false; // a full reload supersedes any pending "load more"
		papersError = false;
		limit = PAGE_SIZE;
		try {
			const r = await api.fieldPapers(fetch, id, paperOpts(limit));
			if (myReq !== reqSeq) return;
			papers = r.papers;
			totalAvailable = r.total_available;
			noMore = !r.has_more;
		} catch {
			if (myReq !== reqSeq) return;
			papersError = true;
			papers = [];
			noMore = true;
		}
		if (myReq === reqSeq) loadingPapers = false;
	}

	async function loadMorePapers() {
		if (!browser) return;
		const myReq = ++reqSeq;
		loadingMore = true;
		const next = limit + PAGE_SIZE;
		try {
			const r = await api.fieldPapers(fetch, id, paperOpts(next));
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

	// Reload when field / window / status changes (search is debounced separately).
	// Gated on the Papers tab so we don't fire a live OpenAlex fetch for a hidden tab
	// now that Directions is the default — the first load happens when Papers is opened.
	let lastKey = '';
	$: if (browser && tab === 'papers') {
		const k = `${id}|${windowDays}|${status}`;
		if (k !== lastKey) {
			lastKey = k;
			loadPapers();
		}
	}

	let searchTimer: ReturnType<typeof setTimeout>;
	function onSearch() {
		clearTimeout(searchTimer);
		searchTimer = setTimeout(loadPapers, 350);
	}

	// --- directions tab: client-side filter over the already-loaded topic list ---
	let dirSearch = '';
	$: dirFiltered = (() => {
		const all = data.directions?.directions ?? [];
		const q = dirSearch.trim().toLowerCase();
		if (!q) return all;
		return all.filter(
			(d) =>
				d.topic_name.toLowerCase().includes(q) ||
				(d.keywords ?? []).some((k) => k.toLowerCase().includes(q))
		);
	})();

	// --- digest status filter (client-side over the stored edition) ---
	// Default to 'all' so the count shown matches the edition's headline (the brief is
	// a small curated set; narrowing by status is opt-in).
	let digestStatus: StatusOpt = 'all';
	$: digestPapers =
		data.digest == null
			? []
			: digestStatus === 'all'
				? data.digest.papers
				: data.digest.papers.filter((p) => p.review_status === digestStatus);
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
		<button class="btn" class:btn--solid={following} on:click={() => toggleInterest(id)}>
			{following ? '✓ Following' : 'Follow field'}
		</button>
	</div>

	<div class="tabs" role="tablist">
		<button role="tab" aria-selected={tab === 'directions'} on:click={() => (tab = 'directions')}>
			Directions
		</button>
		<button role="tab" aria-selected={tab === 'papers'} on:click={() => (tab = 'papers')}>Papers</button>
		<button role="tab" aria-selected={tab === 'digest'} on:click={() => (tab = 'digest')}>Digest</button>
	</div>
</section>

{#if tab === 'papers'}
	<div class="papers-toolbar">
		<input
			class="search"
			type="search"
			placeholder="Search papers in {name}…"
			bind:value={search}
			on:input={onSearch}
			aria-label="Search papers"
		/>
		<div class="toolbar-right">
			<div class="windows mono" aria-label="Time window">
				<button class:on={windowDays === 7} on:click={() => (windowDays = 7)}>7d</button>
				<button class:on={windowDays === 30} on:click={() => (windowDays = 30)}>30d</button>
			</div>
			<div class="cluster status-chips">
				{#each STATUS_OPTS as s (s)}
					<button class="chip" aria-pressed={status === s} on:click={() => (status = s)}>
						{label(s)}
					</button>
				{/each}
			</div>
		</div>
	</div>

	{#if totalAvailable > 0}
		<p class="feed-note mono">
			Newest {papers.length} of {totalAvailable.toLocaleString()} papers · last {windowDays} days
		</p>
	{/if}

	{#if loadingPapers}
		<p class="muted feed-note">Loading…</p>
	{:else if papersError}
		<p class="banner mono">Couldn't load papers. Try again.</p>
	{:else if papers.length === 0}
		<p class="muted empty">
			No {status === 'all' ? '' : label(status).toLowerCase() + ' '}papers{search
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
{:else if tab === 'directions'}
	<div class="papers-toolbar">
		<input
			class="search"
			type="search"
			placeholder="Search directions in {name}…"
			bind:value={dirSearch}
			aria-label="Search directions"
		/>
	</div>
	<p class="section-lede muted">
		Topics ranked by true recent output (last 30 days). Click a topic to see its papers.
	</p>
	{#if dirFiltered.length === 0 && dirSearch.trim()}
		<p class="muted empty">No directions matching “{dirSearch}”.</p>
	{:else if data.directions}
		<Directions directions={dirFiltered} />
	{/if}
{:else}
	{#if data.digest}
		<div class="cluster status-chips digest-filter">
			{#each STATUS_OPTS as s (s)}
				<button class="chip" aria-pressed={digestStatus === s} on:click={() => (digestStatus = s)}>
					{label(s)}
				</button>
			{/each}
		</div>
		<article class="digest">
			<div class="eyebrow">
				Brief · {data.digest.edition_date}{#if data.digest.generated} · live{/if}
			</div>
			<h2 class="digest__headline">{data.digest.headline}</h2>
			{#if data.digest.summary}<p class="digest__summary">{data.digest.summary}</p>{/if}
			{#if data.digest.papers.length > 0}
				<p class="feed-note mono">
					{digestPapers.length}{digestStatus !== 'all'
						? ` of ${data.digest.papers.length}`
						: ''}
					{data.digest.papers.length === 1 ? 'paper' : 'papers'} in this brief
				</p>
			{/if}
			{#if digestPapers.length === 0}
				<p class="muted empty">
					No {digestStatus === 'all' ? '' : label(digestStatus).toLowerCase() + ' '}papers in this
					edition.
				</p>
			{:else}
				{#each digestPapers as p, i (p.id || i)}
					<PaperCard paper={p} index={i} />
				{/each}
			{/if}
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
	.tabs {
		display: flex;
		gap: 1.3rem;
		margin-top: 1.1rem;
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

	.papers-toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		flex-wrap: wrap;
		margin-bottom: 0.6rem;
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
	.toolbar-right {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-wrap: wrap;
		justify-content: flex-end;
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
	.digest-filter {
		margin-bottom: 0.4rem;
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
