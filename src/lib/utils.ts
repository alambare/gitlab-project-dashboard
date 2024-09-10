import type { Issue, TimeData } from '$lib/types';

// Helper function to convert seconds to human-readable format (HH:MM:SS)
export const formatTime = (seconds: number): string => {
	const h = Math.floor(seconds / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	const s = seconds % 60;
	return `${h > 0 ? h + 'h ' : ''}${m > 0 ? m + 'm ' : ''}${s > 0 ? s + 's' : ''}` || '';
};

// Helper function to check if the color is dark
export const isDarkColor = (color: string): boolean => {
	const rgb = parseInt(color.slice(1), 16); // Convert hex to RGB
	const r = (rgb >> 16) & 0xff;
	const g = (rgb >> 8) & 0xff;
	const b = (rgb >> 0) & 0xff;
	const brightness = (r * 299 + g * 587 + b * 114) / 1000;
	return brightness < 125; // If brightness is low, it's a dark color
};

// export function calculateTimeSpentByUserByMonth(issues: Issue[]): TimeData {
// 	const timeData: TimeData = {};

// 	issues.forEach((issue) => {
// 		issue.timelogs.nodes.forEach((log) => {
// 			const username = log.user.username;
// 			const month = new Date(log.spentAt).toLocaleString('default', {
// 				month: 'long',
// 				year: 'numeric'
// 			});

// 			if (!timeData[username]) {
// 				timeData[username] = {};
// 			}

// 			if (!timeData[username][month]) {
// 				timeData[username][month] = {
// 					totalSeconds: 0,
// 					issues: []
// 				};
// 			}

// 			// Sum total time spent for each user per month
// 			timeData[username][month].totalSeconds += log.timeSpent;

// 			// Push issue time
// 			timeData[username][month].issues.push({
// 				issueTitle: issue.title,
// 				timeSpent: log.timeSpent
// 			});
// 		});
// 	});

// 	// Sort months for each user
// 	for (const username in timeData) {
// 		const months = Object.keys(timeData[username]);
// 		const sortedMonths = sortMonths(months);

// 		// Create a new sorted object for months
// 		const sortedUserMonths: { [key: string]: any } = {};
// 		sortedMonths.forEach((month) => {
// 			sortedUserMonths[month] = timeData[username][month];
// 		});

// 		// Replace the user's month data with the sorted version
// 		timeData[username] = sortedUserMonths;
// 	}

// 	return timeData;
// }

export function calculateTimeSpentByUserByDay(issues: Issue[]): TimeData {
	const timeData: TimeData = {};

	issues.forEach((issue) => {
		issue.timelogs.nodes.forEach((log) => {
			const username = log.user.username;
			const day = new Date(log.spentAt).toISOString().slice(0, 10); // YYYY-MM-DD format

			if (!timeData[username]) {
				timeData[username] = {};
			}

			if (!timeData[username][day]) {
				timeData[username][day] = {
					totalSeconds: 0,
					issues: []
				};
			}

			// Sum total time spent for each user per day
			timeData[username][day].totalSeconds += log.timeSpent;

			// Push issue time
			timeData[username][day].issues.push({
				issueTitle: issue.title,
				timeSpent: log.timeSpent
			});
		});
	});

	// Sort days for each user
	for (const username in timeData) {
		const days = Object.keys(timeData[username]);
		const sortedDays = sortDates(days); // You'll need to define or use a sort function for days

		// Create a new sorted object for days
		const sortedUserDays: { [key: string]: any } = {};
		sortedDays.forEach((day) => {
			sortedUserDays[day] = timeData[username][day];
		});

		// Replace the user's day data with the sorted version
		timeData[username] = sortedUserDays;
	}

	return timeData;
}

export function getRandomColor(): string {
	const letters = '0123456789ABCDEF';
	let color = '#';
	for (let i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}

// Function to sort months by year and month (YYYY-MM-dd format)
export function sortDates(date: string[]): string[] {
	return date.sort((a, b) => {
		return new Date(a).getTime() - new Date(b).getTime();
	});
}
