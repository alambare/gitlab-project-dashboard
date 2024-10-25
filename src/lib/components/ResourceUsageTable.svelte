<script lang="ts">
	import SortArrow from './SortArrow.svelte';
	import type { Task, TimeData, TimeUnit } from '$lib/types';
	import { TIMEUNIT_HOURS, HOURS_PER_DAY } from '../../constant';

	// Import the stores
	import {
		selectedMemberStore,
		selectedMonthYearStore,
		sortFieldStore,
		sortAscendingStore
	} from '../../stores';

	// Input parameters
	export let timeData: TimeData;
	export let timeUnit: TimeUnit;

	// Convert TimeData to tasks format for display
	let tasks: Task[] = [];
	let monthsYears = new Set<string>();
	let members: string[];

	$: {
		tasks = [];
		monthsYears.clear();

		for (const [member, days] of Object.entries(timeData)) {
			for (const [day, userDayTime] of Object.entries(days)) {
				for (const issue of userDayTime.issues) {
					const date = new Date(day);
					const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });

					// Register the month-year for table columns
					monthsYears.add(monthYear);

					let existingTask = tasks.find(
						(task) => task.member === member && task.task === issue.title
					);

					if (!existingTask) {
						existingTask = {
							member,
							task: issue.title,
							url: issue.url,
							hours: {}
						};
						tasks.push(existingTask);
					}

					// Accumulate time spent in hours or days based on timeUnit
					const timeInHours = issue.timeSpent / 3600; // Convert seconds to hours
					const timeToAdd =
						timeUnit === TIMEUNIT_HOURS
							? timeInHours // Show in hours
							: timeInHours / HOURS_PER_DAY; // Convert to days

					if (!existingTask.hours[monthYear]) {
						existingTask.hours[monthYear] = 0;
					}
					existingTask.hours[monthYear] += timeToAdd;
				}
			}
		}

		monthYearArray = Array.from(monthsYears).sort(
			(a, b) => new Date(a).getTime() - new Date(b).getTime()
		);

		members = Array.from(new Set(tasks.map((task) => task.member)));
	}

	// Convert Set to sorted array of month-year strings
	let monthYearArray = Array.from(monthsYears).sort(
		(a, b) => new Date(a).getTime() - new Date(b).getTime()
	);

	// Subscribe to the stores for filtering and sorting
	let selectedMember = '';
	let selectedMonthYear = '';
	let sortField: 'member' | 'task' = 'member'; // Default sort by team member
	let sortAscending: boolean = true;

	$: selectedMemberStore.subscribe((value) => {
		selectedMember = value;
	});

	$: selectedMonthYearStore.subscribe((value) => {
		selectedMonthYear = value;
	});

	$: sortFieldStore.subscribe((value) => {
		sortField = value;
	});

	$: sortAscendingStore.subscribe((value) => {
		sortAscending = value;
	});

	function toggleSort(field: 'member' | 'task') {
		if (sortField === field) {
			sortAscendingStore.update((n) => !n); // Toggle sort order if sorting the same field
		} else {
			sortFieldStore.set(field);
			sortAscendingStore.set(true); // Default to ascending when switching fields
		}
	}

	// Computed filtered and sorted tasks based on selected member, month-year, and sorting
	$: filteredTasks = tasks
		.filter((task) => {
			return (
				(!selectedMember || task.member === selectedMember) &&
				(!selectedMonthYear || task.hours[selectedMonthYear]) // Use selectedMonthYear with correct type
			);
		})
		.sort((a, b) => {
			// Perform sorting based on the sortField and sortAscending flag
			if (sortField === 'member') {
				return sortAscending ? a.member.localeCompare(b.member) : b.member.localeCompare(a.member);
			} else if (sortField === 'task') {
				return sortAscending ? a.task.localeCompare(b.task) : b.task.localeCompare(a.task);
			}
			return 0;
		});
</script>

<div class="mb-4 text-left">
	<h2 class="mb-2 text-2xl font-bold text-gray-800">Usage</h2>
</div>

<!-- Filters -->
<div class="mb-4 flex items-center justify-between">
	<!-- Filter by Team Member -->
	<div class="w-1/3">
		<label for="member" class="block font-medium text-gray-700">Filter by Member:</label>
		<select
			id="member"
			class="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
			bind:value={$selectedMemberStore}
		>
			<option value="">All Members</option>
			{#each members as member}
				<option value={member}>{member}</option>
			{/each}
		</select>
	</div>

	<div class="w-1/3">
		<!-- TODO: replace this filter by a month year calendar. Display only the filtered months. -->
		<label for="monthYear" class="block font-medium text-gray-700">Filter by Month-Year:</label>
		<select
			id="monthYear"
			class="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
			bind:value={$selectedMonthYearStore}
		>
			<option value="">All Months</option>
			{#each monthYearArray as monthYear}
				<option value={monthYear}>{monthYear}</option>
			{/each}
		</select>
	</div>
</div>

<div class="overflow-x-auto">
	<table class="min-w-full divide-y divide-gray-200 rounded-lg border border-gray-200">
		<thead class="bg-gray-50">
			<tr>
				<!-- Sort by Team Member -->
				<th
					class="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
					on:click={() => toggleSort('member')}
				>
					<div class="flex items-center">
						Team Member
						<SortArrow isActive={sortField === 'member'} isAscending={sortAscending} />
					</div>
				</th>

				<!-- Sort by Task -->
				<th
					class="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
					on:click={() => toggleSort('task')}
				>
					<div class="flex items-center">
						Task
						<SortArrow isActive={sortField === 'task'} isAscending={sortAscending} />
					</div>
				</th>

				{#each monthYearArray as monthYear}
					<th
						class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
					>
						{monthYear}
					</th>
				{/each}
			</tr>
		</thead>

		<tbody class="divide-y divide-gray-200 bg-white">
			{#each filteredTasks as task}
				<tr>
					<td class="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
						{task.member}
					</td>
					<td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
						<a href={task.url}>{task.task}</a>
					</td>
					{#each monthYearArray as monthYear}
						<td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
							{task.hours[monthYear]?.toFixed(2) || '-'}
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>
