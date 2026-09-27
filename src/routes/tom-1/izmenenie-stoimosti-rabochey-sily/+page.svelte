<script lang="ts">
	import {
		computeLabourPowerVariation,
		MAX_INDEX,
		MAX_WORKING_DAY_HOURS,
		MIN_INDEX,
		MIN_WORKING_DAY_HOURS,
		type LabourPowerVariationLaw
	} from '../../../models/labourPowerVariation';
	import { formatNumber, formatPercent } from '$lib/format';
	import CompositionBar from '$lib/components/CompositionBar.svelte';
	import Legend from '$lib/components/Legend.svelte';

	let law = $state<LabourPowerVariationLaw>('productivity');

	let productivity = $state<number>(1);
	let intensity = $state<number>(1);
	let workingDayHours = $state<number>(12);

	const result = $derived(
		computeLabourPowerVariation({ law, productivity, intensity, workingDayHours })
	);

	const daySegments = $derived([
		{ key: 'v', short: 'n', value: result.necessaryHours, color: 'var(--color-var)' },
		{ key: 'surplus', short: 'H−n', value: result.surplusHours, color: 'var(--color-surplus)' }
	]);

	const lawInfo = $derived(
		(
			{
				productivity: {
					title: 'Закон I: производительность труда переменна',
					fixed: 'день H и интенсивность i постоянны',
					formula: 'w = H × i × 100 — не зависит от p',
					hint: 'Рабочий день данной длины всегда создаёт одну и ту же новую стоимость w, как бы ни менялась производительность. Рост p удешевляет жизненные средства рабочего — стоимость его рабочей силы v падает, а прибавочная стоимость m растёт ровно на ту же величину: v + m = w не меняется.',
					caveat:
						'Упрощение: здесь рост p напрямую снижает v. У Маркса это не автоматическая связь — она верна только если производительность растёт именно в отраслях, производящих предметы потребления рабочего. Рост p где-то ещё на v вообще не повлияет.'
				},
				intensity: {
					title: 'Закон II: интенсивность труда переменна',
					fixed: 'день H и производительность p постоянны',
					formula: 'v = 600 — не зависит от i',
					hint: 'Более интенсивный час труда — это как бы «сгущённый» рабочий день: за то же время создаётся больше новой стоимости w. Стоимость рабочей силы v при этом не меняется, поэтому весь прирост w целиком идёт в прибавочную стоимость m.',
					caveat:
						'Упрощение: здесь v строго постоянна. Маркс допускает и другой исход — v может слегка подрасти (более интенсивный труд быстрее изнашивает рабочую силу, требуя больше средств на её восстановление), но медленнее, чем растёт w, так что m всё равно увеличивается, просто не на всю величину прироста.'
				},
				workingDay: {
					title: 'Закон III: длина рабочего дня переменна',
					fixed: 'интенсивность i и производительность p постоянны',
					formula: 'n = 6 ч — не зависит от H',
					hint: 'Удлинение или сокращение рабочего дня не меняет ни стоимости рабочей силы v, ни необходимого времени в часах. Каждый добавленный (или отнятый) час целиком идёт в прибавочное время — это в точности механизм абсолютной прибавочной стоимости.',
					caveat: null
				}
			} as const
		)[law]
	);

	const lawTabs: { id: LabourPowerVariationLaw; label: string }[] = [
		{ id: 'productivity', label: 'Закон I · производительность' },
		{ id: 'intensity', label: 'Закон II · интенсивность' },
		{ id: 'workingDay', label: 'Закон III · длина дня' }
	];

	function selectLaw(next: LabourPowerVariationLaw) {
		law = next;
	}
</script>

<svelte:head>
	<title>Изменение стоимости рабочей силы и прибавочной стоимости — Капитал онлайн</title>
	<meta
		name="description"
		content="Три закона Маркса о том, как длина рабочего дня, интенсивность и производительность труда меняют стоимость рабочей силы и прибавочную стоимость."
	/>
</svelte:head>

<nav class="mb-6 text-sm text-ink-soft">
	<a href="/" class="hover:underline">Оглавление</a>
	<span class="px-1">/</span>
	<span>Том I</span>
