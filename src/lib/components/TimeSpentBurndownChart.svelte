<script lang="ts">
	import { Line } from 'svelte-chartjs';
	import {
		Chart,
		LineElement,
		PointElement,
		Title,
		Tooltip,
		Legend,
		LinearScale,
		TimeScale,
		CategoryScale,
		Filler,
		type ChartOptions,
		type ChartDataset
	} from 'chart.js';

	import zoomPlugin from 'chartjs-plugin-zoom';

	import 'chartjs-adapter-date-fns';

	// Register necessary components
	Chart.register(
		LineElement,
		PointElement,
		Title,
		Tooltip,
		Legend,
		LinearScale,
		CategoryScale,
		TimeScale,
		Filler,
		zoomPlugin
	);

	import type { TimeData, TimeUnit } from '$lib/types';

	import { sortDates } from '$lib/utils';
	import { HOURS_PER_DAY, SECONDS_PER_DAY, TIMEUNIT_HOURS } from '../../constant';
	import { onDestroy, onMount } from 'svelte';

	interface Resource {
		user: string;
		capacity: number; // hours expected
		startDate: string; // Use ISO 8601 format (YYYY-MM-DD) for consistency
	}

	type DataPoint = { x: string; y: number };

	export let timeData: TimeData;
	export let timeUnit: TimeUnit;
	export let resources: Resource[] = [
		{ user: 'aubin.lambare', capacity: 70, startDate: '2022-01-01' },
		{ user: 'benjamin.giraudon', capacity: 210, startDate: '2022-01-01' },
		{ user: 'julia.lahovnik', capacity: 300, startDate: '2022-01-01' },
		{ user: 'nicola.dalpasso', capacity: 200, startDate: '2022-01-01' }
	];
	let labels: string[] = [];
	let datasets: ChartDataset<'line', DataPoint[]>[] = [];

	const chartOptions: ChartOptions<'line'> = {
		responsive: true,
		maintainAspectRatio: true,
		plugins: {
			legend: {
				position: 'top',
				labels: {
					usePointStyle: true,
					pointStyle: 'circle',
					boxWidth: 20,
					padding: 20,
					filter: (item) => item.text !== 'Zero Line'
				}
			},
			title: {
				display: true,
				text: 'Resources burn down chart',
				align: 'start',
				padding: {
					top: 10,
					bottom: 20
				},
				font: {
					size: 24, // Adjust the size as needed
					weight: 'bold', // Make the font bold
					family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif" // Adjust font family if desired
				},
				color: '#333', // Adjust color if needed
				position: 'top' // You can adjust the position (e.g., 'top', 'bottom')
			},
			tooltip: {
				enabled: true,
				callbacks: {
					label: (context) => `${context.dataset.label}: ${context.formattedValue} ${timeUnit}`
				}
			},
			zoom: {
				pan: {
					enabled: true,
					modifierKey: 'ctrl'
				},
				zoom: {
					mode: 'x', // Enable zooming in the x-axis direction
					drag: {
						enabled: true, // Enable drag to zoom
						backgroundColor: 'rgba(0, 0, 0, 0.1)' // Optional: Highlight zoom area with a rectangle
					},
					// onZoom: () => {
					// 	zoomEnabled = true; // Enable the reset button when zoomed in
					// },
					onZoomComplete: () => {
						zoomEnabled = true;
					}
				}
			}
		},
		scales: {
			x: {
				// title: { display: true, text: 'Day' },
				position: 'bottom',
				type: 'time',
				ticks: {
					autoSkip: true,
					autoSkipPadding: 50,
					maxRotation: 0,
					maxTicksLimit: 20
				},
				// type: 'time',
				time: {
					unit: 'day',
					tooltipFormat: 'yyyy-MM-dd'
				}
				// afterBuildTicks: () => {
				// 	const lastLabel = labels[labels.length - 1];
				// 	if (lastLabel) {
				// 		const futureDate = addDays(new Date(lastLabel), 10).toISOString().slice(0, 10);
				// 		if (!labels.includes(futureDate)) {
				// 			labels.push(futureDate);
				// 		}
				// 	}
				// }
			},
			y: {
				title: { display: true, text: 'Available resources' },
				beginAtZero: true
			}
		},
		elements: {
			point: {
				radius: 1,
				borderWidth: 0
			},
			line: {
				borderWidth: 2 // Set line thickness
			}
		},
		layout: {
			padding: {
				top: 10,
				bottom: 20
			}
		}
	};

	const generateDistinctColor = (index: number, total: number): string => {
		const hue = (index / total) * 360;
		const saturation = 70;
		const lightness = 50;
		return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
	};

	// This is the reactive block that recalculates datasets whenever `timeUnit` changes.
	$: updateDatasets(timeUnit);

	function updateDatasets(timeUnit: TimeUnit) {
		let userDatasets: { [key: string]: ChartDataset<'line', DataPoint[]> } = {};
		let globalResourceMap: { [key: string]: number } = {}; // Track global capacity and spending
		labels = [];
		datasets = [];

		const totalUsers = Object.keys(timeData).length + 1;
		let colorIndex = 0;
		let hasBelowZero = false;

		const addDataPoint = (user: string, day: string, value: number) => {
			const scaledValue = value / (timeUnit === TIMEUNIT_HOURS ? 1 : HOURS_PER_DAY);
			const dataPoints = userDatasets[user].data;

			// Add or update data point
			const existingPoint = dataPoints.find((dp) => dp.x === day);
			if (existingPoint) {
				existingPoint.y += scaledValue;
			} else {
				dataPoints.push({ x: day, y: scaledValue });
			}
		};

		// Initialize user datasets
		Object.entries(timeData).forEach(([user, days]) => {
			userDatasets[user] = {
				label: user,
				data: [],
				borderColor: generateDistinctColor(colorIndex, totalUsers),
				backgroundColor: generateDistinctColor(colorIndex, totalUsers),
				fill: false
			};
			colorIndex++;

			// Combine resource capacity and spending data for the user
			const resourceMap: { [key: string]: number } = {};

			// Add resources capacity to the resourceMap
			resources
				.filter((r) => r.user === user)
				.forEach((resource) => {
					const startDateStr = new Date(resource.startDate).toISOString().slice(0, 10);
					if (!resourceMap[startDateStr]) {
						resourceMap[startDateStr] = resource.capacity;
					} else {
						resourceMap[startDateStr] += resource.capacity;
					}
				});

			// Subtract spent resources (add negative values) from the resourceMap
			Object.entries(days).forEach(([day, data]) => {
				const spent_hours = (data.totalSeconds / SECONDS_PER_DAY) * HOURS_PER_DAY;
				if (!resourceMap[day]) resourceMap[day] = 0;
				resourceMap[day] -= spent_hours;
			});

			// Now we have both capacities and spent hours for each day in resourceMap
			const sortedDays = sortDates(Object.keys(resourceMap));
			let cumulativeSum = 0;

			sortedDays.forEach((day) => {
				cumulativeSum += resourceMap[day] || 0; // Add capacity, subtract spent hours
				addDataPoint(user, day, cumulativeSum);

				if (cumulativeSum < 0) {
					hasBelowZero = true;
				}

				// Track global capacity and usage
				if (!globalResourceMap[day]) globalResourceMap[day] = 0;
				globalResourceMap[day] += resourceMap[day]; // Add the user's contribution to the global total
			});
		});

		// Generate the overall dataset for total remaining resources
		const sortedGlobalDays = sortDates(Object.keys(globalResourceMap));
		let globalCumulativeSum = 0;
		const globalAccumulated: { [key: string]: number } = {};

		sortedGlobalDays.forEach((day) => {
			globalCumulativeSum += globalResourceMap[day] || 0; // Add the current day's value to the global cumulative sum
			globalAccumulated[day] = globalCumulativeSum; // Store the accumulative sum for this date
		});

		datasets = [
			{
				label: 'Total Remaining Resources',
				data: sortedGlobalDays.map((day) => ({
					x: day,
					y: (globalAccumulated[day] || 0) / (timeUnit === TIMEUNIT_HOURS ? 1 : HOURS_PER_DAY)
				})),
				borderColor: generateDistinctColor(colorIndex, totalUsers),
				borderWidth: 2,
				fill: true
			},
			...(hasBelowZero
				? [
						{
							label: 'Zero Line',
							data: sortedGlobalDays.map((day) => ({ x: day, y: 0 })),
							borderColor: 'red',
							borderWidth: 3,
							borderDash: [10, 5],
							fill: false
						}
					]
				: []),
			...Object.values(userDatasets).map((dataset) => ({
				...dataset,
				data: dataset.data.sort((a, b) => new Date(a.x).getTime() - new Date(b.x).getTime())
			}))
		];
	}

	let zoomEnabled = false;
	let chartRef: any = null;
	function resetZoom() {
		if (chartRef) {
			chartRef.resetZoom();
			zoomEnabled = false;
		}
	}

	// const handleResize = () => {
	// 	if (chartRef) {
	// 		chartRef.update(); // Update chart to reflect the new size
	// 	}
	// };

	// onMount(() => {
	// 	// Add resize event listener
	// 	window.addEventListener('resize', handleResize);
	// });

	// onDestroy(() => {
	// 	// Remove resize event listener when component is destroyed
	// 	window.removeEventListener('resize', handleResize);
	// });
</script>

<div class="relative">
	<Line
		bind:chart={chartRef}
		data={{ labels: sortDates(labels), datasets }}
		options={chartOptions}
	/>
	<div class="absolute right-0 top-2 flex w-full items-center justify-end pr-2">
		<button
			on:click={resetZoom}
			class="rounded-md px-4 py-2 font-bold text-white transition duration-300 ease-in-out"
			class:bg-blue-600={zoomEnabled}
			class:hover:bg-blue-700={zoomEnabled}
			class:cursor-pointer={zoomEnabled}
			class:bg-gray-400={!zoomEnabled}
			class:cursor-not-allowed={!zoomEnabled}
			disabled={!zoomEnabled}
		>
			Reset Zoom
		</button>
	</div>
</div>
