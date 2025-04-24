import { get } from 'svelte/store';
import { gitlabGraphQLUrl, gitlabApiUrl, accessToken, currentContainerStore } from '../stores';
import type { Container, Issue } from './types';

async function fetchGitLabIssues(fetch: typeof window.fetch) {
    const currentContainer = get(currentContainerStore);

    if (!currentContainer) {
        throw new Error('No current container selected');
    }

    let hasNextPage = true;
    let endCursor = '';
    const issues: Issue[] = [];

    const query = (cursor: string) => `
        {
            ${currentContainer.type}(fullPath: "${currentContainer.fullPath}") {
                issues(after: "${cursor}") {
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
                        timelogs {
                            nodes {
                                summary
                                timeSpent
                                spentAt
                                user {
                                    username
                                }
                            }
                        }
                        webUrl
                    }
                    pageInfo {
                        hasNextPage
                        endCursor
                    }
                }
            }
        }
    `;

    while (hasNextPage) {
        try {
            const data = await gitlabRequest(query(endCursor), fetch);
            const containerData = data[currentContainer.type] || data.project;

            if (containerData && containerData.issues) {
                issues.push(...containerData.issues.nodes);
                hasNextPage = containerData.issues.pageInfo.hasNextPage;
                endCursor = containerData.issues.pageInfo.endCursor;
            } else {
                console.warn(`No issues found in ${currentContainer.type} ${currentContainer.name}.`);
                return [];
            }
        } catch (error) {
            console.error('Error loading GitLab issues:', error);
            return [];
        }
    }

    return issues;
}


async function fetchGitLabContainers(fetch: typeof window.fetch) {
    interface PageInfo {
        hasNextPage: boolean;
        endCursor: string | null;
    }

    const query = (afterProjectCursor: string | null, afterGroupCursor: string | null, includeProjects: boolean, includeGroups: boolean) => `
    {
        ${includeProjects ? `
            projects(first: 100, after: ${afterProjectCursor ? `"${afterProjectCursor}"` : null}) {
                nodes {
                    fullPath
                    nameWithNamespace
                }
                pageInfo {
                    hasNextPage
                    endCursor
                }
            }
        ` : ``}
        ${includeGroups ? `
            groups(first: 100, after: ${afterGroupCursor ? `"${afterGroupCursor}"` : null}) {
                nodes {
                    fullPath
                    fullName
                }
                pageInfo {
                    hasNextPage
                    endCursor
                }
            }
        ` : ``}
    }
`;

    try {
        const formattedData: Container[] = [];
        let hasNextProjectPage = true;
        let hasNextGroupPage = true;
        let projectEndCursor: string | null = null;
        let groupEndCursor: string | null = null;

        // Loop until all pages for both projects and groups are fetched
        while (hasNextProjectPage || hasNextGroupPage) {
            const data = await gitlabRequest(query(projectEndCursor, groupEndCursor, hasNextProjectPage, hasNextGroupPage), fetch);

            // Process projects if still fetching
            if (hasNextProjectPage && data.projects && data.projects.nodes) {
                data.projects.nodes.forEach((project: { fullPath: string, nameWithNamespace: string }) => {
                    formattedData.push({
                        fullPath: project.fullPath,
                        name: project.nameWithNamespace,
                        type: 'project',
                    });
                });
                const projectPageInfo: PageInfo = data.projects.pageInfo;
                hasNextProjectPage = projectPageInfo.hasNextPage;
                projectEndCursor = projectPageInfo.endCursor;
            }

            // Process groups if still fetching
            if (hasNextGroupPage && data.groups && data.groups.nodes) {
                data.groups.nodes.forEach((group: { fullPath: string, fullName: string }) => {
                    formattedData.push({
                        fullPath: group.fullPath,
                        name: group.fullName,
                        type: 'group',
                    });
                });
                const groupPageInfo: PageInfo = data.groups.pageInfo;
                hasNextGroupPage = groupPageInfo.hasNextPage;
                groupEndCursor = groupPageInfo.endCursor;
            }
        }

        formattedData.sort((a, b) => a.name.localeCompare(b.name));
        return formattedData;
    } catch (error) {
        console.error('Error loading GitLab projects and groups:', error);
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

export { gitlabRequest, gitlabRestRequest, fetchGitLabIssues, fetchGitLabContainers };
