import { sleep } from './sleep';

export const executeCallbackWithRetry = async <T>(
  executionCallback: () => T,
  times = 3,
  retryMS = 300,
): Promise<T | Error | null> => {
  let tries = 0;
  let lastError: Error | null = null;

  do {
    try {
      const result = await executionCallback();
      return result;
    } catch (error) {
      if (error instanceof Error) {
        lastError = error;
      }
      tries++;
    }
    await sleep(retryMS);
  } while (tries < times);

  return lastError;
};
