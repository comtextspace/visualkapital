<script lang="ts">
	/** Строка легенды под диаграммой: цветной квадратик + название + буквенный код. */
	interface Item {
		key: string;
		color: string;
		code: string;
		label: string;
	}

	let { items }: { items: Item[] } = $props();
</script>

<div class="mt-3 flex flex-wrap justify-between gap-2 text-sm">
	{#each items as item (item.key)}
		<span class="flex items-center gap-2">
			<span class="inline-block h-3 w-3 rounded-sm" style={`background-color: ${item.color};`}
			></span>
			{item.label} <code class="font-semibold" style={`color: ${item.color};`}>{item.code}</code>
		</span>
	{/each}
</div>
