<script lang="ts">
	import {
		computeTurnoverCapital,
		DAYS_IN_YEAR,
		MAX_CIRCULATION_PERIOD_DAYS,
		MAX_DAILY_OUTLAY,
		MAX_WORKING_PERIOD_DAYS,
		MIN_CIRCULATION_PERIOD_DAYS,
		MIN_DAILY_OUTLAY,
		MIN_WORKING_PERIOD_DAYS
	} from '../../../models/turnoverCapital';
	import { formatNumber } from '$lib/format';
	import CompositionBar from '$lib/components/CompositionBar.svelte';
	import Legend from '$lib/components/Legend.svelte';

	let dailyOutlay = $state<number>(50);
	let workingPeriodDays = $state<number>(20);
	let circulationPeriodDays = $state<number>(10);

	const result = $derived(
		computeTurnoverCapital({ dailyOutlay, workingPeriodDays, circulationPeriodDays })
	);

	// Ширина всей полосы пропорциональна времени оборота относительно максимума —
	// поэтому удлинение рабочего периода или периода обращения реально растягивает
	// полосу, а не только двигает границу между его частями.
	const turnoverSegments = $derived([
		{ key: 'w', short: 'w', value: result.workingPeriodDays, color: 'var(--color-labour)' },
		{ key: 'z', short: 'z', value: result.circulationPeriodDays, color: 'var(--color-circulation)' }
	]);
	const turnoverScaleMax = MAX_WORKING_PERIOD_DAYS + MAX_CIRCULATION_PERIOD_DAYS;
</script>

<svelte:head>
	<title>Время оборота и величина авансированного капитала — Капитал онлайн</title>
	<meta
		name="description"
		content="Как рабочий период и период обращения складываются во время оборота и почему от него зависит величина авансированного капитала."
	/>
</svelte:head>

<nav class="mb-6 text-sm text-ink-soft">
	<a href="/" class="hover:underline">Оглавление</a>
	<span class="px-1">/</span>
	<span>Том II</span>
</nav>

