<script lang="ts">
	import {
		computeProductivity,
		MAX_CONSTANT_CAPITAL_PER_UNIT,
		MAX_QUANTITY,
		MIN_CONSTANT_CAPITAL_PER_UNIT,
		MIN_QUANTITY
	} from '../../../models/productivity';
	import { DAILY_LIVING_LABOUR_VALUE } from '../../../models/composition';
	import { formatNumber } from '$lib/format';
	import CompositionBar from '$lib/components/CompositionBar.svelte';
	import Legend from '$lib/components/Legend.svelte';

	let quantity = $state<number>(12);
	let constantCapitalPerUnit = $state<number>(40);

	const result = $derived(computeProductivity({ quantity, constantCapitalPerUnit }));

	const units = $derived(Array.from({ length: result.quantity }, (_, index) => index));

	const totalSegments = $derived([
		{
			key: 'const',
			short: 'c',
			value: result.totalConstantCapital,
			color: 'var(--color-const)'
		},
		{
			key: 'labour',
			short: 'v+m',
			value: result.totalLabourValue,
			color: 'var(--color-labour)'
		}
	]);

	const unitSegments = $derived([
		{
			key: 'const',
			short: 'c',
			value: result.constantCapitalPerUnit,
			color: 'var(--color-const)'
		},
		{
			key: 'labour',
			short: 'v+m',
			value: result.labourValuePerUnit,
			color: 'var(--color-labour)'
		}
	]);
</script>

<svelte:head>
	<title>Производительность труда и стоимость товара — Капитал онлайн</title>
	<meta
		name="description"
		content="Как рост производительности труда снижает стоимость отдельного товара при неизменной массе вновь созданной стоимости за рабочий день."
	/>
</svelte:head>

<nav class="mb-6 text-sm text-ink-soft">
	<a href="/" class="hover:underline">Оглавление</a>
	<span class="px-1">/</span>
	<span>Том I</span>
</nav>

