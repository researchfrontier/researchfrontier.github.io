<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { navigating, page } from '$app/stores';
	import Loader from '$lib/components/Loader.svelte';
	import { interests } from '$lib/stores/interests';
	import { cycleTheme, theme } from '$lib/stores/theme';

	$: path = $page.url.pathname;
	$: themeLabel = $theme === 'light' ? 'Light' : $theme === 'dark' ? 'Dark' : 'Auto';

	// Remove the instant boot splash (app.html) once the app has mounted. On a cold
	// start the initial load() blocks until the API wakes, so this fires only when
	// the first view is ready.
	onMount(() => {
		const boot = document.getElementById('rf-boot');
		if (!boot) return;
		boot.classList.add('rf-boot--done');
		setTimeout(() => boot.remove(), 450);
	});

	// In-session navigations (e.g. opening a field) can hit the API after it has
	// slept again. Show an overlay only if the navigation takes a moment, so quick
	// moves stay invisible. The timer is driven from a plain function so the reactive
	// statement depends only on $navigating (and never on navTimer itself).
	let showNavLoader = false;
	let navTimer: ReturnType<typeof setTimeout>;
	function onNavigate(nav: typeof $navigating) {
		clearTimeout(navTimer);
		if (nav) {
			navTimer = setTimeout(() => (showNavLoader = true), 600);
		} else {
			showNavLoader = false;
		}
	}
	$: onNavigate($navigating);
</script>

<header class="masthead">
	<div class="shell masthead__row">
		<a href="{base}/" class="wordmark">Research<b>Frontier</b></a>
		<nav class="nav" aria-label="Primary">
			<a href="{base}/" aria-current={path === `${base}/` ? 'page' : undefined}>Home</a>
			<a href="{base}/trends/" aria-current={path.startsWith(`${base}/trends`) ? 'page' : undefined}>
				Trends
			</a>
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

{#if showNavLoader}
	<div class="nav-loading" role="status" aria-live="polite">
		<Loader
			message="Loading…"
			delayedMessage="The free server may be waking up — this can take up to a minute."
		/>
	</div>
{/if}

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
	}

	.nav-loading {
		position: fixed;
		inset: 0;
		z-index: 50;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1.5rem;
		background: color-mix(in srgb, var(--paper) 92%, transparent);
		backdrop-filter: blur(3px);
	}
</style>
