<script lang="ts">
	import { fetchGitLabContainers, fetchGitLabIssues, verifyConnection } from '$lib/gitlab';
	import type { Container, Issue } from '$lib/types';
	import { gitlabUrl, accessToken, updateGitLabSettings } from '../../stores';
	import { onMount } from 'svelte';

	// Bind to the store values
	let currentGitlabUrl: string;
	let currentAccessToken: string;
	let originalGitlabUrl: string; // To store the original URL for comparison
	let originalAccessToken: string; // To store the original token for comparison
	let showAccessToken = false;

	export let issues: Issue[];
	export let containers: Container[] | null;
	export let currentView: string;
	export let error: string | null = null;

	// Subscribe to the store on mount to load the initial values
	onMount(() => {
		gitlabUrl.subscribe((value) => {
			currentGitlabUrl = value;
			originalGitlabUrl = value; // Set original value
		});
		accessToken.subscribe((value) => {
			currentAccessToken = value;
			originalAccessToken = value;
		});
	});

	const handleConnect = async () => {
		error = await verifyConnection(currentGitlabUrl, currentAccessToken);

		if (error !== null) {
			return;
		}

		// Save the settings and update the store
		updateGitLabSettings(currentGitlabUrl, currentAccessToken);
		containers = await fetchGitLabContainers(fetch);
		issues = await fetchGitLabIssues(fetch);

		currentView = 'resources'; // Switch to the resources view
	};

	const toggleAccessTokenVisibility = () => {
		showAccessToken = !showAccessToken;
	};

	// Enable save button only if there are changes
	$: isDirty =
		currentAccessToken &&
		currentGitlabUrl &&
		(currentGitlabUrl !== originalGitlabUrl || currentAccessToken !== originalAccessToken);
</script>

<div class="mx-auto mt-12 max-w-xl rounded-lg bg-white p-6 shadow-md">
	<h2 class="mb-6 text-2xl font-semibold text-gray-800">Connect to GitLab</h2>

	<div class="mb-6">
		<label for="gitlab-url" class="block text-sm font-medium text-gray-700">GitLab URL</label>
		<input
			type="url"
			id="gitlab-url"
			bind:value={currentGitlabUrl}
			class="mt-1 block w-full rounded-md border border-gray-300 px-4 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
		/>
	</div>

	<div class="mb-6">
		<label for="access-token" class="flex justify-between text-sm font-medium text-gray-700"
			>Access Token <a
				href="https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html"
				target="_blank"
				class="text-xs text-blue-500 hover:underline"
			>
				How to create a GitLab access token</a
			></label
		>
		<div class="relative mt-1">
			{#if showAccessToken}
				<input
					type="text"
					id="access-token"
					bind:value={currentAccessToken}
					class="block w-full rounded-md border border-gray-300 px-4 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
				/>
			{:else}
				<input
					type="password"
					id="access-token"
					bind:value={currentAccessToken}
					class="block w-full rounded-md border border-gray-300 px-4 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
				/>
			{/if}
			<button
				type="button"
				on:click={toggleAccessTokenVisibility}
				class="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700 focus:outline-none"
			>
				{#if showAccessToken}
					<!-- Eye Icon (Heroicons) -->
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="size-6"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
						/>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
						/>
					</svg>
				{:else}
					<!-- Eye-slash icon (Heroicons) -->
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="size-6"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
						/>
					</svg>
				{/if}
			</button>
		</div>
	</div>

	<div class="flex justify-between">
		<p class="mt-2 text-sm text-red-600">{error ? error : ''}</p>
		<button
			on:click={handleConnect}
			class="inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
			class:bg-blue-600={isDirty}
			class:bg-gray-400={!isDirty}
			class:hover:bg-blue-700={isDirty}
			class:cursor-not-allowed={!isDirty}
			disabled={!isDirty}
		>
			Connect
		</button>
	</div>
</div>
