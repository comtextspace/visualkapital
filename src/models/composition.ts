/**
 * Модель продукта одного рабочего дня.
 * Капитал, том I, глава IX «Норма прибавочной стоимости».
 *
 * Исходное допущение: за один час живого труда рабочий создаёт новую стоимость
 * VALUE_PER_HOUR (100 рублей), рабочий день длится WORKING_DAY_HOURS часов (12).
 * Значит за весь день живой труд создаёт ровно DAILY_LIVING_LABOUR_VALUE
 * (12 × 100 = 1200 рублей) новой стоимости — независимо от того, как эта сумма
 * распределится между переменным капиталом v (оплаченный, необходимый труд)
 * и прибавочной стоимостью m (неоплаченный, прибавочный труд).
 *
 * Независимые величины (их двигает пользователь):
 *  - c  — постоянный капитал: стоимость средств производства, перенесённая на
 *         продукт без изменения величины. Она не создаётся живым трудом этого
 *         дня, поэтому меняется независимо от v и m;
 *  - v  — переменный капитал (стоимость рабочей силы за день). В интерфейсе есть
 *         и слайдер для m — по сути это тот же слайдер, повёрнутый в другую
 *         сторону, потому что v и m перераспределяют одну и ту же фиксированную
 *         сумму: m = DAILY_LIVING_LABOUR_VALUE − v. Ни v, ни m не опускаются до нуля.
 *
 * Производные: m, m' = m / v · 100 (%), W = c + v + m, органическое строение c / v.
 */

export const WORKING_DAY_HOURS = 12;
export const VALUE_PER_HOUR = 100;

/** Новая стоимость, которую живой труд создаёт за весь рабочий день:
 *  12 часов × 100 рублей = 1200 рублей. Эта сумма всегда равна v + m —
 *  она не зависит от того, как её поделить между необходимым и прибавочным трудом. */
export const DAILY_LIVING_LABOUR_VALUE = WORKING_DAY_HOURS * VALUE_PER_HOUR;

/** Верхняя граница слайдера постоянного капитала. */
export const MAX_CONSTANT_CAPITAL = 2000;

/** v = 0 сделало бы норму прибавочной стоимости неопределённой («ноль работников —
 *  ноль стоимости»), поэтому у переменного капитала есть нижняя граница. */
export const MIN_VARIABLE_CAPITAL = 1;

/** m = 0 означало бы отсутствие прибавочного труда вообще — тоже вырожденный
 *  случай, поэтому и у прибавочной стоимости есть нижняя граница. */
export const MIN_SURPLUS_VALUE = 1;

export interface ValueCompositionInput {
	c: number;
	v: number;
}

export interface ValueCompositionResult {
	c: number;
	v: number;
	/** Прибавочная стоимость: m = DAILY_LIVING_LABOUR_VALUE − v. */
	m: number;
	/** Стоимость товара: W = c + v + m (что равно c + DAILY_LIVING_LABOUR_VALUE). */
	w: number;
	/** Норма прибавочной стоимости m' = m / v · 100, в процентах. */
	mRate: number;
	/** Органическое строение капитала c / v. */
	organicComposition: number;
}

export function clampValueCompositionInput(input: ValueCompositionInput): ValueCompositionInput {
	return {
		c: Math.min(Math.max(0, input.c), MAX_CONSTANT_CAPITAL),
		// v и m = DAILY_LIVING_LABOUR_VALUE − v должны оставаться больше нуля,
		// поэтому v зажимается не до самой границы суммы, а до неё минус MIN_SURPLUS_VALUE.
		v: Math.min(
			Math.max(MIN_VARIABLE_CAPITAL, input.v),
			DAILY_LIVING_LABOUR_VALUE - MIN_SURPLUS_VALUE
		)
	};
}

export function computeValueComposition(input: ValueCompositionInput): ValueCompositionResult {
	const { c, v } = clampValueCompositionInput(input);
	const m = DAILY_LIVING_LABOUR_VALUE - v;
	const w = c + v + m;
	const mRate = (m / v) * 100;
	const organicComposition = c / v;

	return { c, v, m, w, mRate, organicComposition };
}
