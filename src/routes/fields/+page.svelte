<script lang="ts">
	import { base } from '$app/paths';
	import { interests, toggleInterest } from '$lib/stores/interests';
	import type { DomainNode } from '$lib/types';

	export let data: { tree: DomainNode[]; apiError: boolean };

	let q = '';
	$: ql = q.trim().toLowerCase();

	function matches(name: string) {
		return !ql || name.toLowerCase().includes(ql);
	}

	// Keep a domain/field only if it (or a child) matches the query.
	$: view = data.tree
		.map((d) => ({
			...d,
			fields: d.fields
				.map((f) => ({
					...f,
					subfields: f.subfields.filter((s) => matches(s.name) || matches(f.name) || matches(d.name))
				}))
				.filter((f) => f.subfields.length > 0)
		}))
		.filter((d) => d.fields.length > 0);
</script>

<svelte:head><title>Research fields — ResearchFrontier</title></svelte:head>

<section class="head">
	<p class="eyebrow">Taxonomy · OpenAlex</p>
	<h1>Research fields</h1>
	<p class="lede">
		Browse the field taxonomy and follow the areas you care about. Following keeps them on your
		home page and (soon, with an account) drives your personalised digest.
		<strong>{$interests.length}</strong> followed.
	</p>
	<input
		class="search"
		type="search"
		placeholder="Filter fields — e.g. “vision”, “oncology”, “networks”"
		bind:value={q}
		aria-label="Filter research fields"
	/>
</section>

{#if data.apiError}
	<p class="banner mono">Can't reach the API. Start the backend and reload.</p>
{/if}

{#each view as d (d.id)}
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

{#if view.length === 0 && !data.apiError}
	<p class="muted">No field matches “{q}”.</p>
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
	.search {
		margin-top: 1.1rem;
		width: 100%;
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
