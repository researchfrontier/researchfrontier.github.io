<script lang="ts">
	// A small animated "equalizer" loader, matching the boot splash in app.html.
	// `message` shows immediately; `delayedMessage` fades in only if the wait drags
	// on (a Render cold start), so quick loads stay quiet.
	export let message = '';
	export let delayedMessage = '';
</script>

<div class="loader">
	<div class="loader__bars" aria-hidden="true">
		<span></span><span></span><span></span><span></span><span></span>
	</div>
	{#if message}<p class="loader__msg">{message}</p>{/if}
	{#if delayedMessage}<p class="loader__msg loader__msg--delayed">{delayedMessage}</p>{/if}
</div>

<style>
	.loader {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.1rem;
		text-align: center;
	}
	.loader__bars {
		display: flex;
		align-items: flex-end;
		gap: 0.4rem;
		height: 2.4rem;
	}
	.loader__bars span {
		display: block;
		width: 0.42rem;
		height: 100%;
		background: var(--accent);
		transform-origin: bottom;
	}
	.loader__bars span:nth-child(1) {
		transform: scaleY(0.4);
	}
	.loader__bars span:nth-child(2) {
		transform: scaleY(0.7);
	}
	.loader__bars span:nth-child(3) {
		transform: scaleY(1);
	}
	.loader__bars span:nth-child(4) {
		transform: scaleY(0.6);
	}
	.loader__bars span:nth-child(5) {
		transform: scaleY(0.45);
	}
	.loader__msg {
		max-width: 36ch;
		margin: 0;
		font-family: var(--font-mono);
		font-size: 0.8rem;
		line-height: 1.5;
		color: var(--ink-3);
	}
	/* Hidden until the wait drags on (a cold start), so quick loads stay quiet. A
	   plain opacity fade has no motion, so it runs for everyone rather than being
	   gated on the motion query (which would make reduced-motion users see it
	   instantly or never). */
	.loader__msg--delayed {
		opacity: 0;
		animation: fade 0.5s ease forwards;
		animation-delay: 3.5s;
	}
	@keyframes fade {
		to {
			opacity: 1;
		}
	}
	@media (prefers-reduced-motion: no-preference) {
		.loader__bars span {
			animation: eq 1s ease-in-out infinite;
		}
		.loader__bars span:nth-child(2) {
			animation-delay: 0.12s;
		}
		.loader__bars span:nth-child(3) {
			animation-delay: 0.24s;
		}
		.loader__bars span:nth-child(4) {
			animation-delay: 0.36s;
		}
		.loader__bars span:nth-child(5) {
			animation-delay: 0.48s;
		}
		@keyframes eq {
			0%,
			100% {
				transform: scaleY(0.35);
			}
			50% {
				transform: scaleY(1);
			}
		}
	}
</style>
