<script lang="ts">
	import { onMount } from 'svelte';
	import { fetchGitLabIssues, fetchGitLabContainers } from '$lib/gitlab';
	import TimeTable from '$lib/components/TimeTable.svelte';
	import IssueTable from '$lib/components/IssueTable.svelte';
	import Settings from '$lib/components/Settings.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import { calculateTimeSpentByUserByDay } from '$lib/utils';
	import { TIMEUNIT_DAYS, TIMEUNIT_HOURS } from '../constant';
	import { type TimeData, type Issue, type TimeUnit, type Container } from '$lib/types';
	import Header from '$lib/components/Header.svelte';
	import ResourceUsageTable from '$lib/components/ResourceUsageTable.svelte';
	import { accessToken, currentContainerStore } from '../stores'; // Import the store for the GitLab token

	let issues: Issue[] = [];
	let timeData: TimeData = {};
	let timeUnit: TimeUnit = TIMEUNIT_HOURS;
	let isHours: boolean = false;
	let currentView: 'tasks' | 'resources' | 'settings' = 'resources'; // Include 'settings' in the type
	let loading: boolean = false;
	let containers: Container[] | null = null;
	let currentContainer: Container | null = null; // Initialize currentContainer

	// Subscribe to currentContainerStore to get the current container
	currentContainerStore.subscribe((value) => {
		currentContainer = value;
	});

	onMount(async () => {
		const token = $accessToken;
		if (!token) {
			currentView = 'settings';
			return;
		}

		// Fetch issues only if there is a current container
		loading = true;
		if (currentContainer) {
			issues = await fetchGitLabIssues(fetch);
		} else {
			containers = await fetchGitLabContainers(fetch);
		}
		loading = false;
	});

	$: isHours, (timeUnit = isHours ? TIMEUNIT_HOURS : TIMEUNIT_DAYS);
	$: timeData = calculateTimeSpentByUserByDay(issues);
</script>

<div class="container mx-auto rounded-lg bg-white px-4 py-6 shadow-md">
	<div class="sticky top-0 z-10 bg-white">
		<Header bind:loading bind:issues bind:currentView bind:isHours bind:containers />
	</div>

	{#if currentView === 'settings'}
		<Settings bind:issues bind:containers />
	{:else if loading}
		<LoadingSpinner />
	{:else if !currentContainer}
		<p class="text-gray-600">Please select a project or a group to continue.</p>
	{:else if !issues || issues.length === 0}
		<p class="text-gray-600">No issues found for the selected {currentContainer.type}.</p>
	{:else if currentView === 'resources'}
		<!-- TODO: add a message on both table to inform user to declare spent time on gitlab issues. -->
		<div>
			<div class="mb-4">
				<TimeTable userData={timeData} {timeUnit} />
			</div>
			<ResourceUsageTable {timeData} {timeUnit} />
		</div>
	{:else if currentView === 'tasks'}
		<IssueTable {issues} {timeUnit} />
	{/if}
</div>
