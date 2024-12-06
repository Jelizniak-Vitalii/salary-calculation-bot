import { Markup, session, Telegraf } from 'telegraf';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'node:fs';

import { calculateExpression, getCurrency, getSalary, getSmsSalary, updateCurrency } from './utils/index.js';
import { messages } from './constants/messages.js';
import { buttons } from './constants/buttons.js';
import { methods, refresh } from './methods/methods.js';
import { logger, LogLevel } from './services/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// const dataDir = path.join(__dirname);
const dataDir = '/app/data';
const telegramDataFileName = 'telegram-data.json';
const baseTelegramData = {
  rubCurrency: 95,
  uahCurrency: 33
};

export class Telegram {
  #token = '7276327541:AAHqoCtH57fXbwCshwYgDprFZkWLf4ZEZUc';
  // #token = '7117585256:AAFiIYcwi12MzUIGwUVHduRlw41_L8IZKYk';

  #tgBot = new Telegraf(this.#token);

  async initTelegramDataFile() {
    try {
      const jsonData = await fs.promises.readFile(`${dataDir}/${telegramDataFileName}`, 'utf-8');
      return JSON.parse(jsonData);
    } catch (error) {
      if (error.code === 'ENOENT') {
        await fs.promises.writeFile(`${dataDir}/${telegramDataFileName}`, JSON.stringify(baseTelegramData), 'utf-8');
        return {};
      } else {
        throw error;
      }
    }
  }

  async start() {
    await this.initTelegramDataFile();

    try {
      this.#tgBot.use(session());

      this.#tgBot.use( async (ctx, next) => {
        if (!ctx.session) {
          ctx.session = {};
        }

        return await next();
      });

      for (const [ key, value ] of Object.entries(methods)) {
        this.#tgBot.hears(key, value);
      }

      this.#tgBot.command(buttons.start, refresh);

      this.#tgBot.on('text', async (ctx) => {
        try {
          logger(`Пользователь ввел текст: ${ctx.message.text}, User name - ${ctx.message.chat.username ?? ''}, Chat id - ${ctx.message.chat.id}, First name - ${ctx.message.chat.first_name || ''}`);

          const number = calculateExpression(ctx.message.text);
          const data = await getCurrency(dataDir, telegramDataFileName);

          if (ctx.session.isSms) {
            if (!ctx.session.smsAmount) {
              ctx.session.smsAmount = number;

              await ctx.reply(messages.writeAmountFromBoard);

              return;
            }

            if (ctx.session.smsAmount) {
              await ctx.reply(
                `Зарплата с учетом ${ctx.session.smsAmount} смс - ${getSmsSalary(ctx.session.smsAmount, number, data.rubCurrency, data.uahCurrency)} UAH`,
                Markup.keyboard([ Markup.button.callback(buttons.restart, `restart`) ], { columns: 2 })
              );
            } else {
              await ctx.reply(messages.smsAmount);
            }
          }

          if (ctx.session.isPolice) {
            await ctx.reply(
              `Зарплата с учетом ставки - ${getSalary(number, 4, data.rubCurrency, data.uahCurrency)} UAH`,
              Markup.keyboard([ Markup.button.callback(buttons.restart, `restart`) ], { columns: 2 })
            );
          }

          if (ctx.session.isColdClose) {
            await ctx.reply(
              `Зарплата с учетом ставки - ${getSalary(number, 7, data.rubCurrency, data.uahCurrency)} UAH`,
              Markup.keyboard([ Markup.button.callback(buttons.restart, `restart`) ], { columns: 2 })
            );
          }

          if (ctx.session.isChangeCurrencyActive) {
            if (ctx.session.uahCurrencyActive) {
              await updateCurrency({ uahCurrency: number });

              await ctx.reply(messages.uahCurrencyUpdated, Markup.keyboard([ Markup.button.callback(buttons.restart, `restart`) ], { columns: 2 }));
            }

            if (ctx.session.rubCurrencyActive) {
              await updateCurrency({ rubCurrency: number });

              await ctx.reply(messages.rubCurrencyUpdated, Markup.keyboard([ Markup.button.callback(buttons.restart, `restart`) ], { columns: 2 }));
            }
          }
        } catch (error) {
          await ctx.reply(error.message);
        }
      });

      this.#tgBot.launch()
        .then(() => logger('Бот успешно запущен'))
        .catch(() => logger('Произошла ошибка при запуске бота', LogLevel.ERROR));
    } catch (error) {
      logger(`Произошла ошибка ${error?.message}`, LogLevel.ERROR);
    }
  }
}
