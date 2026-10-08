<script lang="ts">
	import { browser } from '$app/environment';
	import { base } from '$app/paths';
	import { api } from '$lib/api';
	import BarList from '$lib/components/BarList.svelte';
	import LineChart from '$lib/components/LineChart.svelte';
	import type { InstitutionHit, TrendField, TrendFieldDetail, TrendHot } from '$lib/types';

	export let data: { hot: TrendHot | null; apiError: boolean };

	$: fields = data.hot?.fields ?? [];

	const yearPoints = (f: TrendField) => f.years.map((y) => ({ label: String(y.year), value: y.count }));

	// --- selected field detail ---
	let selectedId: number | null = null;
	let detail: TrendFieldDetail | null = null;
	let detailLoading = false;
	let detailError = false;
	let detailSeq = 0;

	async function selectField(id: number) {
		if (!browser) return;
		selectedId = id;
		const seq = ++detailSeq;
		detailLoading = true;
		detailError = false;
		detail = null;
		try {
			const r = await api.trendsField(fetch, id);
			if (seq !== detailSeq) return;
			detail = r;
		} catch {
			if (seq !== detailSeq) return;
			detailError = true;
		}
		if (seq === detailSeq) detailLoading = false;
	}

	// auto-select the hottest field once the list is in
	$: if (browser && selectedId === null && fields.length) selectField(fields[0].subfield_id);

	$: detailYears = detail ? detail.years.map((y) => ({ label: String(y.year), value: y.count })) : [];
	$: detailMomentum = detail
		? detail.momentum.map((m) => ({ label: m.date.slice(5), value: m.works_30d }))
		: [];

	// --- reverse view: by institution ---
	let instQuery = '';
	let instResults: InstitutionHit[] = [];
	let selectedInst: InstitutionHit | null = null;
	let instFields: { name: string; value: number; href?: string }[] = [];
	let instLoading = false;
	let searchTimer: ReturnType<typeof setTimeout>;

	function onInstSearch() {
		clearTimeout(searchTimer);
		searchTimer = setTimeout(async () => {
			const q = instQuery.trim();
			if (q.length < 2) {
				instResults = [];
				return;
			}
			try {
				instResults = await api.institutionSearch(fetch, q);
			} catch {
				instResults = [];
			}
		}, 350);
	}

	async function pickInst(h: InstitutionHit) {
		selectedInst = h;
		instResults = [];
		instQuery = h.name ?? '';
		instLoading = true;
		instFields = [];
		try {
			const r = await api.institutionFields(fetch, h.id);
			instFields = r.fields.map((f) => ({
				name: f.name ?? 'Unknown',
				value: f.count,
				href: f.subfield_id ? `${base}/field/${f.subfield_id}/` : undefined
			}));
		} catch {
			instFields = [];
		}
		instLoading = false;
	}
</script>

<svelte:head><title>Trends - ResearchFrontier</title></svelte:head>

