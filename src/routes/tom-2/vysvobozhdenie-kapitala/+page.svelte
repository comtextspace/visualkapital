<script lang="ts">
	import {
		computeCapitalRelease,
		describeWeekEvent,
		MAX_PERIOD_WEEKS,
		MAX_WEEKLY_OUTLAY,
		MIN_PERIOD_WEEKS,
		MIN_WEEKLY_OUTLAY,
		type CapitalBatch
	} from '../../../models/capitalRelease';
	import { formatNumber } from '$lib/format';

	let weeklyOutlay = $state<number>(100);
	let workingPeriodWeeks = $state<number>(6);
	let circulationPeriodWeeks = $state<number>(3);

	const result = $derived(
		computeCapitalRelease({ weeklyOutlay, workingPeriodWeeks, circulationPeriodWeeks })
	);

	const caseInfo = $derived(
		(
			{
				equal: {
					label: 'Рабочий период равен периоду обращения',
					hint: 'Доли капитала сменяют друг друга без остатка — высвобождения не происходит.'
				},
				greater: {
					label: 'Рабочий период больше периода обращения',
					hint: 'Деньги от проданных партий успевают вернуться, пока идёт следующее производство. Временно простаивает до k × z — не весь K, а только сумма на период обращения одной партии; затем она снова понадобится.'
				},
				less: {
					label: 'Рабочий период меньше периода обращения',
					hint: 'Если z кратно w — высвобождения нет. Иначе временно простаивает до k × (z mod w).'
				}
			} as const
		)[result.caseType]
	);

	const caseLabels: Record<string, string> = {
		equal: 'равен',
		greater: 'больше',
		less: 'меньше'
	};

	let selectedWeek = $state<number>(1);

	const bars = $derived(
		result.timeline.map((snapshot) => ({
			week: snapshot.week,
			production: snapshot.production,
			circulation: snapshot.circulation,
			remainingAdvanced: snapshot.remainingAdvanced,
			released: snapshot.released,
			events: snapshot.events,
			productionPct: (snapshot.production / result.advancedCapital) * 100,
			circulationPct: (snapshot.circulation / result.advancedCapital) * 100,
			remainingAdvancedPct: (snapshot.remainingAdvanced / result.advancedCapital) * 100,
			releasedPct: (snapshot.released / result.advancedCapital) * 100
		}))
	);

	const selectedSnapshot = $derived(
		bars.find((bar) => bar.week === selectedWeek) ?? bars[0] ?? null
	);

	const chartWeeks = $derived(result.timeline.length);

	$effect(() => {
		weeklyOutlay;
		workingPeriodWeeks;
		circulationPeriodWeeks;
		selectedWeek = 1;
	});

	function selectWeek(week: number) {
		selectedWeek = week;
	}

	function batchPhase(batch: CapitalBatch, week: number): 'production' | 'circulation' | null {
		if (week >= batch.productionStartWeek && week <= batch.productionEndWeek) {
			return 'production';
		}

		if (week >= batch.circulationStartWeek && week <= batch.circulationEndWeek) {
			return 'circulation';
		}

		return null;
	}

	function batchPhaseStyle(phase: 'production' | 'circulation' | null): string {
		if (phase === 'production') {
			return 'background-color: var(--color-labour); opacity: 0.85;';
		}

		if (phase === 'circulation') {
			return 'background-color: var(--color-circulation); opacity: 0.85;';
		}

		return 'background-color: var(--color-paper-dark); opacity: 0.35;';
	}
</script>

<svelte:head>
	<title>Высвобождение оборотного капитала — Капитал онлайн</title>
	<meta
		name="description"
		content="Три случая соотношения рабочего периода и периода обращения — и когда часть авансированного капитала временно высвобождается."
	/>
</svelte:head>

<nav class="mb-6 text-sm text-ink-soft">
	<a href="/" class="hover:underline">Оглавление</a>
	<span class="px-1">/</span>
	<span>Том II</span>
</nav>

