<script lang="ts">
	import {
		computeMassSurplusValue,
		MAX_CONSTANT_CAPITAL_PER_WORKER,
		MAX_WORKERS,
		MIN_WORKERS
	} from '../../../models/massSurplusValue';
	import {
		DAILY_LIVING_LABOUR_VALUE,
		MIN_SURPLUS_VALUE,
		MIN_VARIABLE_CAPITAL
	} from '../../../models/composition';
	import { formatNumber, formatPercent } from '$lib/format';
	import CompositionBar from '$lib/components/CompositionBar.svelte';
	import Legend from '$lib/components/Legend.svelte';

	let workers = $state<number>(10);
	let v = $state<number>(600);
	let c = $state<number>(50);

	const result = $derived(computeMassSurplusValue({ workers, v, c }));

	const workerUnits = $derived(Array.from({ length: result.workers }, (_, index) => index));

	const totalSegments = $derived([
		{ key: 'c', short: 'C', value: result.totalC, color: 'var(--color-const)' },
		{ key: 'v', short: 'V', value: result.totalV, color: 'var(--color-var)' },
		{ key: 'm', short: 'M', value: result.totalM, color: 'var(--color-surplus)' }
	]);

	// Слайдер m на одного рабочего — тот же v, только повёрнутый в другую сторону.
	function handleMInput(event: Event) {
		const target = event.currentTarget as HTMLInputElement;
		v = DAILY_LIVING_LABOUR_VALUE - target.valueAsNumber;
	}
</script>

<svelte:head>
	<title>Масса прибавочной стоимости и число рабочих — Капитал онлайн</title>
	<meta
		name="description"
		content="Как масса прибавочной стоимости растёт с числом одновременно занятых рабочих при неизменной норме прибавочной стоимости."
	/>
</svelte:head>

<nav class="mb-6 text-sm text-ink-soft">
	<a href="/" class="hover:underline">Оглавление</a>
	<span class="px-1">/</span>
	<span>Том I</span>
</nav>

