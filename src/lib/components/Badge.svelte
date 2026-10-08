<script lang="ts">
	import { STATUS_LABEL } from '$lib/format';
	import type { ReviewStatus } from '$lib/types';

	export let status: ReviewStatus;
	export let confidence: string | undefined = undefined;

	$: label = STATUS_LABEL[status] ?? status;
	$: title = confidence ? `${label} · confidence: ${confidence}` : label;
</script>

<span class="badge badge--{status}" {title}>{label}</span>
