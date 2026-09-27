<script lang="ts">
	import {
		computeSimpleReproduction,
		MAX_DEPT1_CONSTANT_CAPITAL,
		MAX_DEPT1_VARIABLE_CAPITAL,
		MAX_DEPT2_CONSTANT_CAPITAL,
		MAX_DEPT2_VARIABLE_CAPITAL,
		MAX_SURPLUS_VALUE_RATE,
		MIN_CAPITAL,
		MIN_SURPLUS_VALUE_RATE
	} from '../../../models/simpleReproduction';
	import { formatNumber, formatPercent } from '$lib/format';
	import CompositionBar from '$lib/components/CompositionBar.svelte';
	import Legend from '$lib/components/Legend.svelte';

	// Числовой пример Маркса из главы XX: I. 4000c+1000v+1000m = 6000;
	// II. 2000c+500v+500m = 3000 — обмен между отделами сбалансирован.
	let c1 = $state<number>(4000);
	let v1 = $state<number>(1000);
	let c2 = $state<number>(2000);
	let v2 = $state<number>(500);
	let surplusValueRate = $state<number>(100);

	const result = $derived(computeSimpleReproduction({ c1, v1, c2, v2, surplusValueRate }));

	const dept1Segments = $derived([
		{ key: 'c1', short: 'c₁', value: result.c1, color: 'var(--color-const)' },
		{ key: 'v1', short: 'v₁', value: result.v1, color: 'var(--color-var)' },
		{ key: 'm1', short: 'm₁', value: result.m1, color: 'var(--color-surplus)' }
	]);

	const dept2Segments = $derived([
		{ key: 'c2', short: 'c₂', value: result.c2, color: 'var(--color-const)' },
		{ key: 'v2', short: 'v₂', value: result.v2, color: 'var(--color-var)' },
		{ key: 'm2', short: 'm₂', value: result.m2, color: 'var(--color-surplus)' }
	]);

	// Куда уходит продукт каждого отдела: то, что остаётся внутри самого
	// отдела (в натуре, без обмена), и то, что должно быть обменяно с другим
	// отделом. Синий — «внутри своего отдела», фиолетовый — «в обмен».
	const dept1FlowSegments = $derived([
		{
			key: 'inside1',
			short: `c₁ — внутри отдела I`,
			value: result.c1,
			color: 'var(--color-labour)'
		},
		{
			key: 'exchange1',
			short: `v₁+m₁ — в обмен на предметы потребления`,
			value: result.dept1Offer,
			color: 'var(--color-circulation)'
		}
	]);

	const dept2FlowSegments = $derived([
		{
			key: 'exchange2',
			short: `c₂ — в обмен на средства производства`,
			value: result.dept2Demand,
			color: 'var(--color-circulation)'
		},
		{
			key: 'inside2',
			short: `v₂+m₂ — внутри отдела II`,
			value: result.v2 + result.m2,
			color: 'var(--color-labour)'
		}
	]);

	const caseInfo = $derived(
		(
			{
				balanced: {
					label: 'Обмен между отделами сбалансирован',
					colorClass: 'text-var',
					hint: 'v₁ + m₁ = c₂ — условие простого воспроизводства выполнено: весь общественный продукт находит покупателя, и производство может повториться в прежнем масштабе.'
				},
				surplus: {
					label: 'Отдел I производит больше, чем нужно отделу II',
					colorClass: 'text-released',
					hint: 'v₁ + m₁ больше c₂: отдел I предлагает для обмена больше средств производства, чем отдел II готов купить для возобновления своего постоянного капитала. Излишек не найдёт сбыта, если отдел II не станет расширять производство.'
				},
				deficit: {
					label: 'Отдел I производит меньше, чем нужно отделу II',
					colorClass: 'text-surplus',
					hint: 'v₁ + m₁ меньше c₂: отделу II не хватает средств производства, чтобы полностью возобновить постоянный капитал. Часть его производства не сможет продолжиться в прежнем масштабе.'
				}
			} as const
		)[result.caseType]
	);
</script>

<svelte:head>
	<title>Простое воспроизводство — Капитал онлайн</title>
	<meta
		name="description"
		content="Обмен между двумя отделами общественного капитала: v₁ + m₁ = c₂ — условие простого воспроизводства из главы XX второго тома «Капитала»."
	/>
</svelte:head>

