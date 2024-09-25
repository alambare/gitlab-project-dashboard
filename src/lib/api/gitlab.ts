import { get } from 'svelte/store';
import { gitlabGraphQLUrl, gitlabApiUrl, accessToken } from '../../stores';
import { GITLAB_GROUP_NAME } from '../../constant';

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
        return data.group.issues.nodes;
    } catch (error) {
        console.error('Error loading GitLab issues:', error);
        return [];
    }
}

async function gitlabRequest(query: string, fetch: typeof window.fetch) {
    const url = get(gitlabGraphQLUrl);
    const token = get(accessToken);

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ query }),
        });

        if (!res.ok) {
            console.error('Failed to fetch data:', res.status, res.statusText);
            throw new Error('Failed to fetch data');
        }

        const data = await res.json();
        return data.data;
    } catch (error) {
        console.error('Error during GitLab request:', error);
        throw error;
    }
}

async function gitlabRestRequest(endpoint: string) {
    const url = get(gitlabApiUrl);
    const token = get(accessToken);
    try {
        const res = await fetch(`${url}/${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
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
