/* eslint-disable no-process-env */
/* eslint-disable no-console */
const colours = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',

  fg: {
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    crimson: '\x1b[38m',
  },
  bg: {
    black: '\x1b[40m',
    red: '\x1b[41m',
    green: '\x1b[42m',
    yellow: '\x1b[43m',
    blue: '\x1b[44m',
    magenta: '\x1b[45m',
    cyan: '\x1b[46m',
    white: '\x1b[47m',
    crimson: '\x1b[48m',
  },
};

function parseStackTrace(stack: string | undefined): string {
  if (!stack) return '--';

  // Extract the second stack line (caller function)
  const line = stack.split('\n')[2]?.trim();
  const regex = /\bat\s+(.*?)(?:\s+\(|$)/; // Matches "at functionName ("

  return line?.match(regex)?.[1] ?? '--';
}

function getCallingFunction(error: Error): string {
  try {
    return parseStackTrace(error.stack);
  } catch {
    return '--';
  }
}

function logMessage(
  level: string,
  colour: string,
  message?: unknown,
  ...optionalParams: unknown[]
) {
  const timestamp = new Date().toLocaleString();
  console.log(
    `[${timestamp}]`,
    colour,
    `[${level}]`,
    colours.reset,
    message,
    ...optionalParams
  );
}

function log(message?: unknown, ...optionalParams: unknown[]) {
  logMessage('LOG', colours.fg.magenta, message, ...optionalParams);
}

function debug(message?: unknown, ...optionalParams: unknown[]) {
  if (process.env.NODE_ENV === 'production') return;
  logMessage('DEBUG', colours.fg.green, message, ...optionalParams);
}

function info(message?: unknown, ...optionalParams: unknown[]) {
  logMessage('INFO', colours.fg.cyan, message, ...optionalParams);
}

function warn(message?: unknown, ...optionalParams: unknown[]) {
  logMessage('WARN', colours.fg.yellow, message, ...optionalParams);
  console.log(
    colours.fg.yellow,
    `[Called from: ${getCallingFunction(new Error())}]`,
    colours.reset
  );
}

function error(message?: unknown, ...optionalParams: unknown[]) {
  const errorInstance = message instanceof Error ? message : new Error();
  logMessage('ERROR', colours.fg.red, message, ...optionalParams);
  console.log(
    colours.fg.red,
    `[Called from: ${getCallingFunction(errorInstance)}]`,
    colours.reset
  );
}

export const logger = {
  log,
  debug,
  info,
  warn,
  error,
};
