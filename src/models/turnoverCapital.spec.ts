import { describe, expect, it } from 'vitest';
import {
	clampTurnoverCapitalInput,
	computeTurnoverCapital,
	DAYS_IN_YEAR,
	MAX_CIRCULATION_PERIOD_DAYS,
	MAX_DAILY_OUTLAY,
	MAX_WORKING_PERIOD_DAYS,
	MIN_CIRCULATION_PERIOD_DAYS,
	MIN_DAILY_OUTLAY,
	MIN_WORKING_PERIOD_DAYS
} from './turnoverCapital';

describe('computeTurnoverCapital', () => {
	it('авансированный капитал равен дневным расходам, умноженным на время оборота', () => {
		const result = computeTurnoverCapital({
			dailyOutlay: 50,
			workingPeriodDays: 10,
			circulationPeriodDays: 5
		});

		expect(result.turnoverDays).toBe(15);
		expect(result.advancedCapital).toBe(750);
	});

	it('чем короче время оборота, тем меньше нужно авансировать при тех же дневных расходах', () => {
		const slow = computeTurnoverCapital({
			dailyOutlay: 50,
			workingPeriodDays: 20,
			circulationPeriodDays: 20
		});
		const fast = computeTurnoverCapital({
			dailyOutlay: 50,
			workingPeriodDays: 5,
			circulationPeriodDays: 5
		});

		expect(fast.advancedCapital).toBeLessThan(slow.advancedCapital);
		expect(fast.turnoversPerYear).toBeGreaterThan(slow.turnoversPerYear);
	});

	it('число оборотов в год равно 360 / U', () => {
		const result = computeTurnoverCapital({
			dailyOutlay: 30,
			workingPeriodDays: 20,
			circulationPeriodDays: 10
		});

		expect(result.turnoversPerYear).toBeCloseTo(DAYS_IN_YEAR / 30, 6);
	});

	it('годовая сумма оборотов не зависит от разбивки года на обороты: k × 360 = K × n', () => {
		const a = computeTurnoverCapital({
			dailyOutlay: 40,
			workingPeriodDays: 30,
			circulationPeriodDays: 10
		});
		const b = computeTurnoverCapital({
			dailyOutlay: 40,
			workingPeriodDays: 5,
			circulationPeriodDays: 5
		});

		expect(a.annualTurnoverValue).toBe(40 * DAYS_IN_YEAR);
		expect(a.annualTurnoverValue).toBeCloseTo(a.advancedCapital * a.turnoversPerYear, 6);
		expect(b.annualTurnoverValue).toBe(a.annualTurnoverValue);
	});

	it('clampTurnoverCapitalInput отрезает по границам и округляет дни', () => {
		const clamped = clampTurnoverCapitalInput({
			dailyOutlay: MAX_DAILY_OUTLAY + 100,
			workingPeriodDays: 0,
			circulationPeriodDays: MAX_CIRCULATION_PERIOD_DAYS + 100
		});

		expect(clamped.dailyOutlay).toBe(MAX_DAILY_OUTLAY);
		expect(clamped.workingPeriodDays).toBe(MIN_WORKING_PERIOD_DAYS);
		expect(clamped.circulationPeriodDays).toBe(MAX_CIRCULATION_PERIOD_DAYS);

		const tooLow = clampTurnoverCapitalInput({
			dailyOutlay: MIN_DAILY_OUTLAY - 100,
			workingPeriodDays: MAX_WORKING_PERIOD_DAYS + 100,
			circulationPeriodDays: MIN_CIRCULATION_PERIOD_DAYS - 100
		});

		expect(tooLow.dailyOutlay).toBe(MIN_DAILY_OUTLAY);
		expect(tooLow.workingPeriodDays).toBe(MAX_WORKING_PERIOD_DAYS);
		expect(tooLow.circulationPeriodDays).toBe(MIN_CIRCULATION_PERIOD_DAYS);
	});
});