<article>
	<h1 class="font-serif text-3xl">Высвобождение оборотного капитала</h1>
	<p class="mt-3 max-w-prose text-ink-soft">
		Капитал возвращается деньгами не сразу, а партиями: товар, произведённый за
		<strong style="color: var(--color-labour);">рабочий период w</strong>, продаётся и приносит
		деньги обратно только через
		<strong style="color: var(--color-circulation);">период обращения z</strong>
		после того, как он готов. Чтобы дело не прерывалось, капиталист каждую неделю тратит на рабочую силу
		и материалы <code>k</code> ₽ — и должен держать эти деньги наготове весь срок оборота
		<code>U = w + z</code>. Отсюда <strong>авансированный капитал</strong>
		<code>K = k × U = k × (w + z)</code>. Но смотря по тому, что больше — рабочий период или период
		обращения, — часть этого капитала может периодически оказываться временно ненужной для
		производства: она <strong>высвобождается</strong> и до поры может найти другое применение, например
		на денежном рынке.
	</p>
	<p class="mt-3 max-w-prose text-ink-soft">
		Маркс разбирает три случая. Если <code>w = z</code>, доли капитала просто сменяют друг друга без
		остатка — высвобождения не происходит вовсе. Если <code>w &gt; z</code>, рабочий период длиннее
		обращения: деньги от уже проданных партий возвращаются, пока следующая ещё производится, и
		периодически простаивает до <code>k × z</code> — ровно столько, сколько нужно авансировать на
		период обращения <em>одной</em> партии, а не весь капитал <code>K</code>. Если же
		<code>w &lt; z</code>, высвобождение зависит от того, укладывается ли период обращения в рабочий
		период без остатка: если да — высвобождения нет, если нет — высвобождается остаток от деления
		<code>z</code> на <code>w</code> (в деньгах: <code>k × (z mod w)</code>).
	</p>
	<p class="mt-3 max-w-prose text-ink-soft">
		Высвобождение здесь временное, а не безвозвратное: деньги простаивают лишь часть каждого
		оборота, а затем производство снова забирает их себе. Именно такие периодически освобождающиеся
		суммы Маркс считал одним из источников денежного капитала, питающего кредит.
	</p>

	<div class="mt-8">
		<div class="mb-6 rounded-lg border border-ink/15 bg-paper px-4 py-4 sm:px-5">
			<div class="flex flex-wrap items-baseline gap-x-2 gap-y-1 font-serif text-lg leading-snug">
				<span>{caseInfo.label}:</span>
				<span>
					<code class="font-semibold" style="color: var(--color-labour);">w</code>
					<span class="mx-1 text-ink-soft">{caseLabels[result.caseType]}</span>
					<code class="font-semibold" style="color: var(--color-circulation);">z</code>
				</span>
			</div>
			<p class="mt-1 max-w-prose text-sm text-ink-soft">{caseInfo.hint}</p>

			<div class="mt-4 border-t border-ink/10 pt-4">
				<div class="text-xs tracking-wide text-ink-soft uppercase">
					Пик высвобождающегося капитала
				</div>
				{#if result.hasRelease}
					<p class="mt-1 font-mono text-3xl tabular-nums" style="color: var(--color-released);">
						{formatNumber(result.maxReleased)} ₽
					</p>
				{:else}
					<p class="mt-1 font-mono text-xl text-ink-soft">Не высвобождается</p>
				{/if}
			</div>
		</div>

		<div class="rounded-lg border border-dashed border-ink/20 bg-paper-dark/20 p-3">
			{#if selectedSnapshot}
				<div class="mb-2 rounded-md border border-ink/10 bg-paper px-3 py-2 text-xs">
					<div class="mb-2 font-serif text-sm">
						Неделя {selectedSnapshot.week} — начало
					</div>

					<div class="mb-2">
						<div class="mb-1 font-semibold text-ink-soft">Текущее состояние</div>
						<ul class="space-y-0.5 font-mono">
							<li style="color: var(--color-labour);">
								в производстве — {formatNumber(selectedSnapshot.production)} ₽
							</li>
							<li style="color: var(--color-circulation);">
								в обращении — {formatNumber(selectedSnapshot.circulation)} ₽
							</li>
							<li style="color: var(--color-const);">
								осталось авансировать на текущий рабочий период —
								{formatNumber(selectedSnapshot.remainingAdvanced)} ₽
							</li>
							<li style="color: var(--color-released);">
								ещё не авансирован (высвободился) — {formatNumber(selectedSnapshot.released)} ₽
							</li>
						</ul>
						<div class="mt-1 border-t border-ink/10 pt-1 text-ink-soft">
							итого K — {formatNumber(result.advancedCapital)} ₽
						</div>
					</div>

					<div>
						<div class="mb-1 font-semibold text-ink-soft">Что произошло в начале недели</div>
						<ul class="space-y-0.5 text-ink-soft">
							{#each selectedSnapshot.events as event, index (index)}
								<li>→ {describeWeekEvent(event)}</li>
							{/each}
						</ul>
					</div>
				</div>
			{/if}

			<div class="overflow-x-auto">
				<div class="flex h-40 min-w-[480px] items-stretch gap-0.5 sm:h-48">
					{#each bars as bar (bar.week)}
						<button
							type="button"
							class={`flex flex-1 flex-col-reverse rounded-[2px] border-0 bg-transparent p-0 transition-shadow ${selectedWeek === bar.week ? 'z-10 ring-2 ring-surplus ring-inset' : ''}`}
							aria-pressed={selectedWeek === bar.week}
							aria-label={`Неделя ${bar.week}, начало`}
							onclick={() => selectWeek(bar.week)}
						>
							<div class="flex min-h-0 flex-1 flex-col-reverse overflow-hidden rounded-[2px]">
								<div
									class="transition-[height] duration-300 ease-out"
									style={`height: ${bar.productionPct}%; background-color: var(--color-labour);`}
								></div>
								<div
									class="transition-[height] duration-300 ease-out"
									style={`height: ${bar.circulationPct}%; background-color: var(--color-circulation);`}
								></div>
								<div
									class="transition-[height] duration-300 ease-out"
									style={`height: ${bar.remainingAdvancedPct}%; background-color: var(--color-const);`}
								></div>
								<div
									class="transition-[height] duration-300 ease-out"
									style={`height: ${bar.releasedPct}%; background-color: var(--color-released);`}
								></div>
							</div>
						</button>
					{/each}
				</div>
			</div>

			<p class="mt-2 text-center text-xs text-ink-soft">
				столбик — состояние на <strong>начало</strong> недели. Нажмите на другую неделю, чтобы переключить
				подсказку.
			</p>

			{#if result.batches.length > 0}
				<div class="mt-4 border-t border-ink/10 pt-3">
					<p class="mb-2 text-xs text-ink-soft">
						Партии производства (наслаиваются; в каждой — рабочий период и период обращения)
					</p>
					<div class="overflow-x-auto">
						<div class="min-w-[480px]">
							<div class="mb-1 flex gap-0.5 pl-14">
								{#each { length: chartWeeks } as _, index (index)}
									<div
										class={`flex-1 text-center font-mono text-[10px] ${selectedWeek === index + 1 ? 'font-semibold text-ink' : 'text-ink-soft'}`}
									>
										{index + 1}
									</div>
								{/each}
							</div>
							{#each result.batches as batch (batch.id)}
								<div class="mb-1 flex items-stretch gap-0.5">
									<div
										class="w-14 shrink-0 self-center truncate pr-1 font-mono text-[10px] text-ink-soft"
									>
										п. {batch.id}
									</div>
									<div class="flex flex-1 gap-0.5">
										{#each { length: chartWeeks } as _, index (index)}
											{@const week = index + 1}
											{@const phase = batchPhase(batch, week)}
											<div
												class={`h-5 flex-1 rounded-[2px] transition-shadow ${selectedWeek === week ? 'ring-1 ring-surplus ring-inset' : ''}`}
												style={batchPhaseStyle(phase)}
												title={phase === 'production'
													? `партия ${batch.id}: производство, нед. ${week}`
													: phase === 'circulation'
														? `партия ${batch.id}: обращение, нед. ${week}`
														: undefined}
											></div>
										{/each}
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>
			{/if}
		</div>

		<div class="mt-3 flex flex-wrap justify-between gap-2 text-sm">
			<span class="flex items-center gap-2">
				<span class="inline-block h-3 w-3 rounded-sm" style="background-color: var(--color-labour);"
				></span>
				в производстве
			</span>
			<span class="flex items-center gap-2">
				<span
					class="inline-block h-3 w-3 rounded-sm"
					style="background-color: var(--color-circulation);"
				></span>
				в обращении
			</span>
			<span class="flex items-center gap-2">
				<span class="inline-block h-3 w-3 rounded-sm" style="background-color: var(--color-const);"
				></span>
				осталось авансировать на рабочий период
			</span>
			<span class="flex items-center gap-2">
				<span
					class="inline-block h-3 w-3 rounded-sm"
					style="background-color: var(--color-released);"
				></span>
				ещё не авансирован
			</span>
		</div>
	</div>

	<div class="mt-10 space-y-6">
		<div>
			<label for="slider-k" class="flex justify-between font-mono text-sm">
				<span><code class="font-semibold">k</code> — еженедельные расходы на производство</span>
				<span>{formatNumber(weeklyOutlay)} ₽</span>
			</label>
			<input
				id="slider-k"
				type="range"
				min={MIN_WEEKLY_OUTLAY}
				max={MAX_WEEKLY_OUTLAY}
				step="10"
				bind:value={weeklyOutlay}
				class="mt-2 h-11 w-full"
			/>
		</div>

		<div>
			<label for="slider-w" class="flex justify-between font-mono text-sm">
				<span
					><code class="font-semibold" style="color: var(--color-labour);">w</code> — рабочий период,
					недель</span
				>
				<span>{formatNumber(workingPeriodWeeks)}</span>
			</label>
			<input
				id="slider-w"
				type="range"
				min={MIN_PERIOD_WEEKS}
				max={MAX_PERIOD_WEEKS}
				step="1"
				bind:value={workingPeriodWeeks}
				class="mt-2 h-11 w-full"
				style="accent-color: var(--color-labour);"
			/>
		</div>

		<div>
			<label for="slider-z" class="flex justify-between font-mono text-sm">
				<span
					><code class="font-semibold" style="color: var(--color-circulation);">z</code> — период обращения,
					недель</span
				>
				<span>{formatNumber(circulationPeriodWeeks)}</span>
			</label>
			<input
				id="slider-z"
				type="range"
				min={MIN_PERIOD_WEEKS}
				max={MAX_PERIOD_WEEKS}
				step="1"
				bind:value={circulationPeriodWeeks}
				class="mt-2 h-11 w-full"
				style="accent-color: var(--color-circulation);"
			/>
			<p class="mt-1 text-xs text-ink-soft">
				Подвигайте <code>w</code> и <code>z</code>: при равных значениях высвобождения не будет;
				если одно кратно другому без остатка — тоже не будет. Во всех остальных случаях часть
				капитала будет периодически освобождаться.
			</p>
		</div>
	</div>

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
						<div class="font-mono text-xs text-ink-soft">K = k × (w + z)</div>
					</td>
					<td class="py-2 pr-3 font-mono">{formatNumber(result.advancedCapital)} ₽</td>
				</tr>
				<tr class="border-b border-ink/10">
					<td class="py-2 pr-3">
						<code class="font-semibold" style="color: var(--color-labour);">w</code> — рабочий период
					</td>
					<td class="py-2 pr-3 font-mono">{formatNumber(result.workingPeriodWeeks)} нед.</td>
				</tr>
				<tr class="border-b border-ink/10">
					<td class="py-2 pr-3">
						<code class="font-semibold" style="color: var(--color-circulation);">z</code> — период обращения
					</td>
					<td class="py-2 pr-3 font-mono">{formatNumber(result.circulationPeriodWeeks)} нед.</td>
				</tr>
				<tr class="border-b border-ink/10">
					<td class="py-2 pr-3">соотношение периодов</td>
					<td class="py-2 pr-3 font-mono">w {caseLabels[result.caseType]} z</td>
				</tr>
				<tr class="border-b border-ink/10">
					<td class="py-2 pr-3">
						капитал, авансированный на период обращения («капитал II»)
						<div class="font-mono text-xs text-ink-soft">k × z</div>
					</td>
					<td class="py-2 pr-3 font-mono">{formatNumber(result.releaseCapacity)} ₽</td>
				</tr>
				<tr>
					<td class="py-2 pr-3" style="color: var(--color-released);">
						пик высвобождающегося капитала
					</td>
					<td class="py-2 pr-3 font-mono" style="color: var(--color-released);">
						{result.hasRelease
							? `${formatNumber(result.maxReleased)} ₽`
							: '0 ₽ (не высвобождается)'}
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</article>
