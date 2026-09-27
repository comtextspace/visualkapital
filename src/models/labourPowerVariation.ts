/**
 * Изменение величины стоимости рабочей силы и прибавочной стоимости.
 * Капитал, том I, отдел V «Производство абсолютной и относительной
 * прибавочной стоимости», глава XV.
 *
 * Маркс разбирает три величины, от которых зависят стоимость рабочей силы v
 * и прибавочная стоимость m: длина рабочего дня, интенсивность труда и
 * производительность труда. Он показывает три закона, каждый раз считая две
 * из трёх величин постоянными, а третью — переменной:
 *
 *  - Закон I (производительность переменна, день и интенсивность постоянны):
 *    рабочий день данной длины при данной интенсивности всегда создаёт одну
 *    и ту же новую стоимость w, как бы ни менялась производительность труда.
 *    Рост производительности только удешевляет жизненные средства рабочего —
 *    стоимость рабочей силы v падает, а прибавочная стоимость m растёт на
 *    ровно ту же величину: v + m = w остаётся неизменным;
 *
 *  - Закон II (интенсивность переменна, день и производительность постоянны):
 *    более интенсивный час труда создаёт больше новой стоимости, чем обычный
 *    (это как бы «сгущённый» рабочий день). Стоимость рабочей силы v при этом
 *    не меняется, поэтому весь прирост новой стоимости целиком идёт в
 *    прибавочную стоимость m;
 *
 *  - Закон III (день переменен, интенсивность и производительность постоянны):
 *    удлинение или сокращение рабочего дня не меняет ни стоимости рабочей
 *    силы v, ни необходимого времени в часах — весь добавленный (или
 *    отнятый) час целиком идёт в прибавочное время. Это в точности механизм
 *    абсолютной прибавочной стоимости.
 *
 * Один час простого труда нормальной интенсивности создаёт новую стоимость
 * VALUE_PER_HOUR (100 ₽) — то же допущение, что и в моделях тома I для
 * рабочего дня (workingDay.ts) и состава продукта (composition.ts). Базовый
 * рабочий день BASE_WORKING_DAY_HOURS = 12 ч делится на необходимое время
 * BASE_NECESSARY_HOURS = 6 ч (v = 600 ₽) и такое же прибавочное время.
 *
 * Независимая величина — только та, что относится к активному закону
 * (law); две другие принудительно приравниваются к базовому уровню (индекс 1
 * для производительности/интенсивности, 12 ч для дня) — именно так Маркс
 * рассматривает каждый закон «при прочих равных».
 */

export type LabourPowerVariationLaw = 'productivity' | 'intensity' | 'workingDay';

export const VALUE_PER_HOUR = 100;

export const BASE_WORKING_DAY_HOURS = 12;
export const BASE_NECESSARY_HOURS = 6;
export const BASE_V = BASE_NECESSARY_HOURS * VALUE_PER_HOUR;

export const BASE_INDEX = 1;
export const MIN_INDEX = 0.6;
export const MAX_INDEX = 2;

export const MIN_WORKING_DAY_HOURS = 7;
export const MAX_WORKING_DAY_HOURS = 18;

export interface LabourPowerVariationInput {
	law: LabourPowerVariationLaw;
	/** p — индекс производительности труда, 1 = базовый уровень. */
	productivity: number;
	/** i — индекс интенсивности труда, 1 = базовый уровень. */
	intensity: number;
	/** H — длина рабочего дня, часов. */
	workingDayHours: number;
}

export interface LabourPowerVariationResult {
	law: LabourPowerVariationLaw;
	productivity: number;
	intensity: number;
	workingDayHours: number;
	/** Необходимое время в часах дня — граница, на которой v уже воспроизведена. */
	necessaryHours: number;
	/** Прибавочное время в часах дня: H − необходимое время. */
	surplusHours: number;
	/** Стоимость рабочей силы (переменный капитал): v = BASE_V / p. */
	v: number;
	/** Прибавочная стоимость: m = w − v. */
	m: number;
	/** Новая стоимость за день: w = H × i × VALUE_PER_HOUR. */
	w: number;
	/** Норма прибавочной стоимости m′ = m / v · 100, в процентах. */
	mRate: number;
}

function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(min, value), max);
}

export function clampLabourPowerVariationInput(
	input: LabourPowerVariationInput
): LabourPowerVariationInput {
	const productivity = clamp(input.productivity, MIN_INDEX, MAX_INDEX);
	const intensity = clamp(input.intensity, MIN_INDEX, MAX_INDEX);
	const workingDayHours = clamp(
		input.workingDayHours,
		MIN_WORKING_DAY_HOURS,
		MAX_WORKING_DAY_HOURS
	);

	// «Прочие равные»: только величина активного закона свободна, остальные
	// две принудительно на базовом уровне — так изолируется каждый закон.
	return {
		law: input.law,
		productivity: input.law === 'productivity' ? productivity : BASE_INDEX,
		intensity: input.law === 'intensity' ? intensity : BASE_INDEX,
		workingDayHours: input.law === 'workingDay' ? workingDayHours : BASE_WORKING_DAY_HOURS
	};
}

export function computeLabourPowerVariation(
	input: LabourPowerVariationInput
): LabourPowerVariationResult {
	const { law, productivity, intensity, workingDayHours } = clampLabourPowerVariationInput(input);

	const v = BASE_V / productivity;
	const w = workingDayHours * intensity * VALUE_PER_HOUR;
	const m = w - v;
	const mRate = (m / v) * 100;
	const necessaryHours = v / (intensity * VALUE_PER_HOUR);
	const surplusHours = workingDayHours - necessaryHours;

	return {
		law,
		productivity,
		intensity,
		workingDayHours,
		necessaryHours,
		surplusHours,
		v,
		m,
		w,
		mRate
	};
}
