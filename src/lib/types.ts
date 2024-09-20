import type { TIMEUNIT_DAYS, TIMEUNIT_HOURS } from '../constant';

export interface Label {
	title: string;
	color: string;
}

export interface Timelog {
	summary: string;
	timeSpent: number;
	spentAt: string;
	user: {
		username: string;
	};
}

export interface Issue {
	title: string;
	createdAt: string;
	closedAt: string | null;
	dueDate: string | null;
	timeEstimate: number;
	totalTimeSpent: number;
	projectId: number;
	labels: {
		nodes: Label[];
	};
	iid: number;
	id: string;
	timelogs: {
		nodes: Timelog[];
	};
}

export interface IssueTimeLog {
	issueTitle: string;
	timeSpent: number;
}

export interface TimeData {
	[username: string]: {
		[day: string]: UserDayTime;
	};
}

export interface UserMonthTime {
	user: string;
	month: string;
	totalSeconds: number;
	issues: { issueTitle: string; timeSpent: number }[];
}

export interface UserDayTime {
	totalSeconds: number;
	issues: {
		issueTitle: string;
		timeSpent: number;
	}[];
}

export type TimeUnit = typeof TIMEUNIT_HOURS | typeof TIMEUNIT_DAYS;
