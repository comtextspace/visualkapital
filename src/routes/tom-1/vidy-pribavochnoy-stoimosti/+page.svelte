<script lang="ts">
	import {
		computeWorkingDay,
		MAX_WORKING_DAY_HOURS,
		MIN_NECESSARY_LABOUR_HOURS,
		MIN_SURPLUS_LABOUR_HOURS,
		MIN_WORKING_DAY_HOURS
	} from '../../../models/workingDay';
	import { formatNumber, formatPercent } from '$lib/format';

	let workingDayHours = $state<number>(12);
	let necessaryLabourHours = $state<number>(6);

	const result = $derived(computeWorkingDay({ workingDayHours, necessaryLabourHours }));

	// Ширина всей полосы пропорциональна длине дня относительно максимума —
	// поэтому удлинение дня (H) реально растягивает полосу, а изменение
	// необходимого времени (n) только двигает границу сегментов внутри неё.
	const dayWidthPct = $derived((result.workingDayHours / MAX_WORKING_DAY_HOURS) * 100);
	const necessaryPct = $derived((result.necessaryLabourHours / result.workingDayHours) * 100);
	const surplusPct = $derived((result.surplusLabourHours / result.workingDayHours) * 100);

	const necessaryMax = $derived(workingDayHours - MIN_SURPLUS_LABOUR_HOURS);
</script>

<svelte:head>
	<title>Абсолютная и относительная прибавочная стоимость — Капитал онлайн</title>
	<meta
		name="description"
		content="Два способа увеличить прибавочную стоимость: удлинение рабочего дня (абсолютная) и сокращение необходимого времени (относительная)."
	/>
</svelte:head>

<nav class="mb-6 text-sm text-ink-soft">
	<a href="/" class="hover:underline">Оглавление</a>
	<span class="px-1">/</span>
	<span>Том I</span>
</nav>

