import { fetchGitLabIssues } from '$lib/api/gitlab';

export async function GET({ fetch }) {
	try {
		const issues = await fetchGitLabIssues(fetch);
		console.log("DONE!")
		return new Response(JSON.stringify(issues), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error) {
		console.error('Failed to fetch GitLab issues:', error);
		return new Response(JSON.stringify({ error: 'Failed to fetch issues' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
}
