<script lang="ts">
	import type { Issue } from '$lib/types';
	import { formatTime, isDarkColor } from '$lib/utils';

	export let issues: Issue[] = [];
</script>

<table class="mb-6 w-full border-collapse">
	<thead>
		<tr class="bg-blue-600 text-white">
			<th class="border px-4 py-2">Title</th>
			<th class="border px-4 py-2">Created At</th>
			<th class="border px-4 py-2">Due Date</th>
			<th class="border px-4 py-2">Time Estimate</th>
			<th class="border px-4 py-2">Total Time Spent</th>
			<th class="border px-4 py-2">Closed At</th>
			<th class="border px-4 py-2">Labels</th>
		</tr>
	</thead>
	<tbody>
		{#each issues as issue}
			<tr class="hover:bg-gray-100">
				<td class="border px-4 py-2">{issue.title}</td>
				<td class="border px-4 py-2">{new Date(issue.createdAt).toLocaleString()}</td>
				<td class="border px-4 py-2">
					{#if issue.dueDate}
						{new Date(issue.dueDate).toLocaleDateString()}
					{/if}
				</td>
				<td class="border px-4 py-2">
					{#if issue.timeEstimate > 0}
						{formatTime(issue.timeEstimate)}
					{/if}
				</td>
				<td class="border px-4 py-2">
					{#if issue.totalTimeSpent > 0}
						{formatTime(issue.totalTimeSpent)}
					{/if}
				</td>
				<td class="border px-4 py-2">
					{#if issue.closedAt}
						{new Date(issue.closedAt).toLocaleDateString()}
					{/if}
				</td>
				<td class="border px-4 py-2">
					{#each issue.labels.nodes as label}
						<span
							class="mb-2 mr-2 inline-block rounded px-2 py-1 text-sm"
							style="background-color: {label.color}; color: {isDarkColor(label.color)
								? 'white'
								: 'black'};"
						>
							{label.title}
						</span>
					{/each}
				</td>
			</tr>
		{/each}
	</tbody>
</table>
