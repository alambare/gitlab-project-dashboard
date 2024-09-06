<script lang="ts">
	import type { Label } from '$lib/types';

	export let labels: Label[] = [];
	export let selectedLabel: string | null = null;
	export let onFilterChange: (label: string | null) => void;

	const handleFilterClick = (label: string) => {
		onFilterChange(selectedLabel === label ? null : label);
	};

	const isSelected = (label: string) => selectedLabel === label;

	// Helper function to check if the color is dark
	const isDarkColor = (color: string): boolean => {
		const rgb = parseInt(color.slice(1), 16); // Convert hex to RGB
		const r = (rgb >> 16) & 0xff;
		const g = (rgb >> 8) & 0xff;
		const b = (rgb >> 0) & 0xff;
		const brightness = (r * 299 + g * 587 + b * 114) / 1000;
		return brightness < 125; // If brightness is low, it's a dark color
	};
</script>

<div class="mb-4 flex flex-wrap">
	{#each labels as label}
		<button
			class="mb-2 mr-2 inline-block rounded px-2 py-1 text-sm"
			style="background-color: {label.color}; color: {isDarkColor(label.color)
				? 'white'
				: 'black'};"
			on:click={() => handleFilterClick(label.title)}
		>
			{label.title}
			{#if isSelected(label.title)}
				<span class="ml-2 text-red-500">&#10006;</span> <!-- Close icon -->
			{/if}
		</button>
	{/each}
</div>
