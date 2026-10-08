<script lang="ts">
	import { signed } from '$lib/format';
	import type { Direction } from '$lib/types';

	export let directions: Direction[];

	$: max = Math.max(1, ...directions.map((d) => d.count));
</script>

{#if directions.length === 0}
	<p class="muted">No activity in this window yet.</p>
{:else}
	<ul class="dirs">
		{#each directions as d, i (d.topic_id)}
			<li class="dir enter" style="animation-delay:{i * 45}ms">
				<div class="dir__head spread">
					<span class="dir__name">{d.topic_name}</span>
					<span class="mono dir__stat">
						{d.count.toLocaleString()} · {Math.round(d.share * 100)}%
						{#if d.delta !== 0}
							<em class:up={d.delta > 0} class:down={d.delta < 0}>{signed(d.delta)}</em>
						{/if}
					</span>
				</div>
				<div class="dir__bar"><span style="width:{(d.count / max) * 100}%"></span></div>
				{#if d.keywords?.length}
					<div class="dir__kw mono">{d.keywords.slice(0, 4).join(' · ')}</div>
				{/if}
			</li>
		{/each}
	</ul>
{/if}

<style>
	.dirs {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.dir {
		padding-block: 0.9rem;
		border-top: 1px solid var(--rule);
	}
	.dir__name {
		font-family: var(--font-display);
		font-size: var(--step-1);
		font-weight: 500;
	}
	.dir__stat {
		color: var(--ink-3);
		white-space: nowrap;
	}
	.dir__stat em {
		font-style: normal;
	}
	.dir__stat em.up {
		color: var(--good);
	}
	.dir__stat em.down {
		color: var(--bad);
	}
	.dir__bar {
		height: 6px;
		background: var(--paper-2);
		margin-top: 0.55rem;
		overflow: hidden;
	}
	.dir__bar span {
		display: block;
		height: 100%;
		background: var(--accent);
	}
	@media (prefers-reduced-motion: no-preference) {
		.dir__bar span {
			animation: grow 0.6s cubic-bezier(0.2, 0.7, 0.2, 1) both;
			transform-origin: left;
		}
		@keyframes grow {
			from {
				transform: scaleX(0);
			}
		}
	}
	.dir__kw {
		color: var(--ink-3);
		margin-top: 0.4rem;
	}
</style>
