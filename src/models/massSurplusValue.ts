/**
 * Масса прибавочной стоимости и число одновременно занятых рабочих.
 * Капитал, том I, глава IX «Норма и масса прибавочной стоимости».
 *
 * Маркс: «масса произведённой прибавочной стоимости равна величине
 * авансированного переменного капитала, умноженной на норму прибавочной
 * стоимости»; иначе говоря, она определяется совокупным отношением числа
 * одновременно эксплуатируемых капиталистом рабочих сил и степени
 * эксплуатации каждой отдельной рабочей силы.
 *
 * Каждый рабочий за день, как и в модели composition.ts, создаёт ровно 1200
 * рублей новой стоимости, которая распадается на переменный капитал v
 * (на одного рабочего) и прибавочную стоимость m = 1200 − v (на одного
 * рабочего). Норма прибавочной стоимости m' = m / v не зависит от числа
 * рабочих L, а вот их произведения — общая переменная стоимость V = L×v
 * и общая масса прибавочной стоимости M = L×m — растут прямо
 * пропорционально числу рабочих.
 *
 * Независимые величины (их двигает пользователь):
 *  - workers — L, число одновременно занятых рабочих;
 *  - v       — переменный капитал на одного рабочего (m = 1200 − v);
 *  - c       — постоянный капитал, приходящийся на одного рабочего.
 *
 * Производные: m, m' на одного рабочего; totalC, totalV, totalM, totalW —
 * то же самое, умноженное на L.
 */

import { DAILY_LIVING_LABOUR_VALUE, MIN_SURPLUS_VALUE, MIN_VARIABLE_CAPITAL } from './composition';

/** Хотя бы один рабочий должен быть занят, иначе капитал не функционирует. */
export const MIN_WORKERS = 1;

/** Верхняя граница слайдера — удобна для сетки-визуализации рабочих. */
export const MAX_WORKERS = 60;

export const MIN_CONSTANT_CAPITAL_PER_WORKER = 0;
export const MAX_CONSTANT_CAPITAL_PER_WORKER = 2000;

export interface MassSurplusValueInput {
	/** L — число одновременно занятых рабочих. */
	workers: number;
	/** v на одного рабочего — переменный капитал (дневная плата за рабочую силу). */
	v: number;
	/** c на одного рабочего — постоянный капитал. */
	c: number;
}

export interface MassSurplusValueResult {
	workers: number;
	c: number;
	v: number;
	/** m на одного рабочего = 1200 − v. */
	m: number;
	/** Норма прибавочной стоимости, % — не зависит от L. */
	mRate: number;
	/** Общий постоянный капитал: C = L × c. */
	totalC: number;
	/** Общий переменный капитал: V = L × v. */
	totalV: number;
	/** Масса прибавочной стоимости: M = L × m. */
	totalM: number;
	/** Стоимость всего дневного продукта всех рабочих: W = C + V + M. */
	totalW: number;
}

export function clampMassSurplusValueInput(input: MassSurplusValueInput): MassSurplusValueInput {
	return {
		workers: Math.min(Math.max(MIN_WORKERS, Math.round(input.workers)), MAX_WORKERS),
		c: Math.min(
			Math.max(MIN_CONSTANT_CAPITAL_PER_WORKER, input.c),
			MAX_CONSTANT_CAPITAL_PER_WORKER
		),
		// v и m = DAILY_LIVING_LABOUR_VALUE − v должны оставаться больше нуля —
		// та же логика, что и в composition.ts.
		v: Math.min(
			Math.max(MIN_VARIABLE_CAPITAL, input.v),
			DAILY_LIVING_LABOUR_VALUE - MIN_SURPLUS_VALUE
		)
	};
}

export function computeMassSurplusValue(input: MassSurplusValueInput): MassSurplusValueResult {
	const { workers, c, v } = clampMassSurplusValueInput(input);
	const m = DAILY_LIVING_LABOUR_VALUE - v;
	const mRate = (m / v) * 100;

	const totalC = workers * c;
	const totalV = workers * v;
	const totalM = workers * m;
	const totalW = totalC + totalV + totalM;

	return { workers, c, v, m, mRate, totalC, totalV, totalM, totalW };
}
