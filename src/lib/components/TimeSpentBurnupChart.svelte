<script lang="ts">
	import { Line } from 'svelte-chartjs';
	import {
		Chart as ChartJS,
		LineElement,
		PointElement,
		Title,
		Tooltip,
		Legend,
		LinearScale,
		CategoryScale,
		Filler,
		type ChartOptions,
		type ChartDataset
	} from 'chart.js';

	// Register necessary components, including PointElement for rendering points on the chart
	ChartJS.register(
		LineElement,
		PointElement,
		Title,
		Tooltip,
		Legend,
		LinearScale,
		CategoryScale,
		Filler
	);

	import type { TimeData } from '$lib/types';
	import { sortDates } from '$lib/utils';

	type DataPoint = { x: string; y: number };

	export let timeData: TimeData;
	export let timeUnit: 'hours' | 'days';
	export let thresholds: Map<string, number> = new Map([['Total', 1000]]); // Define threshold lines here

	const HOURS_PER_DAY = Number(import.meta.env.VITE_HOURS_PER_DAY) || 7;
	const SECONDS_PER_DAY = HOURS_PER_DAY * 3600;

	let totalSpentData: { [key: string]: number } = {};
	let labels: string[] = [];
	let userDatasets: { [key: string]: ChartDataset<'line', DataPoint[]> } = {};
	let datasets: ChartDataset<'line', DataPoint[]>[] = [];

	const chartOptions: ChartOptions<'line'> = {
		responsive: true,
		plugins: {
			legend: {
				position: 'top',
				labels: {
					usePointStyle: true, // Changes the shape from a rectangle to a circle
					pointStyle: 'circle',
					boxWidth: 20,
					padding: 20
				}
			},
			title: {
				display: true,
				text: 'Resources burn up chart',
				align: 'start',
				padding: {
					top: 10,
					bottom: 20
				}
			},
			tooltip: {
				callbacks: {
					label: (context) => {
						const value = context.formattedValue;
						return `${value} ${timeUnit}`;
					}
				}
			}
		},
		scales: {
			x: {
				title: { display: true, text: 'Month' },
				type: 'category'
			},
			y: {
				title: { display: true, text: 'Time Spent (hours)' }, // This will dynamically change based on timeUnit
				beginAtZero: true
			}
		}
	};

	const generateDistinctColor = (index: number, total: number): string => {
		const hue = (index / total) * 360; // Evenly space the hues around the color wheel
		const saturation = 70; // Saturation of the color
		const lightness = 50; // Lightness of the color
		return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
	};

	// This is the reactive block that recalculates datasets whenever `timeUnit` changes.
	$: updateDatasets(timeUnit);

	function updateDatasets(timeUnit: string) {
		totalSpentData = {};
		labels = [];
		userDatasets = {};
		datasets = [];

		const totalUsers = Object.keys(timeData).length + 1;
		let colorIndex = 0;

		for (const [user, months] of Object.entries(timeData)) {
			userDatasets[user] = {
				label: user,
				data: [],
				borderColor: generateDistinctColor(colorIndex, totalUsers),
				backgroundColor: generateDistinctColor(colorIndex, totalUsers),
				fill: false
			};
			colorIndex++;

			let cumulativeUserTime = 0;

			for (const [month, data] of Object.entries(months)) {
				if (!labels.includes(month)) {
					labels.push(month);
				}

				// Recalculate based on `timeUnit`
				const spent_time = data.totalSeconds / (timeUnit === 'hours' ? 3600 : SECONDS_PER_DAY);

				cumulativeUserTime += spent_time;

				userDatasets[user].data.push({
					x: month,
					y: cumulativeUserTime
				});

				if (!totalSpentData[month]) totalSpentData[month] = 0;
				totalSpentData[month] += spent_time;
			}
		}

		const sortedMonths = sortDates(Object.keys(totalSpentData));

		// Sort total time spent
		const sortedTotalSpentData: { [key: string]: number } = {};
		let cumulativeTotalTime = 0;
		sortedMonths.forEach((month) => {
			cumulativeTotalTime += totalSpentData[month];
			sortedTotalSpentData[month] = cumulativeTotalTime;
		});

		datasets = [
			{
				label: 'Total Time Spent',
				data: Object.entries(sortedTotalSpentData).map(([month, time]) => ({
					x: month,
					y: time
				})),
				borderColor: generateDistinctColor(colorIndex, totalUsers),
				borderWidth: 2,
				fill: true
			},
			...Object.values(userDatasets)
		];

		// Add threshold datasets
		for (const [label, hours] of thresholds) {
			datasets.push(generateThresholdLineDataset(hours, label, sortedMonths));
		}
	}

	// Helper function to generate threshold lines
	function generateThresholdLineDataset(
		hours: number,
		label: string,
		sortedMonths: string[]
	): ChartDataset<'line', DataPoint[]> {
		const value = hours / (timeUnit === 'hours' ? 1 : HOURS_PER_DAY);
		const color =
			Object.values(userDatasets).find((dataset) => dataset.label === label)?.borderColor ||
			'black';

		return {
			label: `${label} Threshold`,
			data: sortedMonths.map((month) => ({ x: month, y: value })),
			borderColor: color,
			borderWidth: 2,
			fill: false,
			pointRadius: 0
		};
	}
</script>

<Line data={{ labels: sortDates(labels), datasets }} options={chartOptions} />
