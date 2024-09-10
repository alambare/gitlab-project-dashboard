<script lang="ts">
	import type { TimeData, TimeUnit } from '$lib/types';
	import { onDestroy, onMount } from 'svelte';
	import { HOURS_PER_DAY, TIMEUNIT_HOURS } from '../../constant';

	export let userData: TimeData = {};
	export let timeUnit: 'hours' | 'days' = 'hours';

	let months: string[] = [];
	let users: string[] = [];
	let monthlyTimeData: { user: string; row: { month: string; timeSpent: number }[] }[] = [];
	let formattedTimeData: { user: string; row: { month: string; timeSpent: string }[] }[] = [];

	const monthSet = new Set<string>();
	const userSet = new Set<string>();

	for (const user in userData) {
		userSet.add(user);
		for (const day in userData[user]) {
			const date = new Date(day);
			const month = date.toLocaleString('default', { month: '2-digit' });
			const year = date.getFullYear();
			monthSet.add(`${month}/${year}`);
		}
	}

	// Convert months to 'YYYY-MM' format for sorting
	const sortableMonths = Array.from(monthSet).map((month) => {
		const [mm, yyyy] = month.split('/');
		return `${yyyy}-${mm}`;
	});

	// Sort the months
	sortableMonths.sort((a, b) => a.localeCompare(b));

	// Convert back to 'MM/YYYY' format for display
	months = sortableMonths.map((date) => {
		const [yyyy, mm] = date.split('-');
		return `${mm}/${yyyy}`;
	});

	users = Array.from(userSet).sort();

	monthlyTimeData = users.map((user) => {
		const row: { month: string; timeSpent: number }[] = months.map((month) => {
			// Convert the month back to the 'YYYY-MM' format to match the sorting format
			const [mm, yyyy] = month.split('/');
			const formattedMonth = `${yyyy}-${mm}`;

			const totalTimeSpent = Object.keys(userData[user])
				.filter((day) => {
					const dayMonthYear = new Date(day);
					const dayMonth = dayMonthYear.toLocaleString('default', { month: '2-digit' });
					const dayYear = dayMonthYear.getFullYear();
					return `${dayYear}-${dayMonth}` === formattedMonth;
				})
				.reduce((acc, day) => acc + (userData[user][day]?.totalSeconds || 0), 0);
			return {
				month,
				timeSpent: totalTimeSpent
			};
		});
		return { user, row };
	});

	// Format the time data based on the current timeUnit
	function formatTimeData(timeUnit: TimeUnit) {
		formattedTimeData = monthlyTimeData.map(({ user, row }) => ({
			user,
			row: row.map(({ month, timeSpent }) => ({
				month,
				timeSpent: formatTime(timeUnit, timeSpent)
			}))
		}));
	}

	// Helper function to format time based on the timeUnit
	function formatTime(timeUnit: TimeUnit, seconds: number): string {
		const hours = seconds / 3600;
		if (timeUnit === TIMEUNIT_HOURS) {
			return hours.toFixed(0);
		} else {
			return (hours / HOURS_PER_DAY).toFixed(2);
		}
	}

	// Reactive statements
	$: formatTimeData(timeUnit);

	let tableContainer: HTMLDivElement;

	const scrollToRight = () => {
		if (tableContainer) {
			tableContainer.scrollLeft = tableContainer.scrollWidth;
		}
	};

	onMount(() => {
		// Scroll to the right after the component is mounted
		scrollToRight();

		// Add resize event listener
		window.addEventListener('resize', scrollToRight);
	});

	onDestroy(() => {
		// Clean up event listener on component destroy
		window.removeEventListener('resize', scrollToRight);
	});

	$: {
		// Ensure to scroll to the right whenever the months or table is updated
		scrollToRight();
	}
</script>

<div class="mb-4 text-left">
	<h2 class="mb-2 text-2xl font-bold text-gray-800">Monthly resources usage</h2>
</div>

<div class="overflow-x-auto" bind:this={tableContainer}>
	<table class="min-w-full border-collapse border border-gray-300">
		<thead class="bg-gray-100">
			<tr>
				<th class="border-b px-4 py-2 text-left">User</th>
				{#each months as month}
					<th class="border-b px-4 py-2 text-right">{month}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each formattedTimeData as { user, row }}
				<tr>
					<td class="border-b px-4 py-2 font-semibold">{user}</td>
					{#each row as { month, timeSpent }}
						<td class="border-b px-4 py-2 text-right">
							{#if parseFloat(timeSpent) > 0}
								{timeSpent}
							{/if}
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>
