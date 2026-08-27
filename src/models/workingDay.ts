/**
 * Абсолютная и относительная прибавочная стоимость.
 * Капитал, том I, отдел III «Производство абсолютной прибавочной стоимости»
 * и отдел IV «Производство относительной прибавочной стоимости», главы IX–XII.
 *
 * Один час живого труда создаёт новую стоимость VALUE_PER_HOUR (100 ₽). Рабочий
 * день длится workingDayHours (H) часов и делится на необходимое время
 * necessaryLabourHours (n) — за него рабочий воспроизводит стоимость своей
 * рабочей силы, переменный капитал v = n × 100, — и прибавочное время H − n,
 * создающее прибавочную стоимость m = (H − n) × 100.
 *
 * Маркс различает два способа увеличить m:
 *  - абсолютная прибавочная стоимость — рабочий день H удлиняется, а
 *    необходимое время n остаётся тем же: каждый добавленный час целиком
 *    идёт в прибавочное время;
 *  - относительная прибавочная стоимость — рабочий день H не меняется, но
 *    сокращается необходимое время n (обычно за счёт роста производительности
 *    труда в отраслях, производящих предметы потребления рабочего, что
 *    удешевляет его рабочую силу): прибавочное время растёт за счёт
 *    перераспределения того же дня.
 *
 * Независимые величины (их двигает пользователь):
 *  - workingDayHours      — H, длина рабочего дня в часах;
 *  - necessaryLabourHours — n, необходимое рабочее время в часах.
 *
 * Производные: прибавочное время H − n, v = n × 100, m = (H − n) × 100,
 * норма прибавочной стоимости m′ = m / v · 100.
 */

export const VALUE_PER_HOUR = 100;

/** Нижняя граница слайдера длины рабочего дня. */
export const MIN_WORKING_DAY_HOURS = 4;

/** Верхняя граница слайдера длины рабочего дня. */
export const MAX_WORKING_DAY_HOURS = 18;

/** Необходимое время должно быть больше нуля — рабочая сила чего-то да стоит. */
export const MIN_NECESSARY_LABOUR_HOURS = 1;

/** Прибавочное время должно быть больше нуля — иначе нет эксплуатации вовсе. */
export const MIN_SURPLUS_LABOUR_HOURS = 1;

export interface WorkingDayInput {
	workingDayHours: number;
	necessaryLabourHours: number;
}

export interface WorkingDayResult {
	workingDayHours: number;
	necessaryLabourHours: number;
	/** Прибавочное время: H − n. */
	surplusLabourHours: number;
	/** Переменный капитал: v = n × 100. */
	v: number;
	/** Прибавочная стоимость: m = (H − n) × 100. */
	m: number;
	/** Новая стоимость за день: w = v + m. */
	w: number;
	/** Норма прибавочной стоимости m′ = m / v · 100, в процентах. */
	mRate: number;
}

export function clampWorkingDayInput(input: WorkingDayInput): WorkingDayInput {
	const workingDayHours = Math.min(
		Math.max(MIN_WORKING_DAY_HOURS, input.workingDayHours),
		MAX_WORKING_DAY_HOURS
	);
	// n не должно доходить до H — иначе прибавочное время (и m) обнулится.
	const necessaryLabourHours = Math.min(
		Math.max(MIN_NECESSARY_LABOUR_HOURS, input.necessaryLabourHours),
		workingDayHours - MIN_SURPLUS_LABOUR_HOURS
	);

	return { workingDayHours, necessaryLabourHours };
}

export function computeWorkingDay(input: WorkingDayInput): WorkingDayResult {
	const { workingDayHours, necessaryLabourHours } = clampWorkingDayInput(input);

	const surplusLabourHours = workingDayHours - necessaryLabourHours;
	const v = necessaryLabourHours * VALUE_PER_HOUR;
	const m = surplusLabourHours * VALUE_PER_HOUR;
	const w = v + m;
	const mRate = (m / v) * 100;

	return { workingDayHours, necessaryLabourHours, surplusLabourHours, v, m, w, mRate };
}
