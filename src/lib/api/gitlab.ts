import type { Issue } from '$lib/types';
import { GITLAB_ACCESS_TOKEN, GITLAB_API, GITLAB_GRAPHQL_URL, GITLAB_GROUP_NAME } from '../../constant';

async function fetchGitLabIssues(fetch: typeof window.fetch) {
	const query = `
        query {
            group(fullPath: "${GITLAB_GROUP_NAME}") {
                issues {
                    nodes {
                        title
                        createdAt
                        closedAt
                        dueDate
                        timeEstimate
                        totalTimeSpent
                        projectId
                        labels {
                            nodes {
                                title
                                color
                            }
                        }
                        iid
                        id
                        timelogs(first: 100000) {
                            nodes {
                                summary
                                timeSpent
                                spentAt
                                user {
                                    username
                                }
                            }
                        }
                    }
                }
            }
        }
    `;

	try {
		const data = await gitlabRequest(query, fetch);
        let issues: Issue[] = data.group.issues.nodes;
        issues = issues.map(issue => {
            if (!issue.id) {
                throw new Error("Issue ID is null or undefined");
            }
            const match = issue.id.match(/(\d+)$/);
            if (!match) {
                throw new Error(`Invalid ID format: ${issue.id}`);
            }
            const id = match[0];
            return {
                ...issue,
                id: id
            };
        });
        return issues;
	} catch (error) {
		console.error('Error loading GitLab issues:', error);
		return [];
	}
}

async function gitlabRequest(query: string, fetch: typeof window.fetch) {
	try {
		const res = await fetch(GITLAB_GRAPHQL_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${GITLAB_ACCESS_TOKEN}`,
			},
			body: JSON.stringify({ query }),
		});

		if (!res.ok) {
			console.error('Failed to fetch data:', res.status, res.statusText);
			throw new Error('Failed to fetch data');
		}

		const data = await res.json();

		// Log if there are any GraphQL errors
		if (data.errors) {
			console.error('GraphQL errors:', data.errors);
			throw new Error('GraphQL query failed');
		}

		return data.data;
	} catch (error) {
		console.error('Error during GitLab request:', error);
		throw error;
	}
}

async function gitlabRestRequest(endpoint: string) {
	try {
		const res = await fetch(`${GITLAB_API}/${endpoint}`, {
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${GITLAB_ACCESS_TOKEN}`,
			},
		});

		if (!res.ok) {
			console.error('Failed to fetch data:', res.status, res.statusText);
			throw new Error('Failed to fetch data');
		}

		const data = await res.json();
		return data;
	} catch (error) {
		console.error('Error during GitLab request:', error);
		throw error;
	}
}

export { gitlabRequest, gitlabRestRequest, fetchGitLabIssues };
