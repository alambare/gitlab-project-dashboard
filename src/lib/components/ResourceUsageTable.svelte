<script lang="ts">
	import SortArrow from './SortArrow.svelte';
	import type { Task, TimeData, TimeUnit } from '$lib/types';
	import { TIMEUNIT_HOURS, HOURS_PER_DAY } from '../../constant';

	// Import the stores
	import {
		selectedMemberStore,
		selectedTemporalRange,
		sortFieldStore,
		sortAscendingStore
	} from '../../stores';

	// Input parameters
	export let timeData: TimeData;
	export let timeUnit: TimeUnit;

	// Convert TimeData to tasks format for display
	let tasks: Task[] = [];
	let members: string[] = [];
	let monthYearArray: string[] = [];
	let allMonthYears: string[] = [];

	let earliestMonthYear: string | null = null;
	let latestMonthYear: string | null = null;

	// Track the selected range
	let selectedRange = { from: '', to: '' };

	// Subscribe to the stores for filtering and sorting
	let selectedMember = '';
	let sortField: 'member' | 'task' = 'member'; // Default sort by team member
	let sortAscending: boolean = true;

	$: selectedMemberStore.subscribe((value) => {
		selectedMember = value;
	});

	$: sortFieldStore.subscribe((value) => {
		sortField = value;
	});

	$: sortAscendingStore.subscribe((value) => {
		sortAscending = value;
	});

	$: selectedTemporalRange.subscribe((value) => {
		selectedRange.from = value.from;
		selectedRange.to = value.to;
	});

	// Computed filtered and sorted tasks based on selected member, month-year, and sorting
	$: filteredTasks = tasks
		.filter((task) => {
			const fromDate = selectedRange.from && selectedRange.from !== '' ? selectedRange.from : null;
			const toDate = selectedRange.to && selectedRange.to !== '' ? selectedRange.to : null;

			return (
				(!selectedMember || task.member === selectedMember) &&
				Object.keys(task.hours).some((monthYear) => {
					// Convert taskDate from "MMM YYYY" to "YYYY-MM" format
					const [month, year] = monthYear.split(' '); // Split "Oct 2024" into ["Oct", "2024"]
					const monthNumber = new Date(`${month} 1, 2020`).getMonth() + 1; // Get month number (1-based)
					const taskDate = `${year}-${monthNumber.toString().padStart(2, '0')}`; // Convert to "YYYY-MM" format

					// Check if the taskDate is within the range
					const isAfterFromDate = fromDate ? taskDate >= fromDate : true;
					const isBeforeToDate = toDate ? taskDate <= toDate : true;

					return isAfterFromDate && isBeforeToDate;
				})
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

	// Populate tasks from timeData
	$: {
		let monthYears = new Set<string>();
		tasks = [];
		for (const [member, days] of Object.entries(timeData)) {
			for (const [day, userDayTime] of Object.entries(days)) {
				for (const issue of userDayTime.issues) {
					const date = new Date(day);
					const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });

					monthYears.add(monthYear);

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

		allMonthYears = Array.from(monthYears).sort(
			(a, b) => new Date(a).getTime() - new Date(b).getTime()
		);

		const earliestDate = allMonthYears[0] ? new Date(allMonthYears[0]) : null;
		const latestDate = allMonthYears[allMonthYears.length - 1]
			? new Date(allMonthYears[allMonthYears.length - 1])
			: null;

		// Format the dates as "YYYY-MM"
		const formatDate = (date: Date | null) =>
			date ? `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}` : null;

		earliestMonthYear = formatDate(earliestDate);
		latestMonthYear = formatDate(latestDate);

		monthYearArray = allMonthYears;
		members = Array.from(new Set(tasks.map((task) => task.member)));
	}

	// Dynamically generate monthYearArray based on selected range
	$: {
		monthYearArray = allMonthYears.filter((monthYear) => {
			const monthYearDate = new Date(`${monthYear}-01`);

			const fromDate = selectedRange.from ? new Date(`${selectedRange.from}-01`) : null;
			const toDate = selectedRange.to ? new Date(`${selectedRange.to}-01`) : null;

			// Normalize the dates (set hours, minutes, seconds, and milliseconds to 0)
			monthYearDate.setHours(0, 0, 0, 0);
			if (fromDate) fromDate.setHours(0, 0, 0, 0);
			if (toDate) toDate.setHours(0, 0, 0, 0);

			return (
				(fromDate ? monthYearDate >= fromDate : true) && (toDate ? monthYearDate <= toDate : true)
			);
		});
	}

	function toggleSort(field: 'member' | 'task') {
		if (sortField === field) {
			sortAscendingStore.update((n) => !n); // Toggle sort order if sorting the same field
		} else {
			sortFieldStore.set(field);
			sortAscendingStore.set(true); // Default to ascending when switching fields
		}
	}
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
		<div class="mt-1 flex items-center space-x-2">
			<!-- From Label and Input -->
			<div class="flex w-1/2 flex-col items-start">
				<label for="fromMonthYear" class="mb-1 block font-medium text-gray-700">From</label>
				<input
					type="month"
					id="fromMonthYear"
					min={earliestMonthYear}
					max={latestMonthYear}
					class="block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
					bind:value={$selectedTemporalRange.from}
				/>
			</div>

			<!-- To Label and Input -->
			<div class="flex w-1/2 flex-col items-start">
				<label for="toMonthYear" class="mb-1 block font-medium text-gray-700">To</label>
				<input
					type="month"
					id="toMonthYear"
					min={earliestMonthYear}
					max={latestMonthYear}
					class="block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
					bind:value={$selectedTemporalRange.to}
				/>
			</div>
		</div>
	</div>
</div>

<div class="overflow-x-auto">
	<table class="min-w-full divide-y divide-gray-200 rounded-lg border border-gray-200">
		<thead class="bg-gray-50">
			<tr>
				<th
					class="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
					on:click={() => toggleSort('member')}
				>
					<div class="flex items-center">
						Team Member
						<SortArrow isActive={sortField === 'member'} isAscending={sortAscending} />
					</div>
				</th>

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