<article>
	<h1 class="font-serif text-3xl">Стоимость товара и производительность труда</h1>
	<p class="mt-3 max-w-prose text-ink-soft">
		Рабочий день не меняется, поэтому не меняется и общая масса живого труда за день: она всегда
		создаёт ровно <strong>1200 ₽</strong> новой стоимости. Но чем выше
		<strong>производительность труда</strong>, тем больше штук товара
		<code>N</code> получается за тот же день — и эта фиксированная сумма делится на большее
		количество изделий. Стоимость каждой отдельной штуки, создаваемая живым трудом, падает —
		<em>обратно пропорционально</em> производительности.
	</p>
	<p class="mt-3 max-w-prose text-ink-soft">
		<strong class="text-const">Постоянный капитал c</strong> — перенесённая стоимость сырья,
		материалов и снашиваемого оборудования — наоборот, обычно пропорционален количеству штук: на
		каждое изделие уходит одна и та же его порция. Поэтому доля <code class="text-const">c</code> в стоимости
		одной штуки не зависит от производительности — а вот суммарный расход постоянного капитала за день
		растёт вместе с количеством изделий.
	</p>
	<p class="mt-3 max-w-prose text-ink-soft">
		Рост производительности увеличивает <em>количество</em> продукта (потребительных стоимостей), но
		не
		<em>сумму</em> новой стоимости, которую живой труд создаёт за день, — это разные вещи: масса продукта
		и его стоимость.
	</p>

	<!-- Сетка штук товара -->
	<div class="mt-8">
		<div class="mb-3 flex items-baseline gap-3">
			<span class="text-sm text-ink-soft">N — штук товара за рабочий день</span>
			<span class="font-mono text-3xl">{formatNumber(result.quantity)}</span>
		</div>
		<div
			class="flex min-h-14 flex-wrap gap-1.5 rounded-lg border border-ink/20 bg-paper-dark/30 p-3"
			role="img"
			aria-label={`${result.quantity} штук товара, произведённых за один рабочий день`}
		>
			{#each units as unit (unit)}
				<div
					class="h-5 w-5 rounded-sm sm:h-6 sm:w-6"
					style="background-color: var(--color-labour);"
				></div>
			{/each}
		</div>
	</div>

	<!-- Схема состава стоимости одной штуки -->
	<div class="mt-8">
		<div class="mb-3 flex items-baseline gap-3">
			<span class="text-sm text-ink-soft">w — стоимость одной штуки товара</span>
			<span class="font-mono text-3xl">{formatNumber(result.unitValue, 2)} ₽</span>
		</div>
		<CompositionBar
			segments={unitSegments}
			ariaLabel={`Стоимость одной штуки: постоянный капитал ${formatNumber(result.constantCapitalPerUnit)}, новая стоимость ${formatNumber(result.labourValuePerUnit, 2)}`}
			formatValue={(value) => formatNumber(value, 2)}
		/>
	</div>

	<!-- Схема состава стоимости всего дневного продукта -->
	<div class="mt-8">
		<div class="mb-3 flex items-baseline gap-3">
			<span class="text-sm text-ink-soft">W — стоимость всего дневного продукта</span>
			<span class="font-mono text-3xl">{formatNumber(result.totalValue)} ₽</span>
		</div>
		<CompositionBar
			segments={totalSegments}
			ariaLabel={`Стоимость всего продукта дня: постоянный капитал ${formatNumber(result.totalConstantCapital)}, новая стоимость ${formatNumber(result.totalLabourValue)}`}
			formatValue={formatNumber}
		/>
		<Legend
			items={[
				{
					key: 'const',
					color: 'var(--color-const)',
					code: 'c',
					label: 'постоянный капитал (материалы и оборудование)'
				},
				{
					key: 'labour',
					color: 'var(--color-labour)',
					code: 'v + m',
					label: 'новая стоимость, созданная живым трудом'
				}
			]}
		/>
	</div>

	<!-- Слайдеры -->
	<div class="mt-10 space-y-6">
		<div>
			<label for="slider-quantity" class="flex justify-between font-mono text-sm">
				<span><code class="font-semibold">N</code> — штук товара за день (производительность)</span>
				<span>{formatNumber(quantity)}</span>
			</label>
			<input
				id="slider-quantity"
				type="range"
				min={MIN_QUANTITY}
				max={MAX_QUANTITY}
				step="1"
				bind:value={quantity}
				class="mt-2 h-11 w-full"
				style="accent-color: var(--color-labour);"
			/>
			<p class="mt-1 text-xs text-ink-soft">
				Двигая <code>N</code> вправо, вы увеличиваете производительность труда: за тот же рабочий день
				делается больше штук, и новая стоимость (1200 ₽) распределяется на большее их число.
			</p>
		</div>

		<div>
			<label for="slider-const" class="flex justify-between font-mono text-sm">
				<span
					><code class="font-semibold text-const">c</code> — постоянный капитал на одну штуку</span
				>
				<span>{formatNumber(constantCapitalPerUnit)}</span>
			</label>
			<input
				id="slider-const"
				type="range"
				min={MIN_CONSTANT_CAPITAL_PER_UNIT}
				max={MAX_CONSTANT_CAPITAL_PER_UNIT}
				step="5"
				bind:value={constantCapitalPerUnit}
				class="mt-2 h-11 w-full"
				style="accent-color: var(--color-const);"
			/>
		</div>
	</div>

	<!-- Таблица показателей -->
	<div class="mt-10 overflow-x-auto">
		<table class="w-full min-w-[360px] border-collapse text-left text-sm">
			<thead>
				<tr class="border-b border-ink/20">
					<th class="py-2 pr-3 font-serif">Показатель</th>
					<th class="py-2 pr-3 font-serif">Значение</th>
				</tr>
			</thead>
			<tbody>
				<tr class="border-b border-ink/10">
					<td class="py-2 pr-3">
						<code class="font-semibold">N</code> — штук товара за день
					</td>
					<td class="py-2 pr-3 font-mono">{formatNumber(result.quantity)}</td>
				</tr>
				<tr class="border-b border-ink/10">
					<td class="py-2 pr-3">
						<code class="font-semibold text-const">c</code> — постоянный капитал на одну штуку
					</td>
					<td class="py-2 pr-3 font-mono">{formatNumber(result.constantCapitalPerUnit)}</td>
				</tr>
				<tr class="border-b border-ink/10">
					<td class="py-2 pr-3">
						<code class="font-semibold" style="color: var(--color-labour);">(v + m) ⁄ N</code> —
						новая стоимость на штуку
						<div class="font-mono text-xs text-ink-soft">
							= {formatNumber(DAILY_LIVING_LABOUR_VALUE)} ⁄ N
						</div>
					</td>
					<td class="py-2 pr-3 font-mono">{formatNumber(result.labourValuePerUnit, 2)}</td>
				</tr>
				<tr class="border-b border-ink/10">
					<td class="py-2 pr-3">
						<code class="font-semibold">w</code> — стоимость одной штуки товара
					</td>
					<td class="py-2 pr-3 font-mono">{formatNumber(result.unitValue, 2)}</td>
				</tr>
				<tr class="border-b border-ink/10">
					<td class="py-2 pr-3">
						<code class="font-semibold text-const">N · c</code> — постоянный капитал за весь день
					</td>
					<td class="py-2 pr-3 font-mono">{formatNumber(result.totalConstantCapital)}</td>
				</tr>
				<tr class="border-b border-ink/10">
					<td class="py-2 pr-3">
						<code class="font-semibold" style="color: var(--color-labour);">v + m</code> — новая стоимость
						за весь день
					</td>
					<td class="py-2 pr-3 font-mono">{formatNumber(result.totalLabourValue)}</td>
				</tr>
				<tr>
					<td class="py-2 pr-3">
						<code class="font-semibold">W</code> — стоимость всего дневного продукта
					</td>
					<td class="py-2 pr-3 font-mono">{formatNumber(result.totalValue)}</td>
				</tr>
			</tbody>
		</table>
	</div>
</article>
