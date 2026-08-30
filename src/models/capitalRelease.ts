/**
 * Высвобождение оборотного капитала при обороте.
 * Капитал, том II, отдел II «Оборот капитала», глава XV, разделы I–IV.
 *
 * Схема показывает состояние на начало каждой недели: сначала возвращаются
 * деньги от продаж, затем вкладывается еженедельная сумма k.
 *
 * Четыре доли авансированного капитала K = k × (w + z):
 *  - production — в производстве (незавершённая или только что завершённая партия);
 *  - circulation — в обращении (готовый, но непроданный товар);
 *  - remainingAdvanced — осталось авансировать на текущий рабочий период;
 *  - released — ещё не авансирован ни на один рабочий период, понадобится
 *    для периода обращения, когда текущее производство завершится.
 */

export const MIN_WEEKLY_OUTLAY = 20;
export const MAX_WEEKLY_OUTLAY = 200;

export const MIN_PERIOD_WEEKS = 1;
export const MAX_PERIOD_WEEKS = 9;

export type CapitalReleaseCase = 'equal' | 'greater' | 'less';

export type WeekEventType =
	'initial_advance' | 'sale' | 'outlay' | 'batch_complete' | 'circulation_start';

export interface WeekEvent {
	type: WeekEventType;
	batchId?: number;
	amount: number;
}

export interface CapitalReleaseInput {
	weeklyOutlay: number;
	workingPeriodWeeks: number;
	circulationPeriodWeeks: number;
}

export interface WeekSnapshot {
	week: number;
	/** Незавершённое производство — деньги, уже вложенные в текущую партию. */
	production: number;
	/** Товарный капитал — готовый товар, ещё не проданный. */
	circulation: number;
	/** Осталось авансировать на текущий рабочий период. */
	remainingAdvanced: number;
	/** Ещё не авансирован на рабочий период — понадобится для обращения. */
	released: number;
	/** События в начале этой недели (до среза состояния). */
	events: WeekEvent[];
}

export interface CapitalBatch {
	id: number;
	value: number;
	productionStartWeek: number;
	productionEndWeek: number;
	circulationStartWeek: number;
	circulationEndWeek: number;
	saleWeek: number;
}

export interface CapitalReleaseResult {
	weeklyOutlay: number;
	workingPeriodWeeks: number;
	circulationPeriodWeeks: number;
	/** Авансированный капитал: K = k × (w + z). */
	advancedCapital: number;
	/** Капитал, авансированный на период обращения («капитал II»): k × z. */
	releaseCapacity: number;
	caseType: CapitalReleaseCase;
	/** Пик высвобождающегося капитала в установившемся режиме. */
	maxReleased: number;
	hasRelease: boolean;
	/** Недельные срезы на начало недели — для схемы. */
	timeline: WeekSnapshot[];
	/** Партии для схемы периодов. */
	batches: CapitalBatch[];
}

interface ActiveBatch {
	id: number;
	value: number;
	productionStartWeek: number;
	circulationStartWeek: number;
	saleWeek: number;
}

export function clampCapitalReleaseInput(input: CapitalReleaseInput): CapitalReleaseInput {
	const weeklyOutlay = Math.min(Math.max(MIN_WEEKLY_OUTLAY, input.weeklyOutlay), MAX_WEEKLY_OUTLAY);
	const workingPeriodWeeks = Math.min(
		Math.max(MIN_PERIOD_WEEKS, Math.round(input.workingPeriodWeeks)),
		MAX_PERIOD_WEEKS
	);
	const circulationPeriodWeeks = Math.min(
		Math.max(MIN_PERIOD_WEEKS, Math.round(input.circulationPeriodWeeks)),
		MAX_PERIOD_WEEKS
	);

	return { weeklyOutlay, workingPeriodWeeks, circulationPeriodWeeks };
}

function circulationValue(batches: ActiveBatch[], week: number): number {
	return batches
		.filter((batch) => batch.circulationStartWeek <= week && batch.saleWeek > week)
		.reduce((sum, batch) => sum + batch.value, 0);
}

function splitCapital(
	advancedCapital: number,
	production: number,
	circulation: number,
	weekInBatch: number,
	workingPeriodWeeks: number,
	weeklyOutlay: number
): { remainingAdvanced: number; released: number } {
	const cash = advancedCapital - production - circulation;
	const earmarked =
		weekInBatch > 0
			? Math.min(weeklyOutlay * (workingPeriodWeeks - weekInBatch), Math.max(0, cash))
			: 0;

	return {
		remainingAdvanced: earmarked,
		released: Math.max(0, cash - earmarked)
	};
}

