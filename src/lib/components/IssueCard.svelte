<script lang="ts">
	import { gitlabRestRequest } from '$lib/gitlab';
	import type { Issue, TimeUnit, Timelog } from '$lib/types';
	import IssueSumary from '$lib/components/IssueSumary.svelte';
	import RelatedIssueItem from '$lib/components/RelatedIssueItem.svelte';
	import { onMount } from 'svelte';
	import { formatTime } from '$lib/utils';

	export let issue: Issue;
	export let allIssues: Issue[];
	export let timeUnit: TimeUnit;

	let relatedIssues: Issue[] = [];
	let isLoading = true;
	let showRelatedIssues = false;
	let userTimeSpent: { [username: string]: number } = {};
	let totalTimeSpentWithRelated: number = 0;

	function calculateUserTimeSpent() {
		userTimeSpent = {};

		const sumTimeForUser = (timelogs: Timelog[]) => {
			timelogs.forEach((log: Timelog) => {
				const username = log.user.username;
				const timeSpent = log.timeSpent;

				if (userTimeSpent[username]) {
					userTimeSpent[username] += timeSpent;
				} else {
					userTimeSpent[username] = timeSpent;
				}
			});
		};

		sumTimeForUser(issue.timelogs.nodes);

		relatedIssues.forEach((relatedIssue) => {
			sumTimeForUser(relatedIssue.timelogs.nodes);
		});
	}

	async function fetchRelatedIssues() {
		try {
			const endpoint = `/projects/${issue.projectId}/issues/${issue.iid}/links`;
			const links = await gitlabRestRequest(endpoint);

			if (Array.isArray(links)) {
				const relatedPromises = links.map(async (link) => {
					const relatedIssue = allIssues.find((i) => i.id.endsWith('/' + link.id));
					if (relatedIssue) {
						return relatedIssue;
					} else {
						console.error('Error finding issue:', link);
						return undefined;
					}
				});

				relatedIssues = (await Promise.all(relatedPromises)).filter(
					(issue): issue is Issue => issue !== undefined
				);

				// Calculate total time spent from related issues
				totalTimeSpentWithRelated = relatedIssues.reduce((sum, relatedIssue) => {
					return sum + relatedIssue.totalTimeSpent;
				}, 0);
			} else {
				console.error('Expected an array but got:', links);
			}
		} catch (error) {
			console.error('Error fetching related issues:', error);
		} finally {
			isLoading = false;
			calculateUserTimeSpent(); // You can call this if you still need to calculate user time spent
		}
	}

	// Reactive statement for total time spent
	$: totalTimeSpent = issue.totalTimeSpent + totalTimeSpentWithRelated;

	onMount(() => {
		fetchRelatedIssues();
		calculateUserTimeSpent();
	});
</script>

<div class={`rounded-lg bg-white p-4 shadow-md ${issue.closedAt ? 'opacity-50' : ''}`}>
	<IssueSumary {issue} {timeUnit} {totalTimeSpent} bind:showRelatedIssues />

	<div class="mt-2">
		{#if showRelatedIssues}
			<div class="mt-4">
				<div class="mt-2 flex flex-wrap text-sm text-gray-700">
					<p class="mr-2">Resources spent:</p>
					{#each Object.entries(userTimeSpent) as [username, timeSpent]}
						<div class="mb-2 mr-4">
							<span class="font-semibold">{username}:</span>
							<span> {formatTime(timeUnit, timeSpent)}</span>
						</div>
					{/each}
				</div>
			</div>

			{#if isLoading}
				<div class="mt-4 text-center text-gray-600">Loading related issues...</div>
			{:else if relatedIssues.length > 0}
				<div class="ml-6 mt-4 space-y-2">
					{#each relatedIssues as relatedIssue}
						<RelatedIssueItem {relatedIssue} {timeUnit} />
					{/each}
				</div>
			{:else}
				<div class="mt-4 text-center text-gray-600">No related issues found</div>
			{/if}
		{/if}
	</div>
</div>