<article>
	<h1 class="font-serif text-3xl">Время оборота и величина авансированного капитала</h1>
	<p class="mt-3 max-w-prose text-ink-soft">
		Речь здесь только об <strong>оборотном капитале</strong> — деньгах, вложенных в рабочую силу и
		материалы: они целиком расходуются за один оборот и целиком же возвращаются из выручки.
		<strong>Основной капитал</strong> (здания, машины) устроен иначе — он служит много оборотов подряд
		и переносит свою стоимость на продукт по частям, через износ, — поэтому в модели не участвует.
	</p>
	<p class="mt-3 max-w-prose text-ink-soft">
		Пока товар производится и продаётся, вложенные в него деньги «в пути»: капиталист получит их
		назад только после продажи. Время от вложения денег до их возврата — это
		<strong>время оборота</strong>. Оно складывается из
		<strong style="color: var(--color-labour);">рабочего периода w</strong>
		— срока, за который производится партия товара, — и
		<strong style="color: var(--color-circulation);">периода обращения z</strong>
		— срока, за который готовый товар доходит до покупателя, а деньги за него возвращаются обратно.
	</p>
	<p class="mt-3 max-w-prose text-ink-soft">
		Чтобы производство не прерывалось, капиталист каждый день тратит на рабочую силу и материалы
		<code>k</code> ₽ — и должен держать эти деньги наготове весь срок оборота
		<code>U = w + z</code>, потому что раньше они не вернутся. Отсюда
		<strong>авансированный капитал</strong>
		<code>K = k × U</code>: он растёт вместе с дневными расходами и длиной оборота, но не зависит от
		того, как оборот делится между производством и обращением.
	</p>
	<p class="mt-3 max-w-prose text-ink-soft">
		Отсюда и вывод главы: чем короче время оборота, тем меньше капитала нужно авансировать для того
		же масштаба производства — и тем больше оборотов
		<code>n = 360 ⁄ U</code>
		капитал успевает совершить за год. Ускорить оборот (быстрее произвести, быстрее продать, быстрее получить
		деньги) — способ освободить капитал не хуже, чем накопить новый.
	</p>

	<!-- Величина авансированного капитала -->
	<div class="mt-8">
		<div class="mb-3 flex items-baseline gap-3">
			<span class="text-sm text-ink-soft">K — авансированный капитал</span>
			<span class="font-mono text-3xl">{formatNumber(result.advancedCapital)} ₽</span>
		</div>

		<!-- Схема времени оборота -->
		<div class="mb-3 flex items-baseline gap-3 text-sm text-ink-soft">
			<span>U — время оборота</span>
			<span class="font-mono">{formatNumber(result.turnoverDays)} дней</span>
		</div>
		<CompositionBar
			segments={turnoverSegments}
			scaleMax={turnoverScaleMax}
			formatValue={(value) => `${formatNumber(value)} дн.`}
			ariaLabel={`Время оборота ${formatNumber(result.turnoverDays)} дней: рабочий период ${formatNumber(result.workingPeriodDays)} дней, период обращения ${formatNumber(result.circulationPeriodDays)} дней`}
		/>
		<Legend
			items={[
				{ key: 'w', color: 'var(--color-labour)', code: 'w', label: 'рабочий период' },
				{ key: 'z', color: 'var(--color-circulation)', code: 'z', label: 'период обращения' }
			]}
		/>
	</div>

	<!-- Слайдеры -->
	<div class="mt-10 space-y-6">
		<div>
			<label for="slider-k" class="flex justify-between font-mono text-sm">
				<span
					><code class="font-semibold">k</code> — дневные расходы оборотного капитала (рабочая сила и
					материалы)</span
				>
				<span>{formatNumber(dailyOutlay)} ₽</span>
			</label>
			<input
				id="slider-k"
				type="range"
				min={MIN_DAILY_OUTLAY}
				max={MAX_DAILY_OUTLAY}
				step="5"
				bind:value={dailyOutlay}
				class="mt-2 h-11 w-full"
			/>
			<p class="mt-1 text-xs text-ink-soft">
				Чем больше денег в день уходит на рабочую силу и материалы, тем больше капитала нужно
				держать наготове при том же времени оборота.
			</p>
		</div>

		<div>
			<label for="slider-w" class="flex justify-between font-mono text-sm">
				<span
					><code class="font-semibold" style="color: var(--color-labour);">w</code> — рабочий период</span
				>
				<span>{formatNumber(workingPeriodDays)} дн.</span>
			</label>
			<input
				id="slider-w"
				type="range"
				min={MIN_WORKING_PERIOD_DAYS}
				max={MAX_WORKING_PERIOD_DAYS}
				step="1"
				bind:value={workingPeriodDays}
				class="mt-2 h-11 w-full"
				style="accent-color: var(--color-labour);"
			/>
		</div>

		<div>
			<label for="slider-z" class="flex justify-between font-mono text-sm">
				<span
					><code class="font-semibold" style="color: var(--color-circulation);">z</code> — период обращения</span
				>
				<span>{formatNumber(circulationPeriodDays)} дн.</span>
			</label>
			<input
				id="slider-z"
				type="range"
				min={MIN_CIRCULATION_PERIOD_DAYS}
				max={MAX_CIRCULATION_PERIOD_DAYS}
				step="1"
				bind:value={circulationPeriodDays}
				class="mt-2 h-11 w-full"
				style="accent-color: var(--color-circulation);"
			/>
			<p class="mt-1 text-xs text-ink-soft">
				Сократить <code>w</code> или <code>z</code> — значит сократить и время оборота
				<code>U</code>, а значит и авансированный капитал <code>K</code>, нужный для того же дела.
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
						<code class="font-semibold">K</code> — авансированный капитал
						<div class="font-mono text-xs text-ink-soft">K = k × U</div>
					</td>
					<td class="py-2 pr-3 font-mono">{formatNumber(result.advancedCapital)} ₽</td>
				</tr>
				<tr class="border-b border-ink/10">
					<td class="py-2 pr-3">
						<code class="font-semibold">k</code> — дневные расходы на производство
					</td>
					<td class="py-2 pr-3 font-mono">{formatNumber(result.dailyOutlay)} ₽</td>
				</tr>
				<tr class="border-b border-ink/10">
					<td class="py-2 pr-3">
						<code class="font-semibold" style="color: var(--color-labour);">w</code> — рабочий период
					</td>
					<td class="py-2 pr-3 font-mono">{formatNumber(result.workingPeriodDays)} дн.</td>
				</tr>
				<tr class="border-b border-ink/10">
					<td class="py-2 pr-3">
						<code class="font-semibold" style="color: var(--color-circulation);">z</code> — период обращения
					</td>
					<td class="py-2 pr-3 font-mono">{formatNumber(result.circulationPeriodDays)} дн.</td>
				</tr>
				<tr class="border-b border-ink/10">
					<td class="py-2 pr-3">
						<code class="font-semibold">U</code> — время оборота
						<div class="font-mono text-xs text-ink-soft">U = w + z</div>
					</td>
					<td class="py-2 pr-3 font-mono">{formatNumber(result.turnoverDays)} дн.</td>
				</tr>
				<tr class="border-b border-ink/10">
					<td class="py-2 pr-3">
						<code class="font-semibold">n</code> — число оборотов в год
						<div class="font-mono text-xs text-ink-soft">n = 360 ⁄ U</div>
					</td>
					<td class="py-2 pr-3 font-mono">{formatNumber(result.turnoversPerYear, 2)}</td>
				</tr>
				<tr>
					<td class="py-2 pr-3">
						годовая сумма оборотов
						<div class="font-mono text-xs text-ink-soft">k × 360 = K × n</div>
					</td>
					<td class="py-2 pr-3 font-mono">{formatNumber(result.annualTurnoverValue)} ₽</td>
				</tr>
			</tbody>
		</table>
		<p class="mt-3 text-xs text-ink-soft">
			Год здесь, как и у Маркса, — {DAYS_IN_YEAR} дней. Годовая сумма оборотов одна и та же при любой
			разбивке года на обороты: она зависит только от дневных расходов <code>k</code>, а не от того,
			насколько быстро капитал оборачивается.
		</p>
	</div>
</article>
