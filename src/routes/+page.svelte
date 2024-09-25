<script lang="ts">
	import { onMount } from 'svelte';
	import { fetchGitLabIssues } from '$lib/api/gitlab';
	import TimeTable from '$lib/components/TimeTable.svelte';
	import IssueTable from '$lib/components/IssueTable.svelte';
	import Settings from '$lib/components/Settings.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import { calculateTimeSpentByUserByDay } from '$lib/utils';
	import { TIMEUNIT_DAYS, TIMEUNIT_HOURS } from '../constant';
	import { type TimeData, type Issue, type TimeUnit } from '$lib/types';
	import Header from '$lib/components/Header.svelte';
	import ResourceUsageTable from '$lib/components/ResourceUsageTable.svelte';
	import { accessToken } from '../stores'; // Import the store for the GitLab token

	let issues: Issue[] = [];
	let timeData: TimeData = {};
	let timeUnit: TimeUnit = TIMEUNIT_HOURS;
	let isHours: boolean = false;
	let currentView: 'tasks' | 'resources' | 'settings' = 'resources'; // Include 'settings' in the type
	let loading: boolean = false;

	onMount(async () => {
		// Check if GitLab access token is set
		const token = $accessToken; // Access the store value
		if (!token) {
			currentView = 'settings'; // Set view to settings if no token is set
			return; // Exit early
		}

		// Fetch GitLab issues only if token is present
		issues = await fetchGitLabIssues(fetch);
	});

	$: isHours, (timeUnit = isHours ? TIMEUNIT_HOURS : TIMEUNIT_DAYS);
	$: timeData = calculateTimeSpentByUserByDay(issues);
</script>

<div class="container mx-auto rounded-lg bg-white px-4 py-6 shadow-md">
	<div class="sticky top-0 z-10 bg-white">
		<Header bind:loading bind:issues bind:currentView bind:isHours />
	</div>

	{#if currentView === 'settings'}
		<Settings bind:issues />
	{:else if loading || !issues || issues.length === 0}
		<LoadingSpinner />
	{:else if currentView === 'resources'}
		<div>
			<!-- <ResourceUsageBurnDownChart {timeData} bind:timeUnit /> -->
			<div class="mb-4">
				<TimeTable userData={timeData} {timeUnit} />
			</div>
			<ResourceUsageTable {timeData} {timeUnit} />
		</div>
	{:else if currentView === 'tasks'}
		<IssueTable {issues} {timeUnit} />
	{/if}
</div>
