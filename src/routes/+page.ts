import { browser } from '$app/environment';
import type { Issue } from '$lib/types';

// This function is executed on both server-side and client-side
export const load = async ({ fetch }) => {
    const GITLAB_GRAPHQL_URL = import.meta.env.VITE_GITLAB_GRAPHQL_URL;
    const GITLAB_ACCESS_TOKEN = import.meta.env.VITE_GITLAB_ACCESS_TOKEN;

    if (browser) {
        // This code will only run in the browser

        const query = `
            query {
                group(fullPath: "dedl") {
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
            const res = await fetch(GITLAB_GRAPHQL_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${GITLAB_ACCESS_TOKEN}`
                },
                body: JSON.stringify({ query })
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
            return {
                issues: data.data.group.issues.nodes as Issue[],
            };
        } catch (error) {
            console.error('Error loading GitLab issues:', error);
            return {
                issues: [] as Issue[]
            };
        }
    } else {
        // If we are on the server, return an empty issues array
        return {
            issues: [] as Issue[]
        };
    }
};
