import winston from 'winston';
import chalk from 'chalk';

const logConfiguration = {
  transports: [
    new winston.transports.Console()
  ],
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.printf(info => {
      let message = `${chalk.gray(info.timestamp)} | ${info.level.toUpperCase()} | ${info.message}`;
      if (info.level === 'error') {
        message = chalk.red(message);
      } else if (info.level === 'info') {
        message = chalk.green(message);
      }
      return message;
    })
  )
};

const logger = winston.createLogger(logConfiguration);

export default logger;