{#if data.apiError}
	<p class="banner mono">Can't reach the API. Start the backend and reload.</p>
{/if}

<section class="head">
	<h1>Trends</h1>
	<p class="lede">
		How research output is moving — the hottest fields, their directions, the most-cited work, and
		who is most active. Multi-year curves show now; week-to-week momentum fills in as snapshots
		accrue.
	</p>
</section>

<div class="layout">
	<section class="hot">
		<h2 class="eyebrow">Hottest fields · last 30 days</h2>
		{#if fields.length === 0 && !data.apiError}
			<p class="muted small">No field activity yet.</p>
		{/if}
		<ul class="hot__list">
			{#each fields as f (f.subfield_id)}
				<li>
					<button
						class="hot__item"
						class:on={selectedId === f.subfield_id}
						on:click={() => selectField(f.subfield_id)}
					>
						<span class="hot__name">{f.subfield_name}</span>
						<span class="hot__spark">
							{#if f.years.length > 1}
								<LineChart points={yearPoints(f)} height={26} pad={2} minimal ariaLabel="{f.subfield_name} yearly output" />
							{/if}
						</span>
						<span class="hot__count mono">{f.count_30d.toLocaleString()}</span>
					</button>
				</li>
			{/each}
		</ul>
	</section>

	<section class="detail-wrap">
		{#if detailLoading}
			<p class="muted feed-note">Loading…</p>
		{:else if detailError}
			<p class="banner mono">Couldn't load this field.</p>
		{:else if detail}
			<div class="detail">
				<h2 class="detail__name">
					{detail.subfield.subfield_name}
					<a class="detail__link mono" href="{base}/field/{detail.subfield.subfield_id}/">open field ↗</a>
				</h2>

				<div class="grid">
					<div class="panel">
						<h3 class="eyebrow">Output by year</h3>
						{#if detailYears.length > 1}
							<LineChart points={detailYears} ariaLabel="Yearly output for {detail.subfield.subfield_name}" />
						{:else}
							<p class="muted small">Not enough data yet.</p>
						{/if}
					</div>
					<div class="panel">
						<h3 class="eyebrow">Recent momentum</h3>
						{#if detailMomentum.length >= 3}
							<LineChart points={detailMomentum} ariaLabel="Recent 30-day output snapshots" />
						{:else}
							<p class="muted small">Weekly momentum fills in as snapshots accrue over the coming weeks.</p>
						{/if}
					</div>
				</div>

				{#if detail.top_topics.length}
					<div class="panel">
						<h3 class="eyebrow">Top directions · last 30 days</h3>
						<BarList
							ariaLabel="Top directions"
							items={detail.top_topics.map((t) => ({
								name: t.topic_name,
								value: t.count,
								href: `${base}/topic/${t.topic_id}/`
							}))}
						/>
					</div>
				{/if}

				{#if detail.most_cited.length}
					<div class="panel">
						<h3 class="eyebrow">Most-cited papers</h3>
						<ol class="cited">
							{#each detail.most_cited as c (c.rank)}
								<li class="cited__row">
									<span class="cited__title">
										{#if c.url}<a href={c.url} target="_blank" rel="noopener noreferrer">{c.title}</a
											>{:else}{c.title}{/if}
										{#if c.year}<span class="cited__yr mono">{c.year}</span>{/if}
									</span>
									<span class="cited__n mono">{c.cited_by_count.toLocaleString()} cited</span>
								</li>
							{/each}
						</ol>
					</div>
				{/if}

				<div class="grid">
					{#if detail.institutions.length}
						<div class="panel">
							<h3 class="eyebrow">Most-active institutions · 3y</h3>
							<BarList
								ariaLabel="Most-active institutions"
								items={detail.institutions.map((i) => ({ name: i.name, value: i.count }))}
							/>
						</div>
					{/if}
					{#if detail.countries.length}
						<div class="panel">
							<h3 class="eyebrow">Most-active countries · 3y</h3>
							<BarList
								ariaLabel="Most-active countries"
								items={detail.countries.map((c) => ({ name: c.name, value: c.count }))}
							/>
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</section>
</div>

<section class="byinst">
	<h2 class="eyebrow">Explore by institution</h2>
	<p class="muted small">See which fields an institution publishes most in (last 3 years).</p>
	<input
		class="search"
		type="search"
		placeholder="Search an institution — e.g. “MIT”, “CNRS”, “Tsinghua”"
		bind:value={instQuery}
		on:input={onInstSearch}
		aria-label="Search an institution"
	/>
	{#if instResults.length}
		<ul class="inst__results">
			{#each instResults as h (h.id)}
				<li>
					<button class="inst__hit" on:click={() => pickInst(h)}>
						{h.name}{#if h.country_code}<span class="mono muted"> · {h.country_code}</span>{/if}
					</button>
				</li>
			{/each}
		</ul>
	{/if}
	{#if selectedInst}
		<div class="panel">
			<h3 class="detail__name">{selectedInst.name}</h3>
			{#if instLoading}
				<p class="muted feed-note">Loading…</p>
			{:else if instFields.length}
				<BarList items={instFields} ariaLabel="Fields this institution is most active on" />
			{:else}
				<p class="muted small">No field breakdown available.</p>
			{/if}
		</div>
	{/if}
</section>

<style>
	.head {
		border-bottom: 1px solid var(--rule-strong);
		padding-bottom: 1.1rem;
		margin-bottom: 1.3rem;
	}
	.head h1 {
		font-size: var(--step-3);
		margin: 0.2rem 0 0.5rem;
	}
	.lede {
		max-width: 64ch;
		color: var(--ink-2);
	}
	.layout {
		display: grid;
		grid-template-columns: minmax(16rem, 22rem) 1fr;
		gap: 2rem;
		align-items: start;
	}
	@media (max-width: 720px) {
		.layout {
			grid-template-columns: 1fr;
			gap: 1.4rem;
		}
	}
	.hot__list {
		list-style: none;
		margin: 0.4rem 0 0;
		padding: 0;
	}
	.hot__item {
		display: grid;
		grid-template-columns: 1fr 5rem auto;
		align-items: center;
		gap: 0.6rem;
		width: 100%;
		text-align: left;
		background: none;
		border: none;
		border-top: 1px solid var(--rule);
		padding: 0.5rem 0.2rem;
		cursor: pointer;
		color: var(--ink);
		font-family: var(--font-display);
		font-size: 1rem;
	}
	.hot__item:hover {
		color: var(--accent);
	}
	.hot__item.on {
		color: var(--accent);
		border-left: 2px solid var(--accent);
		padding-left: 0.5rem;
	}
	.hot__spark {
		display: block;
		opacity: 0.8;
	}
	.hot__count {
		color: var(--ink-3);
		font-size: 0.8rem;
	}
	.detail__name {
		font-size: var(--step-2);
		display: flex;
		align-items: baseline;
		gap: 0.9rem;
		flex-wrap: wrap;
		margin-bottom: 0.6rem;
	}
	.detail__link {
		font-size: 0.78rem;
		color: var(--ink-3);
	}
	.detail__link:hover {
		color: var(--accent);
	}
	.grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.5rem;
	}
	@media (max-width: 560px) {
		.grid {
			grid-template-columns: 1fr;
		}
	}
	.panel {
		margin-top: 1.4rem;
	}
	.panel .eyebrow {
		margin-bottom: 0.5rem;
	}
	.cited {
		list-style: none;
		margin: 0;
		padding: 0;
		counter-reset: cited;
	}
	.cited__row {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		align-items: baseline;
		padding-block: 0.45rem;
		border-top: 1px solid var(--rule);
	}
	.cited__row:first-child {
		border-top: none;
	}
	.cited__title {
		color: var(--ink);
	}
	.cited__title a:hover {
		color: var(--accent);
	}
	.cited__yr {
		color: var(--ink-3);
		font-size: 0.72rem;
		margin-left: 0.4ch;
	}
	.cited__n {
		color: var(--ink-3);
		font-size: 0.78rem;
		white-space: nowrap;
	}
	.byinst {
		margin-top: 2.6rem;
		padding-top: 1.4rem;
		border-top: 1px solid var(--rule-strong);
	}
	.search {
		width: 100%;
		max-width: 460px;
		font-family: var(--font-ui);
		font-size: 0.95rem;
		padding: 0.55rem 0.8rem;
		margin-top: 0.6rem;
		background: var(--paper-2);
		border: 1px solid var(--rule-strong);
		color: var(--ink);
	}
	.search:focus {
		border-color: var(--accent);
		outline: none;
	}
	.inst__results {
		list-style: none;
		margin: 0.4rem 0 0;
		padding: 0;
		max-width: 460px;
		border: 1px solid var(--rule);
	}
	.inst__hit {
		width: 100%;
		text-align: left;
		background: none;
		border: none;
		border-top: 1px solid var(--rule);
		padding: 0.5rem 0.7rem;
		cursor: pointer;
		color: var(--ink);
		font-family: var(--font-ui);
		font-size: 0.92rem;
	}
	.inst__results li:first-child .inst__hit {
		border-top: none;
	}
	.inst__hit:hover {
		background: var(--paper-2);
		color: var(--accent);
	}
	.small {
		font-size: 0.85rem;
	}
	.feed-note {
		color: var(--ink-3);
	}
</style>
