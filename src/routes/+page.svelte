<script lang="ts">
	import { base } from '$app/paths';
	import { signed } from '$lib/format';
	import { interests, toggleInterest } from '$lib/stores/interests';
	import type { DomainNode } from '$lib/types';

	export let data: { hot: import('$lib/types').HotField[]; tree: DomainNode[]; apiError: boolean };

	// id -> label, so followed fields can be shown by name on the home page.
	$: nameMap = (() => {
		const m = new Map<number, string>();
		for (const d of data.tree) for (const f of d.fields) for (const s of f.subfields) m.set(s.id, s.name);
		return m;
	})();

	$: followed = $interests.filter((id) => nameMap.has(id));
</script>

<svelte:head><title>ResearchFrontier - the state of the art, as it happens</title></svelte:head>

<section class="hero">
	<h1 class="hero__title">
		The state of the art,<br /><span class="accent">as it happens.</span>
	</h1>
	<p class="hero__lede">
		Pick your field and see what actually moved this week — the newest papers, where the
		interest is shifting, and a short brief every Monday, Wednesday and Friday. Peer-reviewed or
		preprint, always labelled, always linked to the DOI.
	</p>
	<div class="cluster hero__cta">
		<a class="btn btn--solid" href="{base}/fields/">Choose your fields</a>
		<a class="btn" href="{base}/about/">How it works</a>
	</div>
</section>

{#if data.apiError}
	<p class="banner mono">
		Can't reach the API right now. Start the backend (see researchfrontier-infra) and reload.
	</p>
{/if}

{#if followed.length}
	<section class="block">
		<div class="spread block__head">
			<h2>Your fields</h2>
			<a class="mono muted" href="{base}/fields/">manage →</a>
		</div>
		<div class="cluster">
			{#each followed as id (id)}
				<a class="follow-chip" href="{base}/field/{id}/">{nameMap.get(id)}</a>
			{/each}
		</div>
	</section>
{/if}

<section class="block">
	<div class="spread block__head">
		<h2>Hottest fields now</h2>
		<span class="eyebrow">last 30 days · by output &amp; momentum</span>
	</div>

	{#if data.hot.length === 0 && !data.apiError}
		<p class="muted">No activity yet — run the ingestion job to populate fields.</p>
	{/if}

	<ul class="hot-list">
		{#each data.hot as h, i (h.subfield_id)}
			<li class="hot enter" style="animation-delay:{i * 45}ms">
				<a class="hot__link" href="{base}/field/{h.subfield_id}/">
					<span class="hot__rank mono">{String(i + 1).padStart(2, '0')}</span>
					<span class="hot__body">
						<span class="eyebrow">{h.field_name} · {h.domain_name}</span>
						<span class="hot__name">{h.subfield_name}</span>
					</span>
					<span class="hot__stats mono">
						<span class="hot__count">{h.count}</span>
						<span class="hot__delta" class:up={h.delta > 0} class:down={h.delta < 0}>
							{signed(h.delta)}
						</span>
					</span>
				</a>
				<button
					class="chip"
					aria-pressed={$interests.includes(h.subfield_id)}
					on:click={() => toggleInterest(h.subfield_id)}
				>
					{$interests.includes(h.subfield_id) ? 'Following' : 'Follow'}
				</button>
			</li>
		{/each}
	</ul>
</section>

<style>
	.hero {
		padding-block: 0 clamp(2rem, 5vw, 3.5rem);
		border-bottom: 1px solid var(--rule-strong);
	}
	.hero__title {
		font-size: var(--step-4);
		font-weight: 600;
		margin: 0.6rem 0 1rem;
	}
	.hero__lede {
		max-width: 60ch;
		font-size: var(--step-1);
		color: var(--ink-2);
		margin: 0 0 1.6rem;
	}
	.hero__cta {
		gap: 0.75rem;
	}

	.banner {
		border: 1px solid var(--warn);
		color: var(--warn);
		padding: 0.75rem 1rem;
		margin-top: 1.5rem;
	}

	.block {
		margin-top: clamp(2rem, 5vw, 3.5rem);
	}
	.block__head {
		margin-bottom: 0.5rem;
	}
	.block__head h2 {
		font-size: var(--step-2);
	}

	.follow-chip {
		font-family: var(--font-mono);
		font-size: 0.78rem;
		border: 1px solid var(--rule-strong);
		padding: 0.3rem 0.6rem;
		transition: border-color 0.18s, color 0.18s;
	}
	.follow-chip:hover {
		border-color: var(--accent);
		color: var(--accent);
	}

	.hot-list {
		list-style: none;
		margin: 0.5rem 0 0;
		padding: 0;
	}
	.hot {
		display: flex;
		align-items: center;
		gap: 1rem;
		border-top: 1px solid var(--rule);
	}
	.hot:last-child {
		border-bottom: 1px solid var(--rule);
	}
	.hot__link {
		display: grid;
		grid-template-columns: 2.2rem 1fr auto;
		align-items: center;
		gap: 1rem;
		padding-block: 1.1rem;
		flex: 1;
		min-width: 0;
	}
	.hot__rank {
		color: var(--ink-3);
	}
	.hot__body {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		min-width: 0;
	}
	.hot__name {
		font-family: var(--font-display);
		font-size: var(--step-2);
		font-weight: 500;
		line-height: 1.1;
		transition: color 0.18s;
	}
	.hot__link:hover .hot__name {
		color: var(--accent);
	}
	.hot__stats {
		display: flex;
		align-items: baseline;
		gap: 0.6rem;
		color: var(--ink-3);
	}
	.hot__count {
		font-size: 1.15rem;
		color: var(--ink);
	}
	.hot__delta.up {
		color: var(--good);
	}
	.hot__delta.down {
		color: var(--bad);
	}
	@media (max-width: 560px) {
		.hot__link {
			grid-template-columns: 1.6rem 1fr auto;
			gap: 0.6rem;
		}
	}
</style>
