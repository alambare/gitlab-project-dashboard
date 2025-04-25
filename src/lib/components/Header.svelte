<script lang="ts">
	import { fetchGitLabContainers, fetchGitLabIssues } from '$lib/gitlab';
	import type { Container, Issue } from '$lib/types';
	import { currentContainerStore, updateCurrentContainer } from '../../stores';

	export let currentView: string;
	export let loading: boolean;
	export let issues: Issue[];
	export let containers: Container[] | null;

	let searchQuery: string = '';
	let filteredContainers: Container[] = [];
	let currentContainer: Container | null = null;

	// Subscribe to the currentContainerStore to get the full container object
	currentContainerStore.subscribe((value) => {
		currentContainer = value;
		if (currentContainer) {
			searchQuery = currentContainer.name;
		}
	});

	const toggleView = (view: string) => {
		currentView = view;
	};

	async function refreshIssues() {
		loading = true;
		issues = await fetchGitLabIssues(fetch);
		loading = false;
	}

	// Filter containers based on the search query
	async function filterContainers() {
		if (containers === null) {
			containers = await fetchGitLabContainers(fetch);
		}

		const query = searchQuery.toLowerCase();
		filteredContainers = containers.filter(
			(container) =>
				container.fullPath.toLowerCase().includes(query) ||
				container.name.toLowerCase().includes(query)
		);
	}

	// Set selected container as the current container
	async function selectContainer(container: Container) {
		searchQuery = container.name; // Set searchQuery to the name of the selected container
		filteredContainers = [];

		let formerContainerPath = currentContainer?.fullPath;

		updateCurrentContainer(container); // Update the store with the entire container object

		if (formerContainerPath !== container.fullPath) {
			await refreshIssues();
		}
	}

	// Function to convert issues data to CSV format
	function issuesToCSV(issues: Issue[]): string {
		if (issues.length === 0) return '';

		// Extract unique labels
		const labelSet = new Set<string>();
		issues.forEach((issue) => {
			issue.labels.nodes.forEach((label) => labelSet.add(label.title));
		});
		const uniqueLabels = Array.from(labelSet);

		// Prepare CSV headers
		const excludedKeys = ['labels', 'assignees', 'milestone'];
		const keys = Object.keys(issues[0]).filter((key) => !excludedKeys.includes(key));

		const csvRows = [keys.concat('assignee', 'milestone').concat(uniqueLabels).join(',')];

		// Add data rows
		issues.forEach((issue) => {
			const values = keys.map((key) => {
				let value = issue[key as keyof Issue];
				if (value instanceof Object) {
					value = JSON.stringify(value); // Convert nested objects to JSON string
				}
				const escapedValue = String(value).replace(/"/g, '""');
				return `"${escapedValue}"`;
			});

			const assigneeName = issue.assignees.nodes.length > 0 ? issue.assignees.nodes[0].name : '';
			values.push(`"${assigneeName}"`);

			const milestoneTitle = issue.milestone ? issue.milestone.title : '';
			values.push(`"${milestoneTitle}"`);

			// Add label values
			uniqueLabels.forEach((label) => {
				values.push(
					issue.labels.nodes.some((issueLabel) => issueLabel.title === label) ? 'true' : 'false'
				);
			});

			csvRows.push(values.join(','));
		});

		return csvRows.join('\n');
	}

	// Function to download CSV file
	function downloadCSV(csvContent: string, fileName: string) {
		const blob = new Blob([csvContent], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);

		const a = document.createElement('a');
		a.href = url;
		a.download = fileName;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	// Function to get the current timestamp in a readable format
	function getTimestamp(): string {
		const now = new Date();
		const year = now.getFullYear();
		const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-based
		const day = String(now.getDate()).padStart(2, '0');
		const hours = String(now.getHours()).padStart(2, '0');
		const minutes = String(now.getMinutes()).padStart(2, '0');
		const seconds = String(now.getSeconds()).padStart(2, '0');

		return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
	}

	// Function to handle button click
	function handleExport() {
		const csvContent = issuesToCSV(issues);
		const fileName = `issues_${currentContainer?.fullPath || 'export'}_${getTimestamp()}.csv`;

		downloadCSV(csvContent, fileName);
	}
</script>

<div class="mb-6 flex flex-wrap items-center justify-between pt-1">
	<div class="flex items-center space-x-4">
		<h1 class="text-2xl font-semibold text-gray-800">GitLab - Activity tracking</h1>
		{#if currentView !== 'connectToGitLab'}
			<button
				on:click={refreshIssues}
				class="text-blue-600 hover:text-blue-800"
				aria-label="Refresh issues"
			>
				<!-- Refresh Icon (Heroicons) -->
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
						d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
					/>
				</svg>
			</button>

			<div class="relative">
				<input
					type="text"
					placeholder="Select a project or a group"
					bind:value={searchQuery}
					on:focus={filterContainers}
					on:input={filterContainers}
					class="search-input w-64 rounded-lg border border-gray-300 px-4 py-2 shadow-md transition-all duration-300 ease-in-out focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
				/>
				{#if filteredContainers.length > 0}
					<ul
						class="absolute left-0 z-20 mt-2 max-h-60 w-64 max-w-xs overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-md transition-all duration-200 ease-in-out"
					>
						{#each filteredContainers as container}
							<li>
								<button
									class="block w-full px-4 py-3 text-left text-gray-700 transition-colors duration-200 ease-in-out hover:bg-blue-50 hover:text-blue-600 focus:bg-blue-100 focus:text-blue-700 focus:outline-none"
									on:click={() => selectContainer(container)}
									on:keydown={(event) => event.key === 'Enter' && selectContainer(container)}
								>
									{container.name}
								</button>
							</li>
						{/each}
					</ul>
				{/if}
			</div>
		{/if}
	</div>

	{#if currentView !== 'connectToGitLab'}
		<div class="inline-flex overflow-hidden rounded-md">
			<button
				class={`px-4 py-2 font-medium transition-colors duration-200 ${
					currentView === 'tasks' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
				}`}
				on:click={() => toggleView('tasks')}
			>
				Tasks
			</button>
			<button
				class={`px-4 py-2 font-medium transition-colors duration-200 ${
					currentView === 'resources' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
				}`}
				on:click={() => toggleView('resources')}
			>
				Resources
			</button>
		</div>

		<div class="flex space-x-6">
			<button
				class="rounded border border-blue-500 bg-transparent px-4 py-2 font-semibold text-blue-700 hover:border-transparent hover:bg-blue-500 hover:text-white"
				on:click={handleExport}
			>
				Export issues as CSV
			</button>

			<button
				on:click={() => toggleView('settings')}
				class="text-gray-600 hover:text-gray-800"
				aria-label="Open settings"
			>
				<!-- Settings Icon (Heroicons) -->
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
						d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z"
					/>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
					/>
				</svg>
			</button>
		</div>
	{/if}
</div>
