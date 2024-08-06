import { messages } from '../constants/messages.js';
import { Markup } from 'telegraf';
import { buttons } from '../constants/buttons.js';
import { admins } from '../constants/admins.js';
import { getCurrency } from '../utils/index.js';

const commands = Object.freeze({
  start: [
    Markup.button.callback(buttons.sms, `sms`),
    Markup.button.callback(buttons.coldClose, `coldClose`),
    Markup.button.callback(buttons.police, `coldClose`)
  ]
});

export const refresh = async (ctx) => {
  ctx.session.isSms = false;
  ctx.session.smsAmount = 0;
  ctx.smsNumberFromDesk = 0;
  ctx.session.isColdClose = false;
  ctx.session.isPolice = false;
  ctx.session.uahCurrencyActive = false;
  ctx.session.rubCurrencyActive = false;
  ctx.session.isChangeCurrencyActive = false;

  await ctx.reply(
    messages.start,
    Markup.keyboard([
      ...commands.start,
      ...(admins.includes(String(ctx.chat.id)) ? [ Markup.button.callback(buttons.changeCurrency, `changeCurrency`) ] : [])
    ]),
    { columns: 2 }
  );
};

const sms = async (ctx) => {
  ctx.session.isSms = true;
  ctx.session.smsAmount = 0;
  ctx.smsNumberFromDesk = 0;

  await ctx.reply(
    messages.smsAmount,
    Markup.keyboard([ Markup.button.callback(buttons.restart, `restart`) ], { columns: 2 })
  );
};

const coldClose = async (ctx) => {
  ctx.session.isColdClose = true;

  await ctx.reply(
    messages.writeAmountFromBoard,
    Markup.keyboard([ Markup.button.callback(buttons.restart, `restart`) ], { columns: 2 })
  );
};

const police = async (ctx) => {
  ctx.session.isPolice = true;

  await ctx.reply(
    messages.writeAmountFromBoard,
    Markup.keyboard([ Markup.button.callback(buttons.restart, `restart`) ], { columns: 2 })
  );
};

const changeCurrency = async (ctx) => {
  const data = await getCurrency().catch(error => console.log(error));

  ctx.session.isChangeCurrencyActive = true;

  await ctx.reply(
    `Текущий курс валют: UAH - ${data.uahCurrency}, RUB - ${data.rubCurrency}`,
    Markup.keyboard([
        Markup.button.callback(buttons.uahCurrency, buttons.uahCurrency),
        Markup.button.callback(buttons.rubCurrency, buttons.rubCurrency),
        Markup.button.callback(buttons.restart, `restart`) ],
      { columns: 2 }
    )
  );
};

const uahCurrency = async (ctx) => {
  ctx.session.uahCurrencyActive = true;

  await ctx.reply(
    messages.writeNewUahCurrency,
    Markup.keyboard([ Markup.button.callback(buttons.restart, `restart`) ], { columns: 2 })
  );
};

const rubCurrency = async (ctx) => {
  ctx.session.rubCurrencyActive = true;

  await ctx.reply(
    messages.writeNewRubCurrency,
    Markup.keyboard([ Markup.button.callback(buttons.restart, `restart`) ], { columns: 2 })
  );
};

export const methods = Object.freeze({
  [buttons.restart]: refresh,
  [buttons.sms]: sms,
  [buttons.coldClose]: coldClose,
  [buttons.police]: police,
  [buttons.changeCurrency]: changeCurrency,
  [buttons.uahCurrency]: uahCurrency,
  [buttons.rubCurrency]: rubCurrency
});
