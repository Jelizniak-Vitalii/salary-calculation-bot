import { evaluate } from 'mathjs';

export function getSmsSalary(smsAmount, amountFromDesk, rubCurrency, uahCurrency) {
  return Math.floor((((amountFromDesk / 100 * 2) / rubCurrency) * uahCurrency) + (smsAmount * 100)).toFixed(2);
}

export function getSalary(value, percentage, rubCurrency, uahCurrency) {
  return Math.floor((((value / 100 * percentage) / rubCurrency) * uahCurrency + 3000)).toFixed(2);
}

export function calculateExpression(input) {
  const regex = /^[0-9]+(\.[0-9]+)?$/;

  input = input.trim();

  if (regex.test(input)) {
    return parseFloat(input);
  }

  try {
    return evaluate(input);
  } catch (error) {
    return false;
  }
}
