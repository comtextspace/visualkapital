/**
 * Влияние времени оборота на величину авансированного капитала.
 * Капитал, том II, отдел II «Оборот капитала», глава XV.
 *
 * Чтобы производство не прерывалось, капиталист должен постоянно держать
 * наготове (авансировать) капитал, покрывающий текущие расходы на рабочую
 * силу и средства производства, — и держать его весь тот срок, пока деньги
 * от продажи готового товара не вернутся обратно.
 *
 * Время оборота U складывается из:
 *  - рабочего периода w — сколько дней идёт производство одной партии товара;
 *  - периода обращения z — сколько дней проходит от готовности товара до
 *    возврата его стоимости деньгами (продажа, доставка, платёж).
 *
 * Если ежедневные расходы на производство постоянны и равны k, то капитал,
 * который должен быть в наличии одновременно, чтобы за всё время оборота
 * работа не останавливалась, равен: K = k × U = k × (w + z). Это и есть
 * авансированный капитал в узком смысле главы XV.
 *
 * Отсюда — главный вывод Маркса: чем короче время оборота, тем меньше
 * капитала нужно авансировать для того же непрерывного масштаба производства,
 * и тем больше оборотов капитал успевает совершить за год.
 *
 * Число оборотов в год: n = O / U, где O — год (Маркс считает годом 360 дней).
 * Годовая сумма оборотов (весь капитал, прошедший через дело за год):
 * k × O = K × n — она не зависит от того, как год разбит на обороты.
 *
 * Независимые величины (их двигает пользователь):
 *  - dailyOutlay          — k, дневные расходы на производство;
 *  - workingPeriodDays    — w, рабочий период в днях;
 *  - circulationPeriodDays — z, период обращения в днях.
 */

export const DAYS_IN_YEAR = 360;

export const MIN_DAILY_OUTLAY = 10;
export const MAX_DAILY_OUTLAY = 200;

export const MIN_WORKING_PERIOD_DAYS = 1;
export const MAX_WORKING_PERIOD_DAYS = 60;

export const MIN_CIRCULATION_PERIOD_DAYS = 1;
export const MAX_CIRCULATION_PERIOD_DAYS = 60;

export interface TurnoverCapitalInput {
	dailyOutlay: number;
	workingPeriodDays: number;
	circulationPeriodDays: number;
}

export interface TurnoverCapitalResult {
	dailyOutlay: number;
	workingPeriodDays: number;
	circulationPeriodDays: number;
	/** Время оборота: U = w + z, дней. */
	turnoverDays: number;
	/** Число оборотов в год: n = 360 / U. */
	turnoversPerYear: number;
	/** Авансированный капитал: K = k × U — сколько нужно держать в наличии одновременно. */
	advancedCapital: number;
	/** Годовая сумма оборотов: k × 360 = K × n — не зависит от разбивки года на обороты. */
	annualTurnoverValue: number;
}

export function clampTurnoverCapitalInput(input: TurnoverCapitalInput): TurnoverCapitalInput {
	const dailyOutlay = Math.min(Math.max(MIN_DAILY_OUTLAY, input.dailyOutlay), MAX_DAILY_OUTLAY);
	const workingPeriodDays = Math.min(
		Math.max(MIN_WORKING_PERIOD_DAYS, Math.round(input.workingPeriodDays)),
		MAX_WORKING_PERIOD_DAYS
	);
	const circulationPeriodDays = Math.min(
		Math.max(MIN_CIRCULATION_PERIOD_DAYS, Math.round(input.circulationPeriodDays)),
		MAX_CIRCULATION_PERIOD_DAYS
	);

	return { dailyOutlay, workingPeriodDays, circulationPeriodDays };
}

export function computeTurnoverCapital(input: TurnoverCapitalInput): TurnoverCapitalResult {
	const { dailyOutlay, workingPeriodDays, circulationPeriodDays } =
		clampTurnoverCapitalInput(input);

	const turnoverDays = workingPeriodDays + circulationPeriodDays;
	const turnoversPerYear = DAYS_IN_YEAR / turnoverDays;
	const advancedCapital = dailyOutlay * turnoverDays;
	const annualTurnoverValue = dailyOutlay * DAYS_IN_YEAR;

	return {
		dailyOutlay,
		workingPeriodDays,
		circulationPeriodDays,
		turnoverDays,
		turnoversPerYear,
		advancedCapital,
		annualTurnoverValue
	};
}
