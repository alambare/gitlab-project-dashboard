// src/lib/utils/chart.ts
import type { TimeData } from '$lib/types';
import type { TIMEUNIT_DAYS, TIMEUNIT_HOURS } from '../constant';
import { getRandomColor } from './utils';

export function processChartData(
	timeData: TimeData,
	timeUnit: typeof TIMEUNIT_HOURS | typeof TIMEUNIT_DAYS,
	HOURS_PER_DAY: number
) {
	const labels: string[] = [];
	const totalSpentData: { [key: string]: number } = {};
	const userDatasets: { [key: string]: any } = {};

	for (const [user, months] of Object.entries(timeData)) {
		userDatasets[user] = {
			label: user,
			data: [],
			borderColor: getRandomColor(),
			fill: false
		};
		for (const [month, data] of Object.entries(months)) {
			if (!labels.includes(month)) {
				labels.push(month);
			}

			let spent_time = data.totalSeconds / (timeUnit === 'hours' ? 3600 : HOURS_PER_DAY);

			userDatasets[user].data.push({
				x: month,
				y: spent_time
			});

			if (!totalSpentData[month]) totalSpentData[month] = 0;
			totalSpentData[month] += spent_time;
		}
	}

	return {
		labels: sortMonths(labels),
		datasets: [
			{
				label: 'Total Time Spent',
				data: Object.entries(totalSpentData).map(([month, time]) => ({
					x: month,
					y: time
				})),
				borderColor: '#0000FF',
				backgroundColor: 'rgba(0,0,255,0.2)',
				borderWidth: 2,
				fill: false
			},
			...Object.values(userDatasets)
		]
		// userMonth: Object.entries(timeData).flatMap(([user, months]) =>
		//     Object.entries(months).map(([month, data]) => ({
		//         user,
		//         month,
		//         totalSeconds: data.totalSeconds / (timeUnit === 'hours' ? 3600 : HOURS_PER_DAY),
		//         issues: data.issues.map(issue => ({
		//             issueTitle: issue.issueTitle,
		//             timeSpent: issue.timeSpent / (timeUnit === 'hours' ? 3600 : HOURS_PER_DAY),
		//         })),
		//     }))
		// )
	};
}
