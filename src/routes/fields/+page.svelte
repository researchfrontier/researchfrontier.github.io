<script lang="ts">
	import { base } from '$app/paths';
	import { interests, toggleInterest } from '$lib/stores/interests';
	import type { DomainNode } from '$lib/types';

	export let data: { tree: DomainNode[]; apiError: boolean };

	let q = '';
	$: ql = q.trim().toLowerCase();

	// `ql` is passed in (not closed over) so the reactive `view` actually tracks it
	// and re-runs when the query changes.
	function filterTree(tree: DomainNode[], query: string): DomainNode[] {
		const hit = (name: string) => !query || name.toLowerCase().includes(query);
		return tree
			.map((d) => ({
				...d,
				fields: d.fields
					.map((f) => ({
						...f,
						subfields: f.subfields.filter((s) => hit(s.name) || hit(f.name) || hit(d.name))
					}))
					.filter((f) => f.subfields.length > 0)
			}))
			.filter((d) => d.fields.length > 0);
	}

	let onlyFollowing = false;

	$: view = filterTree(data.tree, ql);

	// Optionally narrow to just the fields the user follows.
	$: shown = onlyFollowing
		? view
				.map((d) => ({
					...d,
					fields: d.fields
						.map((f) => ({ ...f, subfields: f.subfields.filter((s) => $interests.includes(s.id)) }))
						.filter((f) => f.subfields.length > 0)
				}))
				.filter((d) => d.fields.length > 0)
		: view;
</script>

<svelte:head><title>Research fields - ResearchFrontier</title></svelte:head>

<section class="head">
	<h1>Research fields</h1>
	<p class="lede">
		Browse the field taxonomy and follow the areas you care about. Following keeps them on your
		home page and (soon, with an account) drives your personalised digest.
		<strong>{$interests.length}</strong> followed.
	</p>
	<div class="search-row">
		<input
			class="search"
			type="search"
			placeholder="Filter fields — e.g. “vision”, “oncology”, “networks”"
			bind:value={q}
			aria-label="Filter research fields"
		/>
		<button
			class="chip only-following"
			aria-pressed={onlyFollowing}
			disabled={$interests.length === 0}
			on:click={() => (onlyFollowing = !onlyFollowing)}
		>
			{onlyFollowing ? '✓ Showing following' : 'Only following'}{$interests.length
				? ` · ${$interests.length}`
				: ''}
		</button>
	</div>
</section>

{#if data.apiError}
	<p class="banner mono">Can't reach the API. Start the backend and reload.</p>
{/if}

{#each shown as d (d.id)}
	<section class="domain">
		<h2 class="domain__name">{d.name}</h2>
		{#each d.fields as f (f.id)}
			<div class="field">
				<div class="field__name eyebrow">{f.name}</div>
				<ul class="subs">
					{#each f.subfields as s (s.id)}
						<li class="sub">
							<a class="sub__name" href="{base}/field/{s.id}/">{s.name}</a>
							<span class="sub__count mono">{s.works_count}</span>
							<button
								class="chip"
								aria-pressed={$interests.includes(s.id)}
								on:click={() => toggleInterest(s.id)}
							>
								{$interests.includes(s.id) ? '✓ Following' : 'Follow'}
							</button>
						</li>
					{/each}
				</ul>
			</div>
		{/each}
	</section>
{/each}

{#if shown.length === 0 && !data.apiError}
	<p class="muted">
		{#if onlyFollowing && $interests.length === 0}
			You are not following any field yet.
		{:else if onlyFollowing}
			None of your followed fields match “{q}”.
		{:else}
			No field matches “{q}”.
		{/if}
	</p>
{/if}

<style>
	.head {
		border-bottom: 1px solid var(--rule-strong);
		padding-bottom: 1.5rem;
	}
	.head h1 {
		font-size: var(--step-3);
		margin: 0.4rem 0 0.6rem;
	}
	.lede {
		max-width: 62ch;
		color: var(--ink-2);
	}
	.search-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-top: 1.1rem;
		flex-wrap: wrap;
	}
	.search {
		flex: 1 1 280px;
		max-width: 520px;
		font-family: var(--font-ui);
		font-size: 1rem;
		padding: 0.6rem 0.8rem;
		background: var(--paper-2);
		border: 1px solid var(--rule-strong);
		color: var(--ink);
	}
	.search:focus {
		border-color: var(--accent);
		outline: none;
	}
	.only-following {
		margin-left: auto;
		white-space: nowrap;
	}
	.chip:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}

	.domain {
		margin-top: 2.2rem;
	}
	.domain__name {
		font-size: var(--step-2);
		padding-bottom: 0.5rem;
		border-bottom: 1px solid var(--rule);
	}
	.field {
		margin-top: 1.2rem;
	}
	.field__name {
		margin-bottom: 0.5rem;
	}
	.subs {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.sub {
		display: grid;
		grid-template-columns: 1fr auto auto;
		align-items: center;
		gap: 1rem;
		padding-block: 0.6rem;
		border-top: 1px solid var(--rule);
	}
	.sub__name {
		font-family: var(--font-display);
		font-size: 1.15rem;
		transition: color 0.18s;
	}
	.sub__name:hover {
		color: var(--accent);
	}
	.sub__count {
		color: var(--ink-3);
	}
</style>
