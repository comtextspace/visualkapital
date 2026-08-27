<script lang="ts">
	import {
		computeValueComposition,
		DAILY_LIVING_LABOUR_VALUE,
		MAX_CONSTANT_CAPITAL,
		MIN_SURPLUS_VALUE,
		MIN_VARIABLE_CAPITAL
	} from '../../../models/composition';
	import { formatNumber, formatPercent } from '$lib/format';
	import CompositionBar from '$lib/components/CompositionBar.svelte';
	import Legend from '$lib/components/Legend.svelte';

	// Независимые величины: c меняется сам по себе, а v перераспределяет
	// фиксированную сумму v + m = 1200 между необходимым и прибавочным трудом.
	let c = $state<number>(800);
	let v = $state<number>(600);

	const result = $derived(computeValueComposition({ c, v }));

	const segments = $derived([
		{ key: 'c', short: 'c', value: result.c, color: 'var(--color-const)' },
		{ key: 'v', short: 'v', value: result.v, color: 'var(--color-var)' },
		{ key: 'm', short: 'm', value: result.m, color: 'var(--color-surplus)' }
	]);

	// Слайдер m — тот же v, только повёрнутый в другую сторону: двигая его,
	// мы на самом деле меняем v = 1200 − m.
	function handleMInput(event: Event) {
		const target = event.currentTarget as HTMLInputElement;
		v = DAILY_LIVING_LABOUR_VALUE - target.valueAsNumber;
	}
</script>

<svelte:head>
	<title>Стоимость и прибавочная стоимость — Капитал онлайн</title>
	<meta
		name="description"
		content="Продукт одного рабочего дня: W = c + v + m, норма прибавочной стоимости, органическое строение капитала."
	/>
</svelte:head>

<nav class="mb-6 text-sm text-ink-soft">
	<a href="/" class="hover:underline">Оглавление</a>
	<span class="px-1">/</span>
	<span>Том I</span>
</nav>