<article>
	<h1 class="font-serif text-3xl">Абсолютная и относительная прибавочная стоимость</h1>
	<p class="mt-3 max-w-prose text-ink-soft">
		Каждый час живого труда создаёт новую стоимость 100 ₽. Рабочий день длится
		<code>H</code> часов и делится на <strong class="text-var">необходимое время</strong> — за него
		рабочий воспроизводит стоимость своей рабочей силы, переменный капитал
		<code>v</code> — и <strong class="text-surplus">прибавочное время</strong>, создающее
		прибавочную стоимость <code>m</code>. Есть два способа увеличить <code>m</code>.
	</p>
	<p class="mt-3 max-w-prose text-ink-soft">
		<strong>Абсолютная прибавочная стоимость</strong> получается при удлинении самого рабочего дня
		<code>H</code>, если необходимое время <code>n</code> остаётся прежним: каждый добавленный час целиком
		идёт в прибавочное время.
	</p>
	<p class="mt-3 max-w-prose text-ink-soft">
		<strong>Относительная прибавочная стоимость</strong> получается, когда рабочий день
		<code>H</code> не меняется, но сокращается необходимое время <code>n</code> — например, из-за роста
		производительности труда в отраслях, производящих предметы потребления рабочего, отчего его рабочая
		сила дешевеет. Прибавочное время растёт за счёт перераспределения того же дня.
	</p>

	<!-- Схема рабочего дня -->
	<div class="mt-8">
		<div class="mb-3 flex items-baseline gap-3">
			<span class="text-sm text-ink-soft">H — длина рабочего дня</span>
			<span class="font-mono text-3xl">{formatNumber(result.workingDayHours, 1)} ч</span>
		</div>
		<div class="rounded-lg border border-dashed border-ink/20 bg-paper-dark/20 p-3">
			<div
				class="flex h-16 overflow-hidden rounded-md shadow-sm transition-[width] duration-300 ease-out sm:h-20"
				style={`width: ${dayWidthPct}%;`}
				role="img"
				aria-label={`Рабочий день ${formatNumber(result.workingDayHours, 1)} часов: необходимое время ${formatNumber(result.necessaryLabourHours, 1)} часов, прибавочное время ${formatNumber(result.surplusLabourHours, 1)} часов`}
			>
				<div
					class="flex items-center justify-center overflow-hidden text-paper transition-[flex-basis] duration-300 ease-out"
					style={`flex: 0 0 ${necessaryPct}%; background-color: var(--color-var);`}
				>
					{#if necessaryPct > 10}
						<span class="px-1 text-center font-mono text-xs leading-tight sm:text-sm">
							n<br />{formatNumber(result.necessaryLabourHours, 1)} ч
						</span>
					{/if}
				</div>
				<div
					class="flex items-center justify-center overflow-hidden text-paper transition-[flex-basis] duration-300 ease-out"
					style={`flex: 0 0 ${surplusPct}%; background-color: var(--color-surplus);`}
				>
					{#if surplusPct > 10}
						<span class="px-1 text-center font-mono text-xs leading-tight sm:text-sm">
							H−n<br />{formatNumber(result.surplusLabourHours, 1)} ч
						</span>
					{/if}
				</div>
			</div>
		</div>

		<div class="mt-3 flex flex-wrap justify-between gap-2 text-sm">
			<span class="flex items-center gap-2">
				<span class="inline-block h-3 w-3 rounded-sm" style="background-color: var(--color-var);"
				></span>
				необходимое время <code class="font-semibold text-var">n</code>
				(<code class="text-var">v</code> = {formatNumber(result.v)} ₽)
			</span>
			<span class="flex items-center gap-2">
				<span
					class="inline-block h-3 w-3 rounded-sm"
					style="background-color: var(--color-surplus);"
				></span>
				прибавочное время <code class="font-semibold text-surplus">H − n</code>
				(<code class="text-surplus">m</code> = {formatNumber(result.m)} ₽)
			</span>
		</div>
	</div>

	<!-- Слайдеры -->
	<div class="mt-10 space-y-6">
		<div>
			<label for="slider-day" class="flex justify-between font-mono text-sm">
				<span><code class="font-semibold">H</code> — длина рабочего дня (абсолютная)</span>
				<span>{formatNumber(workingDayHours, 1)} ч</span>
			</label>
			<input
				id="slider-day"
				type="range"
				min={MIN_WORKING_DAY_HOURS}
				max={MAX_WORKING_DAY_HOURS}
				step="0.5"
				bind:value={workingDayHours}
				class="mt-2 h-11 w-full"
			/>
			<p class="mt-1 text-xs text-ink-soft">
				Двигая <code>H</code> вправо, вы удлиняете рабочий день: необходимое время <code>n</code>
				не меняется, а весь добавленный час идёт в прибавочное время — это и есть
				<strong>абсолютная</strong> прибавочная стоимость.
			</p>
		</div>

		<div>
			<label for="slider-necessary" class="flex justify-between font-mono text-sm">
				<span
					><code class="font-semibold text-var">n</code> — необходимое время (относительная)</span
				>
				<span>{formatNumber(necessaryLabourHours, 1)} ч</span>
			</label>
			<input
				id="slider-necessary"
				type="range"
				min={MIN_NECESSARY_LABOUR_HOURS}
				max={necessaryMax}
				step="0.5"
				bind:value={necessaryLabourHours}
				class="mt-2 h-11 w-full"
				style="accent-color: var(--color-var);"
			/>
			<p class="mt-1 text-xs text-ink-soft">
				Двигая <code>n</code> влево при неизменном <code>H</code>, вы сокращаете необходимое время
				(например, из-за удешевления рабочей силы): прибавочное время растёт за счёт
				перераспределения того же дня — это <strong>относительная</strong> прибавочная стоимость.
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
						<code class="font-semibold">H</code> — длина рабочего дня, часов
					</td>
					<td class="py-2 pr-3 font-mono">{formatNumber(result.workingDayHours, 1)}</td>
				</tr>
				<tr class="border-b border-ink/10">
					<td class="py-2 pr-3">
						<code class="font-semibold text-var">n</code> — необходимое время, часов
					</td>
					<td class="py-2 pr-3 font-mono">{formatNumber(result.necessaryLabourHours, 1)}</td>
				</tr>
				<tr class="border-b border-ink/10">
					<td class="py-2 pr-3">
						<code class="font-semibold text-surplus">H − n</code> — прибавочное время, часов
					</td>
					<td class="py-2 pr-3 font-mono">{formatNumber(result.surplusLabourHours, 1)}</td>
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
						<code class="font-semibold">w</code> — новая стоимость за день
					</td>
					<td class="py-2 pr-3 font-mono">{formatNumber(result.w)}</td>
				</tr>
			</tbody>
		</table>
	</div>
</article>
