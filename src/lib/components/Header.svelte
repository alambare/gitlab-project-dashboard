<script lang="ts">
	import type { Issue } from '$lib/types';

	export let currentView: string;
	export let loading: boolean;
	export let issues: Issue[];
	export let isHours: boolean;

	const toggleView = () => {
		currentView = currentView === 'table' ? 'time' : 'table';
	};

	async function refreshIssues() {
		loading = true;
		try {
			const res = await fetch('/api/gitlab-issues', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				}
			});

			if (!res.ok) {
				throw new Error('Failed to fetch data');
			}

			issues = await res.json();
		} catch (error) {
			console.error('Failed to refresh data', error);
		} finally {
			loading = false;
		}
	}
</script>

<div class="mb-6 flex items-center justify-between">
	<div class="flex items-center space-x-4">
		<h1 class="text-2xl font-semibold text-gray-800">GitLab Issues Dashboard</h1>

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
	</div>

	<button class="rounded bg-blue-600 px-4 py-2 text-white" on:click={toggleView}>
		Switch to {currentView === 'time' ? 'Table View' : 'Time View'}
	</button>

	<div class="flex items-center space-x-4">
		<span class="text-sm font-medium text-gray-900 dark:text-gray-300">Days</span>

		<label class="inline-flex cursor-pointer items-center">
			<input bind:checked={isHours} type="checkbox" value="" class="peer sr-only" />
			<div
				class="peer relative h-6 w-14 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-yellow-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-blue-500 peer-checked:after:translate-x-7 peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rtl:peer-checked:after:-translate-x-full dark:after:border-gray-600 dark:peer-focus:ring-blue-800"
			></div>
		</label>

		<span class="text-sm font-medium text-gray-900 dark:text-gray-300">Hours</span>
	</div>
</div>
