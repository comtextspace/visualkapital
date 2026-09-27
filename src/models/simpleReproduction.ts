/**
 * Простое воспроизводство: обмен между двумя отделами общественного капитала.
 * Капитал, том II, отдел III «Воспроизводство и обращение совокупного
 * общественного капитала», глава XX «Простое воспроизводство».
 *
 * Маркс делит весь общественный продукт на два отдела:
 *  - отдел I  производит средства производства (сырьё, машины, материалы);
 *  - отдел II производит предметы потребления (для рабочих и капиталистов).
 *
 * Продукт каждого отдела распадается на постоянный капитал c, переменный
 * капитал v и прибавочную стоимость m, как и продукт одного рабочего дня в
 * томе I: W = c + v + m. Именно так — числами c, v, m — Маркс и записывает
 * схему воспроизводства в главе XX: I. 4000c + 1000v + 1000m = 6000.
 *
 * При простом воспроизводстве (без накопления, когда вся прибавочная
 * стоимость проедается, а не капитализируется) стоимость каждой части
 * продукта должна найти своего покупателя:
 *  - c₁ — постоянный капитал отдела I — заменяется в натуре внутри самого
 *    отдела I: капиталисты этого отдела покупают средства производства друг
 *    у друга;
 *  - v₂ + m₂ — доходы отдела II (зарплата рабочих и потребление капиталистов)
 *    — расходуются на предметы потребления, произведённые внутри самого
 *    отдела II;
 *  - v₁ + m₁ — доходы отдела I — должны быть обменены на предметы потребления
 *    отдела II;
 *  - c₂ — постоянный капитал отдела II — должен быть обменян на средства
 *    производства отдела I.
 *
 * Это один и тот же обмен с двух сторон, поэтому условие простого
 * воспроизводства — знаменитое уравнение Маркса:
 *
 *     v₁ + m₁ = c₂
 *
 * Если оно выполняется — весь продукт общества реализуется без остатка, и
 * производство может повториться в прежнем масштабе. Если не выполняется —
 * возникает диспропорция: либо отдел I произвёл больше средств производства,
 * чем нужно отделу II («избыток»), либо меньше, чем требуется для полного
 * возобновления постоянного капитала отдела II («недостаток»).
 *
 * Независимые величины (их двигает пользователь):
 *  - c1, v1 — постоянный и переменный капитал отдела I;
 *  - c2, v2 — постоянный и переменный капитал отдела II;
 *  - surplusValueRate — норма прибавочной стоимости m' (одна и та же для
 *    обоих отделов, как и в числовом примере Маркса: m = v × m' / 100).
 */

export const MIN_CAPITAL = 0;

export const MAX_DEPT1_CONSTANT_CAPITAL = 8000;
export const MAX_DEPT1_VARIABLE_CAPITAL = 4000;
export const MAX_DEPT2_CONSTANT_CAPITAL = 6000;
export const MAX_DEPT2_VARIABLE_CAPITAL = 3000;

export const MIN_SURPLUS_VALUE_RATE = 0;
export const MAX_SURPLUS_VALUE_RATE = 200;

export type ReproductionCase = 'balanced' | 'surplus' | 'deficit';

export interface SimpleReproductionInput {
	/** c₁ — постоянный капитал отдела I (средства производства). */
	c1: number;
	/** v₁ — переменный капитал отдела I. */
	v1: number;
	/** c₂ — постоянный капитал отдела II (предметы потребления). */
	c2: number;
	/** v₂ — переменный капитал отдела II. */
	v2: number;
	/** m′ — норма прибавочной стоимости, %, одна для обоих отделов. */
	surplusValueRate: number;
}

export interface SimpleReproductionResult {
	c1: number;
	v1: number;
	/** m₁ = v₁ × m′ / 100 — прибавочная стоимость отдела I. */
	m1: number;
	/** W₁ = c₁ + v₁ + m₁ — весь продукт отдела I (средства производства). */
	w1: number;

	c2: number;
	v2: number;
	/** m₂ = v₂ × m′ / 100 — прибавочная стоимость отдела II. */
	m2: number;
	/** W₂ = c₂ + v₂ + m₂ — весь продукт отдела II (предметы потребления). */
	w2: number;

	surplusValueRate: number;

	/** Совокупный общественный продукт: W = W₁ + W₂. */
	totalProduct: number;

	/** v₁ + m₁ — доходы отдела I, которые нужно обменять на предметы потребления. */
	dept1Offer: number;
	/** c₂ — постоянный капитал отдела II, который нужно обменять на средства производства. */
	dept2Demand: number;
	/** Баланс обмена: (v₁ + m₁) − c₂. Ноль — простое воспроизводство сходится. */
	balance: number;
	caseType: ReproductionCase;
	isBalanced: boolean;
}

export function clampSimpleReproductionInput(
	input: SimpleReproductionInput
): SimpleReproductionInput {
	return {
		c1: Math.min(Math.max(MIN_CAPITAL, input.c1), MAX_DEPT1_CONSTANT_CAPITAL),
		v1: Math.min(Math.max(MIN_CAPITAL, input.v1), MAX_DEPT1_VARIABLE_CAPITAL),
		c2: Math.min(Math.max(MIN_CAPITAL, input.c2), MAX_DEPT2_CONSTANT_CAPITAL),
		v2: Math.min(Math.max(MIN_CAPITAL, input.v2), MAX_DEPT2_VARIABLE_CAPITAL),
		surplusValueRate: Math.min(
			Math.max(MIN_SURPLUS_VALUE_RATE, input.surplusValueRate),
			MAX_SURPLUS_VALUE_RATE
		)
	};
}

const BALANCE_EPSILON = 1e-6;

export function computeSimpleReproduction(
	input: SimpleReproductionInput
): SimpleReproductionResult {
	const { c1, v1, c2, v2, surplusValueRate } = clampSimpleReproductionInput(input);

	const m1 = v1 * (surplusValueRate / 100);
	const m2 = v2 * (surplusValueRate / 100);

	const w1 = c1 + v1 + m1;
	const w2 = c2 + v2 + m2;
	const totalProduct = w1 + w2;

	const dept1Offer = v1 + m1;
	const dept2Demand = c2;
	const balance = dept1Offer - dept2Demand;

	const isBalanced = Math.abs(balance) < BALANCE_EPSILON;
	const caseType: ReproductionCase = isBalanced ? 'balanced' : balance > 0 ? 'surplus' : 'deficit';

	return {
		c1,
		v1,
		m1,
		w1,
		c2,
		v2,
		m2,
		w2,
		surplusValueRate,
		totalProduct,
		dept1Offer,
		dept2Demand,
		balance,
		caseType,
		isBalanced
	};
}
