import { describe, expect, it } from 'vitest';
import {
	clampWorkingDayInput,
	computeWorkingDay,
	MAX_WORKING_DAY_HOURS,
	MIN_NECESSARY_LABOUR_HOURS,
	MIN_SURPLUS_LABOUR_HOURS,
	MIN_WORKING_DAY_HOURS
} from './workingDay';

describe('computeWorkingDay', () => {
	it('удлинение рабочего дня при неизменном n даёт абсолютную прибавочную стоимость', () => {
		const before = computeWorkingDay({ workingDayHours: 10, necessaryLabourHours: 6 });
		const after = computeWorkingDay({ workingDayHours: 12, necessaryLabourHours: 6 });

		expect(after.v).toBe(before.v);
		expect(after.m).toBeGreaterThan(before.m);
		expect(after.surplusLabourHours).toBeGreaterThan(before.surplusLabourHours);
	});

	it('сокращение необходимого времени при неизменном H даёт относительную прибавочную стоимость', () => {
		const before = computeWorkingDay({ workingDayHours: 12, necessaryLabourHours: 6 });
		const after = computeWorkingDay({ workingDayHours: 12, necessaryLabourHours: 4 });

		expect(after.workingDayHours).toBe(before.workingDayHours);
		expect(after.m).toBeGreaterThan(before.m);
		expect(after.v).toBeLessThan(before.v);
	});

	it('v = n × 100, m = (H − n) × 100, w = v + m', () => {
		const result = computeWorkingDay({ workingDayHours: 12, necessaryLabourHours: 8 });
		expect(result.v).toBe(800);
		expect(result.m).toBe(400);
		expect(result.w).toBe(1200);
	});

	it("норма прибавочной стоимости m' = m / v × 100", () => {
		const result = computeWorkingDay({ workingDayHours: 12, necessaryLabourHours: 6 });
		expect(result.mRate).toBeCloseTo(100, 5);
	});

	it('не даёт рабочему дню выйти за границы 4..18 часов', () => {
		const tooShort = computeWorkingDay({ workingDayHours: 1, necessaryLabourHours: 1 });
		expect(tooShort.workingDayHours).toBe(MIN_WORKING_DAY_HOURS);

		const tooLong = computeWorkingDay({ workingDayHours: 30, necessaryLabourHours: 1 });
		expect(tooLong.workingDayHours).toBe(MAX_WORKING_DAY_HOURS);
	});

	it('не даёт прибавочному времени обнулиться, даже если n близко к H', () => {
		const result = computeWorkingDay({ workingDayHours: 8, necessaryLabourHours: 8 });
		expect(result.surplusLabourHours).toBe(MIN_SURPLUS_LABOUR_HOURS);
		expect(result.m).toBeGreaterThan(0);
	});

	it('clampWorkingDayInput не даёт n уйти ниже минимума', () => {
		const clamped = clampWorkingDayInput({ workingDayHours: 12, necessaryLabourHours: -5 });
		expect(clamped.necessaryLabourHours).toBe(MIN_NECESSARY_LABOUR_HOURS);
	});
});
