import { describe, expect, it } from 'vitest';
import {
	BASE_V,
	clampLabourPowerVariationInput,
	computeLabourPowerVariation,
	MAX_INDEX,
	MAX_WORKING_DAY_HOURS,
	MIN_INDEX,
	MIN_WORKING_DAY_HOURS
} from './labourPowerVariation';

describe('computeLabourPowerVariation', () => {
	it('на базовом уровне (p=i=1, H=12) все три закона дают одно и то же: v=600, w=1200, m=600', () => {
		for (const law of ['productivity', 'intensity', 'workingDay'] as const) {
			const result = computeLabourPowerVariation({
				law,
				productivity: 1,
				intensity: 1,
				workingDayHours: 12
			});

			expect(result.v).toBeCloseTo(600, 6);
			expect(result.w).toBeCloseTo(1200, 6);
			expect(result.m).toBeCloseTo(600, 6);
			expect(result.mRate).toBeCloseTo(100, 5);
			expect(result.necessaryHours).toBeCloseTo(6, 6);
			expect(result.surplusHours).toBeCloseTo(6, 6);
		}
	});

	describe('Закон I: производительность переменна, день и интенсивность постоянны', () => {
		it('новая стоимость за день w не меняется от производительности', () => {
			const low = computeLabourPowerVariation({
				law: 'productivity',
				productivity: 0.6,
				intensity: 1,
				workingDayHours: 12
			});
			const high = computeLabourPowerVariation({
				law: 'productivity',
				productivity: 2,
				intensity: 1,
				workingDayHours: 12
			});

			expect(low.w).toBeCloseTo(1200, 6);
			expect(high.w).toBeCloseTo(1200, 6);
		});

		it('рост производительности снижает v и повышает m ровно на ту же величину (v+m=const)', () => {
			const before = computeLabourPowerVariation({
				law: 'productivity',
				productivity: 1,
				intensity: 1,
				workingDayHours: 12
			});
			const after = computeLabourPowerVariation({
				law: 'productivity',
				productivity: 1.5,
				intensity: 1,
				workingDayHours: 12
			});

			expect(after.v).toBeLessThan(before.v);
			expect(after.m).toBeGreaterThan(before.m);
			expect(after.v + after.m).toBeCloseTo(before.v + before.m, 6);
		});

		it('интенсивность и длина дня зафиксированы на базовом уровне независимо от входа', () => {
			const result = computeLabourPowerVariation({
				law: 'productivity',
				productivity: 1.2,
				intensity: 1.7,
				workingDayHours: 16
			});

			expect(result.intensity).toBe(1);
			expect(result.workingDayHours).toBe(12);
		});
	});

	describe('Закон II: интенсивность переменна, день и производительность постоянны', () => {
		it('стоимость рабочей силы v не меняется от интенсивности', () => {
			const low = computeLabourPowerVariation({
				law: 'intensity',
				productivity: 1,
				intensity: 0.6,
				workingDayHours: 12
			});
			const high = computeLabourPowerVariation({
				law: 'intensity',
				productivity: 1,
				intensity: 2,
				workingDayHours: 12
			});

			expect(low.v).toBeCloseTo(600, 6);
			expect(high.v).toBeCloseTo(600, 6);
		});

		it('рост интенсивности увеличивает и новую стоимость w, и прибавочную стоимость m', () => {
			const before = computeLabourPowerVariation({
				law: 'intensity',
				productivity: 1,
				intensity: 1,
				workingDayHours: 12
			});
			const after = computeLabourPowerVariation({
				law: 'intensity',
				productivity: 1,
				intensity: 1.5,
				workingDayHours: 12
			});

			expect(after.w).toBeGreaterThan(before.w);
			expect(after.m).toBeGreaterThan(before.m);
			expect(after.m - before.m).toBeCloseTo(after.w - before.w, 6);
		});

		it('производительность и длина дня зафиксированы на базовом уровне независимо от входа', () => {
			const result = computeLabourPowerVariation({
				law: 'intensity',
				productivity: 1.3,
				intensity: 1.4,
				workingDayHours: 16
			});

			expect(result.productivity).toBe(1);
			expect(result.workingDayHours).toBe(12);
		});
	});

	describe('Закон III: день переменен, интенсивность и производительность постоянны', () => {
		it('необходимое время в часах не меняется от длины дня — растёт только прибавочное время', () => {
			const short = computeLabourPowerVariation({
				law: 'workingDay',
				productivity: 1,
				intensity: 1,
				workingDayHours: 8
			});
			const long = computeLabourPowerVariation({
				law: 'workingDay',
				productivity: 1,
				intensity: 1,
				workingDayHours: 16
			});

			expect(short.necessaryHours).toBeCloseTo(6, 6);
			expect(long.necessaryHours).toBeCloseTo(6, 6);
			expect(long.surplusHours - short.surplusHours).toBeCloseTo(
				long.workingDayHours - short.workingDayHours,
				6
			);
		});

		it('удлинение дня — это абсолютная прибавочная стоимость: v не меняется, m растёт', () => {
			const before = computeLabourPowerVariation({
				law: 'workingDay',
				productivity: 1,
				intensity: 1,
				workingDayHours: 10
			});
			const after = computeLabourPowerVariation({
				law: 'workingDay',
				productivity: 1,
				intensity: 1,
				workingDayHours: 14
			});

			expect(after.v).toBeCloseTo(before.v, 6);
			expect(after.m).toBeGreaterThan(before.m);
		});

		it('производительность и интенсивность зафиксированы на базовом уровне независимо от входа', () => {
			const result = computeLabourPowerVariation({
				law: 'workingDay',
				productivity: 1.3,
				intensity: 1.4,
				workingDayHours: 15
			});

			expect(result.productivity).toBe(1);
			expect(result.intensity).toBe(1);
		});
	});

	it('во всех случаях m остаётся положительной величиной (v < w)', () => {
		const cases = [
			{ law: 'productivity' as const, productivity: MAX_INDEX, intensity: 1, workingDayHours: 12 },
			{ law: 'productivity' as const, productivity: MIN_INDEX, intensity: 1, workingDayHours: 12 },
			{ law: 'intensity' as const, productivity: 1, intensity: MIN_INDEX, workingDayHours: 12 },
			{
				law: 'workingDay' as const,
				productivity: 1,
				intensity: 1,
				workingDayHours: MIN_WORKING_DAY_HOURS
			},
			{
				law: 'workingDay' as const,
				productivity: 1,
				intensity: 1,
				workingDayHours: MAX_WORKING_DAY_HOURS
			}
		];

		for (const input of cases) {
			const result = computeLabourPowerVariation(input);
			expect(result.m).toBeGreaterThan(0);
			expect(result.v).toBeLessThan(result.w);
		}
	});

	it('v = BASE_V / p при активном законе производительности', () => {
		const result = computeLabourPowerVariation({
			law: 'productivity',
			productivity: 1.5,
			intensity: 1,
			workingDayHours: 12
		});
		expect(result.v).toBeCloseTo(BASE_V / 1.5, 6);
	});

	it('clampLabourPowerVariationInput ограничивает индексы и длину дня диапазонами', () => {
		const clamped = clampLabourPowerVariationInput({
			law: 'productivity',
			productivity: 10,
			intensity: 10,
			workingDayHours: 100
		});
		expect(clamped.productivity).toBe(MAX_INDEX);

		const clampedLow = clampLabourPowerVariationInput({
			law: 'workingDay',
			productivity: -5,
			intensity: -5,
			workingDayHours: 1
		});
		expect(clampedLow.workingDayHours).toBe(MIN_WORKING_DAY_HOURS);
	});
});
