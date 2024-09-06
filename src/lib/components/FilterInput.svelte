<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Label } from '$lib/types';

	import { isDarkColor } from '$lib/utils';

	interface CustomEvents {
		filterChange: string[];
	}

	export let labels: Label[] = [];
	export let selectedLabels: string[] = [];

	const dispatch = createEventDispatcher<CustomEvents>();

	let filterText = '';

	const handleFilterChange = () => {
		const filtered = labels
			.filter((label) => label.title.toLowerCase().includes(filterText.toLowerCase()))
			.map((label) => label.title);
		dispatch('filterChange', filtered);
	};

	const clearFilter = (label: string) => {
		selectedLabels = selectedLabels.filter((l) => l !== label);
		dispatch('filterChange', selectedLabels);
	};

	// Handle text input change
	$: filterText, handleFilterChange();
</script>

<div class="relative mb-4">
	<input
		type="text"
		bind:value={filterText}
		placeholder="Filter labels..."
		class="w-full rounded border border-gray-300 px-4 py-2"
	/>

	{#if filterText}
		<ul class="absolute z-10 mt-2 w-full rounded border border-gray-300 bg-white shadow-lg">
			{#each labels.filter((label) => label.title
					.toLowerCase()
					.includes(filterText.toLowerCase())) as label}
				<li
					role="option"
					aria-selected={selectedLabels.includes(label.title)}
					class="cursor-pointer px-4 py-2 hover:bg-gray-200"
					style="background-color: {label.color}; color: {isDarkColor(label.color)
						? 'white'
						: 'black'};"
				>
					<button
						type="button"
						class="h-full w-full text-left"
						on:click={() => {
							if (!selectedLabels.includes(label.title)) {
								selectedLabels = [...selectedLabels, label.title];
								dispatch('filterChange', selectedLabels);
							}
						}}
					>
						{label.title}
					</button>
				</li>
			{/each}
		</ul>
	{/if}

	<div class="mt-2">
		{#each selectedLabels as label}
			<span
				class="mr-2 inline-flex items-center rounded-full bg-blue-600 px-3 py-1 text-sm font-medium text-white"
			>
				{label}
				<button
					type="button"
					class="ml-2 text-white hover:text-gray-200"
					aria-label="Remove filter"
					on:click={() => clearFilter(label)}
				>
					×
				</button>
			</span>
		{/each}
	</div>
</div>
