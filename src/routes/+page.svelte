<script lang="ts">
	import TimeTable from '$lib/components/TimeTable.svelte';
	import IssueTable from '$lib/components/IssueTable.svelte';
	// import FilterInput from '$lib/components/FilterInput.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	// import ResourceUsageBurnDownChart from '$lib/components/ResourceUsageBurnDownChart.svelte';
	import { calculateTimeSpentByUserByDay } from '$lib/utils';
	import { TIMEUNIT_DAYS, TIMEUNIT_HOURS } from '../constant';
	import { type TimeData, type Issue, type Label, type TimeUnit } from '$lib/types';
	import Header from '$lib/components/Header.svelte';
	import ResourceUsageTable from '$lib/components/ResourceUsageTable.svelte';

	export let data: { issues: Issue[] };

	let issues: Issue[] = data.issues;
	let timeData: TimeData = {};
	let timeUnit: TimeUnit = TIMEUNIT_HOURS;
	let isHours: boolean = false;
	let currentView: 'tasks' | 'resources' = 'resources';
	let loading = false;

	$: isHours, (timeUnit = isHours ? TIMEUNIT_HOURS : TIMEUNIT_DAYS);

	timeData = calculateTimeSpentByUserByDay(issues);
</script>

<div class="container mx-auto rounded-lg bg-white px-4 py-6 shadow-md">
	<div class="sticky top-0 z-10 bg-white">
		<Header bind:loading bind:issues bind:currentView bind:isHours />
	</div>

	{#if loading}
		<LoadingSpinner />
	{/if}

	{#if !issues || issues.length === 0}
		<LoadingSpinner />
	{:else if currentView === 'resources'}
		<div>
			<!-- <ResourceUsageBurnDownChart {timeData} bind:timeUnit /> -->
			<div class="mb-4">
				<TimeTable userData={timeData} {timeUnit} />
			</div>
			<ResourceUsageTable {timeData} {timeUnit} />
		</div>
	{:else}
		<IssueTable {issues} {timeUnit} />
	{/if}
</div>
