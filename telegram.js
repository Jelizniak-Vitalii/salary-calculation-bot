import { Markup, session, Telegraf } from 'telegraf';

const rubCurrency = 95;
const uahCurrency = 33;

const buttons = Object.freeze({
  sms: 'Смс',
  coldClose: 'Холодка Клоуз',
  police: 'Мент',
  restart: 'Начать сначала'
});

const commands = Object.freeze({
  start: Markup.keyboard([
    Markup.button.callback(buttons.sms, `sms`),
    Markup.button.callback(buttons.coldClose, `coldClose`),
    Markup.button.callback(buttons.police, `coldClose`)
  ])
});

const messages = Object.freeze({
  start: 'Добро пожаловать! Выберите одну из кнопок ниже для выполнения вашего расчета.',
  restart: 'Выберите одну из кнопок ниже для выполнения вашего расчета.',
  smsAmount: 'Введите количество sms.',
  writeAmountFromBoard: 'Введите число с доски.',
  wrongValue: 'Введите корректное число для расчета. Для разделения десятичных дробей используйте точку'
});

export class Telegram {
  #token = '7276327541:AAHqoCtH57fXbwCshwYgDprFZkWLf4ZEZUc';

  #tgBot = new Telegraf(this.#token);

  start() {
    try {
      this.#tgBot.use(session());

      this.#tgBot.use( async (ctx, next) => {
        if (!ctx.session) {
          ctx.session = {};
        }

        return await next();
      });

      this.#tgBot.command('start', async (ctx) => {
        ctx.session.isSms = false;
        ctx.session.smsAmount = 0;
        ctx.smsNumberFromDesk = 0;
        ctx.session.isColdClose = false;
        ctx.session.isPolice = false;

        await ctx.reply(messages.start, commands.start, { columns: 3 });
      });

      this.#tgBot.hears(buttons.restart, async (ctx) => {
        ctx.session.isSms = false;
        ctx.session.smsAmount = 0;
        ctx.smsNumberFromDesk = 0;
        ctx.session.isColdClose = false;
        ctx.session.isPolice = false;

        await ctx.reply(messages.restart, commands.start, { columns: 3 });
      });

      this.#tgBot.hears(buttons.sms, async (ctx) => {
        ctx.session.isSms = true;
        ctx.session.smsAmount = 0;
        ctx.smsNumberFromDesk = 0;

        await ctx.reply(
          messages.smsAmount,
          Markup.keyboard([ Markup.button.callback(buttons.restart, `restart`) ], { columns: 2 })
        );
      });

      this.#tgBot.hears(buttons.coldClose, async (ctx) => {
        ctx.session.isColdClose = true;

        await ctx.reply(
          messages.wrongValue,
          Markup.keyboard([ Markup.button.callback(buttons.restart, `restart`) ], { columns: 2 })
        );
      });

      this.#tgBot.hears(buttons.police, async (ctx) => {
        ctx.session.isPolice = true;

        await ctx.reply(
          messages.wrongValue,
          Markup.keyboard([ Markup.button.callback(buttons.restart, `restart`) ], { columns: 2 })
        );
      });

      this.#tgBot.on('text', async (ctx) => {
        if (isNaN(ctx.message.text)) {
          await ctx.reply(messages.wrongValue);

          return;
        }

        const number = parseInt(ctx.message.text);

        if (ctx.session.isSms) {
          if (!ctx.session.smsAmount) {
            ctx.session.smsAmount = number;

            await ctx.reply(messages.writeAmountFromBoard);

            return;
          }

          if (ctx.session.smsAmount) {
            await ctx.reply(
              `Зарплата с учетом ${ctx.session.smsAmount} sms - ${this.getSmsSalary(ctx.session.smsAmount, number)} UAH`,
              Markup.keyboard([ Markup.button.callback(buttons.restart, `restart`) ], { columns: 2 })
            );
          } else {
            await ctx.reply(messages.smsAmount);
          }
        }

        if (ctx.session.isPolice) {
          await ctx.reply(
            `Зарплата - ${this.getSalary(number, 4)} UAH`,
            Markup.keyboard([ Markup.button.callback(buttons.restart, `restart`) ], { columns: 2 })
          );
        }

        if (ctx.session.isColdClose) {
          await ctx.reply(
            `Зарплата - ${this.getSalary(number, 7)} UAH`,
            Markup.keyboard([ Markup.button.callback(buttons.restart, `restart`) ], { columns: 2 })
          );
        }
      });

      this.#tgBot.launch()
        .then(() => console.log('Бот успешно запущен'))
        .catch(() => new Error('Произошла ошибка при запуске бота'));
    } catch (error) {
      console.log('Произошла ошибка', error?.message);
    }
  }

  getSmsSalary(smsAmount, amountFromDesk) {
    return Math.floor((((amountFromDesk / 100 * 2) / rubCurrency) * uahCurrency) + (smsAmount * 100)).toFixed(2);
  }

  getSalary(value, percentage) {
    return Math.floor((((value / 100 * percentage) / rubCurrency) * uahCurrency + 3000)).toFixed(2);
  }
}
