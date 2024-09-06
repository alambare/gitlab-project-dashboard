<script lang="ts">
	import IssueTable from '$lib/components/IssueTable.svelte';
	import FilterInput from '$lib/components/FilterInput.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import type { IssuesData, Issue, Label } from '$lib/types';

	export let data: IssuesData; // Use the IssuesData interface for the data prop

	let issues: Issue[] = data.issues;
	let filteredIssues: Issue[] = issues; // Initially, no filters applied
	let allLabels: Label[] = getUniqueLabels();
	let selectedLabels: string[] = [];

	// Function to extract unique labels from issues
	function getUniqueLabels(): Label[] {
		const labelsSet = new Set<string>();
		issues.forEach((issue) => issue.labels.nodes.forEach((label) => labelsSet.add(label.title)));
		return Array.from(labelsSet).map((title) => {
			const exampleLabel = issues
				.flatMap((issue) => issue.labels.nodes)
				.find((label) => label.title === title);
			return { title, color: exampleLabel ? exampleLabel.color : '#ffffff' };
		});
	}

	// Handle filter changes from FilterInput component
	const handleFilterChange = (event: CustomEvent<string[]>) => {
		selectedLabels = event.detail;
		filteredIssues = issues.filter((issue) =>
			issue.labels.nodes.some((label) => selectedLabels.includes(label.title))
		);
	};
</script>

<div class="container mx-auto rounded-lg bg-white px-4 py-6 shadow-md">
	<h1 class="mb-6 text-center text-2xl font-semibold text-gray-800">GitLab Issues Dashboard</h1>

	{#if !issues || issues.length === 0}
		<LoadingSpinner />
	{:else}
		<FilterInput labels={allLabels} {selectedLabels} on:filterChange={handleFilterChange} />
		<IssueTable issues={filteredIssues} />
	{/if}
</div>
