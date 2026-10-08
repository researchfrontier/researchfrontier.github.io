<script lang="ts">
	import { base } from '$app/paths';
	import { signed } from '$lib/format';
	import { toggleTopicInterest, topicInterests } from '$lib/stores/topicInterests';
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
				<a class="dir__link" href="{base}/topic/{d.topic_id}/">
					<div class="dir__head spread">
						<span class="dir__name">{d.topic_name}</span>
						<span class="mono dir__stat">
							{d.count.toLocaleString()} · {Math.round(d.share * 100)}%
							{#if d.delta !== 0}
								<em class:up={d.delta > 0} class:down={d.delta < 0}>{signed(d.delta)}</em>
							{/if}
							<span class="dir__go" aria-hidden="true">→</span>
						</span>
					</div>
					<div class="dir__bar"><span style="width:{(d.count / max) * 100}%"></span></div>
					{#if d.keywords?.length}
						<div class="dir__kw mono">{d.keywords.slice(0, 4).join(' · ')}</div>
					{/if}
				</a>
				<button
					class="chip dir__follow"
					aria-pressed={$topicInterests.includes(d.topic_id)}
					aria-label={($topicInterests.includes(d.topic_id) ? 'Following' : 'Follow') +
						' — ' +
						d.topic_name}
					on:click={() => toggleTopicInterest(d.topic_id)}
				>
					{$topicInterests.includes(d.topic_id) ? '✓ Following' : 'Follow'}
				</button>
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
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		border-top: 1px solid var(--rule);
	}
	.dir__link {
		display: block;
		flex: 1;
		min-width: 0;
		padding-block: 0.9rem;
	}
	.dir__follow {
		flex-shrink: 0;
		margin-top: 0.9rem;
	}
	.dir__name {
		font-family: var(--font-display);
		font-size: var(--step-1);
		font-weight: 500;
		transition: color 0.18s;
	}
	.dir__link:hover .dir__name {
		color: var(--accent);
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
	.dir__go {
		opacity: 0;
		margin-left: 0.3rem;
		transition: opacity 0.18s;
	}
	.dir__link:hover .dir__go {
		opacity: 1;
		color: var(--accent);
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
