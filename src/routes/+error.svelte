<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/stores';
</script>

<section class="err">
	<p class="eyebrow">Error {$page.status}</p>
	<h1>{$page.error?.message ?? 'Something went wrong.'}</h1>
	<p class="muted">
		If you just started the app, make sure the backend API is running (see
		researchfrontier-infra).
	</p>
	<a class="btn" href="{base}/">← Back to home</a>
</section>

<style>
	.err {
		padding-block: 3rem;
		max-width: 60ch;
	}
	.err h1 {
		font-size: var(--step-3);
		margin: 0.4rem 0 1rem;
	}
</style>