<nav class="mb-6 text-sm text-ink-soft">
	<a href="/" class="hover:underline">Оглавление</a>
	<span class="px-1">/</span>
	<span>Том II</span>
</nav>

<article>
	<h1 class="font-serif text-3xl">Простое воспроизводство</h1>
	<p class="mt-3 max-w-prose text-ink-soft">
		Весь общественный продукт Маркс делит на два отдела:
		<strong>отдел I</strong> производит средства производства (сырьё, машины, материалы), а
		<strong>отдел II</strong> — предметы потребления (для рабочих и капиталистов). Продукт каждого
		отдела, как и продукт одного рабочего дня, распадается на
		<strong class="text-const">постоянный капитал c</strong>,
		<strong class="text-var">переменный капитал v</strong> и
		<strong class="text-surplus">прибавочную стоимость m</strong>.
	</p>
	<p class="mt-3 max-w-prose text-ink-soft">
		При <strong>простом воспроизводстве</strong> — когда вся прибавочная стоимость проедается, а не
		копится, — производство просто повторяется в прежнем размере. Для этого стоимость каждой части
		продукта должна найти покупателя: <code>c₁</code> заменяется в натуре внутри самого отдела I
		(капиталисты покупают средства производства друг у друга), а
		<code>v₂ + m₂</code> — доходы отдела II — расходуются на предметы потребления, произведённые
		внутри самого отдела II. Остаются <code>v₁ + m₁</code> (доходы отдела I, которым нужны предметы
		потребления) и <code>c₂</code> (постоянный капитал отдела II, которому нужны средства производства)
		— это один и тот же обмен, только с двух его сторон.
	</p>
	<p class="mt-3 max-w-prose text-ink-soft">
		Отсюда знаменитое условие простого воспроизводства:
		<code class="font-semibold">v₁ + m₁ = c₂</code>. Если оно выполняется — весь продукт общества
		реализуется без остатка. Если нет — возникает диспропорция между отделами: то, что Маркс
		разбирает в следующих главах как один из корней экономических кризисов.
	</p>

	<!-- Продукт каждого отдела -->
	<div class="mt-8 space-y-6">
		<div>
			<div class="mb-2 flex items-baseline gap-3">
				<span class="font-serif text-lg">Отдел I — средства производства</span>
				<span class="font-mono text-2xl">{formatNumber(result.w1)} ₽</span>
			</div>
			<CompositionBar
				segments={dept1Segments}
				ariaLabel={`Продукт отдела I: постоянный капитал ${formatNumber(result.c1)}, переменный капитал ${formatNumber(result.v1)}, прибавочная стоимость ${formatNumber(result.m1)}, итого ${formatNumber(result.w1)}`}
				formatValue={formatNumber}
			/>
		</div>

		<div>
			<div class="mb-2 flex items-baseline gap-3">
				<span class="font-serif text-lg">Отдел II — предметы потребления</span>
				<span class="font-mono text-2xl">{formatNumber(result.w2)} ₽</span>
			</div>
			<CompositionBar
				segments={dept2Segments}
				ariaLabel={`Продукт отдела II: постоянный капитал ${formatNumber(result.c2)}, переменный капитал ${formatNumber(result.v2)}, прибавочная стоимость ${formatNumber(result.m2)}, итого ${formatNumber(result.w2)}`}
				formatValue={formatNumber}
			/>
		</div>

		<Legend
			items={[
				{ key: 'c', color: 'var(--color-const)', code: 'c', label: 'постоянный капитал' },
				{ key: 'v', color: 'var(--color-var)', code: 'v', label: 'переменный капитал' },
				{ key: 'm', color: 'var(--color-surplus)', code: 'm', label: 'прибавочная стоимость' }
			]}
		/>

		<div class="flex items-baseline gap-3 border-t border-ink/10 pt-4 text-sm text-ink-soft">
			<span>W — совокупный общественный продукт</span>
			<span class="font-mono text-2xl text-ink">{formatNumber(result.totalProduct)} ₽</span>
		</div>
	</div>

	<!-- Куда уходит продукт: внутри отдела или в обмен -->
	<div class="mt-10">
		<h2 class="font-serif text-xl">Что остаётся внутри отдела, а что идёт в обмен</h2>
		<p class="mt-2 max-w-prose text-sm text-ink-soft">
			Синим — часть продукта, которая находит покупателя внутри самого отдела. Фиолетовым — часть,
			которая должна пересечь границу между отделами.
		</p>

		<div class="mt-4 space-y-4">
			<div>
				<div class="mb-1 text-sm text-ink-soft">Отдел I</div>
				<CompositionBar
					segments={dept1FlowSegments}
					ariaLabel={`Отдел I: внутри отдела ${formatNumber(result.c1)}, в обмен на предметы потребления ${formatNumber(result.dept1Offer)}`}
					formatValue={formatNumber}
				/>
			</div>
			<div>
				<div class="mb-1 text-sm text-ink-soft">Отдел II</div>
				<CompositionBar
					segments={dept2FlowSegments}
					ariaLabel={`Отдел II: в обмен на средства производства ${formatNumber(result.dept2Demand)}, внутри отдела ${formatNumber(result.v2 + result.m2)}`}
					formatValue={formatNumber}
				/>
			</div>
		</div>

		<Legend
			items={[
				{ key: 'inside', color: 'var(--color-labour)', code: '', label: 'внутри своего отдела' },
				{
					key: 'exchange',
					color: 'var(--color-circulation)',
					code: '',
					label: 'в обмен с другим отделом'
				}
			]}
		/>
	</div>

	<!-- Баланс обмена -->
	<div class="mt-10">
		<div class="rounded-lg border border-ink/15 bg-paper px-4 py-4 sm:px-5">
			<div class={`font-serif text-lg leading-snug ${caseInfo.colorClass}`}>
				{caseInfo.label}
			</div>
			<p class="mt-1 max-w-prose text-sm text-ink-soft">{caseInfo.hint}</p>

			<div class="mt-4 flex flex-wrap items-baseline gap-x-6 gap-y-2 border-t border-ink/10 pt-4">
				<div>
					<div class="text-xs tracking-wide text-ink-soft uppercase">
						v₁ + m₁ — предложение средств производства
					</div>
					<div class="font-mono text-2xl tabular-nums">{formatNumber(result.dept1Offer)} ₽</div>
				</div>
				<div>
					<div class="text-xs tracking-wide text-ink-soft uppercase">
						c₂ — потребность отдела II
					</div>
					<div class="font-mono text-2xl tabular-nums">{formatNumber(result.dept2Demand)} ₽</div>
				</div>
				<div>
					<div class="text-xs tracking-wide text-ink-soft uppercase">баланс</div>
					<div class={`font-mono text-2xl tabular-nums ${caseInfo.colorClass}`}>
						{result.balance > 0 ? '+' : ''}{formatNumber(result.balance)} ₽
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Слайдеры -->
	<div class="mt-10 space-y-6">
		<h2 class="font-serif text-xl">Отдел I — средства производства</h2>

		<div>
			<label for="slider-c1" class="flex justify-between font-mono text-sm">
				<span><code class="font-semibold text-const">c₁</code> — постоянный капитал отдела I</span>
				<span>{formatNumber(c1)} ₽</span>
			</label>
			<input
				id="slider-c1"
				type="range"
				min={MIN_CAPITAL}
				max={MAX_DEPT1_CONSTANT_CAPITAL}
				step="100"
				bind:value={c1}
				class="mt-2 h-11 w-full"
				style="accent-color: var(--color-const);"
			/>
		</div>

		<div>
			<label for="slider-v1" class="flex justify-between font-mono text-sm">
				<span><code class="font-semibold text-var">v₁</code> — переменный капитал отдела I</span>
				<span>{formatNumber(v1)} ₽</span>
			</label>
			<input
				id="slider-v1"
				type="range"
				min={MIN_CAPITAL}
				max={MAX_DEPT1_VARIABLE_CAPITAL}
				step="100"
				bind:value={v1}
				class="mt-2 h-11 w-full"
				style="accent-color: var(--color-var);"
			/>
		</div>

		<h2 class="pt-4 font-serif text-xl">Отдел II — предметы потребления</h2>

		<div>
			<label for="slider-c2" class="flex justify-between font-mono text-sm">
				<span><code class="font-semibold text-const">c₂</code> — постоянный капитал отдела II</span>
				<span>{formatNumber(c2)} ₽</span>
			</label>
			<input
				id="slider-c2"
				type="range"
				min={MIN_CAPITAL}
				max={MAX_DEPT2_CONSTANT_CAPITAL}
				step="100"
				bind:value={c2}
				class="mt-2 h-11 w-full"
				style="accent-color: var(--color-const);"
			/>
			<p class="mt-1 text-xs text-ink-soft">
				Двигайте <code>c₂</code>: пока <code>c₂ = v₁ + m₁</code>, обмен сбалансирован. Отклонение в
				любую сторону создаёт диспропорцию между отделами.
			</p>
		</div>

		<div>
			<label for="slider-v2" class="flex justify-between font-mono text-sm">
				<span><code class="font-semibold text-var">v₂</code> — переменный капитал отдела II</span>
				<span>{formatNumber(v2)} ₽</span>
			</label>
			<input
				id="slider-v2"
				type="range"
				min={MIN_CAPITAL}
				max={MAX_DEPT2_VARIABLE_CAPITAL}
				step="100"
				bind:value={v2}
				class="mt-2 h-11 w-full"
				style="accent-color: var(--color-var);"
			/>
		</div>

		<h2 class="pt-4 font-serif text-xl">Норма прибавочной стоимости</h2>

		<div>
			<label for="slider-rate" class="flex justify-between font-mono text-sm">
				<span
					><code class="font-semibold text-surplus">m′</code> — норма прибавочной стоимости, одна для
					обоих отделов</span
				>
				<span>{formatPercent(surplusValueRate)}</span>
			</label>
			<input
				id="slider-rate"
				type="range"
				min={MIN_SURPLUS_VALUE_RATE}
				max={MAX_SURPLUS_VALUE_RATE}
				step="10"
				bind:value={surplusValueRate}
				class="mt-2 h-11 w-full"
				style="accent-color: var(--color-surplus);"
			/>
			<p class="mt-1 text-xs text-ink-soft">
				Маркс в числовом примере берёт одну и ту же степень эксплуатации в обоих отделах:
				<code>m = v × m′</code>.
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
						<code class="font-semibold text-const">c₁</code> +
						<code class="font-semibold text-var">v₁</code> +
						<code class="font-semibold text-surplus">m₁</code> = отдел I
					</td>
					<td class="py-2 pr-3 font-mono"
						>{formatNumber(result.c1)} + {formatNumber(result.v1)} + {formatNumber(result.m1)} =
						{formatNumber(result.w1)} ₽</td
					>
				</tr>
				<tr class="border-b border-ink/10">
					<td class="py-2 pr-3">
						<code class="font-semibold text-const">c₂</code> +
						<code class="font-semibold text-var">v₂</code> +
						<code class="font-semibold text-surplus">m₂</code> = отдел II
					</td>
					<td class="py-2 pr-3 font-mono"
						>{formatNumber(result.c2)} + {formatNumber(result.v2)} + {formatNumber(result.m2)} =
						{formatNumber(result.w2)} ₽</td
					>
				</tr>
				<tr class="border-b border-ink/10">
					<td class="py-2 pr-3">
						<code class="font-semibold">W</code> — совокупный общественный продукт
						<div class="font-mono text-xs text-ink-soft">W = W₁ + W₂</div>
					</td>
					<td class="py-2 pr-3 font-mono">{formatNumber(result.totalProduct)} ₽</td>
				</tr>
				<tr class="border-b border-ink/10">
					<td class="py-2 pr-3">
						<code class="font-semibold">v₁ + m₁</code> — предложение средств производства для обмена
					</td>
					<td class="py-2 pr-3 font-mono">{formatNumber(result.dept1Offer)} ₽</td>
				</tr>
				<tr class="border-b border-ink/10">
					<td class="py-2 pr-3">
						<code class="font-semibold">c₂</code> — потребность отдела II в средствах производства
					</td>
					<td class="py-2 pr-3 font-mono">{formatNumber(result.dept2Demand)} ₽</td>
				</tr>
				<tr>
					<td class={`py-2 pr-3 ${caseInfo.colorClass}`}>
						баланс обмена
						<div class="font-mono text-xs text-ink-soft">(v₁ + m₁) − c₂</div>
					</td>
					<td class={`py-2 pr-3 font-mono ${caseInfo.colorClass}`}>
						{result.isBalanced
							? '0 ₽ (простое воспроизводство сходится)'
							: `${result.balance > 0 ? '+' : ''}${formatNumber(result.balance)} ₽`}
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</article>
