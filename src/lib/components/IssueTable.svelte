<script lang="ts">
	import type { Issue, TimeUnit } from '$lib/types';
	import IssueCard from '$lib/components/IssueCard.svelte';
	import { EPIC_LABEL_NAME } from '../../constant';

	export let issues: Issue[] = [];
	export let timeUnit: TimeUnit;
</script>

<div class="flex flex-col space-y-4">
	<p>
		Add a label <span class="font-bold">{EPIC_LABEL_NAME}</span> to your issues to track them on this
		view.
	</p>
	{#each issues.filter( (issue) => issue.labels.nodes.some((label) => label.title.toLowerCase() === EPIC_LABEL_NAME) ) as issue}
		<IssueCard {issue} allIssues={issues} {timeUnit} />
	{/each}
</div>