<article>
	<h1 class="font-serif text-3xl">Масса прибавочной стоимости и число рабочих</h1>
	<p class="mt-3 max-w-prose text-ink-soft">
		Каждый рабочий за день создаёт новую стоимость <strong>1200 ₽</strong>: она распадается на
		<strong class="text-var">переменный капитал v</strong>
		и <strong class="text-surplus">прибавочную стоимость m</strong> на одного рабочего, причём
		<code>v + m = 1200</code>
		всегда. Норма прибавочной стоимости <code>m′ = m ⁄ v</code> — это степень эксплуатации одного рабочего,
		и она тоже не зависит от того, сколько рабочих занято одновременно.
	</p>
	<p class="mt-3 max-w-prose text-ink-soft">
		Капиталиста в первую очередь интересует масса прибавочной стоимости, а не норма прибавочной
		стоимости. Масса равна норме прибавочной стоимости, умноженной на переменный капитал одного
		рабочего <code>v</code> (стоимость его рабочей силы за день) и на число одновременно занятых
		рабочих <code>L</code>: <code>M = m′⁄100 × v × L</code>. Чем больше рабочих при той же норме
		эксплуатации, тем больше общая масса прибавочной стоимости, хотя степень эксплуатации каждого
		рабочего не меняется.
	</p>

	<!-- Сетка рабочих -->
	<div class="mt-8">
		<div class="mb-3 flex items-baseline gap-3">
			<span class="text-sm text-ink-soft">L — число одновременно занятых рабочих</span>
			<span class="font-mono text-3xl">{formatNumber(result.workers)}</span>
		</div>
		<div
			class="flex min-h-14 flex-wrap gap-1.5 rounded-lg border border-ink/20 bg-paper-dark/30 p-3"
			role="img"
			aria-label={`${result.workers} рабочих, занятых одновременно`}
		>
			{#each workerUnits as worker (worker)}
				<div
					class="h-5 w-5 rounded-sm sm:h-6 sm:w-6"
					style="background-color: var(--color-var);"
				></div>
			{/each}
		</div>
	</div>

	<!-- Схема состава стоимости всего дневного продукта -->
	<div class="mt-8">
		<div class="mb-3 flex items-baseline gap-3">
			<span class="text-sm text-ink-soft">W — стоимость всего продукта всех рабочих</span>
			<span class="font-mono text-3xl">{formatNumber(result.totalW)} ₽</span>
		</div>
		<CompositionBar
			segments={totalSegments}
			ariaLabel={`Состав стоимости всего продукта: постоянный капитал ${formatNumber(result.totalC)}, переменный капитал ${formatNumber(result.totalV)}, прибавочная стоимость ${formatNumber(result.totalM)}`}
			formatValue={formatNumber}
		/>
		<Legend
			items={[
				{ key: 'c', color: 'var(--color-const)', code: 'C', label: 'постоянный капитал' },
				{ key: 'v', color: 'var(--color-var)', code: 'V', label: 'переменный капитал' },
				{ key: 'm', color: 'var(--color-surplus)', code: 'M', label: 'прибавочная стоимость' }
			]}
		/>
	</div>

	<!-- Слайдеры -->
	<div class="mt-10 space-y-6">
		<div>
			<label for="slider-workers" class="flex justify-between font-mono text-sm">
				<span><code class="font-semibold">L</code> — число рабочих</span>
				<span>{formatNumber(workers)}</span>
			</label>
			<input
				id="slider-workers"
				type="range"
				min={MIN_WORKERS}
				max={MAX_WORKERS}
				step="1"
				bind:value={workers}
				class="mt-2 h-11 w-full"
				style="accent-color: var(--color-var);"
			/>
		</div>

		<div>
			<label for="slider-c" class="flex justify-between font-mono text-sm">
				<span
					><code class="font-semibold text-const">c</code> — постоянный капитал на одного рабочего</span
				>
				<span>{formatNumber(c)}</span>
			</label>
			<input
				id="slider-c"
				type="range"
				min="0"
				max={MAX_CONSTANT_CAPITAL_PER_WORKER}
				step="10"
				bind:value={c}
				class="mt-2 h-11 w-full"
				style="accent-color: var(--color-const);"
			/>
		</div>

		<div>
			<label for="slider-v" class="flex justify-between font-mono text-sm">
				<span
					><code class="font-semibold text-var">v</code> — переменный капитал на одного рабочего</span
				>
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
				<span
					><code class="font-semibold text-surplus">m</code> — прибавочная стоимость на одного рабочего</span
				>
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
				<code class="text-var">v</code> и <code class="text-surplus">m</code> на одного рабочего —
				два конца одной и той же суммы 1200 ₽. Слайдер <code>L</code> не влияет на норму
				<code>m′</code> — он лишь умножает <code>v</code>, <code>m</code> и <code>c</code> на число рабочих.
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
					<td class="py-2 pr-3">
						<code class="font-semibold">W</code> — стоимость продукта всех рабочих
					</td>
					<td class="py-2 pr-3 font-mono">{formatNumber(result.totalW)}</td>
				</tr>
				<tr class="border-b border-ink/10">
					<td class="py-2 pr-3">
						<code class="font-semibold">L</code> — число рабочих
					</td>
					<td class="py-2 pr-3 font-mono">{formatNumber(result.workers)}</td>
				</tr>
				<tr class="border-b border-ink/10">
					<td class="py-2 pr-3">
						<code class="font-semibold text-surplus">m′</code> — норма прибавочной стоимости (на
						одного рабочего)
						<div class="font-mono text-xs text-ink-soft">m′ = m ⁄ v × 100%</div>
					</td>
					<td class="py-2 pr-3 font-mono">{formatPercent(result.mRate)}</td>
				</tr>
				<tr class="border-b border-ink/10">
					<td class="py-2 pr-3">
						<code class="font-semibold text-surplus">M</code> — масса прибавочной стоимости
						<div class="font-mono text-xs text-ink-soft">M = L × m</div>
					</td>
					<td class="py-2 pr-3 font-mono">{formatNumber(result.totalM)}</td>
				</tr>
				<tr class="border-b border-ink/10">
					<td class="py-2 pr-3">
						<code class="font-semibold text-var">V</code> — общий переменный капитал
						<div class="font-mono text-xs text-ink-soft">V = L × v</div>
					</td>
					<td class="py-2 pr-3 font-mono">{formatNumber(result.totalV)}</td>
				</tr>
				<tr>
					<td class="py-2 pr-3">
						<code class="font-semibold text-const">C</code> — общий постоянный капитал
						<div class="font-mono text-xs text-ink-soft">C = L × c</div>
					</td>
					<td class="py-2 pr-3 font-mono">{formatNumber(result.totalC)}</td>
				</tr>
			</tbody>
		</table>
	</div>
</article>
