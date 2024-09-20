import { browser } from '$app/environment';
import { fetchGitLabIssues } from '$lib/api/gitlab'; // Import the reusable function
import type { Issue } from '$lib/types';

// This function is executed on both server-side and client-side
export const load = async ({ fetch }) => {
	if (browser) {
		// Fetch issues using the shared helper function
		const issues = await fetchGitLabIssues(fetch);
		return {
			issues: issues as Issue[]
		};
	} else {
		// If we are on the server, return an empty issues array
		return {
			issues: [] as Issue[]
		};
	}
};