<article>
	<h1 class="font-serif text-3xl">Стоимость и прибавочная стоимость</h1>
	<p class="mt-3 max-w-prose text-ink-soft">
		Модель показывает продукт одного рабочего дня одного рабочего или одного коллективного рабочего.
		За один час живого труда рабочий создаёт новую стоимость 100 ₽; рабочий день длится 12 часов,
		поэтому живой труд за день всегда создаёт ровно <strong>1200 ₽</strong> новой стоимости (12 ×
		100). Эта сумма распадается на
		<strong class="text-var">переменный капитал v</strong>
		(оплаченный, необходимый труд) и
		<strong class="text-surplus">прибавочную стоимость m</strong>
		(неоплаченный, прибавочный труд) — <code>v + m = 1200</code> всегда.
	</p>
	<p class="mt-3 max-w-prose text-ink-soft">
		<strong class="text-const">Постоянный капитал c</strong> — перенесённая стоимость средств
		производства. Живой труд этого дня её не создаёт, поэтому <code>c</code> меняется независимо, от 0
		до 2000 ₽.
	</p>
	<p class="mt-3 max-w-prose text-ink-soft">
		Обратите внимание: при увеличении переменного капитала <code>v</code> общая масса вновь
		созданной стоимости не растёт — она остаётся равной 1200 ₽, меняется только отношение между
		переменным капиталом и прибавочной стоимостью (между необходимым и прибавочным трудом). При этом
		рост <code>v</code> в этой модели означает не увеличение числа рабочих, а рост заработной платы уже
		работающих рабочих — их число и продолжительность дня не меняются.
	</p>
	<p class="mt-4 font-mono text-sm text-ink-soft">W = c + v + m</p>

	<!-- Схема состава стоимости -->
	<div class="mt-8">
		<div class="mb-3 flex items-baseline gap-3">
			<span class="text-sm text-ink-soft">W — стоимость всего продукта дня</span>
			<span class="font-mono text-3xl">{formatNumber(result.w)} ₽</span>
		</div>
		<CompositionBar
			{segments}
			ariaLabel={`Состав стоимости: постоянный капитал ${formatNumber(result.c)}, переменный капитал ${formatNumber(result.v)}, прибавочная стоимость ${formatNumber(result.m)}, итого ${formatNumber(result.w)}`}
			formatValue={formatNumber}
		/>

		<Legend
			items={[
				{
					key: 'c',
					color: 'var(--color-const)',
					code: 'c',
					label: 'постоянный капитал'
				},
				{ key: 'v', color: 'var(--color-var)', code: 'v', label: 'переменный капитал' },
				{
					key: 'm',
					color: 'var(--color-surplus)',
					code: 'm',
					label: 'прибавочная стоимость'
				}
			]}
		/>
	</div>

	<!-- Слайдеры -->
	<div class="mt-10 space-y-6">
		<div>
			<label for="slider-c" class="flex justify-between font-mono text-sm">
				<span><code class="font-semibold text-const">c</code> — постоянный капитал</span>
				<span>{formatNumber(c)}</span>
			</label>
			<input
				id="slider-c"
				type="range"
				min="0"
				max={MAX_CONSTANT_CAPITAL}
				step="10"
				bind:value={c}
				class="mt-2 h-11 w-full"
				style="accent-color: var(--color-const);"
			/>
		</div>

		<div>
			<label for="slider-v" class="flex justify-between font-mono text-sm">
				<span><code class="font-semibold text-var">v</code> — переменный капитал</span>
				<span>{formatNumber(v)}</span>
			</label>
			<input
				id="slider-v"
				type="range"
				min={MIN_VARIABLE_CAPITAL}
				max={DAILY_LIVING_LABOUR_VALUE - MIN_SURPLUS_VALUE}
				step="10"
				bind:value={v}
				class="mt-2 h-11 w-full"
				style="accent-color: var(--color-var);"
			/>
		</div>

		<div>
			<label for="slider-m" class="flex justify-between font-mono text-sm">
				<span><code class="font-semibold text-surplus">m</code> — прибавочная стоимость</span>
				<span>{formatNumber(result.m)}</span>
			</label>
			<input
				id="slider-m"
				type="range"
				min={MIN_SURPLUS_VALUE}
				max={DAILY_LIVING_LABOUR_VALUE - MIN_VARIABLE_CAPITAL}
				step="10"
				value={result.m}
				oninput={handleMInput}
				class="mt-2 h-11 w-full"
				style="accent-color: var(--color-surplus);"
			/>
			<p class="mt-1 text-xs text-ink-soft">
				<code class="text-var">v</code> и <code class="text-surplus">m</code> — два конца одной и
				той же суммы: v + m = {formatNumber(DAILY_LIVING_LABOUR_VALUE)} всегда, и ни одна из них не опускается
				до нуля.
			</p>
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
					<td class="py-2 pr-3"><code class="font-semibold">W</code> — стоимость товара</td>
					<td class="py-2 pr-3 font-mono">{formatNumber(result.w)}</td>
				</tr>
				<tr class="border-b border-ink/10">
					<td class="py-2 pr-3">
						<code class="font-semibold text-const">c</code> — постоянный капитал
					</td>
					<td class="py-2 pr-3 font-mono">{formatNumber(result.c)}</td>
				</tr>
				<tr class="border-b border-ink/10">
					<td class="py-2 pr-3">
						<code class="font-semibold text-var">v</code> — переменный капитал
					</td>
					<td class="py-2 pr-3 font-mono">{formatNumber(result.v)}</td>
				</tr>
				<tr class="border-b border-ink/10">
					<td class="py-2 pr-3">
						<code class="font-semibold text-surplus">m</code> — прибавочная стоимость
					</td>
					<td class="py-2 pr-3 font-mono">{formatNumber(result.m)}</td>
				</tr>
				<tr class="border-b border-ink/10">
					<td class="py-2 pr-3">
						<code class="font-semibold text-surplus">m′</code> — норма прибавочной стоимости
						<div class="font-mono text-xs text-ink-soft">m′ = m ⁄ v × 100%</div>
					</td>
					<td class="py-2 pr-3 font-mono">{formatPercent(result.mRate)}</td>
				</tr>
				<tr>
					<td class="py-2 pr-3">
						<code class="font-semibold"
							><span class="text-const">c</span> ⁄ <span class="text-var">v</span></code
						> — органическое строение
					</td>
					<td class="py-2 pr-3 font-mono">{formatNumber(result.organicComposition, 2)}</td>
				</tr>
			</tbody>
		</table>
	</div>
</article>
