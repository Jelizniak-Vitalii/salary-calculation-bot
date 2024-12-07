import { evaluate } from 'mathjs';
import { logger, LogLevel } from '../services/logger.js';
import { messages } from '../constants/messages.js';

export function getSmsSalary(smsAmount, amountFromDesk, rubCurrency, uahCurrency) {
  return Math.floor((((amountFromDesk / 100 * 2) / rubCurrency) * uahCurrency) + (smsAmount * 100)).toFixed(2);
}

export function getSalary(value, percentage, rubCurrency, uahCurrency) {
  return Math.floor((((value / 100 * percentage) / rubCurrency) * uahCurrency + 3000)).toFixed(2);
}

export function calculateExpression(input) {
  const regex = /^[-+*/^()0-9.\s]*$/;

  try {
    input = input.replace(/\s+/g, '');

    if (!regex.test(input)) {
      throw new Error(`Некорректный ввод: ${input}`);
    }

    return evaluate(input);
  } catch (error) {
    logger(`Ошибка: ${error.message}`, LogLevel.ERROR);

    throw new Error(messages.wrongValue);
  }
}
