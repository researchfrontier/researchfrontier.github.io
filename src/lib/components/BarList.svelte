<script lang="ts">
	// Ranked horizontal bars — extends the Directions.svelte CSS idiom. Themed via
	// tokens, grow animation gated behind prefers-reduced-motion.
	export let items: { name: string; value: number; href?: string | null; sub?: string | null }[] = [];
	export let ariaLabel = 'Ranked list';
	$: max = Math.max(1, ...items.map((i) => i.value));
</script>

<ul class="bars" aria-label={ariaLabel}>
	{#each items as it, i (it.name + i)}
		<li class="bar">
			<span class="bar__label">
				{#if it.href}<a href={it.href}>{it.name}</a>{:else}{it.name}{/if}
				{#if it.sub}<span class="bar__sub mono">{it.sub}</span>{/if}
			</span>
			<span class="bar__track" aria-hidden="true">
				<span class="bar__fill" style="width:{((it.value / max) * 100).toFixed(1)}%"></span>
			</span>
			<span class="bar__val mono">{it.value.toLocaleString()}</span>
		</li>
	{/each}
</ul>

<style>
	.bars {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.bar {
		display: grid;
		grid-template-columns: minmax(8rem, 1.1fr) 1.4fr auto;
		align-items: center;
		gap: 0.75rem;
		padding-block: 0.4rem;
		border-top: 1px solid var(--rule);
	}
	.bar:first-child {
		border-top: none;
	}
	.bar__label {
		font-size: 0.95rem;
		color: var(--ink);
		min-width: 0;
	}
	.bar__label a:hover {
		color: var(--accent);
	}
	.bar__sub {
		color: var(--ink-3);
		font-size: 0.72rem;
		margin-left: 0.5ch;
	}
	.bar__track {
		display: block;
		height: 0.5rem;
		background: var(--paper-2);
		border: 1px solid var(--rule);
	}
	.bar__fill {
		display: block;
		height: 100%;
		background: var(--accent);
		transform-origin: left;
	}
	.bar__val {
		color: var(--ink-3);
		font-size: 0.8rem;
		white-space: nowrap;
	}
	@media (prefers-reduced-motion: no-preference) {
		.bar__fill {
			animation: grow 0.7s ease-out;
		}
	}
	@keyframes grow {
		from {
			transform: scaleX(0);
		}
		to {
			transform: scaleX(1);
		}
	}
</style>
