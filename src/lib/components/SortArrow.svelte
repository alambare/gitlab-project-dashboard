<script lang="ts">
	export let isActive: boolean;
	export let isAscending: boolean;
</script>

{#if isActive}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="0 0 24 24"
		stroke-width="1.5"
		stroke="currentColor"
		class="ml-2 size-4 text-blue-600"
		transform={isAscending ? '' : 'scale(1, -1)'}
	>
		<path stroke-linecap="round" stroke-linejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
	</svg>
{:else}
	<!-- Gray Double Arrow -->
	<svg
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="0 0 24 24"
		stroke-width="1.5"
		stroke="currentColor"
		class="ml-2 size-4 text-gray-400"
	>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5"
		/>
	</svg>
{/if}
