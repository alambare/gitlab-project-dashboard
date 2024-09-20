<script lang="ts">
	import TimeTable from '$lib/components/TimeTable.svelte';
	import IssueTable from '$lib/components/IssueTable.svelte';
	import FilterInput from '$lib/components/FilterInput.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import TimeSpentBurndownChart from '$lib/components/TimeSpentBurndownChart.svelte';
	import { calculateTimeSpentByUserByDay } from '$lib/utils';
	import { TIMEUNIT_DAYS, TIMEUNIT_HOURS } from '../constant';
	import { type TimeData, type Issue, type Label, type TimeUnit } from '$lib/types';
	import Header from '$lib/components/Header.svelte';

	export let data: { issues: Issue[] };

	let issues: Issue[] = data.issues;
	let filteredIssues: Issue[] = issues;
	let allLabels: Label[] = getUniqueLabels();
	let selectedLabels: string[] = [];
	let timeData: TimeData = {};
	let timeUnit: TimeUnit = TIMEUNIT_HOURS;
	let isHours: boolean = false;
	let currentView: 'table' | 'time' = 'time';
	let loading = false;

	$: isHours, (timeUnit = isHours ? TIMEUNIT_HOURS : TIMEUNIT_DAYS);

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

	const handleFilterChange = (event: CustomEvent<string[]>) => {
		selectedLabels = event.detail;
		filteredIssues = issues.filter((issue) =>
			issue.labels.nodes.some((label) => selectedLabels.includes(label.title))
		);
	};

	timeData = calculateTimeSpentByUserByDay(issues);
</script>

<!-- Page Layout -->
<div class="container mx-auto rounded-lg bg-white px-4 py-6 shadow-md">
	<!-- Header Row with Title, Refresh Button, Switch View, and Toggle Slider -->
	<Header bind:loading bind:issues bind:currentView bind:isHours />

	<!-- Loading Spinner when refreshing -->
	{#if loading}
		<LoadingSpinner />
	{/if}

	<!-- Conditional Rendering for Issues and Views -->
	{#if !issues || issues.length === 0}
		<LoadingSpinner />
	{:else if currentView === 'time'}
		<div>
			<TimeSpentBurndownChart {timeData} bind:timeUnit />
			<TimeTable userData={timeData} {timeUnit} />
		</div>
	{:else}
		<FilterInput labels={allLabels} {selectedLabels} on:filterChange={handleFilterChange} />
		<IssueTable {issues} {timeUnit} />
	{/if}
</div>
