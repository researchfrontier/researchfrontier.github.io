<script lang="ts">
	import '../app.css';
	import { base } from '$app/paths';
	import { page } from '$app/stores';
	import { interests } from '$lib/stores/interests';
	import { cycleTheme, theme } from '$lib/stores/theme';

	$: path = $page.url.pathname;
	$: themeLabel = $theme === 'light' ? 'Light' : $theme === 'dark' ? 'Dark' : 'Auto';
</script>

<header class="masthead">
	<div class="shell masthead__row">
		<a href="{base}/" class="wordmark">Research<b>Frontier</b></a>
		<nav class="nav" aria-label="Primary">
			<a href="{base}/" aria-current={path === `${base}/` ? 'page' : undefined}>Home</a>
			<a
				href="{base}/fields/"
				aria-current={path.startsWith(`${base}/fields`) ? 'page' : undefined}
			>
				Fields{#if $interests.length}&nbsp;·&nbsp;{$interests.length}{/if}
			</a>
			<a href="{base}/about/" aria-current={path.startsWith(`${base}/about`) ? 'page' : undefined}>
				About
			</a>
			<button class="theme" on:click={cycleTheme} title="Theme: {themeLabel}" aria-label="Toggle theme">
				{themeLabel}
			</button>
		</nav>
	</div>
</header>

<main class="shell">
	<slot />
</main>

<footer class="shell foot">
	<hr class="rule" />
	<p class="mono muted">
		ResearchFrontier · a reading-front-door to the literature, not a replacement for it ·
		data from OpenAlex, arXiv, Crossref · every paper links to its DOI
	</p>
</footer>

<style>
	.theme {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		background: transparent;
		border: 1px solid var(--rule-strong);
		color: var(--ink-2);
		padding: 0.2rem 0.5rem;
		cursor: pointer;
	}
	.theme:hover {
		border-color: var(--accent);
		color: var(--ink);
	}
	main {
		min-height: 64vh;
		padding-block: clamp(0.5rem, 1.5vw, 0.9rem) clamp(1.5rem, 4vw, 3rem);
	}
	.foot {
		padding-block: 2rem 3rem;
	}
	.foot p {
		margin-top: 1rem;
		max-width: 70ch;
	}
</style>
