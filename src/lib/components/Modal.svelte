<script>
	export let title;
	export let onClose;
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center">
	<div class="absolute inset-0 bg-gray-900 opacity-50"></div>
	<div class="z-10 rounded bg-white p-6 shadow-lg">
		<header class="mb-4 flex items-center justify-between">
			<h2 class="text-xl font-semibold">{title}</h2>
			<button on:click={onClose} class="text-gray-600 hover:text-gray-900">✖</button>
		</header>
		<slot></slot>
	</div>
</div>
