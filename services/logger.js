import chalk from 'chalk';

export const LogLevel = Object.freeze({
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error'
});

export const logger = (message, level = 'info') => {
  const timestamp = new Date().toLocaleString("uk-Uk", { timeZone: "Europe/Kiev" });
  let formattedMessage = `[${timestamp}] - ${message}`;

  switch (level) {
    case 'info':
      formattedMessage = chalk.blue(formattedMessage);
      break;
    case 'warn':
      formattedMessage = chalk.yellow(formattedMessage);
      break;
    case 'error':
      formattedMessage = chalk.red(formattedMessage);
      break;
    default:
      break;
  }

  if ([LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR].includes(level) && [LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR].includes(LogLevel.INFO)) {
    console[level](formattedMessage);
  }
};
