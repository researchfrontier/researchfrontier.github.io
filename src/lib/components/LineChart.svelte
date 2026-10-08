<script lang="ts">
	// A sober single-series line/area chart, hand-rolled inline SVG, themed via CSS
	// tokens. No chart library. Accessible (role=img + a hidden data table) and
	// motion-gated like the rest of the site.
	export let points: { label: string; value: number }[] = [];
	export let height = 130;
	export let ariaLabel = 'Trend over time';
	export let caption = '';
	export let pad = 16;
	export let minimal = false; // sparkline mode: no axis labels, no max caption

	const W = 640;
	$: PAD = pad;
	$: n = points.length;
	$: vals = points.map((p) => p.value);
	$: max = Math.max(1, ...vals);
	$: min = Math.min(0, ...vals);
	$: innerH = height - PAD * 2;
	const x = (i: number) => (n <= 1 ? W / 2 : PAD + (i / (n - 1)) * (W - PAD * 2));
	$: y = (v: number) => PAD + (1 - (v - min) / (max - min || 1)) * innerH;
	$: line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');
	$: area = n ? `${line} L${x(n - 1).toFixed(1)},${(height - PAD).toFixed(1)} L${x(0).toFixed(1)},${(height - PAD).toFixed(1)} Z` : '';
	function fmt(v: number): string {
		if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + 'M';
		if (v >= 1000) return (v / 1000).toFixed(v >= 10_000 ? 0 : 1) + 'k';
		return String(v);
	}
</script>

{#if n > 0}
	<figure class="chart" role="img" aria-label={ariaLabel}>
		{#if !minimal}<div class="chart__max mono">{fmt(max)}</div>{/if}
		<svg viewBox="0 0 {W} {height}" preserveAspectRatio="none" width="100%" {height} aria-hidden="true">
			{#if !minimal}<line class="axis" x1={PAD} y1={height - PAD} x2={W - PAD} y2={height - PAD} vector-effect="non-scaling-stroke" />{/if}
			<path class="area" d={area} />
			<path class="line" d={line} vector-effect="non-scaling-stroke" />
			<circle class="dot" cx={x(n - 1)} cy={y(points[n - 1].value)} r={minimal ? 2.5 : 3.5} vector-effect="non-scaling-stroke" />
		</svg>
		{#if !minimal}
			<figcaption class="chart__labels mono">
				<span>{points[0].label}</span>
				{#if caption}<span class="chart__cap">{caption}</span>{/if}
				<span>{points[n - 1].label}</span>
			</figcaption>
		{/if}
		<table class="vh">
			<caption>{ariaLabel}</caption>
			<tbody>
				{#each points as p (p.label)}<tr><th scope="row">{p.label}</th><td>{p.value}</td></tr>{/each}
			</tbody>
		</table>
	</figure>
{/if}

<style>
	.chart {
		margin: 0;
		position: relative;
	}
	.chart__max {
		position: absolute;
		top: 0;
		left: 0;
		font-size: 0.72rem;
		color: var(--ink-3);
	}
	svg {
		display: block;
		overflow: visible;
	}
	.axis {
		stroke: var(--rule);
		stroke-width: 1;
	}
	.line {
		fill: none;
		stroke: var(--accent);
		stroke-width: 2;
		stroke-linejoin: round;
		stroke-linecap: round;
	}
	.area {
		fill: var(--accent);
		opacity: 0.08;
		stroke: none;
	}
	.dot {
		fill: var(--accent);
	}
	.chart__labels {
		display: flex;
		justify-content: space-between;
		gap: 0.5rem;
		color: var(--ink-3);
		font-size: 0.72rem;
		margin-top: 0.35rem;
	}
	.chart__cap {
		color: var(--ink-3);
	}
	.vh {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
	@media (prefers-reduced-motion: no-preference) {
		.line {
			stroke-dasharray: 2000;
			stroke-dashoffset: 2000;
			animation: draw 1.1s ease-out forwards;
		}
		.area,
		.dot {
			opacity: 0;
			animation: fade 0.6s ease-out 0.5s forwards;
		}
		.area {
			animation-name: fadeArea;
		}
	}
	@keyframes draw {
		to {
			stroke-dashoffset: 0;
		}
	}
	@keyframes fade {
		to {
			opacity: 1;
		}
	}
	@keyframes fadeArea {
		to {
			opacity: 0.08;
		}
	}
</style>
