<script lang="ts">
	import type { TimeData, TimeUnit } from '$lib/types';
	import { onDestroy, onMount } from 'svelte';
	import { formatTime } from '$lib/utils';

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

	const sortableMonths = Array.from(monthSet).map((month) => {
		const [mm, yyyy] = month.split('/');
		return `${yyyy}-${mm}`;
	});

	sortableMonths.sort((a, b) => a.localeCompare(b));

	months = sortableMonths.map((date) => {
		const [yyyy, mm] = date.split('-');
		return `${mm}/${yyyy}`;
	});

	users = Array.from(userSet).sort();

	monthlyTimeData = users.map((user) => {
		const row: { month: string; timeSpent: number }[] = months.map((month) => {
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

	function formatTimeData(timeUnit: TimeUnit) {
		formattedTimeData = monthlyTimeData.map(({ user, row }) => ({
			user,
			row: row.map(({ month, timeSpent }) => ({
				month,
				timeSpent: formatTime(timeUnit, timeSpent)
			}))
		}));
	}

	$: formatTimeData(timeUnit);

	let tableContainer: HTMLDivElement;

	const scrollToRight = () => {
		if (tableContainer) {
			tableContainer.scrollLeft = tableContainer.scrollWidth;
		}
	};

	onMount(() => {
		scrollToRight();
		window.addEventListener('resize', scrollToRight);
	});

	onDestroy(() => {
		window.removeEventListener('resize', scrollToRight);
	});

	$: {
		scrollToRight();
	}
</script>

<div class="mb-4 text-left">
	<h2 class="mb-2 text-2xl font-bold text-gray-800">Monthly usage</h2>
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
