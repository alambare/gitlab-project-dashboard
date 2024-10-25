<script lang="ts">
	import type { Issue, TimeUnit } from '$lib/types';
	import { formatDate, formatTime, isDarkColor } from '$lib/utils';

	export let issue: Issue;
	export let timeUnit: TimeUnit;
	export let totalTimeSpent: number | null = null;

	$: total = totalTimeSpent || issue.totalTimeSpent;
</script>

<div class="flex flex-wrap items-center justify-between">
	<h2 class="mr-4 text-lg font-semibold text-gray-800"><a href={issue.webUrl}>{issue.title}</a></h2>

	<div>
		<span class="mr-1 text-sm text-gray-600">{formatDate(issue.createdAt)}</span> /
		<span class="ml-1 mr-4 text-sm text-gray-600"
			>{issue.closedAt ? formatDate(issue.closedAt) : '..'}</span
		>
	</div>

	<div>
		<span class="ml-1 mr-4 text-sm font-bold text-gray-600">
			{total > 0 ? formatTime(timeUnit, total) : '..'}
		</span>
		/
		<span class="mr-1 text-sm text-gray-600">
			{issue.timeEstimate > 0 ? formatTime(timeUnit, issue.timeEstimate) : '..'}
		</span>
	</div>

	<div class="ml-4 flex">
		{#each issue.labels.nodes as label}
			<span
				class="mr-2 inline-block rounded-full px-2 py-1 text-xs"
				style="background-color: {label.color}; color: {isDarkColor(label.color)
					? 'white'
					: 'black'};"
			>
				{label.title}
			</span>
		{/each}
	</div>
</div>