</nav>

<article>
	<h1 class="font-serif text-3xl">Изменение стоимости рабочей силы и прибавочной стоимости</h1>
	<p class="mt-3 max-w-prose text-ink-soft">
		Стоимость рабочей силы <code>v</code> и прибавочная стоимость <code>m</code> зависят от трёх
		величин: длины рабочего дня <code>H</code>, интенсивности труда <code>i</code> и
		производительности труда <code>p</code>. Маркс разбирает три закона — в каждом две из трёх
		величин считаются постоянными, а третья меняется.
	</p>
	<p class="mt-3 max-w-prose text-ink-soft">
		Час простого труда нормальной интенсивности создаёт новую стоимость 100 ₽. При базовых значениях
		(<code>p = i = 1</code>, <code>H = 12</code> ч) рабочий день делится на 6 часов необходимого
		времени (<code>v = 600</code> ₽) и 6 часов прибавочного (<code>m = 600</code> ₽).
	</p>

	<!-- Переключатель законов -->
	<div class="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Закон">
		{#each lawTabs as tab (tab.id)}
			<button
				type="button"
				role="tab"
				aria-selected={law === tab.id}
				class={`rounded-md border px-3 py-2 font-mono text-sm transition ${
					law === tab.id
						? 'border-surplus bg-surplus/10 text-ink'
						: 'border-ink/15 text-ink-soft hover:border-ink/30'
				}`}
				onclick={() => selectLaw(tab.id)}
			>
				{tab.label}
			</button>
		{/each}
	</div>

	<div class="mt-4 rounded-lg border border-ink/15 bg-paper px-4 py-4 sm:px-5">
		<div class="font-serif text-lg leading-snug">{lawInfo.title}</div>
		<p class="mt-1 text-xs text-ink-soft">Даны постоянными: {lawInfo.fixed}</p>
		<p class="mt-1 font-mono text-xs text-ink-soft">{lawInfo.formula}</p>
		<p class="mt-3 max-w-prose text-sm text-ink-soft">{lawInfo.hint}</p>
		{#if lawInfo.caveat}
			<p class="mt-2 max-w-prose text-xs text-ink-soft italic">{lawInfo.caveat}</p>
		{/if}
	</div>

	<!-- Схема рабочего дня -->
	<div class="mt-6">
		<div class="mb-3 space-y-1">
			<div class="flex items-baseline gap-3">
				<span class="text-sm text-ink-soft">H — длина рабочего дня</span>
				<span class="font-mono text-3xl">{formatNumber(result.workingDayHours, 1)} ч</span>
			</div>
			<div class="flex items-baseline gap-3">
				<span class="text-sm text-ink-soft">w — новая стоимость за день</span>
				<span class="font-mono text-3xl">{formatNumber(result.w)} ₽</span>
			</div>
		</div>
		<div class="rounded-lg border border-dashed border-ink/20 bg-paper-dark/20 p-3">
			<CompositionBar
				segments={daySegments}
				scaleMax={MAX_WORKING_DAY_HOURS}
				formatValue={(value) => `${formatNumber(value, 1)} ч`}
				ariaLabel={`Рабочий день ${formatNumber(result.workingDayHours, 1)} часов: необходимое время ${formatNumber(result.necessaryHours, 1)} часов, прибавочное время ${formatNumber(result.surplusHours, 1)} часов`}
			/>
		</div>

		<Legend
			items={[
				{ key: 'n', color: 'var(--color-var)', code: 'n', label: 'необходимое время' },
				{ key: 'surplus', color: 'var(--color-surplus)', code: 'H − n', label: 'прибавочное время' }
			]}
		/>
	</div>

	<!-- Слайдеры -->
	<div class="mt-10 space-y-6">
		<div>
			<label for="slider-productivity" class="flex justify-between font-mono text-sm">
				<span>
					<code class="font-semibold">p</code> — производительность труда (Закон I)
				</span>
				<span>{formatNumber(productivity, 2)}×</span>
			</label>
			<input
				id="slider-productivity"
				type="range"
				min={MIN_INDEX}
				max={MAX_INDEX}
				step="0.1"
				bind:value={productivity}
				disabled={law !== 'productivity'}
				class="mt-2 h-11 w-full disabled:opacity-40"
			/>
			<p class="mt-1 text-xs text-ink-soft">
				{law === 'productivity'
					? 'Рост p удешевляет жизненные средства рабочего — v падает, m растёт на ту же величину.'
					: `зафиксировано на базовом уровне (p = 1) — активен другой закон`}
			</p>
		</div>

		<div>
			<label for="slider-intensity" class="flex justify-between font-mono text-sm">
				<span>
					<code class="font-semibold">i</code> — интенсивность труда (Закон II)
				</span>
				<span>{formatNumber(intensity, 2)}×</span>
			</label>
			<input
				id="slider-intensity"
				type="range"
				min={MIN_INDEX}
				max={MAX_INDEX}
				step="0.1"
				bind:value={intensity}
				disabled={law !== 'intensity'}
				class="mt-2 h-11 w-full disabled:opacity-40"
			/>
			<p class="mt-1 text-xs text-ink-soft">
				{law === 'intensity'
					? 'Рост i увеличивает новую стоимость w за тот же день — v не меняется, весь прирост идёт в m.'
					: `зафиксировано на базовом уровне (i = 1) — активен другой закон`}
			</p>
		</div>

		<div>
			<label for="slider-workday" class="flex justify-between font-mono text-sm">
				<span>
					<code class="font-semibold">H</code> — длина рабочего дня (Закон III)
				</span>
				<span>{formatNumber(workingDayHours, 1)} ч</span>
			</label>
			<input
				id="slider-workday"
				type="range"
				min={MIN_WORKING_DAY_HOURS}
				max={MAX_WORKING_DAY_HOURS}
				step="0.5"
				bind:value={workingDayHours}
				disabled={law !== 'workingDay'}
				class="mt-2 h-11 w-full disabled:opacity-40"
			/>
			<p class="mt-1 text-xs text-ink-soft">
				{law === 'workingDay'
					? 'Изменение H не трогает необходимое время в часах — весь добавленный (отнятый) час идёт в прибавочное время.'
					: `зафиксировано на базовом уровне (H = 12 ч) — активен другой закон`}
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
					<td class="py-2 pr-3"><code class="font-semibold">p</code> — производительность труда</td>
					<td class="py-2 pr-3 font-mono">{formatNumber(result.productivity, 2)}×</td>
				</tr>
				<tr class="border-b border-ink/10">
					<td class="py-2 pr-3"><code class="font-semibold">i</code> — интенсивность труда</td>
					<td class="py-2 pr-3 font-mono">{formatNumber(result.intensity, 2)}×</td>
				</tr>
				<tr class="border-b border-ink/10">
					<td class="py-2 pr-3"><code class="font-semibold">H</code> — длина рабочего дня, часов</td
					>
					<td class="py-2 pr-3 font-mono">{formatNumber(result.workingDayHours, 1)}</td>
				</tr>
				<tr class="border-b border-ink/10">
					<td class="py-2 pr-3">
						<code class="font-semibold text-var">n</code> — необходимое время, часов
					</td>
					<td class="py-2 pr-3 font-mono">{formatNumber(result.necessaryHours, 2)}</td>
				</tr>
				<tr class="border-b border-ink/10">
					<td class="py-2 pr-3">
						<code class="font-semibold text-surplus">H − n</code> — прибавочное время, часов
					</td>
					<td class="py-2 pr-3 font-mono">{formatNumber(result.surplusHours, 2)}</td>
				</tr>
				<tr class="border-b border-ink/10">
					<td class="py-2 pr-3">
						<code class="font-semibold text-var">v</code> — стоимость рабочей силы
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
						<div class="font-mono text-xs text-ink-soft">w = H × i × 100</div>
					</td>
					<td class="py-2 pr-3 font-mono">{formatNumber(result.w)}</td>
				</tr>
			</tbody>
		</table>
	</div>
</article>