function simulateWeekBeginning(
	week: number,
	k: number,
	w: number,
	z: number,
	advancedCapital: number,
	money: number,
	productionInProgress: number,
	weekInBatch: number,
	batches: ActiveBatch[],
	nextBatchId: number
): {
	money: number;
	productionInProgress: number;
	weekInBatch: number;
	batches: ActiveBatch[];
	nextBatchId: number;
	snapshot: Omit<WeekSnapshot, 'week'>;
} {
	const events: WeekEvent[] = [];

	if (week === 1) {
		events.push({ type: 'initial_advance', amount: advancedCapital });
	}

	for (const batch of batches) {
		if (batch.circulationStartWeek === week) {
			events.push({ type: 'circulation_start', batchId: batch.id, amount: batch.value });
		}
	}

	for (const batch of batches) {
		if (batch.saleWeek === week) {
			money += batch.value;
			events.push({ type: 'sale', batchId: batch.id, amount: batch.value });
		}
	}
	batches = batches.filter((batch) => batch.saleWeek !== week);

	money -= k;
	productionInProgress += k;
	weekInBatch += 1;
	events.push({ type: 'outlay', amount: k });

	let completingProduction = 0;

	if (weekInBatch >= w) {
		completingProduction = productionInProgress;
		const circulationStartWeek = week + 1;
		const batchId = nextBatchId;
		nextBatchId += 1;

		batches = [
			...batches,
			{
				id: batchId,
				value: completingProduction,
				productionStartWeek: week - w + 1,
				circulationStartWeek,
				saleWeek: circulationStartWeek + z
			}
		];
		events.push({ type: 'batch_complete', batchId, amount: completingProduction });
		productionInProgress = 0;
		weekInBatch = 0;
	}

	const production = productionInProgress + completingProduction;
	const circulation = circulationValue(batches, week);
	const { remainingAdvanced, released } = splitCapital(
		advancedCapital,
		production,
		circulation,
		weekInBatch,
		w,
		k
	);

	return {
		money,
		productionInProgress,
		weekInBatch,
		batches,
		nextBatchId,
		snapshot: {
			production,
			circulation,
			remainingAdvanced,
			released,
			events
		}
	};
}

export function computeCapitalRelease(input: CapitalReleaseInput): CapitalReleaseResult {
	const {
		weeklyOutlay: k,
		workingPeriodWeeks: w,
		circulationPeriodWeeks: z
	} = clampCapitalReleaseInput(input);

	const advancedCapital = k * (w + z);
	const releaseCapacity = k * z;

	let money = advancedCapital;
	let productionInProgress = 0;
	let weekInBatch = 0;
	let batches: ActiveBatch[] = [];
	let nextBatchId = 1;

	const chartWeeks = 2 * (w + z);
	const totalWeeks = Math.max(4 * (w + z), w + z + 8);
	const timeline: WeekSnapshot[] = [];
	let peakReleased = 0;

	for (let week = 1; week <= totalWeeks; week += 1) {
		const step = simulateWeekBeginning(
			week,
			k,
			w,
			z,
			advancedCapital,
			money,
			productionInProgress,
			weekInBatch,
			batches,
			nextBatchId
		);
		money = step.money;
		productionInProgress = step.productionInProgress;
		weekInBatch = step.weekInBatch;
		batches = step.batches;
		nextBatchId = step.nextBatchId;

		if (week <= chartWeeks) {
			timeline.push({ week, ...step.snapshot });
		}

		if (week > w + z) {
			peakReleased = Math.max(peakReleased, step.snapshot.released);
		}
	}

	const caseType: CapitalReleaseCase = w === z ? 'equal' : w > z ? 'greater' : 'less';

	return {
		weeklyOutlay: k,
		workingPeriodWeeks: w,
		circulationPeriodWeeks: z,
		advancedCapital,
		releaseCapacity,
		caseType,
		maxReleased: peakReleased,
		hasRelease: peakReleased > 1e-6,
		timeline,
		batches: rebuildBatchesFromTimeline(timeline, w, z, chartWeeks)
	};
}

function rebuildBatchesFromTimeline(
	timeline: WeekSnapshot[],
	w: number,
	z: number,
	chartWeeks: number
): CapitalBatch[] {
	const batches: CapitalBatch[] = [];

	for (const snapshot of timeline) {
		for (const event of snapshot.events) {
			if (event.type !== 'batch_complete' || event.batchId === undefined) {
				continue;
			}

			const productionEndWeek = snapshot.week;
			const circulationStartWeek = snapshot.week + 1;
			const saleWeek = circulationStartWeek + z;

			batches.push({
				id: event.batchId,
				value: event.amount,
				productionStartWeek: productionEndWeek - w + 1,
				productionEndWeek,
				circulationStartWeek,
				circulationEndWeek: saleWeek - 1,
				saleWeek
			});
		}
	}

	return batches.filter((batch) => batch.productionStartWeek <= chartWeeks);
}

export function describeWeekEvent(event: WeekEvent): string {
	switch (event.type) {
		case 'initial_advance':
			return `авансирован весь капитал K = ${event.amount} ₽`;
		case 'sale':
			return `партия ${event.batchId}: товар продан, вернулось ${event.amount} ₽`;
		case 'outlay':
			return `вложено на производство — ${event.amount} ₽`;
		case 'batch_complete':
			return `партия ${event.batchId}: рабочий период завершён (${event.amount} ₽ произведено; с следующей недели — обращение)`;
		case 'circulation_start':
			return `партия ${event.batchId}: товар пошёл в обращение (${event.amount} ₽)`;
	}
}
