<script lang="ts">
	// Multi-series time line chart (hand-rolled inline SVG, no chart lib). Time x-axis
	// with monthly ticks; one line per field, coloured from the token palette, with a
	// legend. Fills in as weekly snapshots accrue; shows a note until there are enough.
	export let series: { name: string; points: { date: string; value: number }[] }[] = [];
	export let height = 230;
	export let ariaLabel = 'Hottest fields, week by week';

	const COLORS = ['var(--accent)', 'var(--cool)', 'var(--good)', 'var(--warn)', 'var(--bad)', 'var(--accent-ink)'];
	const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	const W = 760;
	const PAD_L = 10;
	const PAD_R = 10;
	const PAD_T = 12;
	const PAD_B = 24;

	const t = (d: string) => new Date(d + 'T00:00:00').getTime();
	$: allPts = series.flatMap((s) => s.points);
	$: times = allPts.map((p) => t(p.date));
	$: minT = times.length ? Math.min(...times) : 0;
	$: maxT = times.length ? Math.max(...times) : 1;
	$: maxV = Math.max(1, ...allPts.map((p) => p.value));
	$: innerW = W - PAD_L - PAD_R;
	$: innerH = height - PAD_T - PAD_B;
	$: x = (tt: number) => (maxT === minT ? PAD_L + innerW / 2 : PAD_L + ((tt - minT) / (maxT - minT)) * innerW);
	$: y = (v: number) => PAD_T + (1 - v / maxV) * innerH;
	const pathFor = (pts: { date: string; value: number }[]) =>
		pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(t(p.date)).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');

	$: ticks = (() => {
		if (!times.length) return [] as { t: number; label: string }[];
		const start = new Date(minT);
		let cur = new Date(start.getFullYear(), start.getMonth(), 1);
		if (cur.getTime() < minT) cur = new Date(start.getFullYear(), start.getMonth() + 1, 1);
		const out: { t: number; label: string }[] = [];
		while (cur.getTime() <= maxT && out.length < 18) {
			out.push({ t: cur.getTime(), label: `${MONTHS[cur.getMonth()]} ${String(cur.getFullYear()).slice(2)}` });
			cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
		}
		return out;
	})();

	$: enough = series.some((s) => s.points.length >= 2);
	const fmt = (v: number) => (v >= 1000 ? (v / 1000).toFixed(0) + 'k' : String(v));
</script>

{#if series.length === 0}
	<p class="muted small">No field history yet.</p>
{:else if !enough}
	<p class="muted small">
		Week-by-week history is accruing — this chart fills in over the coming weeks as snapshots are
		recorded.
	</p>
	<ul class="legend" aria-hidden="true">
		{#each series as s, i (s.name)}
			<li><span class="legend__sw" style="background:{COLORS[i % COLORS.length]}"></span>{s.name}</li>
		{/each}
	</ul>
{:else}
	<figure class="chart" role="img" aria-label={ariaLabel}>
		<div class="chart__max mono">{fmt(maxV)}</div>
		<svg viewBox="0 0 {W} {height}" preserveAspectRatio="none" width="100%" {height} aria-hidden="true">
			{#each ticks as tk (tk.t)}
				<line class="grid" x1={x(tk.t)} y1={PAD_T} x2={x(tk.t)} y2={height - PAD_B} vector-effect="non-scaling-stroke" />
			{/each}
			<line class="axis" x1={PAD_L} y1={height - PAD_B} x2={W - PAD_R} y2={height - PAD_B} vector-effect="non-scaling-stroke" />
			{#each series as s, i (s.name)}
				{#if s.points.length}
					<path class="line" d={pathFor(s.points)} style="stroke:{COLORS[i % COLORS.length]}" vector-effect="non-scaling-stroke" />
					<circle class="dot" cx={x(t(s.points[s.points.length - 1].date))} cy={y(s.points[s.points.length - 1].value)} r="3" style="fill:{COLORS[i % COLORS.length]}" vector-effect="non-scaling-stroke" />
				{/if}
			{/each}
		</svg>
		<div class="xlabels mono">
			{#each ticks as tk (tk.t)}
				<span style="left:{((x(tk.t) / W) * 100).toFixed(2)}%">{tk.label}</span>
			{/each}
		</div>
		<ul class="legend">
			{#each series as s, i (s.name)}
				<li><span class="legend__sw" style="background:{COLORS[i % COLORS.length]}"></span>{s.name}</li>
			{/each}
		</ul>
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
		stroke: var(--rule-strong);
		stroke-width: 1;
	}
	.grid {
		stroke: var(--rule);
		stroke-width: 1;
	}
	.line {
		fill: none;
		stroke-width: 2;
		stroke-linejoin: round;
		stroke-linecap: round;
	}
	.xlabels {
		position: relative;
		height: 1.1rem;
		margin-top: 0.1rem;
	}
	.xlabels span {
		position: absolute;
		transform: translateX(-50%);
		font-size: 0.68rem;
		color: var(--ink-3);
		white-space: nowrap;
	}
	.legend {
		list-style: none;
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem 1rem;
		margin: 0.6rem 0 0;
		padding: 0;
		font-size: 0.8rem;
		color: var(--ink-2);
	}
	.legend li {
		display: flex;
		align-items: center;
		gap: 0.4ch;
	}
	.legend__sw {
		display: inline-block;
		width: 0.8rem;
		height: 0.28rem;
	}
	.small {
		font-size: 0.85rem;
	}
	@media (prefers-reduced-motion: no-preference) {
		.line {
			stroke-dasharray: 2000;
			stroke-dashoffset: 2000;
			animation: draw 1.2s ease-out forwards;
		}
	}
	@keyframes draw {
		to {
			stroke-dashoffset: 0;
		}
	}
</style>
