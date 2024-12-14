interface CalculationInput {
  income: number;
  otherIncome: number;
  isOsvc: boolean;
  expenses: number;
  passiveIncome: number;
  pensionLevels: number[];
}

interface InvalidityResult {
  total: number;
  constant: number;
  variable: number;
  expectedIncome: number;
}

interface CalculationResults {
  death: number;
  invalidity: InvalidityResult[];
  permanentInjury: number;
  workDisability: number;
  hospitalization: number;
  injury: number;
}

export function calculateResults(input: CalculationInput): CalculationResults {
  return {
    death: calculateDeath(input.income, input.otherIncome, input.expenses, input.passiveIncome),
    invalidity: calculateInvalidity(input.income, input.passiveIncome, ...input.pensionLevels),
    permanentInjury: calculatePermanentInjury(input.income),
    workDisability: calculateWorkDisability(input.income, input.isOsvc),
    hospitalization: calculateHospitalization(input.income),
    injury: calculateInjury(input.income)
  };
}

function calculateDeath(income: number, otherIncome: number, expenses: number, passiveIncome: number): number {
  const baseAmount = 100000;
  const monthlyDeficit = (otherIncome + passiveIncome) - (expenses * 0.8);
  const amount = baseAmount + (monthlyDeficit < 0 ? Math.abs(monthlyDeficit) * 36 : 0);
  return Math.round(amount);
}

function calculateInvalidity(income: number, passiveIncome: number, ...pensions: number[]): InvalidityResult[] {
  const factors = [0.6, 0.3, 0];
  const multipliers = [3, 4, 5];

  return pensions.map((pension, index) => {
    const expectedIncome = (income * factors[index]) + pension + passiveIncome;
    const deficit = Math.max(0, income - expectedIncome);
    const amount = deficit * 200;
    const constant = Math.min(income * multipliers[index] * 12, amount);

    return {
      total: Math.round(amount),
      constant: Math.round(constant),
      variable: Math.round(amount - constant),
      expectedIncome: Math.round(expectedIncome)
    };
  });
}

function calculatePermanentInjury(income: number): number {
  const baseAmount = income * 100;
  return Math.min(Math.round(baseAmount), income * 12 * 5);
}

function calculateWorkDisability(income: number, isOsvc: boolean): number {
  const dailyAmount = isOsvc ? (income / 30) : ((income * 0.4) / 30);
  return Math.ceil(dailyAmount / 50) * 50;
}

function calculateHospitalization(income: number): number {
  const dailyAmount = (income * 0.4) / 30;
  return Math.ceil(dailyAmount / 50) * 50;
}

function calculateInjury(income: number): number {
  const monthlyNeedAmount = income - (income * 0.6);
  const expectedPeriod = 2;
  const neededAmount = monthlyNeedAmount * expectedPeriod;
  return Math.ceil(neededAmount / 15000) * 100000;
}