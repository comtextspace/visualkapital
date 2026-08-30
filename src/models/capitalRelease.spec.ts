import { describe, expect, it } from 'vitest';
import {
	clampCapitalReleaseInput,
	computeCapitalRelease,
	MAX_PERIOD_WEEKS,
	MAX_WEEKLY_OUTLAY,
	MIN_PERIOD_WEEKS,
	MIN_WEEKLY_OUTLAY
} from './capitalRelease';

describe('computeCapitalRelease', () => {
	it('рабочий период = периоду обращения: в установившемся режиме высвобождения нет (случай I)', () => {
		const result = computeCapitalRelease({
			weeklyOutlay: 100,
			workingPeriodWeeks: 5,
			circulationPeriodWeeks: 5
		});

		expect(result.caseType).toBe('equal');
		expect(result.maxReleased).toBeCloseTo(0, 6);
		expect(result.hasRelease).toBe(false);
		expect(result.advancedCapital).toBe(1000);
	});

	it('рабочий период больше периода обращения: высвобождается k × z (случай II, пример Маркса 6/3)', () => {
		const result = computeCapitalRelease({
			weeklyOutlay: 100,
			workingPeriodWeeks: 6,
			circulationPeriodWeeks: 3
		});

		expect(result.caseType).toBe('greater');
		expect(result.releaseCapacity).toBe(300);
		expect(result.maxReleased).toBeCloseTo(300, 6);
		expect(result.hasRelease).toBe(true);
	});

	it('рабочий период меньше периода обращения, но период обращения кратен рабочему: высвобождения нет (случай III, пример Маркса 3/6)', () => {
		const result = computeCapitalRelease({
			weeklyOutlay: 100,
			workingPeriodWeeks: 3,
			circulationPeriodWeeks: 6
		});

		expect(result.caseType).toBe('less');
		expect(result.maxReleased).toBeCloseTo(0, 6);
		expect(result.hasRelease).toBe(false);
	});

	it('рабочий период меньше периода обращения и не кратен ему: высвобождается остаток (пример Маркса 4/5)', () => {
		const result = computeCapitalRelease({
			weeklyOutlay: 100,
			workingPeriodWeeks: 4,
			circulationPeriodWeeks: 5
		});

		expect(result.caseType).toBe('less');
		expect(result.maxReleased).toBeCloseTo(100, 6);
		expect(result.hasRelease).toBe(true);
	});

	it('авансированный капитал всегда равен k × (w + z)', () => {
		const result = computeCapitalRelease({
			weeklyOutlay: 150,
			workingPeriodWeeks: 7,
			circulationPeriodWeeks: 2
		});

		expect(result.advancedCapital).toBe(150 * 9);
	});

	it('в каждую неделю все четыре доли в сумме дают авансированный капитал K', () => {
		const result = computeCapitalRelease({
			weeklyOutlay: 100,
			workingPeriodWeeks: 4,
			circulationPeriodWeeks: 7
		});

		for (const week of result.timeline) {
			const total = week.production + week.circulation + week.remainingAdvanced + week.released;
			expect(total).toBeCloseTo(result.advancedCapital, 6);
			expect(week.released).toBeGreaterThanOrEqual(0);
			expect(week.remainingAdvanced).toBeGreaterThanOrEqual(0);
		}
	});

	it('с первой недели авансирования: w = z = 2 (пример 2/2)', () => {
		const result = computeCapitalRelease({
			weeklyOutlay: 100,
			workingPeriodWeeks: 2,
			circulationPeriodWeeks: 2
		});

		expect(result.timeline[0]).toMatchObject({
			week: 1,
			production: 100,
			circulation: 0,
			remainingAdvanced: 100,
			released: 200
		});
		expect(result.timeline[1]).toMatchObject({
			week: 2,
			production: 200,
			circulation: 0,
			remainingAdvanced: 0,
			released: 200
		});
		expect(result.timeline[2]).toMatchObject({
			week: 3,
			production: 100,
			circulation: 200,
			remainingAdvanced: 100,
			released: 0
		});
		expect(result.timeline[3]).toMatchObject({
			week: 4,
			production: 200,
			circulation: 200,
			remainingAdvanced: 0,
			released: 0
		});
		expect(result.maxReleased).toBeCloseTo(0, 6);
	});

	it('пик высвобождения совпадает с правилом Маркса, когда w > z и w не кратно z + 1', () => {
		const cases = [
			[6, 3],
			[7, 3],
			[4, 2],
			[5, 3]
		] as const;

		for (const [w, z] of cases) {
			const result = computeCapitalRelease({
				weeklyOutlay: 100,
				workingPeriodWeeks: w,
				circulationPeriodWeeks: z
			});

			expect(result.maxReleased).toBeCloseTo(100 * z, 6);
		}
	});

	it('пик высвобождения не превышает теоретический максимум Маркса', () => {
		for (let w = 1; w <= 9; w += 1) {
			for (let z = 1; z <= 9; z += 1) {
				const result = computeCapitalRelease({
					weeklyOutlay: 100,
					workingPeriodWeeks: w,
					circulationPeriodWeeks: z
				});

				let theoretical = 0;
				if (w > z) {
					theoretical = 100 * z;
				} else if (w < z && z % w !== 0) {
					theoretical = 100 * (z % w);
				}

				expect(result.maxReleased).toBeLessThanOrEqual(theoretical + 1e-6);
			}
		}
	});

	it('clampCapitalReleaseInput отрезает по границам и округляет недели', () => {
		const clamped = clampCapitalReleaseInput({
			weeklyOutlay: MAX_WEEKLY_OUTLAY + 500,
			workingPeriodWeeks: 0,
			circulationPeriodWeeks: MAX_PERIOD_WEEKS + 5
		});

		expect(clamped.weeklyOutlay).toBe(MAX_WEEKLY_OUTLAY);
		expect(clamped.workingPeriodWeeks).toBe(MIN_PERIOD_WEEKS);
		expect(clamped.circulationPeriodWeeks).toBe(MAX_PERIOD_WEEKS);

		const tooLow = clampCapitalReleaseInput({
			weeklyOutlay: MIN_WEEKLY_OUTLAY - 500,
			workingPeriodWeeks: MAX_PERIOD_WEEKS + 5,
			circulationPeriodWeeks: MIN_PERIOD_WEEKS - 5
		});

		expect(tooLow.weeklyOutlay).toBe(MIN_WEEKLY_OUTLAY);
		expect(tooLow.workingPeriodWeeks).toBe(MAX_PERIOD_WEEKS);
		expect(tooLow.circulationPeriodWeeks).toBe(MIN_PERIOD_WEEKS);
	});
});
