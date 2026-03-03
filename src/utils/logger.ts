/**
 * Disciplex — Production Logging Utility
 * Structured logging with levels, filtering, and crash reporting integration
 */

import { Platform } from 'react-native';

// ============================================
// LOG LEVELS
// ============================================

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

// ============================================
// CONFIGURATION
// ============================================

const isDev = process.env.EXPO_PUBLIC_APP_ENV === 'development' || __DEV__;

const LOG_LEVEL = isDev
  ? LogLevel.DEBUG
  : parseInt(process.env.EXPO_PUBLIC_LOG_LEVEL || '1', 10);

const ENABLE_CRASH_REPORTING = process.env.EXPO_PUBLIC_ENABLE_CRASH_REPORTING === 'true';

// ============================================
// TYPES
// ============================================

export interface LogContext {
  [key: string]: any;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: Error;
}

// ============================================
// LOG STORAGE (for debugging)
// ============================================

const LOG_BUFFER_SIZE = 100;
const logBuffer: LogEntry[] = [];

function addToBuffer(entry: LogEntry) {
  logBuffer.push(entry);
  if (logBuffer.length > LOG_BUFFER_SIZE) {
    logBuffer.shift();
  }
}

export function getRecentLogs(): LogEntry[] {
  return [...logBuffer];
}

export function clearLogBuffer() {
  logBuffer.length = 0;
}

// ============================================
// LOGGER
// ============================================

class Logger {
  private level: LogLevel;
  private prefix: string;

  constructor(level: LogLevel = LOG_LEVEL, prefix: string = 'DISCIPLEX') {
    this.level = level;
    this.prefix = prefix;
  }

  private formatMessage(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${this.prefix}] [${level}] ${message}${contextStr}`;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.level;
  }

  private log(level: LogLevel, levelName: string, message: string, context?: LogContext, error?: Error) {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
    };

    addToBuffer(entry);

    const formattedMessage = this.formatMessage(levelName, message, {
      ...context,
      platform: Platform.OS,
    });

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formattedMessage);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage);
        break;
      case LogLevel.ERROR:
        console.error(formattedMessage, error);
        break;
    }

    // Send to crash reporting in production
    if (level === LogLevel.ERROR && ENABLE_CRASH_REPORTING && !isDev) {
      this.sendToCrashReporting(message, error, context);
    }
  }

  private sendToCrashReporting(message: string, error?: Error, context?: LogContext) {
    // TODO: Integrate with Sentry, Crashlytics, or similar
    // For now, log to console in production
    if (!isDev) {
      console.error('[CRASH_REPORT]', {
        message,
        error: error?.toString(),
        stack: error?.stack,
        context,
      });
    }
  }

  debug = (message: string, context?: LogContext) => {
    this.log(LogLevel.DEBUG, 'DEBUG', message, context);
  };

  info = (message: string, context?: LogContext) => {
    this.log(LogLevel.INFO, 'INFO', message, context);
  };

  warn = (message: string, context?: LogContext) => {
    this.log(LogLevel.WARN, 'WARN', message, context);
  };

  error = (message: string, error?: Error, context?: LogContext) => {
    this.log(LogLevel.ERROR, 'ERROR', message, context, error);
  };

  setLevel = (level: LogLevel) => {
    this.level = level;
  };
}

// ============================================
// EXPORT LOGGER INSTANCE
// ============================================

export const logger = new Logger();

// ============================================
// CONVENIENCE FUNCTIONS
// ============================================

export const debug = (message: string, context?: LogContext) => {
  logger.debug(message, context);
};

export const info = (message: string, context?: LogContext) => {
  logger.info(message, context);
};

export const warn = (message: string, context?: LogContext) => {
  logger.warn(message, context);
};

export const error = (message: string, error?: Error, context?: LogContext) => {
  logger.error(message, error, context);
};

// ============================================
// ERROR TRACKING
// ============================================

export function trackError(
  error: Error,
  context: {
    component?: string;
    action?: string;
    userId?: string;
    [key: string]: any;
  }
) {
  logger.error(`[${context.component || 'Unknown'}] ${error.message}`, error, {
    ...context,
    stack: error.stack,
    name: error.name,
  });
}

export function createErrorWithContext(
  message: string,
  context: {
    code?: string;
    details?: string;
    [key: string]: any;
  }
) {
  const error = new Error(message);
  (error as any).code = context.code;
  (error as any).details = context.details;
  return error;
}

// ============================================
// PERFORMANCE MONITORING
// ============================================

export interface PerformanceMark {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

const performanceMarks = new Map<string, PerformanceMark>();

export function startPerformanceMark(name: string) {
  const mark: PerformanceMark = {
    name,
    startTime: Date.now(),
  };
  performanceMarks.set(name, mark);
  logger.debug(`[PERF] Started: ${name}`);
}

export function endPerformanceMark(name: string): number | null {
  const mark = performanceMarks.get(name);
  if (!mark) {
    logger.warn(`[PERF] No mark found: ${name}`);
    return null;
  }

  const endTime = Date.now();
  const duration = endTime - mark.startTime;
  mark.endTime = endTime;
  mark.duration = duration;

  logger.info(`[PERF] ${name}: ${duration}ms`);

  // Warn if operation took too long
  if (duration > 1000) {
    logger.warn(`[PERF] Slow operation: ${name} took ${duration}ms`);
  }

  return duration;
}

// ============================================
// USER ACTION TRACKING
// ============================================

export function trackUserAction(
  action: string,
  metadata?: {
    screen?: string;
    component?: string;
    [key: string]: any;
  }
) {
  logger.info(`[USER_ACTION] ${action}`, metadata);
}
