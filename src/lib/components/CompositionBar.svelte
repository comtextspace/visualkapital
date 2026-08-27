<script lang="ts">
	/**
	 * Полоса, разбитая на сегменты пропорционально их величине — общий вид
	 * диаграммы состава стоимости, используемый на всех схемах тома I.
	 */
	interface Segment {
		key: string;
		/** Короткое обозначение внутри сегмента, например «c» или «v». */
		short: string;
		value: number;
		/** Цвет сегмента, например 'var(--color-const)'. */
		color: string;
	}

	let {
		segments,
		ariaLabel,
		formatValue = (value: number) => value.toLocaleString('ru-RU')
	}: {
		segments: Segment[];
		ariaLabel: string;
		formatValue?: (value: number) => string;
	} = $props();

	const total = $derived(segments.reduce((sum, segment) => sum + segment.value, 0));
</script>

<div
	class="flex h-24 w-full overflow-hidden rounded-lg border border-ink/20 shadow-sm sm:h-28"
	role="img"
	aria-label={ariaLabel}
>
	{#each segments as segment (segment.key)}
		{@const pct = total > 0 ? (segment.value / total) * 100 : 0}
		<div
			class="flex items-center justify-center overflow-hidden text-paper transition-[flex-basis] duration-300 ease-out"
			style={`flex: 0 0 ${pct}%; background-color: ${segment.color};`}
		>
			{#if pct > 9}
				<span class="px-1 text-center font-mono text-xs leading-tight sm:text-sm">
					{segment.short}<br />{formatValue(segment.value)}
				</span>
			{/if}
		</div>
	{/each}
</div>
