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
    iid: string;
    timelogs: {
        nodes: Timelog[];
    };
}

export interface IssuesData {
    issues: Issue[]
}
