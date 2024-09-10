<script lang="ts">
	import TimeTable from '$lib/components/TimeTable.svelte';
	import IssueTable from '$lib/components/IssueTable.svelte';
	import FilterInput from '$lib/components/FilterInput.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import type { Issue, Label, TimeData, TimeUnit } from '$lib/types';
	import { calculateTimeSpentByUserByDay } from '$lib/utils';
	import TimeSpentBurndownChart from '$lib/components/TimeSpentBurndownChart.svelte';
	import { TIMEUNIT_DAYS, TIMEUNIT_HOURS } from '../constant';

	export let data: { issues: Issue[] };

	let issues: Issue[] = data.issues;
	let filteredIssues: Issue[] = issues;
	let allLabels: Label[] = getUniqueLabels();
	let selectedLabels: string[] = [];
	let timeData: TimeData = {};
	let timeUnit: TimeUnit = TIMEUNIT_HOURS;
	let isHours: boolean = false;
	let currentView: 'table' | 'time' = 'time';

	const toggleView = () => {
		currentView = currentView === 'table' ? 'time' : 'table';
	};

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

<div class="container mx-auto rounded-lg bg-white px-4 py-6 shadow-md">
	<h1 class="mb-6 text-center text-2xl font-semibold text-gray-800">GitLab Issues Dashboard</h1>

	<div class="mb-4 text-center">
		<button class="rounded bg-blue-600 px-4 py-2 text-white" on:click={toggleView}>
			Switch to {currentView === 'time' ? 'Table View' : 'Time View'}
		</button>

		{#if currentView === 'time'}
			<!-- Tailwind Toggle for Days/Hours Switch -->
			<div class="mt-4 flex items-center justify-end space-x-4">
				<!-- Label for Days -->
				<span class="text-sm font-medium text-gray-900 dark:text-gray-300">Days</span>

				<label class="inline-flex cursor-pointer items-center">
					<input bind:checked={isHours} type="checkbox" value="" class="peer sr-only" />
					<div
						class="peer relative h-6 w-14 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-yellow-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-blue-500 peer-checked:after:translate-x-7 peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rtl:peer-checked:after:-translate-x-full dark:after:border-gray-600 dark:peer-focus:ring-blue-800"
					></div>
				</label>

				<!-- Label for Hours -->
				<span class="text-sm font-medium text-gray-900 dark:text-gray-300">Hours</span>
			</div>
		{/if}
	</div>

	{#if !issues || issues.length === 0}
		<LoadingSpinner />
	{:else if currentView === 'time'}
		<div>
			<TimeSpentBurndownChart {timeData} bind:timeUnit />
			<TimeTable userData={timeData} {timeUnit} />
		</div>
	{:else}
		<FilterInput labels={allLabels} {selectedLabels} on:filterChange={handleFilterChange} />
		<IssueTable issues={filteredIssues} />
	{/if}
</div>
