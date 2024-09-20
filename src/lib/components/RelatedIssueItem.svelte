<script lang="ts">
	import type { Issue, TimeUnit } from '$lib/types';
	import { formatTime } from '$lib/utils';
	import IssueDetail from './IssueDetail.svelte';
	export let relatedIssue: Issue;
	export let timeUnit: TimeUnit;

	function getTimeSpentByUsers(): Record<string, number> {
		const timeSpent: Record<string, number> = {};

		for (const timelog of relatedIssue.timelogs.nodes) {
			const username = timelog.user.username;
			timeSpent[username] = (timeSpent[username] || 0) + timelog.timeSpent;
		}

		return timeSpent;
	}

	const timeSpentByUsers = getTimeSpentByUsers();
</script>

<div class="mt-2 flex items-center">
	<!-- Smaller Circle Indicator -->
	<div
		class={`relative flex h-4 w-4 items-center justify-center rounded-full border-2 ${
			relatedIssue.closedAt ? 'border-purple-600' : 'border-gray-400'
		}`}
	>
		{#if relatedIssue.closedAt}
			<span class="absolute text-xs text-purple-600">&#10003;</span> <!-- Check mark -->
		{/if}
	</div>

	<div class="ml-2 flex-1">
		<IssueDetail issue={relatedIssue} {timeUnit} />
	</div>
</div>

<div class="mt-1 flex flex-wrap pl-8 text-gray-600">
	{#each Object.entries(timeSpentByUsers) as [username, timeSpent]}
		<span class="mr-4">
			{username}: {formatTime(timeUnit, timeSpent)}
		</span>
	{/each}
</div>
