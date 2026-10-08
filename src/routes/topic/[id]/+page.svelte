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

	$: id = data.id;
	$: topicName = data.topic?.topic_name ?? `Topic ${id}`;
	$: bc = data.topic?.subfield;
	$: following = $topicInterests.includes(id);

	let windowDays = 30;
	let status: StatusOpt = 'peer_reviewed';
	let papers: Paper[] = data.topic?.papers ?? [];
	let totalAvailable = data.topic?.total_available ?? 0;
	let loading = false;
	let errored = false;
	let initialized = false;

	async function loadPapers() {
		if (!browser) return;
		loading = true;
		errored = false;
		try {
			const r = await api.topicPapers(fetch, id, {
				window: windowDays,
				status: status === 'all' ? undefined : status,
				limit: 50
			});
			papers = r.papers;
			totalAvailable = r.total_available;
		} catch {
			errored = true;
			papers = [];
		}
		loading = false;
	}

	// The load() already fetched the default view; refetch only on later changes.
	let lastKey = '';
	$: if (browser) {
		const k = `${id}|${windowDays}|${status}`;
		if (!initialized) {
			initialized = true;
			lastKey = k;
		} else if (k !== lastKey) {
			lastKey = k;
			loadPapers();
		}
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
		No {status === 'all' ? '' : label(status).toLowerCase() + ' '}papers in the last {windowDays} days.
	</p>
{:else}
	{#each papers as p, i (p.id || i)}
		<PaperCard paper={p} index={i} />
	{/each}
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
	.feed-note {
		color: var(--ink-3);
		margin: 0 0 0.6rem;
	}
	.empty {
		padding-block: 2rem;
	}
</style>
